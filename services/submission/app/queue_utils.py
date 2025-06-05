from celery import Celery
import os

celery_app = Celery('submission_worker', broker=config.REDIS_URL)

def send_to_queue(task_name, payload, queue):
    celery_app.send_task(task_name, args=[payload], queue=queue)

@celery_app.task(name='handle_result', queue='resultq')
def handle_result(result_data):
    app = Flask(__name__)
    app.config.update({
        'SQLALCHEMY_DATABASE_URI': os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:postgres@db:5432/submissions'
        ),
        'SQLALCHEMY_TRACK_MODIFICATIONS': False
    })
    db.init_app(app)

    with app.app_context():
        sub_id = result_data.get('submission_id')
        if not sub_id:
            return

        try:
            submission = Submission.query.get(sub_id)
            if not submission:
                return

            existing_results = submission.results or []
            existing_results.append({
                'submission_id': result_data.get('submission_id'),
                'test_number': result_data.get('test_number'),
                'passed': result_data.get('passed'),
                'inputs': result_data.get('inputs'),
                'expected': result_data.get('expected'),
                'output': result_data.get('output'),
                'stdout': result_data.get('stdout'),
                'error': result_data.get('error')
            })

            submission.results = existing_results
            
            if submission.status != 'completed':
                submission.status = 'running'
            
            submission.updated_at = datetime.utcnow()
            db.session.commit()
        except Exception:
            db.session.rollback()
            return