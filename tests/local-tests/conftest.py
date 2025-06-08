import pytest
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.test")


@pytest.fixture(scope="session")
def service_urls(request):
    url = os.getenv("AUTH_SERVICE_URL")
    return {
        "auth": os.getenv("AUTH_SERVICE_URL"),
        "problems": os.getenv("PROBLEMS_SERVICE_URL"), 
        "submissions": os.getenv("SUBMISSION_SERVICE_URL"),
        "front-end": os.getenv("FRONTEND_URL")
    }