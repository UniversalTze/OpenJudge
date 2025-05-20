"""
This is the main receiver module for the execution service. It handles incoming test execution requests via Celery,
executes the tests and returns the result according to specified formats described in the documentation.
"""

from celery import Celery
from src.executor import select_executor
from src.config import (
    INPUT_QUEUE, 
    BROKER, 
    OUTPUT_QUEUE,
    LANGUAGE
)

# Initialise the Celery application
celery = Celery("receiver")
celery.conf.broker=BROKER
celery.conf.task_default_queue = INPUT_QUEUE

# Select the executor based on the language
executor = select_executor(LANGUAGE)

################################################################################

@celery.task()
def execute_submission(
    submission_code: str,
    test_cases: list, 
    function_name: str, 
    language: str):
    """
    Executes the given submission code against the provided test cases.
    Args:
        submission_code (str): The code for the submission.
        test_cases (list): A list of test case strings.
        function_name (str): The name of the function to test.
    Returns:
        list: Results for each test case (pass/fail and error messages).
    """
    # TODO: ASSERT THE LANGUAGE IS THE CORRECT ONE
    results = executor(submission_code, test_cases, function_name)
    send_results.apply_async(args=[results], queue=OUTPUT_QUEUE)

################################################################################

@celery.task(name="send_results")
def send_results(results):
    print("Results sent to output queue:", results) 
    return results
    # TODO: REMOVE THIS LOGGING INFO AND REPLACE WITH SOMETHING MORE USEFUL