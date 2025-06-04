# Problems Service

This service is an API service that manages a structured set of coding problems, including metadata like difficulty, title, difficulty, 
topics, description, examples, constraints, test cases, hint and the date when the problems were created. It uses a relational database in 
PostgreSQL to store and retrieve problems. 

**Note**: Problems stored in the databases are language agnostic. (Tailored that all problems can be solved with programming languages user selects). 

## Technologies

**Language:** Python. (FastAPI web framwework) </br> 
**Database:** PostgreSQL (deployed on AWS RDS) </br>
**ORM:** SQLAlchemy
**Response Schemas:** Pydantic</br>
**Package Manager:** uv </br>
**Containerisation:** Docker </br>

### Getting Started
Run the service from root using the following command.

```
task run:problem
```

Test the service from root using the following command.

```
task test:problem
```

Alternatively, a `docker-compose.yaml` have been included for local testing purposes. 

**Note:** before starting you can use the following command to build faster (only works if the docker build kit is available):

```bash
export COMPOSE_BAKE=true
```

To run locally, from the `services/problems` directory, run the following commands:

```bash
docker compose up --build -d
```  

To stop the containers, run:
```bash
docker compose down
```

### Documentation
(Change what is below)
Initial API: 
- Assume front end will decide a language so no need to worry about that. 
- Recommendation service -> Library to do a fuzzle search. 
- Get end point for that. 
- Post end point for addind problems to it. 
- Auth header and how it validates it for a particular session


ASSIGNED TO: Tze Kheng Goh
