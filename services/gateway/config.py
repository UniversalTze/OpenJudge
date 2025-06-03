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
    """Configuration class to hold environment variables."""
    JWT_PUBLIC_KEY = get_env("JWT_PUBLIC_KEY")
    ENV = get_env("ENV")
    PROBLEM_SERVICE_URL = get_env("PROBLEM_SERVICE_URL")
    FRONTEND_URL = get_env("FRONTEND_URL")
    AUTH_SERVICE_URL = get_env("AUTH_SERVICE_URL")
    SUBMISSION_SERVICE_URL = get_env("SUBMISSION_SERVICE_URL")

config = Config()