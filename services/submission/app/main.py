import os
import json
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from models import db, Submission
from queue_utils import celery, enqueue_submission_task, check_broker_health

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@db:5432/submissions'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

CALLBACK_TIMEOUT_SECONDS = int(os.getenv('CALLBACK_TIMEOUT_SECONDS', '600'))

@app.before_first_request
def startup():
    """
    Create database tables if they don’t exist and start the timeout monitor thread.
    """
    db.create_all()
    monitor = threading.Thread(target=timeout_monitor, daemon=True)
    monitor.start()

@app.route('/submit', methods=['POST'])
def submit():
    """
    Accept a new submission:
      - Deduplicate by (user_id, problem_id, language, code) against a 'success' record
      - If duplicate found, return cached results.
      - Otherwise, create new Submission (status='queued') and enqueue a Celery task.
    Expected JSON:
      {
        "user_id": "...",
        "problem_id": "...",
        "language": "...",
        "code": "...",
        "function_name": "...",        # optional
        "test_cases": [                # optional
          { "input": <any>, "expected": <any> },
          ...
        ],
        "callback_url": "http://..."
      }
    """
    data = request.get_json() or {}
    required_fields = ['user_id', 'problem_id', 'language', 'code']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    user_id    = data['user_id']
    problem_id = data['problem_id']
    language   = data['language']
    code       = data['code']
    function_name = data.get('function_name', '')
    test_cases = data.get('test_cases', [])
    callback_url = data.get('callback_url')

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

    # Create a new submission record in the DB
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

    submission_payload = {
        'submission_id': str(new_sub.submission_id),
        'user_id': user_id,
        'problem_id': problem_id,
        'language': language,
        'code': code,
        'function_name': function_name,
        'test_cases': test_cases,
        'callback_url': callback_url
    }

    try:
        enqueue_submission_task(submission_payload)
    except Exception as e:
        new_sub.status = 'failed'
        db.session.commit()
        return jsonify({'error': f'Failed to enqueue submission: {e}'}), 500

    return jsonify({
        'submission_id': str(new_sub.submission_id),
        'status': new_sub.status
    }), 202

@app.route('/users/<string:user_id>/submissions', methods=['GET'])
def list_user_submissions(user_id):
    """
    Return all submissions belonging to a given user.
    """
    subs = Submission.query.filter_by(user_id=user_id).order_by(Submission.created_at.desc()).all()
    results = [{
        'submission_id': str(s.submission_id),
        'problem_id': s.problem_id,
        'language': s.language,
        'status': s.status,
        'created_at': s.created_at.isoformat(),
        'updated_at': s.updated_at.isoformat()
    } for s in subs]
    return jsonify(results), 200

@app.route('/health', methods=['GET'])
def health_check():
    """
    Verify Postgres connectivity (simple SELECT 1) and Redis/Celery broker health.
    Return 200 if both are healthy, else 503.
    """
    health = {'status': 'healthy', 'database': 'ok', 'broker': 'ok'}

    # 1) Database health check
    try:
        db.session.execute('SELECT 1')
    except Exception:
        health['database'] = 'unhealthy'
        health['status'] = 'unhealthy'

    # 2) Broker health check (Redis via Celery)
    if not check_broker_health():
        health['broker'] = 'unhealthy'
        health['status'] = 'unhealthy'

    code = 200 if health['status'] == 'healthy' else 503
    return jsonify(health), code

# --------------------------------------------------------------------------------
# Background timeout monitor
# --------------------------------------------------------------------------------

def timeout_monitor():
    """
    Mark any submission older than CALLBACK_TIMEOUT_SECONDS (still in 'queued' or 'running')
    as 'timed_out'. Runs once per minute.
    """
    while True:
        cutoff = datetime.utcnow() - timedelta(seconds=CALLBACK_TIMEOUT_SECONDS)
        stale = Submission.query.filter(
            Submission.status.in_(['queued', 'running']),
            Submission.created_at < cutoff
        ).all()
        for s in stale:
            s.status = 'timed_out'
            s.updated_at = datetime.utcnow()
        if stale:
            db.session.commit()
        time.sleep(60)

# --------------------------------------------------------------------------------
# Celery task to receive results from Execution Service
# --------------------------------------------------------------------------------

@celery.task(name='result')
def receive_result(payload: dict):
    """
    The Execution Service calls this task when results are ready. Payload structure:
      {
        "submission_id": "<uuid>",
        "explanation": "...",
        "tests": [
          { "passed": true, "input": "...", "output": "...", "error": "", "stack_trace": "" },
          ...
        ]
      }
    We update the Submission row in Postgres accordingly.
    """
    submission_id = payload.get('submission_id')
    if not submission_id:
        return

    sub = Submission.query.get(submission_id)
    if not sub:
        # Could log a warning: unknown submission_id
        return

    # If already in a terminal state, ignore
    if sub.status in ['success', 'failed', 'timed_out']:
        return

    # Persist the results JSONB
    sub.results = payload
    all_passed = all(t.get('passed', False) for t in payload.get('tests', []))
    sub.status = 'success' if all_passed else 'failed'
    sub.updated_at = datetime.utcnow()
    db.session.commit()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
