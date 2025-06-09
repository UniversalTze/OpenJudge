import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Trend, Rate } from "k6/metrics";
import { problem } from "./problem.js"
import encoding from 'k6/encoding';

// Remove trailing slash to prevent double slashes in URLs
const ENDPOINT = (__ENV.ENDPOINT || "").replace(/\/$/, "");
const USERNAME = __ENV.USERNAME;
const PASSWORD = __ENV.PASSWORD;

// Full pipeline metrics
const submissionSuccess = new Counter("submissions_created");
const submissionFailures = new Counter("submissions_failed");
const executionSuccess = new Counter("executions_completed");
const executionFailures = new Counter("executions_failed");
const executionTimeouts = new Counter("executions_timed_out");
const testCasesCorrect = new Counter("test_cases_correct");
const testCasesIncorrect = new Counter("test_cases_incorrect");
const expectedCorrectActuallyPassed = new Counter("expected_correct_passed");
const expectedIncorrectActuallyFailed = new Counter("expected_incorrect_failed");
const unexpectedResults = new Counter("unexpected_results");
const queueLatency = new Trend("queue_processing_time");
const submissionToResult = new Trend("submission_to_result_time");
const executionRate = new Rate("execution_success_rate");
const testCaseAccuracy = new Rate("test_case_accuracy");

export const options = {
    scenarios: {
        // Normal pipeline test - submission + execution validation
        normal_pipeline_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 5 },    // Gentle start
                { duration: '2m', target: 15 },   // Moderate load
                { duration: '2m', target: 25 },   // Peak normal load
                { duration: '1m', target: 15 },   // Wind down
                { duration: '1m', target: 5 },    // Recovery
                { duration: '30s', target: 0 },   // Complete
            ],
            exec: 'fullPipelineTest',
        }
    },
    thresholds: {
        http_req_duration: ['p(95)<8000'],           // 95% under 8s
        http_req_failed: ['rate<0.1'],               // Less than 10% HTTP failures
        submissions_created: ['count>30'],           // At least 30 submissions
        executions_completed: ['count>20'],          // At least 20 executions complete
        execution_success_rate: ['rate>0.7'],        // 70% execution success rate
        submission_to_result_time: ['p(90)<120000'], // 90% complete within 2 minutes
        test_case_accuracy: ['rate>0.8'],           // 80% test cases give expected results
    }
};

let authTokens = [];

export function setup() {
    console.log("=== NORMAL PIPELINE TEST SETUP ===");
    console.log(`Testing complete Python submission-to-execution pipeline: ${ENDPOINT}`);
    
    // Pre-authenticate multiple users for normal pipeline testing
    const tokens = [];
    const userCount = 5; // Normal load testing with fewer users
    
    for (let i = 0; i < userCount; i++) {
        try {
            const loginPayload = JSON.stringify({
                email: USERNAME,
                password: PASSWORD 
            });

            const loginParams = {
                headers: { 'Content-Type': 'application/json' }
            };

            const loginRequest = http.post(`${ENDPOINT}/login`, loginPayload, loginParams);
            
            if (loginRequest.status === 200) {
                const loginData = loginRequest.json();
                const token = loginData.accessToken || loginData.access_token;
                
                // Extract user ID from JWT token
                const tokenParts = token.split('.');
                const payload = JSON.parse(encoding.b64decode(tokenParts[1], 'rawstd', 's'));
                const userId = payload.sub;
                
                tokens.push({ token, userId, userLabel: `user_${i}` });
                console.log(`Pipeline user ${i} ready: ${userId.substring(0, 8)}...`);
            } else {
                console.log(`Pipeline user ${i} auth failed: ${loginRequest.status}`);
            }
        } catch (e) {
            console.log(`Setup error for user ${i}: ${e.message}`);
        }
        
        sleep(0.1);
    }
    
    console.log(`=== ${tokens.length} users ready for normal pipeline testing ===`);
    return { tokens };
}

function getAuthHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
}

function getRandomUser(data) {
    if (!data.tokens || data.tokens.length === 0) {
        throw new Error("No authenticated users available for pipeline test");
    }
    return data.tokens[Math.floor(Math.random() * data.tokens.length)];
}

// Test the complete pipeline: submission → queue → execution → results
export function fullPipelineTest(data) {
    const pipelineStartTime = Date.now();
    
    try {
        const user = getRandomUser(data);
        const testCode = generateTestCode();
        
        console.log(`${user.userLabel}: Starting full pipeline test`);
        
        // Step 1: Submit code for execution
        const submissionPayload = {
            user_id: user.userId,
            problem_id: problem.id,
            language: testCode.language,
            code: testCode.code
        };
        
        const submissionResponse = http.post(
            `${ENDPOINT}/submission`, 
            JSON.stringify(submissionPayload), 
            getAuthHeaders(user.token)
        );
        
        if (submissionResponse.status !== 201) {
            submissionFailures.add(1);
            console.log(`${user.userLabel}: Submission failed - ${submissionResponse.status}`);
            return;
        }
        
        submissionSuccess.add(1);
        const submissionData = submissionResponse.json();
        const submissionId = submissionData.submission_id;
        console.log(`${user.userLabel}: Submission created - ${submissionId.substring(0, 8)}...`);
        
        check(submissionResponse, {
            'pipeline: submission accepted': (r) => r.status === 201,
            'pipeline: submission has ID': (r) => {
                try {
                    const data = r.json();
                    return data.submission_id && data.submission_id.length > 0;
                } catch {
                    return false;
                }
            }
        });
        
        // Step 2: Poll for execution completion
        const maxAttempts = 24; // 2 minutes max (5s intervals)
        let attempt = 1;
        let finalStatus = null;
        let executionCompleted = false;
        
        console.log(`${user.userLabel}: Monitoring execution progress...`);
        
        while (attempt <= maxAttempts && !executionCompleted) {
            sleep(5); // Wait 5 seconds between checks
            
            const statusResponse = http.get(
                `${ENDPOINT}/submission/${submissionId}`, 
                getAuthHeaders(user.token)
            );
            
            if (statusResponse.status === 200) {
                try {
                    const statusData = statusResponse.json();
                    const currentStatus = statusData.status;
                    
                    console.log(`${user.userLabel}: Attempt ${attempt}/24 - Status: ${currentStatus}`);
                    
                    if (currentStatus !== 'pending') {
                        executionCompleted = true;
                        finalStatus = currentStatus;
                        
                        const totalTime = Date.now() - pipelineStartTime;
                        submissionToResult.add(totalTime);
                        queueLatency.add(totalTime);
                        
                        console.log(`${user.userLabel}: Execution completed in ${(totalTime/1000).toFixed(1)}s - Result: ${finalStatus}`);
                        
                        if (finalStatus === 'passed' || finalStatus === 'failed') {
                            executionSuccess.add(1);
                            executionRate.add(1);
                            
                            // Validate test case correctness
                            const isCorrect = validateTestCaseResults(statusData, testCode.expected);
                            if (isCorrect) {
                                testCaseAccuracy.add(1);
                            } else {
                                testCaseAccuracy.add(0);
                            }
                        } else {
                            executionFailures.add(1);
                            executionRate.add(0);
                        }
                        
                        // Verify we got detailed results
                        check(statusResponse, {
                            'pipeline: execution completed': (r) => {
                                try {
                                    const data = r.json();
                                    return data.status !== 'pending';
                                } catch {
                                    return false;
                                }
                            },
                            'pipeline: has test results': (r) => {
                                try {
                                    const data = r.json();
                                    return data.results && Array.isArray(data.results);
                                } catch {
                                    return false;
                                }
                            },
                            'pipeline: test results match expectations': (r) => {
                                try {
                                    const data = r.json();
                                    return validateTestCaseResults(data, testCode.expected);
                                } catch {
                                    return false;
                                }
                            }
                        });
                        
                        break;
                    }
                    
                } catch (e) {
                    console.log(`${user.userLabel}: Error parsing status response - ${e.message}`);
                }
            } else {
                console.log(`${user.userLabel}: Status check failed - ${statusResponse.status}`);
            }
            
            attempt++;
        }
        
        // Step 3: Handle execution timeout
        if (!executionCompleted) {
            executionTimeouts.add(1);
            executionFailures.add(1);
            executionRate.add(0);
            
            const timeoutTime = Date.now() - pipelineStartTime;
            console.log(`${user.userLabel}: Execution timed out after ${(timeoutTime/1000).toFixed(1)}s`);
            
            check(null, {
                'pipeline: execution did not timeout': () => false, // This will fail and be counted
            });
        }
        
        // Step 4: Final validation
        check(submissionResponse, {
            'pipeline: full workflow completed': () => executionCompleted,
            'pipeline: reasonable execution time': () => {
                const totalTime = Date.now() - pipelineStartTime;
                return totalTime < 120000; // Less than 2 minutes
            }
        });
        
    } catch (e) {
        submissionFailures.add(1);
        executionFailures.add(1);
        console.log(`Pipeline test error: ${e.message}`);
    }
}

// Generate Python test code variations
function generateTestCode() {
    const testCases = [
        {
            language: "python",
            code: `def IsPalindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`,
            expected: "correct"
        },
        {
            language: "python",
            code: `def IsPalindrome(x):
    # Mathematical approach
    if x < 0:
        return False
    original = x
    reversed_num = 0
    while x > 0:
        reversed_num = reversed_num * 10 + x % 10
        x //= 10
    return original == reversed_num`,
            expected: "correct"
        },
        {
            language: "python",
            code: `def IsPalindrome(x):
    # List approach
    if x < 0:
        return False
    digits = list(str(x))
    return digits == digits[::-1]`,
            expected: "correct"
        },
        {
            language: "python",
            code: `def IsPalindrome(x):
    # Intentionally wrong for testing
    return x > 0`,
            expected: "incorrect"
        }
    ];
    
    return testCases[Math.floor(Math.random() * testCases.length)];
}

// Validate that test case results match expectations
function validateTestCaseResults(statusData, expected) {
    try {
        const status = statusData.status;
        const testResults = statusData.results; // API returns 'results' not 'test_results'
        
        if (!testResults || !Array.isArray(testResults)) {
            console.log(`No test results found. Available fields: ${Object.keys(statusData)}`);
            console.log(`Status data: ${JSON.stringify(statusData)}`);
            return false;
        }
        
        // Count passed and failed test cases
        let passedCount = 0;
        let failedCount = 0;
        
        for (const result of testResults) {
            if (result.status === 'passed' || result.passed === true) {
                passedCount++;
                testCasesCorrect.add(1);
            } else if (result.status === 'failed' || result.passed === false) {
                failedCount++;
                testCasesIncorrect.add(1);
            }
        }
        
        const totalTests = passedCount + failedCount;
        console.log(`Test results: ${passedCount}/${totalTests} passed`);
        
        // Validate expectations
        if (expected === "correct") {
            // We expect this solution to pass most/all test cases
            const shouldPass = passedCount >= Math.ceil(totalTests * 0.8); // At least 80% should pass
            if (shouldPass && status === 'passed') {
                expectedCorrectActuallyPassed.add(1);
                console.log("Expected correct solution passed as expected");
                return true;
            } else {
                unexpectedResults.add(1);
                console.log(`Expected correct solution but got: ${status} (${passedCount}/${totalTests} passed)`);
                return false;
            }
        } else if (expected === "incorrect") {
            // We expect this solution to fail most test cases
            const shouldFail = failedCount >= Math.ceil(totalTests * 0.6); // At least 60% should fail
            if (shouldFail && status === 'failed') {
                expectedIncorrectActuallyFailed.add(1);
                console.log("Expected incorrect solution failed as expected");
                return true;
            } else {
                unexpectedResults.add(1);
                console.log(`Expected incorrect solution but got: ${status} (${passedCount}/${totalTests} passed)`);
                return false;
            }
        }
        
        return false;
        
    } catch (e) {
        console.log(`Error validating test results: ${e.message}`);
        return false;
    }
}

export function teardown(data) {
    console.log("=== NORMAL PIPELINE TEST RESULTS ===");
    console.log(`Python submissions created: ${submissionSuccess.count || 0}`);
    console.log(`Submissions failed: ${submissionFailures.count || 0}`);
    console.log(`Python executions completed: ${executionSuccess.count || 0}`);
    console.log(`Executions failed: ${executionFailures.count || 0}`);
    console.log(`Executions timed out: ${executionTimeouts.count || 0}`);
    
    console.log("=== TEST CASE VALIDATION RESULTS ===");
    console.log(`Individual test cases passed: ${testCasesCorrect.count || 0}`);
    console.log(`Individual test cases failed: ${testCasesIncorrect.count || 0}`);
    console.log(`Expected correct solutions that passed: ${expectedCorrectActuallyPassed.count || 0}`);
    console.log(`Expected incorrect solutions that failed: ${expectedIncorrectActuallyFailed.count || 0}`);
    console.log(`Unexpected results: ${unexpectedResults.count || 0}`);
    
    const totalSubmissions = (submissionSuccess.count || 0) + (submissionFailures.count || 0);
    const totalExecutions = (executionSuccess.count || 0) + (executionFailures.count || 0);
    const totalTestCases = (testCasesCorrect.count || 0) + (testCasesIncorrect.count || 0);
    const totalValidations = (expectedCorrectActuallyPassed.count || 0) + (expectedIncorrectActuallyFailed.count || 0) + (unexpectedResults.count || 0);
    
    const submissionRate = totalSubmissions > 0 ? ((submissionSuccess.count || 0) / totalSubmissions * 100).toFixed(1) : 0;
    const executionRate = totalExecutions > 0 ? ((executionSuccess.count || 0) / totalExecutions * 100).toFixed(1) : 0;
    const validationAccuracy = totalValidations > 0 ? (((expectedCorrectActuallyPassed.count || 0) + (expectedIncorrectActuallyFailed.count || 0)) / totalValidations * 100).toFixed(1) : 0;
    
    console.log("=== SUMMARY METRICS ===");
    console.log(`Submission success rate: ${submissionRate}%`);
    console.log(`Python execution completion rate: ${executionRate}%`);
    console.log(`Test case validation accuracy: ${validationAccuracy}%`);
    console.log(`Total individual test cases processed: ${totalTestCases}`);
    console.log("=== NORMAL PIPELINE TEST COMPLETE ===");
}