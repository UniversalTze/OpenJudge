"""
Returns the executor for the given language, responsible for
creating the test execution environment for a given language,
test cases and submission, and then returning the results in
the specified format.
"""

from src.executor.abstract_executor import AbstractExecutor
from src.executor.python import PythonExecutor
from src.executor.java import JavaExecutor

def executor_generator(language: str) -> AbstractExecutor:
    """
    Selects the appropriate executor based on the provided language.

    Args:
        language (str): The programming language for which to select an executor.

    Returns:
        callable: The executor function for the specified language.
    """
    executor = None
    match language:
        case "python":
            executor = PythonExecutor
        case "java":
            executor = JavaExecutor
        case _:
            raise ValueError(f"Unsupported language: {language}")
    return executor

def select_execution_script(language: str):
    """
    Selects the appropriate execution script based on the provided language.

    Args:
        language (str): The programming language for which to select an executor.

    Returns:
        str: The path to the execution script for the specified language.
    """
    if language == "python":
        return "python3"
    elif language == "java":
        return "java"
    else:
        raise ValueError(f"Unsupported language: {language}")