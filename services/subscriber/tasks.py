from celery_worker import celery
from database import get_session
from datetime import datetime
from models import Submission
from sqlalchemy import select
import asyncio

@celery.task(name="result", queue="output")
def process_result(result: dict):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return loop.create_task(_process_result(result))
        else:
            return asyncio.run(_process_result(result))
    except RuntimeError:
        return asyncio.run(_process_result(result))

async def _process_result(result: dict):
    async for session in get_session():
        submission_id = result.get("submission_id")
        if not submission_id:
            print("Missing submission_id in result payload")
            return

        stmt = select(Submission).filter_by(submission_id=submission_id)
        res = await session.execute(stmt)
        submission = res.scalar_one_or_none()

        if not submission:
            print(f"Submission with ID {submission_id} not found.")
            return
        
        if not isinstance(submission.results, list):
            submission.results = []

        submission.results.append({
            "test_number": result.get("test_number"),
            "passed": result.get("passed"),
            "inputs": result.get("inputs"),
            "expected": result.get("expected"),
            "output": result.get("output"),
            "stdout": result.get("stdout"),
            "error": result.get("error"),
            "timestamp": datetime.utcnow().isoformat()
        })

        if len(submission.results) >= submission.num_tests:
            submission.status = "passed" if all(test["passed"] for test in submission.results) else "failed"

        submission.updated_at = datetime.utcnow()

        try:
            await session.commit()
        except Exception as e:
            print("Error committing session:", e)
            await session.rollback()
