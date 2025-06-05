from celery import Celery
from config import config

celery_app = Celery('submission_worker', broker=config.BROKER_URL)

def send_to_queue(task_name, payload, queue):
    celery_app.send_task(task_name, args=[payload], queue=queue)
