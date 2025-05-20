"""
Returns the executor for the given language, responsible for
creating the test execution environment for a given language,
test cases and submission, and then returning the results in 
the specified format.
"""

import uuid
from os import makedirs
from src.executor.python import python_executor
from src.executor.java import java_executor
from src.config import TEMP_DIR

def select_executor(language: str):
    """
    Selects the appropriate executor based on the provided language.
    
    Args:
        language (str): The programming language for which to select an executor.
        
    Returns:
        callable: The executor function for the specified language.
    """
    executor = None
    # TODO: Turn this into switch/case
    if language == "python":
        executor = python_executor
    elif language == "java":
        executor = java_executor
    else:
        raise ValueError(f"Unsupported language: {language}")
    return directory_wrapper(executor)
    
def directory_wrapper(executor: callable):
    """
    A decorator to wrap the executor function with directory creation logic.
    
    Args:
        executor (callable): The executor function to wrap.
        
    Returns:
        callable: The wrapped executor function.
    """

    def wrapper(*args, **kwargs):
        # Create the output directory if it doesn't exist
        test_id = str(uuid.uuid4())
        makedirs(TEMP_DIR / test_id, exist_ok=True)
        return executor(*args, **kwargs, directory=TEMP_DIR / test_id)
    
    return wrapper
    
def select_execution_script(language: str):
    """
    Selects the appropriate execution script based on the provided language.
    
    Args:
        language (str): The programming language for which to select an executor.
        
    Returns:
        str: The path to the execution script for the specified language.
    """
    # TODO: UPDATE THIS TO BE AN ACTUAL SCRIPT!
    if language == "python":
        return "python3"
    elif language == "java":
        return "java"
    else:
        raise ValueError(f"Unsupported language: {language}")