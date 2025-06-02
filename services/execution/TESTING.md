# Local Testing Setup for Execution Service

This guide explains how to set up and test the execution service locally using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Make sure Docker daemon is running

## Quick Start

1. **Start the services:**
   ```bash
   cd services/execution
   docker-compose up --build
   ```

2. **Send a test request:**
   In another terminal:
   ```bash
   cd services/execution
   docker-compose exec worker python test_client.py send
   ```

## Services Overview

### Redis
- **Purpose**: Message broker for Celery
- **Port**: 6379
- **Health check**: Ensures Redis is ready before starting workers

### Worker
- **Purpose**: Celery worker that processes code execution requests
- **Features**:
  - Docker-in-Docker sandboxing support
  - Python code execution
  - Automatic restart on failure
- **Environment Variables**:
  - `CELERY_BROKER_URL`: Redis connection URL
  - `TARGET_QUEUE`: Input queue name (pythonq)
  - `OUTPUT_QUEUE`: Output queue name (pythonoutputq)
  - `LANGUAGE`: Programming language (python)

### Test Client (Optional)
- **Purpose**: Send test requests to the worker
- **Usage**: `docker-compose run --rm test-client python test_client.py send`

## Testing Commands

### Start all services:
```bash
docker-compose up --build
```

### Start services in background:
```bash
docker-compose up -d --build
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f worker
docker-compose logs -f redis
```

### Send test request:
```bash
# Send a test request only
docker-compose exec worker python test_client.py send

# Listen for results only
docker-compose exec worker python test_client.py listen

# Send request and listen for results (recommended)
docker-compose exec worker python test_client.py send-and-listen

# Using the test client service
docker-compose run --rm test-client python test_client.py send-and-listen
```

### Stop services:
```bash
docker-compose down
```

### Rebuild and restart:
```bash
docker-compose down
docker-compose up --build
```

## Test Client Usage

The `test_client.py` script can be used to send test execution requests:

```python
# Sample test data that gets sent:
submission_code = """
def solution(x):
    return x * 5
"""

test_inputs = [[5], [7], [13]]
expected_outputs = [25, 35, 65]
function_name = "solution"
submission_id = "test_001"
```

## Troubleshooting

### Common Issues:

1. **Redis connection failed**:
   - Make sure Redis service is healthy: `docker-compose ps`
   - Check Redis logs: `docker-compose logs redis`

2. **Worker fails to start**:
   - Check worker logs: `docker-compose logs worker`
   - Verify environment variables are set correctly

3. **Docker-in-Docker issues**:
   - Ensure Docker socket is mounted: `/var/run/docker.sock:/var/run/docker.sock`
   - Worker container needs `privileged: true` for sandboxing

4. **Build failures**:
   - Clean rebuild: `docker-compose down && docker-compose build --no-cache`
   - Check if all required files exist (pyproject.toml, uv.lock)

### Useful Commands:

```bash
# Check service status
docker-compose ps

# Restart specific service
docker-compose restart worker

# View real-time logs
docker-compose logs -f worker

# Execute commands in running container
docker-compose exec worker bash

# Clean up everything
docker-compose down -v --remove-orphans
```

## Development Workflow

1. Make code changes
2. Rebuild and restart: `docker-compose up --build`
3. Test with: `docker-compose exec worker python test_client.py send`
4. Check logs: `docker-compose logs -f worker`
