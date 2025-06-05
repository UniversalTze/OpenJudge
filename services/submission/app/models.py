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
    results = db.Column(JSONB, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'submission_id': self.submission_id,
            'user_id': self.user_id,
            'problem_id': self.problem_id,
            'language': self.language,
            'code': self.code,
            'callback_url': self.callback_url,
            'status': self.status,
            'results': self.results,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Problem(db.Model):
    __tablename__ = 'problems'
    
    problem_id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    function_name = db.Column(db.String, nullable=False, default='solve')
    test_inputs = db.Column(JSONB, default=list)
    test_outputs = db.Column(JSONB, default=list)
    difficulty = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'problem_id': self.problem_id,
            'title': self.title,
            'description': self.description,
            'function_name': self.function_name,
            'test_inputs': self.test_inputs,
            'test_outputs': self.test_outputs,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }