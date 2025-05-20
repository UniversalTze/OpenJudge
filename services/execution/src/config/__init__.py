from os import environ
from tempfile import gettempdir
from pathlib import Path

# Extract the queue to listen to, and to send results to
INPUT_QUEUE = environ.get("TARGET_QUEUE", "NO QUEUE")
if INPUT_QUEUE == "NO QUEUE":
    raise ValueError("TARGET_QUEUE environment variable is not set. Please set it to the desired queue name.")

OUTPUT_QUEUE = environ.get("OUTPUT_QUEUE", "NO QUEUE")
if OUTPUT_QUEUE == "NO QUEUE":
    raise ValueError("OUTPUT_QUEUE environment variable is not set. Please set it to the desired queue name.")

BROKER = environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")

LANGUAGE = environ.get("LANGUAGE", "NO LANGUAGE")
if OUTPUT_QUEUE == "NO QUEUE":
    raise ValueError("LANGUAGE environment variable is not set. Please set it to the desired language name.")

# Temporary directory for test execution
TEMP_DIR = Path(gettempdir())

# Memory limit in bytes per test case
DEFAULT_MEMORY_LIMIT = 1 * 1024 * 1024  # 1MB

# Time limit in seconds per test case
DEFAULT_TIMEOUT = 5  # 5 seconds