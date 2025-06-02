"""
Executor for Java code.
"""
from src.executor.abstract_executor import AbstractExecutor

class JavaExecutor(AbstractExecutor):
    def _build_test_files(self):
        """
        Builds the test files for the Java submission.
        Creates a Submission.java file and a test runner similar to Python executor.
        """
        # Create the submission Java file (always named Submission.java)
        with open(self.test_dir / "Submission.java", "w") as submission_file:
            submission_file.write(self.submission_code)

        # Create the test runner file (similar to Python's test_runner.py)
        test_code = f'''
import java.util.*;
import java.lang.reflect.*;

public class TestRunner {{
    public static void main(String[] args) {{
        if (args.length != 2) {{
            System.err.println("Usage: java TestRunner <input_json> <expected_json>");
            System.exit(1);
        }}

        try {{
            // Simple JSON parsing for basic types (no external dependencies)
            Object[] parameters = parseJsonArray(args[0]);
            Object expected = parseJsonValue(args[1]);

            // Create instance of Submission class
            Submission solution = new Submission();

            // Call the function using reflection
            Object output = callFunction(solution, "{self.function_name}", parameters);

            // Compare output with expected
            if (!Objects.equals(output, expected)) {{
                System.err.println();
                System.err.print(output);
                System.exit(232);
            }}

            System.err.println();
            System.err.print("Passed but here is output: " + output);
            System.exit(0);

        }} catch (Exception e) {{
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }}
    }}

    // Simple JSON array parser for basic types
    private static Object[] parseJsonArray(String json) {{
        json = json.trim();
        if (!json.startsWith("[") || !json.endsWith("]")) {{
            throw new IllegalArgumentException("Invalid JSON array: " + json);
        }}

        String content = json.substring(1, json.length() - 1).trim();
        if (content.isEmpty()) {{
            return new Object[0];
        }}

        String[] parts = content.split(",");
        Object[] result = new Object[parts.length];

        for (int i = 0; i < parts.length; i++) {{
            result[i] = parseJsonValue(parts[i].trim());
        }}

        return result;
    }}

    // Simple JSON value parser for basic types
    private static Object parseJsonValue(String json) {{
        json = json.trim();

        if (json.equals("null")) {{
            return null;
        }} else if (json.equals("true")) {{
            return true;
        }} else if (json.equals("false")) {{
            return false;
        }} else if (json.startsWith("\\"") && json.endsWith("\\"")) {{
            return json.substring(1, json.length() - 1);
        }} else if (json.contains(".")) {{
            return Double.parseDouble(json);
        }} else {{
            return Integer.parseInt(json);
        }}
    }}

    // Dynamic function caller using reflection
    private static Object callFunction(Object instance, String methodName, Object[] parameters) throws Exception {{
        Class<?> clazz = instance.getClass();
        Method[] methods = clazz.getMethods();

        // Find method by name and parameter count
        for (Method method : methods) {{
            if (method.getName().equals(methodName) && method.getParameterCount() == parameters.length) {{
                // Convert parameters to match method signature
                Class<?>[] paramTypes = method.getParameterTypes();
                Object[] convertedParams = new Object[parameters.length];

                for (int i = 0; i < parameters.length; i++) {{
                    convertedParams[i] = convertParameter(parameters[i], paramTypes[i]);
                }}

                return method.invoke(instance, convertedParams);
            }}
        }}

        throw new NoSuchMethodException("Method " + methodName + " not found with " + parameters.length + " parameters");
    }}

    // Convert parameter to match expected type
    private static Object convertParameter(Object param, Class<?> targetType) {{
        if (param == null) return null;
        if (targetType.isAssignableFrom(param.getClass())) return param;

        if (targetType == int.class || targetType == Integer.class) {{
            if (param instanceof Number) return ((Number) param).intValue();
            return Integer.parseInt(param.toString());
        }} else if (targetType == double.class || targetType == Double.class) {{
            if (param instanceof Number) return ((Number) param).doubleValue();
            return Double.parseDouble(param.toString());
        }} else if (targetType == String.class) {{
            return param.toString();
        }}

        return param;
    }}
}}
'''
        with open(self.test_dir / "TestRunner.java", "w") as test_file:
            test_file.write(test_code)

    def _get_execution_command(self, test_number: int) -> list:
        """
        Returns the command to execute the Java test file.

        Args:
            test_number (int): The test number to execute.

        Returns:
            list: The command to compile and run the test.
        """
        # Java requires compilation before execution, then run with JSON parameters
        import json
        input_json = json.dumps(self.inputs[test_number])
        expected_json = json.dumps(self.outputs[test_number])

        # Return command as list (like Python executor)
        return [
            "bash", "-c",
            f"cd {self.test_dir} && javac *.java && java TestRunner '{input_json}' '{expected_json}'"
        ]

    def _get_result(self, returncode: int, stdout: bytes, stderr: bytes) -> dict:
        """
        Processes the result from a Java test execution.
        Matches the Python executor's logic exactly.

        Args:
            returncode (int): The return code from the process.
            stdout (bytes): The standard output from the process.
            stderr (bytes): The standard error from the process.

        Returns:
            dict: The result of the test execution.
        """
        try:
            stdout_text = stdout.decode() if stdout else ""
            stderr_text = stderr.decode() if stderr else ""

            # Check for different error conditions (same as Python executor)
            if returncode == 124:
                # Timeout from the timeout command
                return {
                    "passed": False,
                    "timeout": True,
                    "memory_exceeded": False,
                    "output": "",
                    "stdout": stdout_text,
                    "stderr": f"The code exceeded the time limit of {self.timeout} seconds."
                }
            elif returncode == 137 or "Cannot allocate memory" in stderr_text:
                # Memory limit exceeded
                return {
                    "passed": False,
                    "timeout": False,
                    "output": "",
                    "memory_exceeded": True,
                    "stdout": stdout_text,
                    "stderr": "The code attempted to use more memory than allowed."
                }
            elif returncode == 232:
                # Test failed - extract actual output (same logic as Python)
                stderr_text = stderr_text.split('\n')[:-1]

                return {
                    "passed": False,
                    "timeout": False,
                    "output": stderr_text[-1] if stderr_text else "",
                    "memory_exceeded": False,
                    "stdout": stdout_text,
                    "stderr": '\n'.join(stderr_text[:-1]) if len(stderr_text) > 1 else ""
                }
            else:
                # Normal execution
                passed = returncode == 0

                return {
                    "passed": passed,
                    "timeout": False,
                    "output": "",
                    "memory_exceeded": False,
                    "stdout": stdout_text,
                    "stderr": stderr_text if not passed else ""
                }
        except Exception as e:
            # Handle any unexpected errors
            return {
                "passed": False,
                "timeout": False,
                "memory_exceeded": False,
                "output": "",
                "stdout": "",
                "stderr": f"Error processing test result: {str(e)}"
            }