from celery import Celery
from config import config

celery_client = Celery("Publisher")

celery_client.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_always_eager=False,
    broker_transport_options={
        "region": config.AWS_REGION,
        "visibility_timeout": 3600,
        "polling_interval": 5,
        "predefined_queues": {
            config.JAVA_QUEUE_NAME: {
                "url": config.JAVA_QUEUE_URL,
            },
            config.PYTHON_QUEUE_NAME: {
                "url": config.PYTHON_QUEUE_URL,
            },
        }
    } if config.ENV == "production" else {},
)

def send(payload, queue, client):
    """Send a task to the specified queue."""
    queue = config.PYTHON_QUEUE_NAME if queue == "python" else config.JAVA_QUEUE_NAME
    client.send_task("process_submission", args=[payload], queue=queue)