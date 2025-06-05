# Problems Service

This service is an API service that manages a structured set of coding problems, including metadata
like difficulty, title, difficulty, topics, description, examples, constraints, test cases, hint and
the date when the problems were created. It uses a relational database in PostgreSQL to store and
retrieve problems.

**Note**: Problems stored in the databases are language agnostic. (Tailored that all problems can be
solved with programming languages user selects).

## Technologies

**Language:** Python. (FastAPI web framwework) </br> **Database:** PostgreSQL (deployed on AWS RDS)
</br> **ORM:** SQLAlchemy **Response Schemas:** Pydantic</br> **Package Manager:** uv </br>
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

**Note:** before starting you can use the following command to build faster (only works if the
docker build kit is available):

```bash
export COMPOSE_BAKE=true
```

### Documentation

Each time this service starts up, it atttempt to do a data migration from a `problems.json` that can
be found in `services/problems` direcotory.

### Input format in JSON FILE

This is an example of the format of the input file.

For examples and test cases, they will be stored in the database as JSON formatted strings. Services
that use these fields will have to use `json.loads()` to convert it back to a python object so that
the fields inside it can be used.

```json
[
  {
    "id": "string",
    "title": "string",
    "difficulty": "string",
    "tags": "List of strings",
    "description": "Text",
    "examples": [ // List of JSON Objects with fields down below.
      {
        "input": "string of input examples",
        "output": "string of output",
        "explanation": "string"
      }
    ],
    "constraints": "List of Strings",
    "testCases": [ // List of JSON objects down below
      {
        "input": "List of inputs to question",
        "output": "Expected output of question",
        "hidden": "bool"
      }
    ],
    "solutionHint": "string"
  }
]
```

This is an example:

```json
[
  {
    "id": "1",
    "title": "Two Sum",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "testCases": [
      {
        "input": [[2, 7, 11, 15], 9],
        "output": [0, 1],
        "hidden": false
      }
    ],
    "solutionHint": "Try using a hash map to store numbers and their indices as you iterate through the array."
  }
]
```

### Package Structure

The package structure for the code execution service is as follows:

Top Level:

```plaintext
services/problem/
├── src/ # Source Files for Problem Service such as models and routes.
├── scripts/ # Helper scripts for local testing
├── docker-compose.yaml # Docker compose file for local testing
├── pyproject.toml # Project requirements file
├── uv.lock # Lock file for uv package manager
├── README.md # This file
|--- jajfak
```

### Testing

###

ASSIGNED TO: Tze Kheng Goh
