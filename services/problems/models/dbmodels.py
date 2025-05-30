# schemas of DB

from .database import Base
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime

class Problems(Base): 
    __tablename__ = 'Problem_Sets'
    problem_id = Column(String, primary_key=True)
    description = Column(Text, nullable=False)
    topics = Column(ARRAY(Text), nullable=False)
    difficulty = Column(String, nullable=False)
    test_cases = Column(ARRAY(Text), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now())

