# Code Execution Service

This service provides sandboxed execution of user submitted code against a series of test cases. Input test cases are received via an input queue and results are sent back via an output queue. Test cases are run in parallel and results are sent back to the relevant result queue asynchronously.  
  
For each supported language (described below), there must exist a unique input and output queue. The name of the queue should be defined as an environment variable (both for testing locally and in a production environment - see below sections).

## Contents:
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Docs](#documentation)
    - [Current Languages](#currently-supported-languages)
    - [Input Formatting](#input-format)
    - [Output Formatting](#output-format)
    - [Overall Package Structure](#package-structure)
    - [How to Add a New Language](#new-language-requirements)
- [Language Specific Requirements](#language-specific-requirements)

## Technologies

**Language:** Python </br> **Package Manager** uv </br> **Concurrency:** Celery </br> **Message Broker:** Redis (Local) / SQS (Production) </br> **Containerisation:** Docker </br> **Sandboxing:** Firejail (TBC)

### Getting Started
A `test_client.py` and `scripts/test.sh` (a bash script wrapper around docker compose for convenience - use docker compose or terraform for more robust testing) have been included for testing purposes. To run locally, from the `services/execution` directory, run the following commands:

```bash
scripts/test.sh start-bg
```  

This will start the services in the background using the docker compose file. You can then run the tests via

```bash
scripts/test.sh test-full
```

This will test the python and java executor and check that submissions can be sent and results are received in the appropriate format in a timely manner. You can check the logs of the worker for debug output via:

```bash
scripts/test.sh logs-worker
```

To stop the services, run:
```bash
scripts/test.sh stop
```

## Documentation
### Currently Supported Languages
- Python (version 3.12)
- Java (version 17)

### Input Format:
All inputs to the queue are expected to be structured in the following format. Note that in particular, messages must be sent in the format specified by Celery ([celery documentation](https://docs.celeryq.dev/en/latest/getting-started/introduction.html)) as the receiver expects it in this format:  

```json
{
    "submission_id": "string",
    "submission_code": "string",
    "inputs": "list", // A list of lists of input parameters
    "outputs": "list", // A list of expected outputs
    "function_name": "string"
}
```

Note - input parameters may only be: booleans, integers, floats, strings or arrays of these types. Integers and floats must fit into a 32-bit signed integer for compatibility with all languages.
  
Note - the function name should be the same as the function name in the submission code. This is how the test executor will call the submission. For the exact nature of how a function name should be specified see [Language Specific Requirements](#language-specific-requirements).

There are currently no requirements on compression schemes for submission code - a compression type field may be added in future to facilitate smaller messages. See `services/execution/src/receiver.py` for more details.
  
Note - we currently expect that submission code has had initial validation completed by the calling service (although validation and sandboxing is performed in this service for additional safety).

### Output Format:
All results sent to the queue are structured in the following format. Note that in particular, messages will be sent via Celery ([celery documentation](https://docs.celeryq.dev/en/latest/getting-started/introduction.html)) and as such will include any automatically included headers by celery:

```json
{
    "submission_id": "string",
    "passed": "bool", // Whether this particular test case was passed
    "inputs": "list", // The input parameters for the test case
    "expected": "string", // The expected output for the test case
    "output": "string", // The actual output from the submission
    "stdout": "string", // The stdout from the test case
    "error": "string" // The error message from the test case (if applicable)
}
```

### Package Structure
The package structure for the code execution service is as follows:
  
Top Level:
```
services/execution/
├── src/ # Source Files for Code Execution Service
├── dockerfiles/ # Dockerfiles for building execution service images for each language
├── tests/ # Unit and integration tests for the code execution service
├── scripts/ # Helper scripts for local testing
├── docker-compose.yaml # Docker compose file for local testing
├── pyproject.toml # Project requirements file
├── uv.lock # Lock file for uv package manager
├── README.md # This file
```
  
Source Files:
```
services/execution/src
├── receiver.py # Celery receiver module - main module from which to start service
├── config/
│   ├── __init__.py # Configuration file for the code execution service
├── executor/ # Executor files for each language
│   ├── __init__.py
│   ├── abstract_executor.py # Abstract executor class
│   ├── python.py # Python executor
│   ├── java.py # Java executor
│   ├── ... # Other executors coming soon
├── sandbox/ # Sandbox Generators for Isolated Code Execution
│   ├── __init__.py # Sandbox factory file
│   ├── secure_executor.py # Secure sandbox generator (TBC WHAT TYPE TODO)
```

### New Language Requirements
To add a new language complete the following (see the `src/executor/python.py` and `src/executor/java.py` files for examples):  
   
An executor file must be created in the `src/executor` directory. This file must contain a class inheriting from the `AbstractExecutor` class (in `src/executor/abstract_executor.py`). The following must be satisfied:  
  
- The new executor name should be of the format `{Language}Executor`.
- The new executor should implement the method `_build_test_files` which builds the necessary test files for the submission code - no other files should be created. All test files should be created in the `self.test_dir` temporary directory created for this submission.
- The new executor should implement the method `_get_execution_command` which provides a command that can be run to execute a given test case. This command should be returned as a list of strings (as required by the `subprocess` module).
- The new executor should implement the method `_get_result` which takes in the process return code, standard out and standard error and returns a dictionary containing the result of the test case. The dictionary should contain the following keys: `passed`, `timeout`, `memory_exceeded`, `output`, `stdout` and `stderr`. The `output` key should contain the actual output from the submission code (and an empty string if an error occurred), `stdout` should contain the standard output from the test case and `stderr` should contain the standard error from the test case. The `passed` key should be a boolean indicating whether the test case passed.
- A new entry should be added to the `executor_generator` function in `src/executor/__init__.py` to map the new language to the new executor class.
- A new dockerfile should be added to the `dockerfiles` directory. This dockerfile should install all necessary dependencies for the new language. It should be named `Dockerfile.{language}`.
- Additional terraform infrastructure must be added: 
    - a new ecs task which builds the relevant docker image and runs the worker with the correct environment variables (`CELERY_BROKER_URL`, `INPUT_QUEUE`, `OUTPUT_QUEUE`, `LANGUAGE`).
    - an SQS queue to and from this service for this language, with names `{language}q` and `{language}outputq`.

## Language Specific Requirements
- Python: Currently no additional requirements.
- Java: Submission code must be in a class named `Solution` and the function to be tested must be a public static method with the function name specified in the input.