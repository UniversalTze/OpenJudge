from celery import Celery
from subscriber.config import config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from app.models.models import Submission
from datetime import datetime

# Set up Celery Application
celery = Celery('subscriber', broker=config.BROKER_URL)
celery.conf.task_default_queue = config.OUTPUT_QUEUE

# Initialise DB connection
engine = create_engine(config.DATABASE_URL)
Session = scoped_session(sessionmaker(bind=engine))

@celery.task(name="result", queue=config.OUTPUT_QUEUE)
def process_result(result: dict):
    session = Session()
    try:
        submission_id = result.get("submission_id")
        if not submission_id:
            print("Missing submission_id in result payload")
            return

        submission = session.query(Submission).filter_by(submission_id=submission_id).first()
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

        submission.updated_at = datetime.utcnow()
        session.commit()
    except Exception as e:
        print("Error processing result:")
        session.rollback()
    finally:
        session.close()
    