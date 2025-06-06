from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

Base = declarative_base()

class Submission(Base):
    __tablename__ = 'submissions'

    submission_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    problem_id = Column(String, nullable=False)
    language = Column(String, nullable=False)
    code = Column(Text, nullable=False)
    num_tests = Column(Integer, nullable=False, default=0)
    function_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default='pending')
    results = Column(JSONB, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'submission_id': self.submission_id,
            'user_id': self.user_id,
            'problem_id': self.problem_id,
            'language': self.language,
            'code': self.code,
            'num_tests': self.num_tests,
            'function_name': self.function_name,
            'status': self.status,
            'results': self.results,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
