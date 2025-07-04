# Services

The `services` directory contains all the microservices that make up the OpenJudge system. Each service is contained in its own directory, and has its own README.md file. The README.md file contains information about the service, how to run it, and how to contribute to it.

The services are as follows:

- `application`: The frontend web application, built with Vite/React/Express
- `gateway`: The API gateway, built with FastAPI
- `auth`: The authentication service built with Golang Fibre
- `problems`: The problems service, built with FastAPI
- `submission`: The code submission service built with FastAPI & Celery
- `execution`: The code execution service built with Celery
