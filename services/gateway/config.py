from dotenv import load_dotenv
import os, sys
import base64
from cryptography.hazmat.primitives.asymmetric import ed25519

load_dotenv()

def get_env(key: str) -> str:
    """Retrieve the environment variable value for the given key."""
    value = os.environ.get(key)
    if value is None:
        print(f"Error: Environment variable '{key}' is not set.")
        sys.exit(1)
    return value

def getPublicKey() -> str:
    publicKey = get_env("JWT_PUBLIC_KEY")
    raw_key_bytes = base64.b64decode(publicKey)
    return ed25519.Ed25519PublicKey.from_public_bytes(raw_key_bytes)

class Config:
    def __init__(self):
        self.JWT_PUBLIC_KEY = getPublicKey()
        self.ENV = get_env("ENV")
        self.PROBLEM_SERVICE_URL = get_env("PROBLEM_SERVICE_URL")
        self.FRONTEND_URL = get_env("FRONTEND_URL")
        self.AUTH_SERVICE_URL = get_env("AUTH_SERVICE_URL")
        self.SUBMISSION_SERVICE_URL = get_env("SUBMISSION_SERVICE_URL")
        self.REDIS_URL = get_env("REDIS_URL")
        
        print(self.JWT_PUBLIC_KEY, self.ENV, self.PROBLEM_SERVICE_URL,
              self.FRONTEND_URL, self.AUTH_SERVICE_URL,
              self.SUBMISSION_SERVICE_URL, self.REDIS_URL)

config = Config()