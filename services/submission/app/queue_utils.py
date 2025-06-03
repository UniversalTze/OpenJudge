import os
import json
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from queue import Queue as LocalQueue

# Determine environment
APP_ENV = os.getenv('APP_ENV', 'LOCAL')
if APP_ENV == 'AWS':
    region = os.getenv('AWS_REGION', 'us-east-1')
    sqs = boto3.resource('sqs', region_name=region)
    queue_name = os.getenv('AWS_SQS_QUEUE_NAME')
    try:
        sqs_queue = sqs.get_queue_by_name(QueueName=queue_name)
    except ClientError as e:
        raise RuntimeError(f"Failed to connect to SQS queue '{queue_name}': {e}")
else:
    sqs_queue = LocalQueue()

def enqueue_submission(message_dict):
    if APP_ENV == 'AWS':
        body = json.dumps(message_dict)
        try:
            response = sqs_queue.send_message(MessageBody=body)
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"SQS send_message failed: {e}")
    else:
        sqs_queue.put(message_dict)

def check_queue_health():
    if APP_ENV == 'AWS':
        try:
            sqs_queue.load()
            return True
        except Exception:
            return False
    else:
        return sqs_queue is not None
