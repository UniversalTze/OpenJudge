import requests
import base
import pytest


def test_health_check(service_urls):
    url = f"{service_urls['problems']}/health"
    try:
        response = requests.get(url, timeout=3)
        assert response.status_code == 200
    except requests.exceptions.ConnectionError:
        pytest.fail(f"Could not connect to problems service at {url}")
