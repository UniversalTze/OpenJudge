# 17. Acceptable Latency for Real-Time Feedback
**Date:** 2025-05-25
**Status:** Accepted
**Summary**  
*In the context of* sending real-time feedback for submissions, *facing* the challenge of securely executing code *we decided* the tradeoff of *additional latency* before returning results in return for enabling *additional security* was acceptable.

**Context**  
- Our system must support running potentially unsafe code without affecting the overall system. We also must return results to the user in a timely manner.
- The additional latency introduced by sandboxing, additional services and network calls are unlikely to add enough latency to be significant relative to actually processing more complex tests, and are unlikely to be noticed by the user.
- An option suggested was was to have a websocket connection from the front-end service to the test runner service to provide real time updates when test execution service was running. 

**Decision**  
Any further architectural decision that introduce additional latency on the scale of seconds is acceptable in exchange for better security and more isolation. This includes allowing queues to the execution service to have a small backlog. Users are unlikely to be affected when waiting for tests if up to 1-2s of latency is added. Thus, in order to ensure isolation of the test runner service (sandbox), we decided not to implement the web-socket connection.

**Consequences**
- There will not quite be real time feedback to users - up to 2s of latency may be deliberately allowed.