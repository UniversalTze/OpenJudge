# 15. Result Aggregation and Persistence  
**Date:** 2025-05-24
**Status:** Accepted  

**Summary**  
*In the context of* delivering comprehensive feedback to students, *facing* the need to store per-test-case outputs for historical review, *we decided* to aggregate execution results in JSON and persist them in a relational database via the submission service *to achieve* queryable submission history with full detail.

**Context**  
- Users must later view their past submissions and detailed outcomes.
- Test cases vary per problem; results must be flexible enough to store arrays of inputs/outputs.
- Database schema should support efficient retrieval by user and problem.

**Decision**  
- Worker serializes results into a JSON blob containing pass/fail status, input, expected and actual output for each test.  
- Submission record in PostgreSQL holds: `submission_id`, `user_id`, `problem_id`, `timestamp`, `code`, `result_json`.  
- Index on `(user_id, problem_id, timestamp)` to support dashboard queries.  
- Submission service exposes an endpoint `/submissions/{user}/{problem}` to fetch history.

**Consequences**  
- Enables rich UI for reviewing past attempts.  
- JSON storage simplifies schema evolution for test case shapes.  
- Large blobs require consideration of row size and possible partitioning for scale.  
- Queries on JSON fields (e.g., filtering by failed tests) may need GIN indexes.