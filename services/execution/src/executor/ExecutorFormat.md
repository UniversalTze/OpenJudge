### Specification for any Executor

- The executor must generate test files according to the following:
- Check the function to run has not been modified (ie try importing it)
- Must run each testcase in a new sandboxed subprocess with a time limit
- Should filter error messages to only those relevant to the test and submission files
- Should return those error messages in the specified format.

- The executor should then run a script to run these tests, and collect the output before returning it to the queue.