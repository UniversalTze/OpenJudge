"""
Secure sandbox executor that integrates with the existing executor framework
"""

import subprocess
import tempfile
import os
import shutil
from pathlib import Path
from typing import List, Optional

class SecureSandbox:
    """
    A secure sandbox for executing code with resource and permission restrictions
    """
    
    def __init__(self, 
                 memory_limit_mb: int = 100,
                 time_limit_seconds: int = 5,
                 sandbox_type: str = "firejail"):
        """
        Initialize the secure sandbox
        
        Args:
            memory_limit_mb: Memory limit in megabytes
            time_limit_seconds: Time limit in seconds
            sandbox_type: Type of sandbox ('firejail', 'bwrap', 'docker', 'nsjail')
        """
        self.memory_limit_mb = memory_limit_mb
        self.time_limit_seconds = time_limit_seconds
        self.sandbox_type = sandbox_type
        self.work_dir = None
        
    def __enter__(self):
        """Context manager entry - create temporary work directory"""
        self.work_dir = Path(tempfile.mkdtemp(prefix="sandbox_"))
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cleanup work directory"""
        if self.work_dir and self.work_dir.exists():
            shutil.rmtree(self.work_dir)

    def copy_files(self, files: dict):
        """
        Copy files to the sandbox work directory

        Args:
            files: Dictionary of {filename: content}
        """
        if not self.work_dir:
            raise RuntimeError("Sandbox not initialized - use as context manager")
            
        for filename, content in files.items():
            file_path = self.work_dir / filename
            with open(file_path, 'w') as f:
                f.write(content)

    def execute(self, command: List[str]) -> subprocess.CompletedProcess:
        """
        Execute a command in the sandbox
        
        Args:
            command: Command and arguments to execute
            
        Returns:
            CompletedProcess with result
        """
        if not self.work_dir:
            raise RuntimeError("Sandbox not initialized - use as context manager")

        if self.sandbox_type == "firejail":
            return self._execute_firejail(command)
        elif self.sandbox_type == "bwrap":
            return self._execute_bwrap(command)
        elif self.sandbox_type == "docker":
            return self._execute_docker(command)
        elif self.sandbox_type == "nsjail":
            return self._execute_nsjail(command)
        else:
            raise ValueError(f"Unsupported sandbox type: {self.sandbox_type}")
            
    def _execute_firejail(self, command: List[str]) -> subprocess.CompletedProcess:
        """Execute using firejail"""
        firejail_cmd = [
            "firejail",
            "--quiet",
            "--net=none",
            "--private-tmp",
            "--private-dev", 
            "--noroot",
            "--seccomp",
            "--caps.drop=all",
            f"--private={self.work_dir}",
            f"--rlimit-as={self.memory_limit_mb * 1024 * 1024}",
            f"--rlimit-cpu={self.time_limit_seconds}",
            "--rlimit-fsize=10485760",
            "--rlimit-nofile=64",
        ] + command
        
        return subprocess.run(
            firejail_cmd,
            cwd=self.work_dir,
            capture_output=True,
            text=True,
            timeout=self.time_limit_seconds + 2
        )

    def _execute_bwrap(self, command: List[str]) -> subprocess.CompletedProcess:
        """Execute using bubblewrap"""
        bwrap_cmd = [
            "bwrap",
            "--ro-bind", "/usr", "/usr",
            "--ro-bind", "/lib", "/lib", 
            "--ro-bind", "/lib64", "/lib64",
            "--ro-bind", "/bin", "/bin",
            "--bind", str(self.work_dir), "/work",
            "--chdir", "/work",
            "--tmpfs", "/tmp",
            "--proc", "/proc",
            "--dev", "/dev",
            "--unshare-all",
            "--die-with-parent",
            "--new-session",
            "--clearenv",
            "--setenv", "PATH", "/usr/bin:/bin",
            "--setenv", "HOME", "/work",
        ] + command
        
        # Set resource limits via ulimit wrapper
        ulimit_cmd = [
            "bash", "-c",
            f"ulimit -v {self.memory_limit_mb * 1024} && "
            f"ulimit -t {self.time_limit_seconds} && "
            f"ulimit -f 10240 && "
            f"ulimit -n 64 && "
            f"exec {' '.join(bwrap_cmd)}"
        ]
        
        return subprocess.run(
            ulimit_cmd,
            capture_output=True,
            text=True,
            timeout=self.time_limit_seconds + 2
        )
        
    def _execute_docker(self, command: List[str]) -> subprocess.CompletedProcess:
        """Execute using Docker"""
        container_name = f"sandbox_{os.getpid()}_{id(self)}"
        
        docker_cmd = [
            "docker", "run",
            "--name", container_name,
            "--rm",
            f"--memory={self.memory_limit_mb}m",
            f"--memory-swap={self.memory_limit_mb}m",
            "--cpus=1",
            "--network=none",
            "--read-only",
            "--tmpfs", "/tmp:noexec,nosuid,size=10m",
            "--volume", f"{self.work_dir}:/work:ro",
            "--workdir", "/work",
            "--user", "nobody",
            "--cap-drop=ALL",
            "--security-opt=no-new-privileges",
            "--pids-limit=32",
            "--ulimit", "nofile=64:64",
            "--ulimit", "nproc=32:32",
            "--ulimit", "fsize=10485760:10485760",
            "python:3.12-slim",
            "timeout", f"{self.time_limit_seconds}s"
        ] + command
        
        return subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=self.time_limit_seconds + 5
        )
        
    def _execute_nsjail(self, command: List[str]) -> subprocess.CompletedProcess:
        """Execute using nsjail (requires root or special setup)"""
        # This is a simplified version - full nsjail integration would require
        # the configuration file approach shown in sandbox_nsjail.py
        nsjail_cmd = [
            "nsjail",
            "--mode", "o",
            "--chroot", "/",
            "--user", "nobody",
            "--group", "nogroup", 
            "--time_limit", str(self.time_limit_seconds),
            "--max_cpus", "1",
            "--rlimit_as", str(self.memory_limit_mb * 1024 * 1024),
            "--rlimit_cpu", str(self.time_limit_seconds),
            "--rlimit_fsize", "10485760",
            "--rlimit_nofile", "64",
            "--disable_clone_newnet=false",
            "--cwd", str(self.work_dir),
            "--"
        ] + command
        
        return subprocess.run(
            nsjail_cmd,
            capture_output=True,
            text=True,
            timeout=self.time_limit_seconds + 2
        )

# Example usage with existing executor framework
def create_secure_python_executor():
    """
    Example of how to integrate SecureSandbox with existing executors
    """

    def secure_python_executor(submission_code, test_cases, function_name,
                             memory_limit_mb=100, time_limit_seconds=5):
        """
        Execute Python code in a secure sandbox
        """
        results = []

        with SecureSandbox(memory_limit_mb, time_limit_seconds, "firejail") as sandbox:
            # Prepare files
            files = {"submission.py": submission_code}

            for i, test_case in enumerate(test_cases):
                test_content = f"""
from submission import {function_name}

{test_case['code']}

{test_case['name']}({function_name})
"""
                files[f"test_{i}.py"] = test_content

            # Copy files to sandbox
            sandbox.copy_files(files)

            # Execute each test
            for i in range(len(test_cases)):
                try:
                    result = sandbox.execute(["python3", f"test_{i}.py"])

                    # Process result
                    if result.returncode == 124:  # Timeout
                        results.append({
                            "test": i,
                            "passed": False,
                            "timeout": True,
                            "stdout": "",
                            "stderr": f"Time limit of {time_limit_seconds}s exceeded"
                        })
                    elif result.returncode == 137:  # Memory limit
                        results.append({
                            "test": i,
                            "passed": False,
                            "timeout": False,
                            "stdout": "",
                            "stderr": "Memory limit exceeded"
                        })
                    else:
                        results.append({
                            "test": i,
                            "passed": result.returncode == 0,
                            "timeout": False,
                            "stdout": result.stdout,
                            "stderr": result.stderr
                        })

                except subprocess.TimeoutExpired:
                    results.append({
                        "test": i,
                        "passed": False,
                        "timeout": True,
                        "stdout": "",
                        "stderr": "Execution timed out"
                    })
                except Exception as e:
                    results.append({
                        "test": i,
                        "passed": False,
                        "timeout": False,
                        "stdout": "",
                        "stderr": f"Sandbox error: {str(e)}"
                    })

        return results

    return secure_python_executor
