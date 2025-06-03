# For SQL Schemas

from pydantic import BaseModel
from typing import List

### Problem set
class Problem(BaseModel):
    problem_id: str
    problem_title: str
    difficulty: str
    topics: List[str]
    description: str
    examples: str
    constraints: List[str]
    test_cases: str
    hint = str
    created_at = str
