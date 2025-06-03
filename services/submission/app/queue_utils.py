import os
import json

# Determine environment mode
USE_SQS = os.getenv('USE_SQS', 'false').lower() == 'true'

if USE_SQS:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    AWS_REGION    = os.getenv('AWS_REGION', 'us-east-1')
    SQS_QUEUE_URL = os.getenv('SQS_QUEUE_URL')
    if not SQS_QUEUE_URL:
        raise RuntimeError("Environment variable SQS_QUEUE_URL is required when USE_SQS=true")

    sqs = boto3.client('sqs', region_name=AWS_REGION)

    def enqueue_submission(message_dict):
        """
        Enqueue a submission job to AWS SQS.
        message_dict is a Python dict; we JSON-serialize it.
        """
        try:
            sqs.send_message(
                QueueUrl=SQS_QUEUE_URL,
                MessageBody=json.dumps(message_dict)
            )
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"SQS send_message failed: {e}")

    def check_queue_health():
        """
        Check if the SQS queue is reachable.
        """
        try:
            sqs.get_queue_attributes(
                QueueUrl=SQS_QUEUE_URL,
                AttributeNames=['QueueArn']
            )
            return True
        except Exception:
            return False

else:
    # Local development: Redis + RQ
    from rq import Queue
    from redis import Redis

    REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
    REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))

    redis_conn = Redis(host=REDIS_HOST, port=REDIS_PORT)
    task_queue = Queue('submission-tasks', connection=redis_conn)

    def enqueue_submission(message_dict):
        """
        Enqueue a submission job to Redis RQ.
        The worker must define a function `process_submission(submission_payload)`.
        """
        # We pass the entire dict; RQ will pickle/unpickle it for the worker.
        task_queue.enqueue('worker.process_submission', message_dict)

    def check_queue_health():
        """
        Check if Redis is reachable.
        """
        try:
            return redis_conn.ping()
        except Exception:
            return False
