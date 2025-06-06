from celery import Celery
from config import config

celery = Celery("Subscriber")

celery.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_always_eager=False,
    broker_transport_options={
        "region": config.AWS_REGION,
        "visibility_timeout": 3600,
        "polling_interval": 5,
        "predefined_queues": {
            config.OUTPUT_QUEUE_NAME: {
                "url": config.OUTPUT_QUEUE_URL,
            }
        }
    } if config.ENV == "production" else {},
    task_default_queue=config.OUTPUT_QUEUE_NAME,
)