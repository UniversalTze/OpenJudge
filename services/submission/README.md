# Submission Service

A microservice for handling user code submissions, executing them against test cases, and returning results. Built with Flask, PostgreSQL, Celery, and Redis. Supports:

- Sanitizing and deduplicating user‐submitted code
- Fetching problem metadata (function name, test inputs/outputs) from an external "problems" service
- Persisting submission metadata & results in a local PostgreSQL "submissions" database
- Asynchronously executing code via Celery workers (one queue per language)
- Exposing REST endpoints for health checks, submitting code, retrieving a single submission, and viewing submission history

## Architecture Overview

1. **Flask API**  
   - Receives submissions via `POST /submission`.  
   - Sanitizes and deduplicates code.  
   - Fetches test metadata from the problems service
   - Persists a new record in the local `submissions` database.  
   - Enqueues an execution task in a Celery queue (one queue per language).

2. **Celery Worker**  
   - Listens on `<language>q` queues in Redis.  
   - Executes submitted code against each test input in a sandboxed `exec()`.  
   - Captures stdout, error messages, and whether each test passed.  
   - Updates the `status` and `results` fields of the corresponding `submissions` record.

3. **Databases**  
   - **Submissions DB (Postgres)**: Stores all submission metadata, raw & cleaned code, execution status, callback URL, and JSON results.

4. **Redis**  
   - Acts as the Celery broker and result backend.

## Running Locally with Docker Compose

Run the service locally:
```bash
task run:submission
```

## API Endpoints

### 2. Health Check
```
GET /health
```

**Description**: Checks that the service is online
  ```

---

### 3. Submit Code
```
POST /submission
```

**Body**:
- `user_id`: Unique user identifier (string)
- `problem_id`: Unique problem identifier (string)
- `language`: Programming language (e.g., `python`, `java`, `cpp`)

**Request Body** (JSON):
```json
{
  "user_id": "uuid",
  "problem_id": "string",
  "language": "Python | Java",
  "code": "string",
}
```

**Processing Steps**:
1. Validate that `user_id`, `problem_id`, `language`, and `code` are provided
2. Clean & sanitize `code`:
   - Remove comments (`#`, `//`, `/* */`)
   - Block banned keywords (`import os`, `eval(`, etc.)
   - Enforce a maximum length of 10 000 characters
3. Check for duplicates: if a record exists in `submissions` with the same `(user_id, problem_id, language, code)`, return **409 Conflict**
4. Fetch problem metadata (function name, test inputs, test outputs) from the external "problems" service
   - If the problem does not exist, return **404 Not Found**
   - If the "problems" DB is unreachable, return **503 Service Unavailable**
5. Insert a new row into `submissions` with `status='queued'` and an empty `results` array
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
- `user_id`: Unique user identifier

**Description**: Returns a list of all submissions by this user, ordered by `updated_at` descending. Each entry includes:
- `problem_id`
- `language`
- `code`
- `results` (JSON array)
- `submitted_at` (ISO 8601 timestamp of `updated_at`)

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
GET /submission/<submission_id>
```

**Path Parameters**:
- `submission_id`: Integer ID of the submission

**Description**: Returns detailed information for one submission, including:
- `submission_id`
- `user_id`
- `problem_id`
- `language`
- `code`
- `callback_url`
- `status`
- `results` (full JSON array)
- `created_at` (ISO 8601)
- `updated_at` (ISO 8601)

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
