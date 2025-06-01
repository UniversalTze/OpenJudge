"""
Basic test file for testing the Python executor functionality.
"""

import sys
import os

# Add the project root and src directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
src_dir = os.path.join(project_root, 'src')
executor_dir = os.path.join(src_dir, 'executor')

# Add both project root and src to path
sys.path.insert(0, project_root)
sys.path.insert(0, src_dir)

# Try importing directly from the executor directory
from src.executor.python import PythonExecutor

def test_python_executor_basic():
    """
    Basic test to verify PythonExecutor can be imported and instantiated.
    """
    print("Testing PythonExecutor import...")

    # Sample test data
    sample_code = """
def solution(x):
    return x * 5
"""

    # Try to create a PythonExecutor instance
    try:
        executor = PythonExecutor(
            function_name="solution",
            inputs=[[5], [7], [13]],
            outputs=[25, 35, 65],
            submission_code=sample_code,
            submission_id="test_basic_001",
            celery_return=lambda: None  # Mock celery return function
        )
        print("✓ PythonExecutor imported and instantiated successfully!")
        print(f"✓ Executor created with submission_id: {executor.submission_id}")
        print(f"✓ Function name: {executor.function_name}")
        with executor:
            executor.run()
        print("✓ PythonExecutor run function can be called without error!")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    print("Running basic test for Python executor...")
    success = test_python_executor_basic()
    if success:
        print("Basic test passed!")
    else:
        print("Basic test failed!")
        sys.exit(1)