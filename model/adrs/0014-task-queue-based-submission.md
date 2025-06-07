# 14. Task Queue-Based Submission Processing  
**Date:** 2025-05-XX 
**Status:** Accepted  

**Summary**  
*In the context of* building a scalable submission pipeline that processes user code independently and without blocking HTTP requests, *facing* unpredictable submission load and potential concurrency issues, *we decided* to use a task queue-based architecture *to achieve* asynchronous and distributed processing of submissions.

**Context**  
- Code execution is compute-intensive and slow relative to HTTP response times.
- Users expect feedback but should not be held up by backend latency.
- A message queue decouples request handling from actual execution.

**Decision**  
We integrated a queue-based worker model:
- Submissions are added to a queue (e.g., Celery-backed by Redis).
- Worker processes consume tasks and run them asynchronously.
- Results are saved to the database and returned via polling or later retrieval.
- This design allows horizontal scaling and better error handling.

**Consequences**  
- Improves system responsiveness under high load.
- Enables retry logic and better failure recovery.
- Introduces complexity in worker management and observability.
- Requires external components like Redis and background job monitoring.