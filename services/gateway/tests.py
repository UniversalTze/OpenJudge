import pytest
import os
from fastapi.testclient import TestClient

os.environ.update({
    "JWT_PUBLIC_KEY": "test_public_key",
    "ENV": "local",
    "AUTH_SERVICE_URL": "http://localhost:8001",
    "PROBLEMS_SERVICE_URL": "http://localhost:8002", 
    "SUBMISSION_SERVICE_URL": "http://localhost:8003",
    "REDIS_URL": "redis://localhost:6379",
    "FRONTEND_URL": "http://localhost:3000"
})

from main import app

@pytest.fixture
def client():
    """Test client fixture"""
    with TestClient(app) as test_client:
        yield test_client

def test_app_creation():
    """Test that the FastAPI app is created correctly"""
    assert app is not None
    assert app.title == "OpenJudge API Gateway"

def test_middleware_configuration():
    """Test that middleware is configured"""
    # Check that middleware is present
    middleware_types = [type(middleware.cls).__name__ for middleware in app.user_middleware]
    
    # We should have our custom middleware
    assert len(middleware_types) > 0

def test_health_endpoint(client):
    """Test that the health endpoint works"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == "API Gateway operational"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
