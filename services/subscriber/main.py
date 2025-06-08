from celery import Celery
from config import config
from database import connect_db
from datetime import datetime, timezone
from models import Submission
from sqlalchemy import select
import asyncio

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
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try: 
        return loop.run_until_complete(_process_result(result))
    finally:
        loop.close()

async def _process_result(result: dict):
    submission_id = result.get("submission_id")
    test_number = result.get("test_number", 0)
    if not submission_id:
        print("Missing submission_id in result payload")
        return False
    
    db = await connect_db()
    try: 
        stmt = select(Submission).where(Submission.submission_id == submission_id).with_for_update()
        result_obj = await db.execute(stmt)
        submission = result_obj.scalar_one_or_none()
        
        if not submission:
            print(f"Submission with ID {submission_id} not found.")
            return False
    
        if not isinstance(submission.results, list):
            submission.results = []
            
        print(f"Updating submission {submission_id} with new result.")

        existing_test = next((test for test in submission.results if test.get("test_number") == test_number), None)
        
        if existing_test:
            print(f"Test {test_number} already processed for submission {submission_id}")
            return True
        
        print(f"Updating submission {submission_id} with test {test_number} result.")

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
        submission.updated_at = datetime.utcnow()
        
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(submission, "results")
        
        if len(submission.results) == submission.num_tests:
            submission.status = "passed" if all(test["passed"] for test in submission.results) else "failed"
        
        await db.commit()
        await db.refresh(submission)
        
        print(f"Successfully added test {test_number} to submission {submission_id}. Total tests: {len(submission.results)}")
        return True
    except Exception as e:
        print("Error updating database:", e)
        await db.rollback()
        return False
    finally:
        await db.close()
