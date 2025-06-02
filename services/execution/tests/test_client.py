#!/usr/bin/env python3
"""
Test client for the execution service.
This script can be used to send test requests to the Celery worker and listen for results.
"""

import os
import sys
import time
import threading
from celery import Celery

results_received = 0

def setup_celery():
    """Set up Celery client with the same configuration as the worker."""
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
    input_queue = os.environ.get("TARGET_QUEUE", "pythonq")

    app = Celery("test_client")
    app.conf.broker_url = broker_url
    app.conf.task_default_queue = input_queue

    return app

def setup_result_listener():
    """Set up Celery app to listen for results from the output queue."""
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
    output_queue = os.environ.get("OUTPUT_QUEUE", "pythonoutputq")

    app = Celery("result_listener")
    app.conf.broker_url = broker_url
    app.conf.task_default_queue = output_queue

    # Define a task to receive results
    @app.task(name="receive_results", queue=output_queue)
    def receive_results(results):
        print("\n" + "="*60)
        print("📥 RECEIVED EXECUTION RESULTS:")
        print("="*60)
        print(f"Results: {results}")
        print("="*60 + "\n")
        results_received += 1
        return results

    return app, receive_results

def send_test_request():
    """Send a test execution request."""
    app = setup_celery()
    
    # Sample test data
    java_code = """
public class Solution {
    public static int solution(int x) {
        return x * 5;
    }
}
"""
    
    submission_code = """
def solution(x):
    return x * 5
"""
    
    test_inputs = [[5], [7], [13]]
    expected_outputs = [25, 35, 65]
    function_name = "solution"
    submission_id = "test_001"
    
    print("Sending test request...")
    print(f"Submission ID: {submission_id}")
    print(f"Function: {function_name}")
    print(f"Test inputs: {test_inputs}")
    print(f"Expected outputs: {expected_outputs}")
    print("-" * 50)
    
    try:
        # Send the task - use the correct task name that matches the worker
        result1 = app.send_task(
            'execute_submission',
            args=[submission_id + "_python", submission_code, test_inputs, expected_outputs, function_name],
            queue="pythonq"
        )
        print(f"Task sent successfully! Task ID: {result1.id}")
        
        result2 = app.send_task(
            'execute_submission',
            args=[submission_id + "_java", java_code, test_inputs, expected_outputs, function_name],
            queue="javaq"
        )
        
        print(f"Task sent successfully! Task ID: {result2.id}")
        print("Check the worker logs for execution results.")
        
        return result1, result2
        
    except Exception as e:
        print(f"Error sending task: {e}")
        return None

def start_result_listener():
    """Start a Celery worker to listen for results."""
    print("🎧 Starting result listener...")
    print("Listening for results on output queue...")
    print("Press Ctrl+C to stop")
    print("-" * 50)

    try:
        app, _ = setup_result_listener()
        # Start the worker to listen for results
        app.worker_main(['worker', '--loglevel=info', '--concurrency=1'])
    except KeyboardInterrupt:
        print("\n👋 Result listener stopped.")
    except Exception as e:
        print(f"❌ Error in result listener: {e}")

def simple_test():
    """Run a simple test: just send request and check worker logs."""
    print("🧪 RUNNING SIMPLE TEST")
    print("=" * 60)

    # Send the test request
    print("📤 Sending test request...")
    task_result = send_test_request()

    if task_result is None:
        print("❌ Failed to send test request")
        return False

    print("✅ Test request sent successfully!")
    print("📋 Check the worker logs to see if the task was processed.")
    print("💡 Look for 'RECEIVED TASK' and 'Sending results to output queue' messages.")
    return True

def full_test():
    """Run a complete test: send request and monitor Redis for results."""
    print("🧪 RUNNING FULL TEST")
    print("=" * 60)

    import time
    import redis

    # Connect to Redis to monitor the output queue
    try:
        broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
        # Extract Redis connection details
        if "redis://" in broker_url:
            redis_host = broker_url.split("://")[1].split(":")[0]
            redis_port = int(broker_url.split(":")[-1].split("/")[0])
        else:
            redis_host = "localhost"
            redis_port = 6379

        r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        r.ping()  # Test connection
        print(f"✅ Connected to Redis at {redis_host}:{redis_port}")
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        print("📋 Falling back to simple test...")
        return simple_test()

    # Send the test request
    print("📤 Sending test request...")
    task_result = send_test_request()

    if task_result is None:
        print("❌ Failed to send test request")
        return False

    print("⏳ Monitoring for results...")
    print("(This may take a few seconds...)")

    # Monitor Redis for activity
    timeout = 30  # 30 seconds timeout
    start_time = time.time()

    while time.time() - start_time < timeout:
        try:
            # Check if there are any messages in the output queue
            output_queue = os.environ.get("OUTPUT_QUEUE", "pythonoutputq")
            queue_length = r.llen(output_queue)

            if queue_length > 0:
                print(f"\n✅ Found {queue_length} message(s) in output queue!")
                print("✅ FULL TEST COMPLETED SUCCESSFULLY!")
                print("📊 Test execution and result delivery working correctly.")
                return True

            time.sleep(0.5)
            print(".", end="", flush=True)

        except Exception as e:
            print(f"\n❌ Error monitoring Redis: {e}")
            break

    print(f"\n⏰ Timeout after {timeout} seconds - no results found in output queue")
    print("📋 Check worker logs for any error messages.")
    print("❌ FULL TEST FAILED")
    return False

def send_and_listen():
    """Send a test request and start listening for results (interactive mode)."""
    print("🚀 Sending test request and starting result listener...")

    # Start result listener in a separate thread
    import threading
    listener_thread = threading.Thread(target=start_result_listener, daemon=True)
    listener_thread.start()

    # Give the listener a moment to start
    import time
    time.sleep(2)

    # Send the test request
    send_test_request()

    print("\n🎧 Result listener is running...")
    print("Waiting for results... (Press Ctrl+C to stop)")

    try:
        # Keep the main thread alive to receive results
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Stopping...")

def main():
    """Main function."""
    print("Execution Service Test Client")
    print("=" * 40)

    # Check environment variables
    broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
    input_queue = os.environ.get("TARGET_QUEUE", "pythonq")
    output_queue = os.environ.get("OUTPUT_QUEUE", "pythonoutputq")

    print(f"Broker URL: {broker_url}")
    print(f"Input Queue: {input_queue}")
    print(f"Output Queue: {output_queue}")
    print("-" * 40)

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "send":
            send_test_request()
        elif command == "listen":
            start_result_listener()
        elif command == "send-and-listen":
            send_and_listen()
        elif command == "simple-test":
            success = simple_test()
            sys.exit(0 if success else 1)
        elif command == "full-test":
            success = full_test()
            sys.exit(0 if success else 1)
        else:
            print(f"Unknown command: {command}")
            show_help()
    else:
        show_help()

def show_help():
    """Show usage help."""
    print("Usage:")
    print("  python test_client.py send             - Send a test request")
    print("  python test_client.py listen           - Listen for results")
    print("  python test_client.py send-and-listen  - Send request and listen for results")
    print("  python test_client.py simple-test      - Send request and check logs")
    print("  python test_client.py full-test        - Run complete test with Redis monitoring")
    print("  python test_client.py                  - Show this help")

if __name__ == "__main__":
    main()
