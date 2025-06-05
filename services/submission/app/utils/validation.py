import re

def clean_code(code: str, language: str):
    """Sanitize code by removing comments, blocking keywords, and enforcing length limits."""
    if not code:
        raise ValueError("Code must be a non-empty string")

    # Python-specific cleaning
    if language.lower() == "python":
        cleaned_lines = []
        for line in code.splitlines():
            if line.strip().startswith("#"):
                continue
            if "#" in line:
                line = line.split("#")[0]
            cleaned_lines.append(line)
        cleaned = "\n".join(cleaned_lines)
    else:
        cleaned = re.sub(r"//.*", "", code)
        cleaned = re.sub(r"/\*[\s\S]*?\*/", "", cleaned)

    # Security checks
    banned = [
        "import os",
        "import sys",
        "eval(",
        "exec(",
        "#!",
        "import subprocess",
        "import socket",
        "import threading",
        "import multiprocessing",
        "import requests",
        "import urllib",
        "import urllib2",  # Python 2
        "import http.client",
        "import ftplib",
        "import telnetlib",
        "open(",
        "__import__",
        "input(",
        "globals(",
        "locals(",
        "compile(",
        "breakpoint(",
        "os.system",
        "subprocess.call",
        "subprocess.Popen",
        "subprocess.run",
        "shlex.split",
        "pickle.loads",
        "pickle.load",
        "marshal.loads",
        "marshal.load",
        "tempfile.NamedTemporaryFile",
        "tempfile.mktemp",
        "webbrowser.open",
        "xml.etree.ElementTree.parse",
        "yaml.load",
        "base64.b64decode",
    ]
    for keyword in banned:
        if keyword in cleaned:
            raise ValueError(f"Banned keyword detected: {keyword}")

    if len(cleaned) > 500:
        raise ValueError("Code is too long.")

