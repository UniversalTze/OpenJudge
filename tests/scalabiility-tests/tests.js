import http, { get, post } from "k6/http";
import { check, sleep } from "k6";
import { Counter} from "k6/metrics";
import { problem } from "./problem.js"
import encoding from 'k6/encoding';

// Remove trailing slash to prevent double slashes in URLs
const ENDPOINT = (__ENV.ENDPOINT || "").replace(/\/$/, "");
const USERNAME = __ENV.USERNAME;
const PASSWORD = __ENV.PASSWORD;
const USERID = __ENV.USERID

let GLOBALTOKEN;
// passing user name and password
// user must be create.
const params = {
    headers: {
        'Content-Type': 'application/json'
    }
};

const errors = new Counter("errors");
const attempted = new Counter("questions_attempted");
const problems_queried = new Counter("problems_asked_for")
const SubmissionCorrect = new Counter("Submission_correct")

export const options = {
    scenarios: {
        normal_circumstances: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
            { duration: '10s', target: 5 },
            { duration: '30s', target: 15 },
            { duration: '10s', target: 0 },
            ],
            exec: 'Normal_Circumstance',
        }
    }
};

const submission = {
    "user_id": USERID,
    "problem_id": problem.id,
    "language": "java",
    "code": "public class Solution {\n    public static boolean IsPalindrome(int x) {\n        if (x < 0) return false; // negative numbers are not palindromes\n\n        int original = x;\n        int reversed = 0;\n\n        while (x != 0) {\n            int digit = x % 10;\n            if (reversed > (Integer.MAX_VALUE - digit) / 10) {\n                return false; // handle overflow\n            }\n            reversed = reversed * 10 + digit;\n            x /= 10;\n        }\n\n        return original == reversed;\n    }\n}"
}

export function setup() {
    // Check health endpoint
    console.log(`Raw ENDPOINT: ${__ENV.ENDPOINT}`);
    console.log(`Cleaned ENDPOINT: ${ENDPOINT}`);
    console.log(`Testing health at: ${ENDPOINT}/health`);
    const healthReq = http.get(`${ENDPOINT}/health`);
    console.log(`Health check status: ${healthReq.status}, body: ${healthReq.body}`);
    
    check(healthReq, {
        'Gateway health status 200': (r) => r.status === 200,
    });

    if (healthReq.status !== 200) {
        console.log("Health check failed, but continuing with login attempt...");
    }

    // Attempt login
    const loginPayload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD 
    });

    console.log(`Attempting login with: ${USERNAME}`);
    const loginRequest = http.post(`${ENDPOINT}/login`, loginPayload, params);
    console.log(`Login status: ${loginRequest.status}, body: ${loginRequest.body}`);
    
    if (loginRequest.status !== 200) {
        console.error(`Login failed with status: ${loginRequest.status}`);
        console.error(`Response body: ${loginRequest.body}`);
        throw new Error(`Login failed with status ${loginRequest.status}: ${loginRequest.body}`);
    }

    const loginData = loginRequest.json();
    GLOBALTOKEN = loginData.accessToken || loginData.access_token;
    
    // Extract user ID from JWT token
    const tokenParts = GLOBALTOKEN.split('.');
    const payload = JSON.parse(encoding.b64decode(tokenParts[1], 'rawstd', 's'));
    const userId = payload.sub;
    
    console.log(`Login successful, token obtained: ${GLOBALTOKEN ? 'Yes' : 'No'}`);
    console.log(`User ID from token: ${userId}`);
    
    return { token: GLOBALTOKEN, userId: userId };
}

// Auth Header for every request.
function getAuthHeaders(token) {
    return {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    }
}

function GetSubmissionStatus (attempts, URL, endpoint_note, tag_note, GLOBALTOKEN) {
    let query;
	let attempt = 1;
    // Give service time to complete an analysis.
    while (attempt <= attempts) {
        query = http.get(URL, getAuthHeaders(GLOBALTOKEN));
        try {
            if (query.status == 200 && query.json().status != 'pending') {
                if (check(query, { "submission correct": (q) => q.json().status == "passed" })) {
                    SubmissionCorrect.add(1, { endpoint: endpoint_note, tag: tag_note });
                } else {
                    errors.add(1, { endpoint: endpoint_note, tag: tag_note });
                }
                return;
            }
        } catch (e) {
            console.error("Failed to parse GET /submission{id} response");
            errors.add(1, { endpoint: endpoint_note, tag: tag_note });
            return;
        }

        attempt += 1;
        sleep(10);
    }
    
    // Final check to determine if the analysis has succeeded or not.
    // Needed so that only a single check is performed on the analysis results.
    // Logic only gets here if a check is not performed in the while attempts loop.
    try {
        if (check(query, { 
                            "get submission status 200": (q) => q.status === 200, 
                            "submission correct": (q) => q.json().status == "correct" 
                         })) {
            SubmissionCorrect.add(1, { endpoint: endpoint_note, tag: tag_note });
        } else {
            errors.add(1, { endpoint: endpoint_note, tag: tag_note });
        }
    } catch (e) {
        console.error("Failed to parse GET /submission/{id} response")
        errors.add(1, { endpoint: endpoint_note, tag: tag_note });
        return;
    }
}

/**
 * Normal Circumstances - easy. Small load of people accessing problems, submission and looking at problems. 
 * Low load and gentle increase in load.
 */
export function Normal_Circumstance(data) {
	attempted.add(1, { tag: "normal circumstances" });
    const token = data.token;
    const userId = data.userId;
    
    console.log(getAuthHeaders(token))
    let getURL = `${ENDPOINT}/problems`;
    let response = http.get(getURL, getAuthHeaders(token));
    check(response, {
        'problems request status 200': (r) => r.status === 200,
    });
    
    // Create submission with proper user_id
    const submissionPayload = {
        user_id: userId,
        problem_id: problem.id,
        language: "java",
        code: "public class Solution {\n    public static boolean IsPalindrome(int x) {\n        if (x < 0) return false; // negative numbers are not palindromes\n\n        int original = x;\n        int reversed = 0;\n\n        while (x != 0) {\n            int digit = x % 10;\n            if (reversed > (Integer.MAX_VALUE - digit) / 10) {\n                return false; // handle overflow\n            }\n            reversed = reversed * 10 + digit;\n            x /= 10;\n        }\n\n        return original == reversed;\n    }\n}"
    };
    
    let postURL = `${ENDPOINT}/submission`;
    console.log(`Submitting to: ${postURL}`);
    console.log(`Submission payload:`, JSON.stringify(submissionPayload));
    let sub = http.post(postURL, JSON.stringify(submissionPayload), getAuthHeaders(token))
    console.log(`Submission response status: ${sub.status}, body: ${sub.body}`);
    check(sub, {
        'submission post request status 201': (r) => r.status === 201,
    })
    let taskId;
    try {
        const data = sub.json();
        console.log(data);
        taskId = data.submission_id;
    } catch (e) {
        console.error("Failed to parse POST response or extract task ID");
		errors.add(1, { endpoint: "POST /Submission", tag: "normal circumstances" });
        return;
    }
     // Check 25% of the results.
    if (Math.random() < 0.25 && taskId) {
        let resultURL = `${ENDPOINT}/submission/${taskId}`
		let attempts = 6;  // One minute to complete analysis under low load.
		GetSubmissionStatus(attempts, resultURL, "GET /submission/{id}", "normal circumstances", token)
	}

    sleep(60);
}

/**
 * Provide a more extended cool down period to give longer to finish analysis request processing.
 */
export function Cool_Down () {
	sleep(15)
	return;
}