from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import re
from sqlalchemy import create_engine, text
from datetime import datetime
from redis import Redis
import traceback
import time
from sqlalchemy.exc import OperationalError

try:
    from queue_utils import send_to_queue
    QUEUE_AVAILABLE = True
except ImportError as e:
    print(f"[Warning] Queue utils not available: {e}")
    QUEUE_AVAILABLE = False
    
    def send_to_queue(task_name, payload, queue_name):
        print(f"[Mock queue] {task_name} -> {queue_name} | Payload: {payload}")
        return True

from models import db, Submission

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@db:5432/submissions'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Ensure tables exist
with app.app_context():
    try:
        db.create_all()
        print("[Info] Local `submissions` table ensured.")
    except Exception as e:
        print(f"[Error] Failed to create local tables: {e}")

# External problems database setup
PROBLEMS_DATABASE_URL = os.getenv(
    'PROBLEMS_DATABASE_URL',
    'postgresql://postgres:postgres@problems-db:5432/problems'
)
try:
    problems_engine = create_engine(PROBLEMS_DATABASE_URL)
    with problems_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("[Info] Connected to Problems database successfully.")
except Exception as e:
    print(f"[Warning] Problems database not available: {e}")
    problems_engine = None

def clean_code(code, language):
    """Sanitize code by removing comments, blocking keywords, and enforcing length limits."""
    if not code or not isinstance(code, str):
        raise ValueError("Code must be a non-empty string")

    # Python-specific cleaning
    if language.lower() == 'python':
        cleaned_lines = []
        for line in code.splitlines():
            if line.strip().startswith('#'):
                continue
            if '#' in line:
                line = line.split('#')[0]
            cleaned_lines.append(line)
        cleaned = "\n".join(cleaned_lines)
    else:
        cleaned = re.sub(r'//.*', '', code)
        cleaned = re.sub(r'/\*[\s\S]*?\*/', '', cleaned)

    # Security checks
    banned = ['import os', 'import sys', 'eval(', 'exec(']
    for keyword in banned:
        if keyword in cleaned:
            raise ValueError(f"Banned keyword detected: {keyword}")

    if len(cleaned) > 10000:
        raise ValueError("Code is too long.")

    return cleaned

@app.route('/submission/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Submission API is running',
        'endpoints': [
            '/submission/health',
            '/submission/<user_id>/<problem_id>/<language>',
            '/submissions/<submission_id>'
        ]
    }), 200

@app.route('/submission/health', methods=['GET'])
def health():
    """Check database and broker connectivity."""
    health_status = {"status": "healthy", "database": "ok", "broker": "ok"}

    # Database health check
    db_ok = False
    for _ in range(3):
        try:
            with db.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_ok = True
            break
        except OperationalError:
            time.sleep(0.1)
    
    if not db_ok:
        health_status.update({"status": "unhealthy", "database": "unhealthy"})

    # Redis health check
    try:
        r = Redis.from_url(os.getenv('REDIS_URL', 'redis://redis:6379/0'))
        r.ping()
    except Exception as e:
        health_status.update({"status": "unhealthy", "broker": "unhealthy"})

    status_code = 200 if health_status["status"] == "healthy" else 503
    return jsonify(health_status), status_code

@app.route('/submission/<user_id>/<problem_id>/<language>', methods=['POST'])
def submit_code(user_id, problem_id, language):
    """Process code submissions with validation and deduplication."""
    try:
        print(f"[Info] Submission attempt: user={user_id}, problem={problem_id}, lang={language}")

        # Validate parameters
        if not all([user_id, problem_id, language]):
            return jsonify({'error': 'Missing required parameters'}), 400

        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'Code not provided'}), 400

        raw_code = data['code']
        print(f"[Info] Received code (first 100 chars): {raw_code[:100]}")

        try:
            cleaned_code = clean_code(raw_code, language)
            print("[Info] Code cleaned successfully.")
        except ValueError as e:
            print(f"[Warn] Code cleaning failed: {e}")
            return jsonify({'error': str(e)}), 400

        # Deduplication check
        existing = Submission.query.filter_by(
            user_id=user_id,
            problem_id=problem_id,
            language=language,
            cleaned_code=cleaned_code
        ).first()
        if existing:
            print(f"[Warn] Duplicate submission detected: ID {existing.submission_id}")
            return jsonify({
                'error': 'Duplicate submission detected',
                'submission_id': existing.submission_id
            }), 409

        # Fetch problem metadata
        func_name = "solve"
        test_inputs = []
        test_outputs = []

        if problems_engine:
            try:
                with problems_engine.connect() as conn:
                    row = conn.execute(
                        text("""
                            SELECT function_name, test_inputs, test_outputs
                            FROM problems
                            WHERE problem_id = :pid
                        """),
                        {"pid": problem_id}
                    ).fetchone()
                    if row:
                        func_name, test_inputs, test_outputs = row
                    else:
                        print(f"[Warn] Problem '{problem_id}' not found in external DB.")
                        return jsonify({'error': 'Problem not found'}), 404
            except Exception as e:
                print(f"[Error] Failed to fetch problem data: {e}")
                return jsonify({'error': 'Unable to fetch problem data'}), 500
        else:
            print("[Warn] Problems database not configured; aborting submission.")
            return jsonify({'error': 'Problems database not available'}), 503

        # Create submission record
        submission = Submission(
            user_id=user_id,
            problem_id=problem_id,
            language=language,
            code=raw_code,
            cleaned_code=cleaned_code,
            function_name=func_name,
            status='queued',
            results=[]
        )
        db.session.add(submission)
        db.session.commit()
        print(f"[Info] Created submission record with ID {submission.submission_id}.")

        # Prepare task payload
        submission.callback_url = f"https://www.openjudge.com/submissions/{submission.submission_id}/results"
        db.session.commit()

        payload = {
            "submission_id": submission.submission_id,
            "submission_code": raw_code,
            "inputs": test_inputs,
            "outputs": test_outputs,
            "function_name": func_name
        }
        queue_name = f"{language.lower()}q"

        # Enqueue processing task
        try:
            if QUEUE_AVAILABLE:
                send_to_queue('process_submission', payload, queue_name)
                print(f"[Info] Enqueued submission {submission.submission_id} on queue '{queue_name}'.")
            else:
                print(f"[Mock queue] {queue_name} <- {payload}")
        except Exception as e:
            print(f"[Error] Failed to enqueue task: {e}")
            submission.status = 'failed'
            db.session.commit()
            return jsonify({'error': 'Failed to queue submission'}), 500

        return jsonify({
            'submission_id': submission.submission_id,
            'status': submission.status,
            'callback_url': submission.callback_url
        }), 201

    except Exception as e:
        print(f"[Error] Unexpected error in submit_code: {e}\n{traceback.format_exc()}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/submissions/history/<string:user_id>', methods=['GET'])
def submission_history(user_id):
    """Retrieve user's submission history."""
    try:
        subs = Submission.query.filter_by(user_id=user_id) \
                               .order_by(Submission.updated_at.desc()) \
                               .all()

        if not subs:
            return jsonify({'submissions': []}), 200

        history = [{
            'problem_id': sub.problem_id,
            'language': sub.language,
            'code': sub.code,
            'results': sub.results,
            'submitted_at': sub.updated_at.isoformat() if sub.updated_at else None
        } for sub in subs]

        return jsonify({'submissions': history}), 200

    except Exception as e:
        print(f"[Error] Retrieving submission history for user {user_id} failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("[Info] Created local `submissions` table (dev mode).")
    app.run(host='0.0.0.0', port=5000, debug=True)