"""
This is the main receiver module for the execution service. It handles incoming test execution requests via Celery,
executes the tests and returns the result according to specified formats described in the documentation.
"""

from celery import Celery
from src.executor import executor_generator
from src.config import (
    INPUT_QUEUE,
    BROKER,
    LANGUAGE,
    OUTPUT_QUEUE,
)

# TODO: Add proper logging!

# Initialise the Celery application
celery = Celery("receiver")
celery.conf.broker=BROKER
celery.conf.task_default_queue=INPUT_QUEUE

# Select the executor based on the language
executor = executor_generator(LANGUAGE)

print("STARTED CONTAINER")

################################################################################

@celery.task(name='execute_submission', queue=INPUT_QUEUE)
def execute_submission(
    submission_id: str,
    submission_code: str,
    inputs: list,
    outputs: list, # list of ints/bools/arrays/strings
    function_name: str):
    """
    Executes the given submission code against the provided test cases.
    Args:
        submission_id (str): The ID of the submission
        submission_code (str): The code for the submission
        inputs (list): List of lists of ints/bools/arrays/strings
        outputs (list): List of ints/bools/arrays/strings
        function_name (str): The name of the function to test
    Returns:
        list: Results for each test case (pass/fail and error messages).
    """
    print(f"RECEIVED TASK {submission_id}")
    print("SUBMISSION CODE: ", submission_code)
    # Run tests in sandboxed environment
    test_runner = executor(
        function_name,
        inputs,
        outputs,
        submission_code,
        submission_id,
        send_results,
    )
    with test_runner:
        test_runner.run()

    """ New procedure:
    1. Receive inputs and outputs, submission code and the function name
    2. Set up executor class
    3. Create sandboxed environment with context manager, and tear down at end
    4. Call the test runner
        5. The test runner should first build the test files (this includes a main test file which runs based on a particular set of input parameters and can read from the input file)
        6. It should then execute each test in parallel
        7. As results come in, it should send them to the output queue asynchronously (format in Google Doc)
    """
    
def send_results(results):
    """Send results to the output queue."""
    print("Sending results to output queue:", results)
    celery.send_task(
            'result',
            args=[results],
            queue=OUTPUT_QUEUE
    )