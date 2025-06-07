from celery import Celery
from config import config
from database import get_session
from datetime import datetime
from models import Submission
from sqlalchemy import select
import asyncio
from config import config

celery = Celery("Subscriber")

celery.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_always_eager=False,
    broker_url=config.CELERY_BROKER_URL,
    task_default_queue=config.OUTPUT_QUEUE_NAME,
    task_routes={
        'result': {'queue': config.OUTPUT_QUEUE_NAME},
    }
)

@celery.task(name="result", queue=config.OUTPUT_QUEUE_NAME)
def process_result(result: dict):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(_process_result(result))
        finally:
            loop.close()
    except Exception as e:
        print(f"Error processing result: {e}")
        return False

async def _process_result(result: dict):
    session_gen = get_session()
    session = await session_gen.__anext__()
    try:
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

        submission.status = "passed" if all(test["passed"] for test in submission.results) else "failed"
        submission.updated_at = datetime.utcnow()
        await session.commit()
        print(f"Updated submission {submission_id} with new results.")
        return True
    except Exception as e:
        print("Error committing session:", e)
        await session.rollback()
        return False
    
    finally:
        try:
            await session_gen.aclose()
        except Exception as e:
            print("Error closing session:", e)
