from celery import Celery
import os

redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
celery_app = Celery('submission_worker', broker=redis_url, backend=redis_url)

def send_to_queue(task_name, payload, queue):
    celery_app.send_task(task_name, args=[payload], queue=queue)
