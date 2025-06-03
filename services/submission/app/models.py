from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

db = SQLAlchemy()

class Submission(db.Model):
    __tablename__ = 'submissions'

    submission_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String, nullable=False)
    problem_id = db.Column(db.String, nullable=False)
    language = db.Column(db.String, nullable=False)
    code = db.Column(db.Text, nullable=False)
    cleaned_code = db.Column(db.Text, nullable=False)
    function_name = db.Column(db.String, nullable=False)
    status = db.Column(db.String, nullable=False, default='queued')
    callback_url = db.Column(db.String, nullable=True)
    results = db.Column(JSONB, default=[])  # JSONB to store structured test results
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Problem(db.Model):
    __tablename__ = 'problems'

    problem_id = db.Column(db.String, primary_key=True)
    function_name = db.Column(db.String, nullable=False)
    test_inputs = db.Column(JSONB, nullable=False)   # list of input lists
    test_outputs = db.Column(JSONB, nullable=False)  # list of expected outputs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
