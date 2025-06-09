import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";
import { problem } from "./problem.js"
import encoding from 'k6/encoding';

// Remove trailing slash to prevent double slashes in URLs
const ENDPOINT = (__ENV.ENDPOINT || "").replace(/\/$/, "");
const USERNAME = __ENV.USERNAME;
const PASSWORD = __ENV.PASSWORD;

// Deadline rush metrics
const submissionSuccess = new Counter("deadline_submissions_success");
const submissionFailures = new Counter("deadline_submissions_failed");
const queueBacklog = new Counter("queue_backlog_events");
const serverOverload = new Counter("server_overload_503s");
const submissionLatency = new Trend("submission_response_time");

export const options = {
    scenarios: {
        // Simulates everyone submitting at assignment deadline
        assignment_deadline_rush: {
            executor: 'ramping-arrival-rate',
            startRate: 1,
            timeUnit: '1s',
            preAllocatedVUs: 30,
            maxVUs: 100,
            stages: [
                { duration: '30s', target: 5 },   // Few early birds
                { duration: '1m', target: 20 },   // Building up
                { duration: '1m', target: 50 },   // Heavy rush starts
                { duration: '2m', target: 80 },   // Peak deadline panic
                { duration: '30s', target: 100 }, // Absolute chaos - everyone submitting
                { duration: '1m', target: 30 },   // Post-deadline stragglers
                { duration: '30s', target: 5 },   // Back to normal
            ],
            exec: 'deadlineRushTest',
        }
    },
    thresholds: {
        http_req_duration: ['p(95)<10000'], // 95% under 10s during rush
        http_req_failed: ['rate<0.15'],     // Less than 15% failure acceptable during rush
        deadline_submissions_success: ['count>50'], // At least 50 successful submissions
        server_overload_503s: ['count<10'], // Less than 10 complete overloads
    }
};

let authTokens = [];

export function setup() {
    console.log("=== ASSIGNMENT DEADLINE RUSH SETUP ===");
    console.log(`Simulating mass submission to: ${ENDPOINT}`);
    
    // Pre-authenticate a few users to simulate class of students
    const tokens = [];
    const studentCount = 5; // Simulate 5 different students (reused across VUs)
    
    for (let i = 0; i < studentCount; i++) {
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
                
                tokens.push({ token, userId, studentId: `student_${i}` });
                console.log(`Student ${i} authenticated: ${userId.substring(0, 8)}...`);
            } else {
                console.log(`Student ${i} auth failed: ${loginRequest.status}`);
            }
        } catch (e) {
            console.log(`Auth error for student ${i}: ${e.message}`);
        }
        
        sleep(0.2); // Small delay between authentications
    }
    
    console.log(`=== ${tokens.length} students ready for deadline rush ===`);
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

function getRandomStudent(data) {
    if (!data.tokens || data.tokens.length === 0) {
        throw new Error("No authenticated students available");
    }
    return data.tokens[Math.floor(Math.random() * data.tokens.length)];
}

// Simulates realistic student behavior during deadline rush
export function deadlineRushTest(data) {
    try {
        const student = getRandomStudent(data);
        
        // Simulate panic behavior - some students check problems first
        if (Math.random() < 0.4) { // 40% check problems in panic
            const problemsResponse = http.get(`${ENDPOINT}/problems`, getAuthHeaders(student.token));
            check(problemsResponse, {
                'deadline panic: problems loaded': (r) => r.status === 200,
            });
            
            // Brief pause as they read
            sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
        }
        
        // Create submission - everyone submitting similar solution in panic
        const panicCode = generatePanicCode();
        const submissionPayload = {
            user_id: student.userId,
            problem_id: problem.id,
            language: "java",
            code: panicCode
        };
        
        // Measure submission latency during rush
        const startTime = Date.now();
        const submissionResponse = http.post(
            `${ENDPOINT}/submission`, 
            JSON.stringify(submissionPayload), 
            getAuthHeaders(student.token)
        );
        const latency = Date.now() - startTime;
        submissionLatency.add(latency);
        
        // Track outcomes
        if (submissionResponse.status === 201) {
            submissionSuccess.add(1);
            console.log(`${student.studentId}: Submission accepted (${latency}ms)`);
            
            // Some students obsessively check status during deadline
            if (Math.random() < 0.6) { // 60% check their submission status
                const subData = submissionResponse.json();
                const submissionId = subData.submission_id;
                
                // Wait a bit then check (anxious checking)
                sleep(Math.random() * 3 + 1); // 1-4 seconds
                
                const statusResponse = http.get(
                    `${ENDPOINT}/submission/${submissionId}`, 
                    getAuthHeaders(student.token)
                );
                
                check(statusResponse, {
                    'deadline panic: status check': (r) => r.status === 200,
                    'submission still processing': (r) => {
                        try {
                            const data = r.json();
                            return data.status === 'pending' || data.status === 'passed' || data.status === 'failed';
                        } catch {
                            return false;
                        }
                    }
                });
                
                if (statusResponse.status === 200) {
                    const statusData = statusResponse.json();
                    console.log(`${student.studentId}: Status check - ${statusData.status}`);
                }
            }
            
        } else if (submissionResponse.status === 429) {
            queueBacklog.add(1);
            console.log(`${student.studentId}: Rate limited (queue backed up)`);
        } else if (submissionResponse.status === 503) {
            serverOverload.add(1);
            console.log(`${student.studentId}: Server overloaded!`);
        } else {
            submissionFailures.add(1);
            console.log(`${student.studentId}: Submission failed - ${submissionResponse.status}`);
        }
        
        check(submissionResponse, {
            'deadline submission accepted': (r) => r.status === 201,
            'system surviving deadline rush': (r) => r.status !== 503,
            'reasonable response time': (r) => latency < 15000, // 15 seconds max during rush
        });
        
        // Random panic behavior - some students submit multiple times
        if (Math.random() < 0.1 && submissionResponse.status !== 201) { // 10% try again if failed
            sleep(1);
            console.log(`${student.studentId}: Retrying submission...`);
            
            const retryResponse = http.post(
                `${ENDPOINT}/submission`, 
                JSON.stringify(submissionPayload), 
                getAuthHeaders(student.token)
            );
            
            if (retryResponse.status === 201) {
                submissionSuccess.add(1);
                console.log(`${student.studentId}: Retry successful`);
            }
        }
        
    } catch (e) {
        submissionFailures.add(1);
        console.log(`Deadline rush error: ${e.message}`);
    }
}

// Generate slightly different panic code submissions
function generatePanicCode() {
    const variations = [
        `public class Solution {
    public static boolean IsPalindrome(int x) {
        if (x < 0) return false; // negative numbers are not palindromes
        int original = x;
        int reversed = 0;
        while (x != 0) {
            int digit = x % 10;
            reversed = reversed * 10 + digit;
            x /= 10;
        }
        return original == reversed;
    }
}`,
        `public class Solution {
    public static boolean IsPalindrome(int x) {
        // Quick solution before deadline!
        String s = String.valueOf(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }
}`,
        `public class Solution {
    public static boolean IsPalindrome(int x) {
        if (x < 0) return false;
        String str = Integer.toString(x);
        int left = 0, right = str.length() - 1;
        while (left < right) {
            if (str.charAt(left) != str.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }
}`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
}

export function teardown(data) {
    console.log("=== DEADLINE RUSH TEST RESULTS ===");
    console.log(`Successful submissions: ${submissionSuccess.count || 0}`);
    console.log(`Failed submissions: ${submissionFailures.count || 0}`);
    console.log(`Queue backlog events: ${queueBacklog.count || 0}`);
    console.log(`Server overload events: ${serverOverload.count || 0}`);
    
    const totalSubmissions = (submissionSuccess.count || 0) + (submissionFailures.count || 0);
    const successRate = totalSubmissions > 0 ? ((submissionSuccess.count || 0) / totalSubmissions * 100).toFixed(1) : 0;
    
    console.log(`Success rate: ${successRate}%`);
    console.log("=== END DEADLINE RUSH TEST ===");
}