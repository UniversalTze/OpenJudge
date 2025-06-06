from celery import Celery
from config import config

celery_client = Celery("Publisher")

celery_client.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_always_eager=False,
    broker_url=config.CELERY_BROKER_URL,
)

def send(payload, queue, client):
    """Send a task to the specified queue."""
    queue = config.PYTHON_QUEUE_NAME if queue == "python" else config.JAVA_QUEUE_NAME
    client.send_task("execute_submission", args=[
        payload.submission_id, 
        payload.submission_code,
        payload.inputs,
        payload.outputs,
        payload.function_name], queue=queue)
    