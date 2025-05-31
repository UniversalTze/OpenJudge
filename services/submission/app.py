# app.py
import os
import json
import hashlib
import threading
import time
from datetime import datetime, timedelta

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from models import db, Submission
from queue_utils import enqueue_submission, check_queue_health, APP_ENV

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///submissions.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

CALLBACK_TIMEOUT = int(os.getenv('CALLBACK_TIMEOUT_SECONDS', 600))

@app.before_first_request
def create_tables():
    # Create DB tables if they don't exist
    db.create_all()
    # Start background thread to monitor timeouts
    monitor_thread = threading.Thread(target=_timeout_monitor, daemon=True)
    monitor_thread.start()

@app.route('/submissions', methods=['POST'])
def submit_code():
    data = request.get_json() or {}
    required = ['user_id', 'problem_id', 'language', 'code']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    user_id = data['user_id']
    problem_id = data['problem_id']
    language = data['language']
    code = data['code']
    test_cases = data.get('test_cases', [])
    callback_url = data.get('callback_url')

    # Compute code hash for deduplication
    code_hash = hashlib.md5(code.encode()).hexdigest()
    # Check for an existing completed submission with same parameters
    existing = Submission.query.filter_by(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        code_hash=code_hash,
        status='SUCCESS'
    ).first()
    if existing:
        # Return cached result without re-queuing
        return jsonify({
            'id': existing.id,
            'status': existing.status,
            'result': json.loads(existing.result) if existing.result else None,
            'message': 'Duplicate submission. Returning cached result.'
        }), 200

    # Create new submission record
    new_sub = Submission(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        code=code,
        code_hash=code_hash,
        test_cases=json.dumps(test_cases),
        callback_url=callback_url,
        status='QUEUED'
    )
    db.session.add(new_sub)
    db.session.commit()

    # Enqueue essential data as raw JSON
    message = {
        'submission_id': new_sub.id,
        'user_id': new_sub.user_id,
        'problem_id': new_sub.problem_id,
        'language': new_sub.language,
        'code': new_sub.code,
        'test_cases': test_cases,
        'callback_url': new_sub.callback_url
    }
    try:
        enqueue_submission(message)
    except Exception as e:
        # If enqueue fails, mark as failed
        new_sub.status = 'FAILED'
        db.session.commit()
        return jsonify({'error': f'Failed to enqueue submission: {e}'}), 500

    return jsonify({'id': new_sub.id, 'status': new_sub.status}), 202

@app.route('/submissions/<int:sub_id>', methods=['GET'])
def get_submission(sub_id):
    sub = Submission.query.get_or_404(sub_id)
    response = {
        'id': sub.id,
        'user_id': sub.user_id,
        'problem_id': sub.problem_id,
        'language': sub.language,
        'status': sub.status,
        'result': json.loads(sub.result) if sub.result else None
    }
    return jsonify(response), 200

@app.route('/submissions/<int:sub_id>/results', methods=['POST'])
def post_results(sub_id):
    sub = Submission.query.get_or_404(sub_id)
    if sub.status == 'TIMED_OUT':
        # Optionally ignore late results
        return jsonify({'error': 'Submission already timed out'}), 409

    result_data = request.get_json() or {}
    # Save result JSON and update status
    sub.result = json.dumps(result_data)
    sub.status = 'SUCCESS'
    sub.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Result recorded'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    health = {}
    try:
        db.session.execute('SELECT 1')
        health['database'] = 'ok'
    except Exception:
        health['database'] = 'unreachable'
    health['queue'] = 'ok' if check_queue_health() else 'unreachable'
    status_code = 200 if all(v == 'ok' for v in health.values()) else 500
    return jsonify(health), status_code

def _timeout_monitor():
    while True:
        cutoff = datetime.utcnow() - timedelta(seconds=CALLBACK_TIMEOUT)
        # Find submissions that are still QUEUED or running but past timeout
        stale = Submission.query.filter(
            Submission.status.in_(['QUEUED', 'RUNNING']),
            Submission.created_at < cutoff
        ).all()
        for sub in stale:
            sub.status = 'TIMED_OUT'
        if stale:
            db.session.commit()
        time.sleep(60)  # Check once per minute

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
