#!/usr/bin/env python3
"""
Test client for the execution service.
This script can be used to send test requests to the Celery worker and listen for results.
"""

import os
import sys
import time
from json import loads
from celery import Celery
from pathlib import Path

# Global constants for testing purposes
LOG_FILE = Path(__file__).parent / 'test_client.log'
TEST_CASE_DIR = Path(__file__).parent / "test_cases"
with open(TEST_CASE_DIR / "test_cases.json", "r") as f:
    ALL_TEST_INFO = loads(f.read())
print("Test case directory: ", TEST_CASE_DIR)

# Global variables for testing purposes
results_received = 0
languages = ["python", "java"]
test_cases = [test_case["test_name"] for test_case in ALL_TEST_INFO]
test_info = {test_case["test_name"]: test_case for test_case in ALL_TEST_INFO}
results_dict = {}

def setup_celery():
    """Set up Celery client with the same configuration as the worker."""
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
    app = Celery("test_client")
    app.conf.broker_url = broker_url
    return app

def setup_result_listener():
    """Set up Celery app to listen for results from the output queue."""
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
    output_queue = os.environ.get("OUTPUT_QUEUE", "outputq")

    app = Celery("result_listener")
    app.conf.broker_url = broker_url
    app.conf.task_default_queue = output_queue

    # Define a task to receive results
    @app.task(name="result", queue=output_queue)
    def receive_results(results):
        with open(LOG_FILE, 'a') as f:
            f.write(f"\n{results}\n")
            
        global results_received
        results_received += 1
        
        global results_dict
        curr_passed = results_dict[results['submission_id']]
        if curr_passed and not results['passed']:
            results_dict[results['submission_id']] = False
            
    return app, receive_results

def listen_for_results(duration_seconds=30):
    """Listen for results for a specified duration.
    
    Args:
        duration_seconds: How long to listen for results (in seconds)
    """
    global results_received, results
    results_received = 0
    results = {}
    
    print(f"🎧 Starting result listener for {duration_seconds} seconds...")
    print("Listening for results on output queue...")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    # Set up Celery app for listening
    app, _ = setup_result_listener()
    
    # Create a worker process
    worker = app.Worker(
        loglevel='INFO',
        concurrency=1,
        queues=[os.environ.get("OUTPUT_QUEUE", "outputq")],
    )
    
    # Start the worker in a separate thread so we can control the duration
    import threading
    
    def worker_thread():
        try:
            worker.start()
        except Exception as e:
            print(f"❌ Error in worker thread: {e}")
    
    thread = threading.Thread(target=worker_thread, daemon=True)
    thread.start()
    
    # Wait for the specified duration, showing progress
    start_time = time.time()
    end_time = start_time + duration_seconds
    
    try:
        while time.time() < end_time:
            remaining = int(end_time - time.time())
            print(f"\rListening... {remaining}s remaining ({results_received} results received)", end="", flush=True)
            time.sleep(3)
            
        print("\n⏱️ Listening period ended.")
        
    except KeyboardInterrupt:
        print("\n👋 Listening stopped by user.")
    except Exception as e:
        print(f"\n❌ Listening stopped due to error: {e}")
    finally:
        # Stop the worker
        worker.stop()
        print(f"📊 Total results received: {results_received}")
    return 
 
def get_test_case(test_case, lang):
    """Get data regarding a test case"""
    c = test_info['test_case']
    inputs = None
    outputs = None
    submission = None
    function_name = None
    return inputs, outputs, submission, function_name

def run_tests():
    """Run all tests in test_cases for all languages in languages"""
    # Set up Celery apps for sending and receiving
    app = setup_celery()
    
    # For each test case and language, send the request
    for lang in languages:
        for test_case in test_cases:
            inp, outp, code, func, _ = get_test_case(test_case, lang)
            app.send_task(
                'execute_submission',
                args=[test_case + "_" + lang, code, inp, outp, func],
                queue=lang + "q"
            )
    
    # Results will be monitored asynchronously - print 20s
    listen_for_results(duration_seconds=20)
    time.sleep(2)

    # Check results dictionary
    for lang in languages:
        for test_case in test_cases:
            submission_id = test_cases + "_" + lang
            if not results_dict[submission_id]:
                print(f"❌ Test case {test_case} failed for {lang} - no results received")
                continue
            _, _, _, _, correct = get_test_case(test_case, lang)
            if results_dict[submission_id] != correct:
                print(f"❌ Test case {test_case} failed for {lang} - expected {correct}, got {results_dict[submission_id]}")
                continue
            print(f"✅ Test case {test_case} passed for {lang}")

def main():
    """Main function."""
    print("Execution Service Test Client")
    print("=" * 40)

    # Check environment variables
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")

    print(f"Broker URL: {broker_url}")
    print("-" * 40)
    
    if broker_url == "redis://localhost:6379":
        print("WARNING: Using default Redis URL. Make sure Redis is running locally.")
        
    # Process language option if present
    if len(sys.argv) > 1 and sys.argv[1] == "--lang":
        if len(sys.argv) == 1:
            print(f"Language must be specified if --lang flag used. Must be one of {languages}")
            sys.exit(1)
        if sys.argv[2] not in languages:
            print(f"Invalid language: {sys.argv[2]}. Must be one of {languages}")
            sys.exit(1)
        # Valid language - process and remove cmd line option
        languages = [sys.argv[2]]
        sys.argv.pop(1)
        sys.argv.pop(1)

    if len(sys.argv) > 1:
        user_input_cases = sys.argv[1:]
        extraneous = set(user_input_cases) - set(test_cases)
        if extraneous:
            print(f"Invalid test cases: {extraneous}. Must be one of {test_cases}")
            sys.exit(1)
        test_cases = user_input_cases
        test_info = {test_info['name']: test_case for test_case in filter(lambda x: x['test_name'] in test_cases)}

    run_tests()
    
def show_help():
    """Show usage help."""
    print("Usage:")
    print("  python test_client.py [--lang {python|java}] [test_cases...]   - Run specified test cases against language sending input and checking output queues.")
    print("                                                                 - Runs all languages if no language specified. Runs all test cases if non specified.")
    print("  See Testing section in `services/execution/ReadMe.md` for more details")

if __name__ == "__main__":
    main()
