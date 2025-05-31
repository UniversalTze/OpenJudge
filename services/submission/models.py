# models.py
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    problem_id = db.Column(db.String, nullable=False)
    language = db.Column(db.String, nullable=False)
    code = db.Column(db.Text, nullable=False)
    code_hash = db.Column(db.String(32), nullable=False, index=True)
    test_cases = db.Column(db.Text, nullable=True)      
    callback_url = db.Column(db.String, nullable=True)
    status = db.Column(db.String, nullable=False, default='QUEUED')
    result = db.Column(db.Text, nullable=True)         
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
