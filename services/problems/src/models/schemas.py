# For SQL Schemas

from pydantic import BaseModel
from typing import List

### Problem set
class Problem_Response(BaseModel):
    problem_id: str
    problem_title: str
    difficulty: str
    topics: List[str]
    description: str
    examples: str
    function_name: str
    return_type: str
    constraints: List[str]
    test_cases: str
    hint: str
    created_at: str