"""
This file defines the abstract executor class, which is used to execute code for a given language.
All new languages must implement the abstract executor class.
"""

import subprocess
import asyncio
import shutil
import gc
from os import makedirs
from uuid import uuid4
from typing import List, Dict, Any

from src.config import TEMP_DIR, DEFAULT_MEMORY_LIMIT, DEFAULT_TIMEOUT

class AbstractExecutor:
    def __init__(
        self,
        function_name: str,
        inputs: list,
        outputs: list,
        submission_code: str,
        submission_id: str,
        send_results: callable,
        ):
        # Initialise fields
        self.submission_id = submission_id
        self.function_name = function_name
        self.submission_code = submission_code
        self.inputs = inputs
        self.outputs = outputs
        self.num_tests = len(inputs)
        self.send_results = send_results
        # TODO: ASSERT LENGTH OF INPUTS AND OUTPUTS IS THE SAME AND ERROR IF NOT
        # TODO: ASSERT LENGTH OF EACH INPUT IS THE SAME AND ERROR IF NOT

        self.timeout = DEFAULT_TIMEOUT
        self.memory_limit = DEFAULT_MEMORY_LIMIT

    def __enter__(self):
        """
        Context manager entry to set up the sandboxed environment 
        from within which tests can be ran.
        """
        # Create the submission directory
        self.test_dir = TEMP_DIR / str(uuid4())
        makedirs(self.test_dir, exist_ok=True)

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Context manager exit to destroy the sandboxed environment when complete
        """
        shutil.rmtree(self.test_dir)
    
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

        # Clean up memory that is no longer needed TODO - SHOULD WE KEEP THIS IN?
        # del self.submission_code, self.test_cases
        # gc.collect()
        
        # Start all test processes
        processes = []
        for i in range(self.num_tests):
            processes.append(self.__start_sandboxed(i))
        
        # Wait for all to complete and handle results
        asyncio.run(self.__collect_tests_async(processes))

    def __start_sandboxed(self, test_num: int):
        """ 
        Set up a fully sandboxed environment in which to start a test
        """
        # TODO - SANDBOX THIS FURTHER!
        # cmd = ["bash", "-c", f"ulimit -v {self.memory_limit // 1024} && timeout {self.timeout}s "] + self._get_execution_command(test_num)
        cmd = self._get_execution_command(test_num)
        # print("Cmd was: ", ' '.join(cmd))
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return (test_num, proc)

    async def __collect_tests_async(self,
                                processes: list[subprocess.Popen]
                                ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Collects all test cases asynchronously.

        Returns:
            dict: The results of the submission against the tests.
        """
        # Create tasks for all test processes and wait for them to complete
        tasks = []
        for i, proc in processes:
            task = asyncio.create_task(self.__process_result_async(i, proc))
            tasks.append(task)

        # Wait for all tasks to complete
        await asyncio.gather(*tasks)

    async def __process_result_async(self, test_index: int, process: subprocess.Popen) -> None:
        """
        Processes the result from a subprocess asynchronously.

        Args:
            test_index (int): The index of the test case.
            process (subprocess.Popen): The subprocess running the test.

        Returns:
            tuple: (test_index, result_dict) to maintain order.
        """
        # Create a future to run communicate in a thread pool
        loop = asyncio.get_event_loop()
        stdout, stderr = await loop.run_in_executor(
            None,
            lambda: process.communicate()
        )

        # TODO - ONLY GIVE THE LAST X BYTES OF STDOUT AND STDERR!
        # Process the result using the subclass implementation
        res = self._get_result(process.returncode, stdout, stderr)
        result = {
            "submission_id": self.submission_id,
            "test_number": test_index,
            "passed": res["passed"],
            "inputs": self.inputs[test_index],
            "expected": self.outputs[test_index],
            "output": res["output"],
            "stdout": res["stdout"],
            "error": "timeout" if res["timeout"] else "memory_limit_exceeded" if res["memory_exceeded"] else res["stderr"]
        }

        # Send the result back via the output queue
        self.send_results(result)
        print(f"Result of test {test_index}:\n", result)
        # print("Applied async")

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

    def _get_result(self, returncode: int, stdout: bytes, stderr: bytes) -> dict:
        """
        Collects the result from the subprocess running the test case.

        Args:
            process (subprocess.Popen): The subprocess running the test case.
            stdout (bytes): The standard output from the process.
            stderr (bytes): The standard error from the process.

        Returns:
            dict: The result of the test case, containing:
                  - passed: Whether the test passed
                  - timeout: Whether the test timeouted
                  - memory_exceeded: Whether the test exceeded the memory limit
                  - stdout: The stdout of the test (used for user debugging)
                  - stderr: The stderr of the test (filtered before being returned)
        """
        # Implement in subclasses
        raise NotImplementedError
