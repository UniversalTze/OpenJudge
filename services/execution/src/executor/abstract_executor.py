"""
This file defines the abstract executor class, which is used to execute code for a given language.
All new languages must implement the abstract executor class.
"""

import subprocess
from os import makedirs
from uuid import uuid4

from src.config import TEMP_DIR, DEFAULT_MEMORY_LIMIT, DEFAULT_TIMEOUT

class AbstractExecutor:
    def __init__(
        self, 
        language: str,
        function_name: str,
        submission_code: str,
        test_cases: str,
        submission_id: str,
        ):
        
        # Initialise fields
        self.submission_id = submission_id
        self.language = language
        self.function_name = function_name
        self.submission_code = submission_code
        self.test_cases = test_cases
        
        self.timeout = DEFAULT_TIMEOUT
        self.memory_limit = DEFAULT_MEMORY_LIMIT
        
        # Create the submission directory
        self.test_dir = TEMP_DIR / str(uuid4())
        makedirs(self.test_dir, exist_ok=True)

    def run(self):
        """
        Runs the test cases against the submission code.
        
        Returns:
            dict: The results of the submission against the tests in JSON format.
                  Results will contain a list of results (in the order of the provided test cases),
                  each containing:
                  - passed: Whether the test passed
                  - timeout: Whether the test timeouted
                  - stdout: The stdout of the test (used for user debugging)
                  - stderr: The stderr of the test (filtered before being returned)
        """
        self._build_test_files()
        
        # Start the subprocess for each test
        processes = []
        for i in range(len(self.test_cases)):
            processes.append(subprocess.Popen(
                ["bash", "-c", f"ulimit -v {DEFAULT_MEMORY_LIMIT // 1024} && timeout {DEFAULT_TIMEOUT}s " + self._get_execution_command(i)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            ))

        # Get the results
        results = []
        for proc in processes:
            results.append(self._get_result(proc))

        return {"submission_id": self.submission_id, "results": results}

    def _build_test_files(self):
        """
        Builds the test files for the submission.
        
        Each executor should implement this method to build the relevant test files 
        needed to run each test case in parallel against the submission code.
        """
        # Implement in subclasses
        raise NotImplementedError

    def _get_execution_command(self, test_number: int) -> str:
        """
        Returns the command that needs to be executed to run the test case.
        
        Args:
            test_number (int): The index of the test case to execute.
            
        Returns:
            str: The command to run the test case
        """
        # Implement in subclasses
        raise NotImplementedError

    def _get_result(self, process: subprocess.Popen) -> dict:
        """
        Collects the result from the subprocess running the test case.
        
        Args:
            process (subprocess.Popen): The subprocess running the test case.
            
        Returns:
            dict: The result of the test case, containing:
                  - passed: Whether the test passed
                  - timeout: Whether the test timeouted
                  - stdout: The stdout of the test (used for user debugging)
                  - stderr: The stderr of the test (filtered before being returned)
        """
        # Implement in subclasses
        raise NotImplementedError
