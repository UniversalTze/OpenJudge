# Code Execution Service

ASSIGNED TO: Mittun Sudhahar

## Built in Python:FastAPI

### Getting Started
- Using uv and fastapi with uvicorn

### Documentation

Initial Docs (Draft):
- Assume input is already validated
- Take in language, test cases, submission
- Return a list of results (error messages and pass/fail)

Basic Script for Python:

{
    Submission: (language, function_name, code)
    TestCases: [testX]
}

Create File:

import function_name as submission from fileX
import tests from fileY

for test_case in tests:
    try:
        test(submission) in subprocess with time limit
        write(test passed in some standard format)
    catch Exception as e:
        write(e, fileOutput) in standard format (write the traceback from exception which contains the submission file and test file only)

Standard Format:
Json Response:
[
    {
        Has_Passed: bool
        Errors: [filtered errStrings]
    }
]
