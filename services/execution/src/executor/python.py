"""
Executor for Python code.
"""
from src.config import DEFAULT_MEMORY_LIMIT
from pathlib import Path
import subprocess

# TODO: ABSTRACT THIS TO A SEPARATE INTERFACE

def python_executor(
    submission_code: str,
    test_cases: list,
    function_name: str,
    directory: Path,
    ):
    """
    Executes the given submission code against the provided test cases.
    Args:
        submission_code (str): The code for the submission.
        test_cases (list): A list of test case strings.
        function_name (str): The name of the function to test.
        directory (Path): Directory to store temporary files.
        memory_limit (int): Maximum memory in bytes that each test can use.
    Returns:
        list: Results for each test case (pass/fail and error messages).
    """
    # Create the submission file
    with open(directory / "submission.py", "w") as submission_file:
        submission_file.write(submission_code)

    # Create the test files with memory limits included
    for i, test_case in enumerate(test_cases):
        with open(directory / f"test_{i}.py", "w") as test_file:
            write_test_case(test_case, function_name, test_file)

    # Run the test script (in parallel), capturing the output
    processes = []
    for i, test_case in enumerate(test_cases):
        test_file = directory / f"test_{i}.py"

        # Start the subprocess for each test
        proc = subprocess.Popen(
            ["python3", str(test_file)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        processes.append((i, proc))

    results = []
    for i, proc in processes:
        try:
            stdout, stderr = proc.communicate(timeout=5)  # 5 second time limit
            stderr_text = stderr.decode()

            # Check if memory limit was exceeded
            if "MemoryError" in stderr_text or "Resource temporarily unavailable" in stderr_text:
                results.append({
                    "test": i,
                    "passed": False,
                    "error": "Memory limit exceeded",
                    "stderr": "The code attempted to use more memory than allowed."
                })
            else:
                results.append({
                    "test": i,
                    "passed": proc.returncode == 0,
                    "stdout": stdout.decode(),
                    "stderr": filter_err_msg(stderr_text.splitlines(), f"test_{i}.py"),
                })
        except subprocess.TimeoutExpired:
            proc.kill()
            results.append({
                "test": i,
                "passed": False,
                "error": "Timeout",
                "stderr": "The code took too long to execute."
            })

    # Return the results
    return results

def write_test_case(test_case: dict, function_name: str, test_file):
    """
    Writes a test case to a file with memory limiting code.
    Args:
        test_case (dict): The test case dictionary.
        function_name (str): The name of the function to test.
        test_file: The file object to write the test case to.
        memory_limit (int): Maximum memory in bytes that the test can use.
    """
    # Write memory limiting code at the beginning
    test_file.write(f"""import resource

# Set memory limit to {DEFAULT_MEMORY_LIMIT} bytes
resource.setrlimit(resource.RLIMIT_AS, ({DEFAULT_MEMORY_LIMIT}, {DEFAULT_MEMORY_LIMIT}))

""")

    # Write relative import of the function name
    test_file.write(f"from submission import {function_name}\n\n")

    # Write the test case
    test_file.write(test_case['code'])

    # Call the test case with the function
    test_file.write(f"\n\n\n{test_case['name']}({function_name})\n")

def filter_err_msg(err_msg: list, test_filename: str):
    """
    Filters the error message to remove unnecessary lines.
    Args:
        err_msg (list): The error message lines.
    Returns:
        list: Filtered error message lines.
    """
    return "\n".join(
        line for line in err_msg
        if test_filename in line or "submission" in line
    )