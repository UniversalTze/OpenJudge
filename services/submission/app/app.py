import os
import json
import hashlib
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from models import db, Submission
from queue_utils import enqueue_submission, check_queue_health, USE_SQS

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@db:5432/submissions'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

CALLBACK_TIMEOUT_SECONDS = int(os.getenv('CALLBACK_TIMEOUT_SECONDS', '600'))

@app.before_first_request
def initialize():
    db.create_all()
    monitor = threading.Thread(target=timeout_monitor, daemon=True)
    monitor.start()

@app.route('/submit', methods=['POST'])
def submit():
    """
    Accept a new submission:
      - Deduplicate by (user_id, problem_id, language, code) if a prior submission has status 'success'.
      - If duplicate found, return cached results immediately.
      - Otherwise, create a new Submission (status='queued') and enqueue a job payload as raw JSON.
    """
    data = request.get_json() or {}
    required = ['user_id', 'problem_id', 'language', 'code']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    user_id    = data['user_id']
    problem_id = data['problem_id']
    language   = data['language']
    code       = data['code']
    test_cases = data.get('test_cases', [])
    callback_url = data.get('callback_url')

    # Deduplication: find an existing successful submission with identical fields
    duplicate = Submission.query.filter_by(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        code=code,
        status='success'
    ).first()
    if duplicate:
        return jsonify({
            'submission_id': str(duplicate.submission_id),
            'status': duplicate.status,
            'results': duplicate.results,
            'message': 'Duplicate submission; returning cached results.'
        }), 200

    # Create a new submission row
    new_sub = Submission(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        code=code,
        callback_url=callback_url,
        status='queued'
    )
    db.session.add(new_sub)
    db.session.commit()

    # Build the raw JSON payload to enqueue
    job_payload = {
        'submission_id': str(new_sub.submission_id),
        'user_id': user_id,
        'problem_id': problem_id,
        'language': language,
        'code': code,
        'test_cases': test_cases,
        'callback_url': callback_url
    }

    try:
        enqueue_submission(job_payload)
    except Exception as e:
        # If queuing fails, mark as 'failed'
        new_sub.status = 'failed'
        db.session.commit()
        return jsonify({'error': f'Failed to enqueue submission: {e}'}), 500

    return jsonify({
        'submission_id': str(new_sub.submission_id),
        'status': new_sub.status
    }), 202

@app.route('/submissions/<uuid:submission_id>', methods=['GET'])
def get_submission(submission_id):
    """
    Return submission details, including status and results (if any).
    """
    sub = Submission.query.get_or_404(submission_id)
    return jsonify({
        'submission_id': str(sub.submission_id),
        'user_id': sub.user_id,
        'problem_id': sub.problem_id,
        'language': sub.language,
        'code': sub.code,
        'callback_url': sub.callback_url,
        'status': sub.status,
        'results': sub.results,
        'created_at': sub.created_at.isoformat(),
        'updated_at': sub.updated_at.isoformat()
    }), 200

@app.route('/submissions/<uuid:submission_id>/results', methods=['POST'])
def post_results(submission_id):
    """
    Callback endpoint for the Execution Service to report results.
    Payload must include at least: { "tests": [ { passed, input, output, error, stack_trace }, … ] }.
    Updates `results` (JSONB) and sets status to 'success' or 'failed'.
    """
    sub = Submission.query.get_or_404(submission_id)
    if sub.status in ['success', 'failed', 'timed_out']:
        return jsonify({'error': f'Submission already {sub.status}'}), 409

    payload = request.get_json() or {}
    if 'tests' not in payload or not isinstance(payload['tests'], list):
        return jsonify({'error': 'Invalid payload format; missing "tests" array'}), 400

    # Store the entire payload in JSONB
    sub.results = payload
    all_passed = all(test.get('passed', False) for test in payload['tests'])
    sub.status = 'success' if all_passed else 'failed'
    sub.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Results recorded'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    """
    Check the health of the database (Postgres) and the queue (Redis or SQS).
    Returns HTTP 200 if both are healthy; otherwise 503 + details.
    """
    status = {'status': 'healthy', 'database': 'ok', 'queue': 'ok'}

    # 1) Database check
    try:
        db.session.execute('SELECT 1')
    except Exception:
        status['database'] = 'unhealthy'
        status['status'] = 'unhealthy'

    # 2) Queue check
    if not check_queue_health():
        status['queue'] = 'unhealthy'
        status['status'] = 'unhealthy'

    http_code = 200 if status['status'] == 'healthy' else 503
    return jsonify(status), http_code

def timeout_monitor():
    """
    Background thread that marks any submission older than CALLBACK_TIMEOUT_SECONDS 
    (still in 'queued' or 'running') as 'timed_out'.
    """
    while True:
        cutoff = datetime.utcnow() - timedelta(seconds=CALLBACK_TIMEOUT_SECONDS)
        stale_subs = Submission.query.filter(
            Submission.status.in_(['queued', 'running']),
            Submission.created_at < cutoff
        ).all()
        for s in stale_subs:
            s.status = 'timed_out'
            s.updated_at = datetime.utcnow()
        if stale_subs:
            db.session.commit()
        time.sleep(60)  # Run this check once per minute

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
