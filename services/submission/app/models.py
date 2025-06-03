import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID, JSONB

db = SQLAlchemy()

class Submission(db.Model):
    __tablename__ = 'submissions'

    submission_id = db.Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        unique=True,
        nullable=False
    )
    user_id      = db.Column(db.String, nullable=False)
    problem_id   = db.Column(db.String, nullable=False)
    language     = db.Column(db.String, nullable=False)
    code         = db.Column(db.Text, nullable=False)
    callback_url = db.Column(db.Text)
    status       = db.Column(db.String, nullable=False, default='queued')
    results      = db.Column(JSONB, nullable=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Submission {self.submission_id} user={self.user_id} problem={self.problem_id} status={self.status}>"
