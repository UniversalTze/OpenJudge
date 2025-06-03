# schemas of DB
from .database import Base
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime

class Problems(Base): 
    __tablename__ = 'problembank'
    problem_id = Column(String, primary_key=True)
    problem_title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    topics = Column(ARRAY(String), nullable=False)
    description = Column(Text, nullable=False)
    examples = Column(Text, nullable=False)
    constraints = Column(ARRAY(Text), nullable=False)
    test_cases = Column(Text, nullable=False)
    hint = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now())

