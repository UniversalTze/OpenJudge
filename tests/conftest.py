def pytest_addoption(parser):
    parser.addoption("--url", action="store", default="http://localhost:8080/api/v1", help="Base URL to test")

import pytest

@pytest.fixture
def base_url(request):
    return request.config.getoption("--url")