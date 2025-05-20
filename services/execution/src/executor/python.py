"""
Executor for Python code.
"""
import subprocess
from src.executor.abstract_executor import AbstractExecutor

class PythonExecutor(AbstractExecutor):
    def _build_test_files(self):
        """
        Builds the test files for the Python submission.
        Creates a submission.py file and test files for each test case.
        """
        # Create the submission file
        with open(self.test_dir / "submission.py", "w") as submission_file:
            submission_file.write(self.submission_code)

        # Create the test files
        for i, test_case in enumerate(self.test_cases):
            with open(self.test_dir / f"test_{i}.py", "w") as test_file:
                self._write_test_case(test_case, i, test_file)

    def _get_execution_command(self, test_number):
        """
        Writes a test case to a file.

        Args:
            test_case (dict): The test case dictionary.
            test_number (int): The test case number (unused but kept for future use).
            test_file: The file object to write to.
        """
        # TODO - UPDATE THIS TO USE THE CORRECT PYTHON COMMAND FOR ANY INFRASTRUCTURE!
        test_file = self.test_dir / f"test_{test_number}.py"
        return f"python3 {test_file}" 

    def _get_result(self, process: subprocess.Popen) -> dict:
        """
        Processes the result from a test execution.

        Args:
            process (subprocess.Popen): The process that ran the test.

        Returns:
            dict: The result of the test execution.
        """
        # TODO - UPDATE THIS TO ALSO RETURN IF MEMORY ALLOCATION EXCEEDED!
        try:
            stdout, stderr = process.communicate()
            stdout_text = stdout.decode()
            stderr_text = stderr.decode()

            # Check for different error conditions
            if process.returncode == 124:
                # Timeout from the timeout command
                return {
                    "passed": False,
                    "timeout": True,
                    "stdout": "",
                    "stderr": f"The code exceeded the time limit of {self.timeout} seconds."
                }
            elif process.returncode == 137 or "Cannot allocate memory" in stderr_text:
                # Memory limit exceeded
                return {
                    "passed": False,
                    "timeout": False,
                    "stdout": "",
                    "stderr": "The code attempted to use more memory than allowed."
                }
            else:
                # Normal execution
                return {
                    "passed": process.returncode == 0,
                    "timeout": False,
                    "stdout": stdout_text,
                    "stderr": self._filter_error_message(stderr_text)
                }
        except Exception as e:
            # Handle any unexpected errors
            return {
                "passed": False,
                "timeout": False,
                "stdout": "",
                "stderr": f"Error processing test result: {str(e)}"
            }

    def _filter_error_message(self, error_message: str) -> str:
        """
        Filters the error message to only include relevant lines.

        Args:
            error_message (str): The full error message.

        Returns:
            str: The filtered error message.
        """
        if not error_message:
            return ""

        lines = error_message.splitlines()
        return "\n".join(
            line for line in lines
            if "test_" in line or "submission.py" in line
        )
