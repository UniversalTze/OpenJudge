"""
Secure sandbox executor that integrates with the existing executor framework
"""

import subprocess
from pathlib import Path
from typing import List

class SecureSandbox:
    """
    A secure sandbox for executing code with resource and permission restrictions
    """
    
    def __init__(self, 
                 memory_limit_mb: int,
                 time_limit_seconds: int):
        """
        Initialize the secure sandbox
        
        Args:
            memory_limit_mb: Memory limit in megabytes
            time_limit_seconds: Time limit in seconds
            sandbox_type: Type of sandbox ('firejail', 'bwrap', 'docker', 'nsjail')
        """
        self.memory_limit_mb = memory_limit_mb
        self.time_limit_seconds = time_limit_seconds

    def execute_nsjail(self, command: List[str]) -> subprocess.Popen:
        """Execute using nsjail (requires root or special setup)"""
        # TOOD - ADD IN CHROOT AND CWD TO PROPERLY ISOLATE FILESYSTEM!!!
        nsjail_cmd = [
            "nsjail",
            "-o",
            "--user", "nobody",
            "--group", "nogroup", 
            "--time_limit", str(self.time_limit_seconds),
            "--max_cpus", "1",
            "--rlimit_as", str(self.memory_limit_mb * 1024 * 1024),
            "--rlimit_cpu", str(self.time_limit_seconds),
            "--rlimit_fsize", "10485760",
            "--disable_clone_newcgroup",
            "--rlimit_nofile", "64",
            "--disable_network",
            "--"
        ] + command
        
        return subprocess.Popen(
            nsjail_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
