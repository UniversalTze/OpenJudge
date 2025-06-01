"""
This is the main receiver module for the execution service. It handles incoming test execution requests via Celery,
executes the tests and returns the result according to specified formats described in the documentation.
"""

from celery import Celery
from src.executor import executor_generator
from src.config import (
    INPUT_QUEUE,
    BROKER,
    OUTPUT_QUEUE,
    LANGUAGE
)

# Initialise the Celery application
celery = Celery("receiver")
celery.conf.broker=BROKER
celery.conf.task_default_queue=INPUT_QUEUE

# Select the executor based on the language
executor = executor_generator(LANGUAGE)

################################################################################

@celery.task(queue=INPUT_QUEUE)
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
    # Run tests in sandboxed environment
    test_runner = executor(
        function_name,
        submission_code,
        inputs,
        outputs,
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

################################################################################

@celery.task(name="send_results", queue=OUTPUT_QUEUE)
def send_results(results):
    print("Results sent to output queue:", results) 
    return results
    # TODO: REMOVE THIS LOGGING INFO AND REPLACE WITH SOMETHING MORE USEFUL