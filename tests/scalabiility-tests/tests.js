import http, { get, post } from "k6/http";
import { check, sleep } from "k6";
import { Counter} from "k6/metrics";
import { problem } from "./problem.js"

const ENDPOINT = __ENV.ENDPOINT;
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
    // Prepare or fetch data
    
    const req = http.get(`${__ENV.ENDPOINT}/health`)
    check(req, {
        'Gateway health status 200': (r) => r.status === 200,
    });
    const payload = JSON.stringify({
    email: USERNAME,
    password: PASSWORD 
    });

    const request = http.post(`${__ENV.ENDPOINT}/login`, payload, params)
    if (request.status != 200) {
        throw new Error("Login failed")
    }
    GLOBALTOKEN = request.json().accessToken;
    console.log()
    return GLOBALTOKEN ;
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
export function Normal_Circumstance(GLOBALTOKEN) {
	attempted.add(1, { tag: "normal circumstances" });
    const here = getAuthHeaders(GLOBALTOKEN)
    console.log(getAuthHeaders(GLOBALTOKEN))
    let getURL = `${ENDPOINT}/problems`;
    let response = http.get(getURL, null, getAuthHeaders(GLOBALTOKEN));
    check(response, {
        'problems request status 200': (r) => r.status === 200,
    });
    
    let postURL = `${ENDPOINT}/submission`;
    let sub = http.post(postURL, submission, getAuthHeaders(GLOBALTOKEN))
    check(sub, {
        'submission post request status 200': (r) => r.status === 201,
    })
    let taskId;
    try {
        const data = submission.json();
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
		GetSubmissionStatus(attempts, resultURL, "GET /submission/{id}", "normal circumstances", GLOBALTOKEN)
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