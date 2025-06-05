from dotenv import load_dotenv
import os, sys

load_dotenv()

def get_env(key: str) -> str:
    """Retrieve the environment variable value for the given key."""
    value = os.environ.get(key)
    if value is None:
        print(f"Error: Environment variable '{key}' is not set.")
        sys.exit(1)
    return value

class Config:
    def __init__(self):
        self.BROKER_URL = get_env("BROKER_URL")
        self.OUTPUT_QUEUE = get_env("OUTPUT_QUEUE")
        self.DATABASE_URL = get_env("DATABASE_URL")

config = Config()