# app/main.py

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import hashlib
from queue_utils import send_to_queue
from models import db, Submission, Problem
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@db:5432/submissions'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def clean_code(code, language):
    # (same cleaning logic as before)
    if language.lower() == 'python':
        lines = code.splitlines()
        cleaned_lines = []
        for line in lines:
            if line.strip().startswith('#'):
                continue
            if '#' in line:
                line = line.split('#')[0]
            cleaned_lines.append(line)
        cleaned = "\n".join(cleaned_lines)
    else:
        import re
        cleaned = re.sub(r'//.*', '', code)
        cleaned = re.sub(r'/\*[\s\S]*?\*/', '', cleaned)
    banned = ['import os', 'import sys', 'eval(', 'exec(']
    for keyword in banned:
        if keyword in cleaned:
            raise ValueError(f"Banned keyword detected: {keyword}")
    if len(cleaned) > 10000:
        raise ValueError("Code is too long.")
    return cleaned

@app.route('/health', methods=['GET'])
def health():
    try:
        db.session.execute('SELECT 1')
        # Quick Redis check
        from redis import Redis
        r = Redis.from_url(os.getenv('REDIS_URL'))
        r.ping()
        return jsonify({"status": "healthy", "database": "ok", "broker": "ok"}), 200
    except Exception:
        return jsonify({"status": "unhealthy"}), 503

@app.route('/submit/<user_id>/<problem_id>/<language>', methods=['POST'])
def submit_code(user_id, problem_id, language):
    data = request.get_json() or {}
    if 'code' not in data:
        return jsonify({'error': 'Code not provided'}), 400

    raw_code = data['code']
    try:
        cleaned_code = clean_code(raw_code, language)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    existing = Submission.query.filter_by(
        user_id=user_id,
        problem_id=problem_id,
        language=language,
        cleaned_code=cleaned_code
    ).first()
    if existing:
        return jsonify({
            'error': 'Duplicate submission detected',
            'submission_id': existing.submission_id
        }), 409

    problem = Problem.query.filter_by(problem_id=problem_id).first()
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    test_inputs = problem.test_inputs
    test_outputs = problem.test_outputs
    func_name = problem.function_name

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

    submission.callback_url = f"https://www.openjudge/submissions/{submission.submission_id}/results"
    db.session.commit()

    payload = {
        "submission_id": submission.submission_id,
        "submission_code": raw_code,
        "inputs": test_inputs,
        "outputs": test_outputs,
        "function_name": func_name
    }
    queue_name = f"{language.lower()}q"
    send_to_queue('process_submission', payload, queue_name)

    return jsonify({
        'submission_id': submission.submission_id,
        'status': submission.status,
        'callback_url': submission.callback_url
    }), 201

@app.route('/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    sub = Submission.query.get_or_404(submission_id)
    return jsonify({
        'submission_id': sub.submission_id,
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
