from celery import Celery
from config import config

celery = Celery("Subscriber")

celery.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_always_eager=False,
    broker_url=config.CELERY_BROKER_URL,
    task_default_queue=config.OUTPUT_QUEUE_NAME,
)