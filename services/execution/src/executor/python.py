"""
Executor for Python code.
"""
from src.executor.abstract_executor import AbstractExecutor

class PythonExecutor(AbstractExecutor):
    # PUBLIC METHODS
    def _build_test_files(self):
        """
        Builds the test files for the Python submission.
        Creates a submission.py file and test files for each test case.
        """
        # Create the submission file
        with open(self.test_dir / "submission.py", "w") as submission_file:
            submission_file.write(self.submission_code)

        # Create the test file
        test_code = f'''
from submission import {self.function_name}
from json import loads
from sys import argv, stderr, exit

if __name__ == "__main__":
    parameters = loads(argv[1])
    expected = loads(argv[2])
    output = {self.function_name}(*parameters)
    if output != expected:
        print("\\n", output, sep="", file=stderr)
        exit(232)
    print("\\nPassed but here is output: ", output, file=stderr)
    exit(0)
        '''
        with open(self.test_dir / "test_runner.py", "w") as test_file:
            test_file.write(test_code)

    def _get_execution_command(self, test_number: int) -> str:
        """
        Returns the command to execute the Python test file.

        Args:
            test_number (int): The test number to execute.

        Returns:
            str: The command to run the test.
        """
        return ["python",  f"{self.test_dir}/test_runner.py", f"{self.inputs[test_number]}",  f"{self.outputs[test_number]}"]
    
    def _get_result(self, returncode: int, stdout: bytes, stderr: bytes) -> dict:
        """
        Processes the result from a test execution.

        Args:
            returncode (int): The return code of the process.
            stdout (bytes): The standard output from the process.
            stderr (bytes): The standard error from the process.

        Returns:
            dict: The result of the test execution.
        """
        try:
            stdout_text = stdout.decode() if stdout else ""
            stderr_text = stderr.decode() if stderr else ""

            # Check for different error conditions
            if returncode == 124:
                # Timeout from the timeout command
                return {
                    "passed": False,
                    "timeout": True,
                    "memory_exceeded": False,
                    "output": "",
                    "stdout": stdout_text,
                    "stderr": f"The code exceeded the time limit of {self.timeout} seconds."
                }
            elif returncode == 137 or "Cannot allocate memory" in stderr_text:
                # Memory limit exceeded
                return {
                    "passed": False,
                    "timeout": False,
                    "output": "",
                    "memory_exceeded": True,
                    "stdout": stdout_text,
                    "stderr": "The code attempted to use more memory than allowed."
                }
            elif returncode == 232:
                stderr_text = stderr_text.split('\n')[:-1]
                
                return {
                    "passed": False,
                    "timeout": False,
                    "output": stderr_text[-1],
                    "memory_exceeded": False,
                    "stdout": stdout_text,
                    "stderr": '\n'.join(stderr_text[:-1])
                }
            else:
                # Normal execution
                passed = returncode == 0
                
                return {
                    "passed": passed,
                    "timeout": False,
                    "output": "",
                    "memory_exceeded": False,
                    "stdout": stdout_text,
                    "stderr": stderr_text if not passed else ""
                }
        except Exception as e:
            # Handle any unexpected errors
            return {
                "passed": False,
                "timeout": False,
                "memory_exceeded": False,
                "stdout": "",
                "stderr": f"Error processing test result: {str(e)}"
            }