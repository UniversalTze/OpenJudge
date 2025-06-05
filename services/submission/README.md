```markdown
# Submission Service

A microservice for handling user code submissions, executing them against test cases, and returning results. Built with Flask, PostgreSQL, Celery, and Redis. Supports:

- Sanitizing and deduplicating user‐submitted code
- Fetching problem metadata (function name, test inputs/outputs) from an external “problems” database
- Persisting submission metadata & results in a local PostgreSQL “submissions” database
- Asynchronously executing code via Celery workers (one queue per language)
- Exposing REST endpoints for health checks, submitting code, retrieving a single submission, and viewing submission history

---

## Table of Contents
 
1. [Prerequisites](#prerequisites)  
2. [File Structure](#file-structure)  
3. [Configuration & Environment Variables](#configuration--environment-variables)  
4. [Setup & Installation](#setup--installation)  
5. [Running Locally with Docker Compose](#running-locally-with-docker-compose)  
6. [Database Initialization](#database-initialization)  
7. [API Endpoints](#api-endpoints)  
8. [Celery Worker](#celery-worker)  
9. [Troubleshooting](#troubleshooting)  
10. [License](#license)  

---


1. **Flask API**  
   - Receives submissions via `POST /submission/<user_id>/<problem_id>/<language>`.  
   - Sanitizes and deduplicates code.  
   - Fetches test metadata from a separate “problems” PostgreSQL instance.  
   - Persists a new record in the local `submissions` database.  
   - Enqueues an execution task in a Celery queue (one queue per language).

2. **Celery Worker**  
   - Listens on `<language>q` queues in Redis.  
   - Executes submitted code against each test input in a sandboxed `exec()`.  
   - Captures stdout, error messages, and whether each test passed.  
   - Updates the `status` and `results` fields of the corresponding `submissions` record.

3. **Databases**  
   - **Problems DB (Postgres)**: Holds problem metadata (`function_name`, `test_inputs`, `test_outputs`) for each `problem_id`.  
   - **Submissions DB (Postgres)**: Stores all submission metadata, raw & cleaned code, execution status, callback URL, and JSON results.

4. **Redis**  
   - Acts as the Celery broker and result backend.

---

## Prerequisites

- Docker & Docker Compose (v2+ recommended)  
- A host machine with at least 4 GB RAM  
- A working internet connection to pull Docker images  

---

## File Structure

```

.
├── app/
│   ├── main.py            # Flask API application
│   ├── models.py          # SQLAlchemy models (Submission, Problem)
│   ├── queue\_utils.py     # Celery configuration & helper
│   └── worker.py          # Celery task definitions
├── init.sql               # SQL script to initialize both Postgres databases
├── docker-compose.yml     # Defines services: db, problems-db, redis, web, worker
├── Dockerfile             # Builds the Flask/Celery image
└── README.md              # This documentation file

````

- **`app/main.py`**: Entrypoint for the Flask REST API.  
- **`app/models.py`**: SQLAlchemy models for `Submission` (and `Problem` if used locally).  
- **`app/queue_utils.py`**: Configures `Celery` with Redis as broker/backend; exports `send_to_queue()`.  
- **`app/worker.py`**: Implements the `process_submission` Celery task, executes user code, and updates the database.  
- **`init.sql`**: Initializes both the `submissions` database and the `problems` database with required tables.  
- **`docker-compose.yml`**: Orchestrates the following containers:  
  - `db` (Postgres for submissions)  
  - `problems-db` (Postgres for problems)  
  - `redis` (Redis broker)  
  - `web` (Flask API + Gunicorn)  
  - `worker` (Celery worker)  

---

## Configuration & Environment Variables

| Variable                  | Description                                               | Default                                        |
|---------------------------|-----------------------------------------------------------|------------------------------------------------|
| `DATABASE_URL`            | URI for the **submissions** Postgres DB                   | `postgresql://postgres:postgres@db:5432/submissions` |
| `PROBLEMS_DATABASE_URL`   | URI for the **problems** Postgres DB                      | `postgresql://postgres:postgres@problems-db:5432/problems` |
| `REDIS_URL`               | URI for the Redis instance (broker & backend)             | `redis://redis:6379/0`                         |
| `APP_ENV`                 | Environment indicator (`LOCAL` or `AWS`)                  | `LOCAL`                                        |
| `MAX_CODE_SIZE`           | Maximum allowed size (in bytes) for raw code              | `10000` (10 KB) or override via env             |

All environment variables are injected via **`docker-compose.yml`**. You can override them by exporting them in your shell before running Docker Compose or by editing the Compose file.

---

## Setup & Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your‐username/submission‐service.git
   cd submission-service
````

2. **Ensure `init.sql` is present**
   The `init.sql` file should be in the project root. It contains `CREATE TABLE` statements for both the `submissions` and `problems` databases.

3. **Build Docker images**

   ```bash
   docker-compose build --no-cache
   ```

---

## Running Locally with Docker Compose

Run all services in the background:

```bash
docker-compose up -d
```

This spins up:

* **`db`** (Postgres on port 5432)
* **`problems-db`** (Postgres on port 5433)
* **`redis`** (Redis on port 6379)
* **`web`** (Flask API + Gunicorn on port 5000)
* **`worker`** (Celery worker listening to Redis)

To view logs in real time:

```bash
docker-compose logs -f
```

To stop and remove all containers and volumes:

```bash
docker-compose down -v
```

---

## Database Initialization

Both Postgres containers mount `./init.sql` under `/docker-entrypoint-initdb.d/init.sql`. During first startup, each container will run any `.sql` files in that directory. Ensure `init.sql` contains:

```sql
-- Create the `submissions` table in the "submissions" DB
CREATE TABLE IF NOT EXISTS submissions (
  submission_id SERIAL PRIMARY KEY,
  user_id       VARCHAR NOT NULL,
  problem_id    VARCHAR NOT NULL,
  language      VARCHAR NOT NULL,
  code          TEXT    NOT NULL,
  cleaned_code  TEXT    NOT NULL,
  function_name VARCHAR NOT NULL,
  status        VARCHAR NOT NULL DEFAULT 'queued',
  callback_url  VARCHAR,
  results       JSONB  DEFAULT '[]',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the `problems` table in the "problems" DB
CREATE TABLE IF NOT EXISTS problems (
  problem_id    VARCHAR PRIMARY KEY,
  title         VARCHAR NOT NULL,
  description   TEXT,
  function_name VARCHAR NOT NULL DEFAULT 'solve',
  test_inputs   JSONB NOT NULL,
  test_outputs  JSONB NOT NULL,
  difficulty    VARCHAR,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

After `docker-compose up -d`, verify both DBs:

```bash
docker-compose exec db psql -U postgres -d submissions -c "\dt submissions"
docker-compose exec problems-db psql -U postgres -d problems -c "\dt problems"
```

---

## API Endpoints

### 1. Root

```
GET /submission/
```

**Response** (200 OK):

```json
{
  "message": "Submission API is running",
  "endpoints": [
    "/submission/health",
    "/submission/<user_id>/<problem_id>/<language>",
    "/submissions/<submission_id>"
  ]
}
```

---

### 2. Health Check

```
GET /submission/health
```

**Description**: Verifies connectivity to the local submissions DB and the Redis broker. Retries database connection up to 3 times.

* **200 OK**

  ```json
  {
    "status": "healthy",
    "database": "ok",
    "broker": "ok"
  }
  ```
* **503 Service Unavailable** (if either DB or Redis is unreachable)

  ```json
  {
    "status": "unhealthy",
    "database": "unhealthy",
    "broker": "ok"
  }
  ```

---

### 3. Submit Code

```
POST /submission/<user_id>/<problem_id>/<language>
```

**Path Parameters**:

* `user_id`: Unique user identifier (string)
* `problem_id`: Unique problem identifier (string)
* `language`: Programming language (e.g., `python`, `java`, `cpp`)

**Request Body** (JSON):

```json
{
  "code": "<full source code string>"
}
```

**Processing Steps**:

1. Validate that `user_id`, `problem_id`, `language`, and `code` are provided.
2. Clean & sanitize `code`.

   * Remove comments (`#`, `//`, `/* */`).
   * Block banned keywords (`import os`, `eval(`, etc.).
   * Enforce a maximum length of 10 000 characters.
3. Check for duplicates: if a record exists in `submissions` with the same `(user_id, problem_id, language, cleaned_code)`, return **409 Conflict**.
4. Fetch problem metadata (function name, test inputs, test outputs) from the external “problems” DB.

   * If the problem does not exist, return **404 Not Found**.
   * If the “problems” DB is unreachable, return **503 Service Unavailable**.
5. Insert a new row into `submissions` with `status='queued'` and an empty `results` array.
6. Enqueue a Celery task on queue `<language>q` with payload:

   ```json
   {
     "submission_id": 123,
     "submission_code": "<raw code>",
     "inputs": [...],         // list of test input lists
     "outputs": [...],        // list of expected outputs
     "function_name": "solve"
   }
   ```
7. Return **201 Created** with:

   ```json
   {
     "submission_id": 123,
     "status": "queued",
     "callback_url": "https://www.openjudge.com/submissions/123/results"
   }
   ```

**Example**:

```bash
curl -X POST http://localhost:5000/submission/user123/prob1/python \
     -H "Content-Type: application/json" \
     -d '{"code":"def solve(a,b): return a+b"}'
```

---

### 4. Submission History

```
GET /submissions/history/<user_id>
```

**Path Parameters**:

* `user_id`: Unique user identifier

**Description**: Returns a list of all submissions by this user, ordered by `updated_at` descending. Each entry includes:

* `problem_id`
* `language`
* `code`
* `results` (JSON array)
* `submitted_at` (ISO 8601 timestamp of `updated_at`)

**Response** (200 OK):

```json
{
  "submissions": [
    {
      "problem_id": "prob1",
      "language": "python",
      "code": "def solve(a,b): return a+b",
      "results": [
        {
          "submission_id": 1,
          "inputs": [1,2],
          "expected": 3,
          "output": 3,
          "stdout": "",
          "error": null,
          "passed": true
        },
        {
          "submission_id": 1,
          "inputs": [3,4],
          "expected": 7,
          "output": 7,
          "stdout": "",
          "error": null,
          "passed": true
        }
      ],
      "submitted_at": "2025-06-05T12:34:56.789012"
    }
    // …more submissions…
  ]
}
```

If the user has no submissions, returns:

```json
{ "submissions": [] }
```

---

### 5. Get Single Submission

```
GET /submissions/<submission_id>
```

**Path Parameters**:

* `submission_id`: Integer ID of the submission

**Description**: Returns detailed information for one submission, including:

* `submission_id`
* `user_id`
* `problem_id`
* `language`
* `code`
* `callback_url`
* `status`
* `results` (full JSON array)
* `created_at` (ISO 8601)
* `updated_at` (ISO 8601)

**Example**:

```bash
curl http://localhost:5000/submissions/1
```

Response (200 OK):

```json
{
  "submission_id": 1,
  "user_id": "user123",
  "problem_id": "prob1",
  "language": "python",
  "code": "def solve(a,b): return a+b",
  "callback_url": "https://www.openjudge.com/submissions/1/results",
  "status": "completed",
  "results": [
    {
      "submission_id": 1,
      "inputs": [1,2],
      "expected": 3,
      "output": 3,
      "stdout": "",
      "error": null,
      "passed": true
    },
    {
      "submission_id": 1,
      "inputs": [3,4],
      "expected": 7,
      "output": 7,
      "stdout": "",
      "error": null,
      "passed": true
    }
  ],
  "created_at": "2025-06-05T12:00:00.000000",
  "updated_at": "2025-06-05T12:34:56.789012"
}
```

---

## Celery Worker

**`app/worker.py`** defines a single Celery task:

```python
@celery_app.task(name='process_submission')
def process_submission(task_data):
    """
    Args:
      task_data: {
        "submission_id": int,
        "submission_code": str,
        "inputs": [[...], [...], ...],
        "outputs": [...],
        "function_name": str
      }

    1. Executes `submission_code` in a sandboxed `exec()` call.
    2. For each test case (input, expected):
       - Captures stdout & any exception.
       - Compares returned value to `expected`.
       - Builds a `results` entry:
         {
           "submission_id": ...,
           "inputs": [...],
           "expected": ...,
           "output": ...,
           "stdout": ...,
           "error": ...,
           "passed": bool
         }
    3. Updates the matching `Submission` record in the local DB:
       - `results` = JSON list of test results
       - `status`   = 'completed'
       - `updated_at` = current timestamp
    """
```

The worker container is defined in `docker-compose.yml` as:

```yaml
worker:
  build: .
  environment:
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/submissions
    - PROBLEMS_DATABASE_URL=postgresql://postgres:postgres@problems-db:5432/problems
    - REDIS_URL=redis://redis:6379/0
  depends_on:
    - db
    - problems-db
    - redis
  volumes:
    - ./app:/app/app
  command: >
    bash -c "cd app &&
             celery -A queue_utils.celery_app worker 
             --loglevel=info
             -Q pythonq"
```

* **Concurrency**: By default, Celery uses `prefork` with as many workers as CPU cores.
* **Queues**: The task is sent to `<language>q` (e.g., `pythonq`, `javaq`, `cppq`). The worker can be configured to listen on multiple queues by appending `-Q pythonq,javaq,...` if needed.

---

## Running End-to-End Locally

1. **Build and start all containers**

   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Wait for initialization**

   * Check that both Postgres databases have run `init.sql` without errors:

     ```bash
     docker-compose logs db
     docker-compose logs problems-db
     ```

     You should see `CREATE TABLE` messages and no “could not read from input file” errors.

   * Verify the Flask application started:

     ```bash
     docker-compose logs web | grep "Local `submissions` table ensured"
     docker-compose logs web | grep "Connected to Problems database successfully"
     ```

   * Verify the Celery worker is “ready”:

     ```bash
     docker-compose logs worker | grep "celery@"
     ```

3. **Test the health endpoint**

   ```bash
   curl http://localhost:5000/submission/health
   ```

   Expected response (HTTP 200):

   ```json
   {
     "status": "healthy",
     "database": "ok",
     "broker": "ok"
   }
   ```

4. **Submit a code solution**

   ```bash
   curl -X POST http://localhost:5000/submission/user123/prob1/python \
        -H "Content-Type: application/json" \
        -d '{"code":"def solve(a,b): return a+b"}'
   ```

   * If `prob1` exists in the “problems” DB, you’ll get:

     ```json
     {
       "submission_id": 1,
       "status": "queued",
       "callback_url": "https://www.openjudge.com/submissions/1/results"
     }
     ```
   * If the problem does not exist:

     ```json
     { "error": "Problem not found" }
     ```

5. **Monitor Celery worker logs**

   ```bash
   docker-compose logs -f worker
   ```

   You should see the worker receive the `process_submission` task, execute the tests, and log completion.

6. **Verify submission results**

   ```bash
   docker-compose exec db psql -U postgres -d submissions -c \
     "SELECT submission_id, status, results FROM submissions WHERE submission_id = 1;"
   ```

   Sample output:

   ```
    submission_id |  status   |                                 results
   ---------------+-----------+------------------------------------------------------------------------------
              1   | completed | [{"submission_id":1,"inputs":[1,2],"expected":3,"output":3,...}, ...]
   ```

7. **Fetch submission history**

   ```bash
   curl http://localhost:5000/submissions/history/user123
   ```

   Sample response (HTTP 200):

   ```json
   {
     "submissions": [
       {
         "problem_id": "prob1",
         "language": "python",
         "code": "def solve(a,b): return a+b",
         "results": [
           { 
             "submission_id": 1,
             "inputs": [1,2],
             "expected": 3,
             "output": 3,
             "stdout": "",
             "error": null,
             "passed": true
           }
         ],
         "submitted_at": "2025-06-05T12:34:56.789012"
       }
     ]
   }
   ```

8. **Retrieve a single submission**

   ```bash
   curl http://localhost:5000/submissions/1
   ```

   Sample response:

   ```json
   {
     "submission_id": 1,
     "user_id": "user123",
     "problem_id": "prob1",
     "language": "python",
     "code": "def solve(a,b): return a+b",
     "callback_url": "https://www.openjudge.com/submissions/1/results",
     "status": "completed",
     "results": [
       {
         "submission_id": 1,
         "inputs": [1,2],
         "expected": 3,
         "output": 3,
         "stdout": "",
         "error": null,
         "passed": true
       }
     ],
     "created_at": "2025-06-05T12:00:00.000000",
     "updated_at": "2025-06-05T12:34:56.789012"
   }
   ```

---

## Troubleshooting

1. **“Could not read from input file: Is a directory”**

   * Occurs if you mount a directory instead of a file under `/docker-entrypoint-initdb.d/`.
   * **Solution**: Ensure your Compose file has:

     ```yaml
     volumes:
       - ./init.sql:/docker-entrypoint-initdb.d/init.sql
     ```

     (not `- ./init:/docker-entrypoint-initdb.d/`).

2. **`OperationalError: could not translate host name "db" to address`**

   * Indicates that the container’s DNS name `db` is not resolvable yet.
   * **Solution**: Ensure `depends_on: [db]` is set for `web` and retry the health endpoint after a few seconds.

3. **Celery worker is running as root**

   * You will see a security warning:

     ```
     You're running the worker with superuser privileges: this is absolutely not recommended!
     ```
   * **Solution**: For production, create a non‐root user in your Dockerfile and run the worker with `--uid`:

     ```dockerfile
     RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
     USER appuser
     ```

     Then modify the `command` to include `--uid appuser`.

4. **“Problems database not available”**

   * If the external “problems” DB is not running or not seeded with the `problems` table, any `/submission/...` request will return `503` or `404`.
   * **Solution**: Ensure the `problems-db` service is up, running on port 5433, and that you mounted `init.sql` which includes the `CREATE TABLE problems` statement.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

```
```
