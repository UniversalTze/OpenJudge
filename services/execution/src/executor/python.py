"""
Executor for Python code.
"""
from src.config import TEMP_DIR
from pathlib import Path
import subprocess

# TODO: ABSTRACT 

def python_executor(
    submission_code: str,
    test_cases: list,
    function_name: str,
    directory: Path
    ):
    """
    Executes the given submission code against the provided test cases.
    Args:
        submission_code (str): The code for the submission.
        test_cases (list): A list of test case strings.
        function_name (str): The name of the function to test.
    Returns:
        list: Results for each test case (pass/fail and error messages).
    """   
    # Create the submission file
    with open(directory / "submission.py", "w") as submission_file:
        submission_file.write(submission_code)
    
    # Create the test files TODO
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
            results.append({
                "test": i,
                "passed": proc.returncode == 0,
                "stdout": stdout.decode(),
                "stderr": filter_err_msg(stderr.decode().splitlines(), f"test_{i}.py"),
            })
        except subprocess.TimeoutExpired:
            proc.kill()
            results.append({
                "test": i,
                "passed": False,
                "error": "Timeout"
            })
    
    # Return the results
    return results    

def write_test_case(test_case: dict, function_name: str, test_file):
    """
    Writes a test case to a file.
    Args:
        test_case (str): The test case string.
        function_name (str): The name of the function to test.
        test_file: The file object to write the test case to.
    """
    # Write relative import of the function name
    test_file.write(f"from submission import {function_name}\n")
    
    # Write the test case
    test_file.write(test_case['code'])
    
    # Call the test case with the function TODO
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