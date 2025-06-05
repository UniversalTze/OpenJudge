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
        self.DATABASE_URL = get_env("DATABASE_URL")
        self.REDIS_URL = get_env("REDIS_URL")
        self.PROBLEMS_SERVICE_URL = get_env("PROBLEMS_SERVICE_URL")

config = Config()