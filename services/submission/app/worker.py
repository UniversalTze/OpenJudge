from queue_utils import celery_app
from models import db, Submission
from flask import Flask
import os
import io
from contextlib import redirect_stdout
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 
    'postgresql://postgres:postgres@localhost:5432/submissions'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@celery_app.task(name='process_submission')
def process_submission(task_data):
    """Execute submitted code and store results."""
    submission_id = task_data['submission_id']
    code = task_data['submission_code']
    inputs = task_data['inputs']        
    outputs = task_data['outputs']    
    func_name = task_data['function_name']

    results = []
    for test_input, expected in zip(inputs, outputs):
        result = {
            "submission_id": submission_id,
            "inputs": test_input,
            "expected": expected,
            "output": None,
            "stdout": None,
            "error": None,
            "passed": False
        }
        stdout_buf = io.StringIO()
        try:
            local_vars = {}
            exec(code, {}, local_vars)
            func = local_vars.get(func_name)
            if not func:
                raise NameError(f"Function '{func_name}' not found")

            with redirect_stdout(stdout_buf):
                if isinstance(test_input, list):
                    out = func(*test_input)
                else:
                    out = func(test_input)

            result["output"] = out
            result["stdout"] = stdout_buf.getvalue()
            result["passed"] = (out == expected)
        except Exception as e:
            result["error"] = str(e)
            result["stdout"] = stdout_buf.getvalue()
        results.append(result)

    with app.app_context():
        sub = Submission.query.get(submission_id)
        if sub:
            sub.results = results
            sub.status = 'completed'
            sub.updated_at = datetime.utcnow()
            db.session.commit()