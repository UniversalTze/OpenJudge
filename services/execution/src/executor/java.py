"""
Executor for Java code.
"""
import subprocess
import re
from src.executor.abstract_executor import AbstractExecutor

class JavaExecutor(AbstractExecutor):
    def _build_test_files(self):
        """
        Builds the test files for the Java submission.
        Creates a Java class file and test files for each test case.
        """
        # Create the submission Java file
        class_name = self._extract_class_name(self.submission_code)
        with open(self.test_dir / f"{class_name}.java", "w") as submission_file:
            submission_file.write(self.submission_code)

        # Create the test files
        for i, test_case in enumerate(self.test_cases):
            with open(self.test_dir / f"Test{i}.java", "w") as test_file:
                self._write_test_case(test_case, i, test_file, class_name)

    def _extract_class_name(self, java_code: str) -> str:
        """
        Extracts the class name from Java code.

        Args:
            java_code (str): The Java source code.

        Returns:
            str: The class name.
        """
        # Simple regex to find public class declaration
        match = re.search(r'public\s+class\s+(\w+)', java_code)
        if match:
            return match.group(1)
        else:
            # Fallback to a default name
            return "Solution"

    def _get_execution_command(self, test_number: int) -> str:
        """
        Returns the command to execute the Java test file.

        Args:
            test_number (int): The test number to execute.

        Returns:
            str: The command to compile and run the test.
        """
        # Java requires compilation before execution
        return f"cd {self.test_dir} && javac *.java && java Test{test_number}"

    def _write_test_case(self, test_case, test_number, test_file, class_name):
        """
        Writes a test case to a Java file.

        Args:
            test_case (dict): The test case dictionary.
            test_number (int): The test case number.
            test_file: The file object to write to.
            class_name (str): The name of the submission class.
        """
        # Write the Java test class
        test_file.write(f"""public class Test{test_number} {{
    public static void main(String[] args) {{
        {class_name} solution = new {class_name}();

        // Test case code
{test_case['code']}

        // Call the test function
        {test_case['name']}(solution);
    }}
}}
""")

    def _get_result(self, process: subprocess.Popen, stdout: bytes, stderr: bytes) -> dict:
        """
        Processes the result from a Java test execution.

        Args:
            process (subprocess.Popen): The process that ran the test.
            stdout (bytes): The standard output from the process.
            stderr (bytes): The standard error from the process.

        Returns:
            dict: The result of the test execution.
        """
        try:
            stdout_text = stdout.decode() if stdout else ""
            stderr_text = stderr.decode() if stderr else ""

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
            elif "error:" in stderr_text.lower() and process.returncode != 0:
                # Compilation error
                return {
                    "passed": False,
                    "timeout": False,
                    "stdout": "",
                    "stderr": self._filter_error_message(stderr_text)
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
            if "Test" in line or ".java" in line or "error:" in line.lower()
        )