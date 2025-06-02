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
import javax.json.*;
import java.io.*;
import java.lang.reflect.*;

public class TestRunner {{
    public static void main(String[] args) {{
        if (args.length != 2) {{
            System.err.println("Usage: java TestRunner <input_json> <expected_json>");
            System.exit(1);
        }}

        try {{
            // Parse JSON using javax.json
            JsonReader inputReader = Json.createReader(new StringReader(args[0]));
            JsonValue inputJson = inputReader.readValue();
            inputReader.close();

            JsonReader expectedReader = Json.createReader(new StringReader(args[1]));
            JsonValue expectedJson = expectedReader.readValue();
            expectedReader.close();

            // Convert JSON array to Object array for parameters
            Object[] parameters = jsonArrayToObjectArray((JsonArray) inputJson);

            // Create instance of Submission class
            Submission solution = new Submission();

            // Call the function using reflection
            Object output = callFunction(solution, "{self.function_name}", parameters);

            // Convert output to JSON string for comparison
            String outputJson = objectToJsonString(output);
            String expectedJsonString = expectedJson.toString();

            // Compare JSON strings
            if (!outputJson.equals(expectedJsonString)) {{
                System.err.println();
                System.err.print(outputJson);
                System.exit(232);
            }}

            System.err.println();
            System.err.print("Passed but here is output: " + outputJson);
            System.exit(0);

        }} catch (Exception e) {{
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }}
    }}

    // Convert JsonArray to Object array
    private static Object[] jsonArrayToObjectArray(JsonArray jsonArray) {{
        Object[] result = new Object[jsonArray.size()];
        for (int i = 0; i < jsonArray.size(); i++) {{
            result[i] = jsonValueToObject(jsonArray.get(i));
        }}
        return result;
    }}

    // Convert JsonValue to Java Object
    private static Object jsonValueToObject(JsonValue jsonValue) {{
        switch (jsonValue.getValueType()) {{
            case STRING:
                return ((JsonString) jsonValue).getString();
            case NUMBER:
                JsonNumber num = (JsonNumber) jsonValue;
                if (num.isIntegral()) {{
                    return num.intValue();
                }} else {{
                    return num.doubleValue();
                }}
            case TRUE:
                return true;
            case FALSE:
                return false;
            case NULL:
                return null;
            default:
                return jsonValue.toString();
        }}
    }}

    // Convert Object to JSON string
    private static String objectToJsonString(Object obj) {{
        if (obj == null) {{
            return "null";
        }} else if (obj instanceof String) {{
            return "\\"" + obj.toString().replace("\\"", "\\\\\\"") + "\\"";
        }} else if (obj instanceof Boolean) {{
            return obj.toString();
        }} else if (obj instanceof Number) {{
            return obj.toString();
        }} else {{
            // For other types, convert to string and quote
            return "\\"" + obj.toString().replace("\\"", "\\\\\\"") + "\\"";
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
        Matches Python executor pattern exactly.

        Args:
            test_number (int): The test number to execute.

        Returns:
            list: The command to compile and run the test.
        """
        # Return command as list (like Python executor)
        # Java requires compilation before execution, then run with JSON parameters
        return [
            "bash", "-c",
            f"cd {self.test_dir} && javac -cp /usr/share/java/javax.json-api.jar:/usr/share/java/javax.json.jar *.java && java -cp .:/usr/share/java/javax.json-api.jar:/usr/share/java/javax.json.jar TestRunner '{self.inputs[test_number]}' '{self.outputs[test_number]}'"
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