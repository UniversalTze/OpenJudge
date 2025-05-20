import os
import uuid
import base64
import io
import zipfile
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

# Configuration
ENV = os.getenv('APP_ENV', 'LOCAL')  # 'LOCAL' or 'AWS'

app = Flask(__name__)
if ENV == 'AWS':
    # Example: set in env: RDS_DATABASE_URI, SQS_QUEUE_URL
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('RDS_DATABASE_URI')
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
define = '#'
class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.String(36), primary_key=True)  # UUID4
    problem_id = db.Column(db.Integer, nullable=False)
    code = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='PENDING')  # e.g. PENDING, RUNNING, COMPLETED

class TestCase(db.Model):
    __tablename__ = 'test_cases'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    problem_id = db.Column(db.Integer, nullable=False)
    input_data = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)

# Initialize DB (for local testing)
@app.before_first_request
def create_tables():
    db.create_all()

# Utility: stub for cleaning code
def clean_code(raw_code: str) -> str:
    # TODO: implement real sanitization
    # This is a placeholder that strips leading/trailing whitespace
    return raw_code.strip()

# Utility: package code and testcases into a zip in-memory
def package_submission(code: str, testcases: list, submission_id: str) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as zf:
        # add code file
        zf.writestr(f"{submission_id}.py", code)
        # add test case files
        for idx, tc in enumerate(testcases, start=1):
            zf.writestr(f"input_{idx}.txt", tc.input_data)
            zf.writestr(f"output_{idx}.txt", tc.expected_output)
    buffer.seek(0)
    return buffer.read()

# Utility: push to queue (local or AWS SQS)
def push_to_queue(zip_bytes: bytes, submission_id: str):
    if ENV == 'AWS':
        import boto3
        sqs = boto3.client('sqs')
        queue_url = os.getenv('SQS_QUEUE_URL')
        # encode as base64
        payload = base64.b64encode(zip_bytes).decode('utf-8')
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=payload,
            MessageAttributes={
                'SubmissionId': {
                    'StringValue': submission_id,
                    'DataType': 'String'
                }
            }
        )
    else:
        # Simple in-memory queue for local
        from queue import Queue
        if not hasattr(app, 'local_queue'):
            app.local_queue = Queue()
        payload = base64.b64encode(zip_bytes).decode('utf-8')
        app.local_queue.put({'submission_id': submission_id, 'payload': payload})

# Routes
@app.route('/submit/<int:problem_id>', methods=['POST'])
def submit(problem_id):
    # Generate IDs & timestamp
    submission_id = str(uuid.uuid4())
    raw_code = request.get_data(as_text=True)

    # Save submission record
    submission = Submission(
        id=submission_id,
        problem_id=problem_id,
        code=raw_code,
        timestamp=datetime.utcnow(),
    )
    db.session.add(submission)
    db.session.commit()

    # Clean code
    cleaned = clean_code(raw_code)

    # Fetch testcases
    testcases = TestCase.query.filter_by(problem_id=problem_id).all()

    # Package
    zip_bytes = package_submission(cleaned, testcases, submission_id)

    # Push to queue
    push_to_queue(zip_bytes, submission_id)

    return jsonify({'submission_id': submission_id, 'status': 'QUEUED'}), 202

@app.route('/submission/<submission_id>', methods=['GET'])
def get_submission(submission_id):
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        'submission_id': submission.id,
        'problem_id': submission.problem_id,
        'timestamp': submission.timestamp.isoformat(),
        'status': submission.status
    })

# CRUD endpoints (optional)
@app.route('/submission/<submission_id>', methods=['PUT'])
def update_submission(submission_id):
    data = request.json or {}
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Not found'}), 404
    # Update allowed fields
    for field in ('status',):
        if field in data:
            setattr(submission, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Updated'}), 200

@app.route('/submission/<submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    submission = Submission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(submission)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

if __name__ == '__main__':
    app.run(debug=(ENV != 'AWS'))
