# 16. Feedback Delivery API Design  
**Date:** 2025-05-XX 
**Status:** Accepted  

**Summary**  
*In the context of* delivering validation errors, execution status, and test results back to clients, *facing* diverse client needs (immediate error vs. async results), *we decided* to design a RESTful feedback API in the submission service *to achieve* clear, consistent, and versioned JSON responses.

**Context**  
- Frontend must handle both synchronous validation failures and asynchronous execution results.
- Clients need to poll or subscribe to status changes.
- Error payloads and result payloads differ in structure.

**Decision**  
- Define `/submit` POST response schema:  
  - `200 OK` with `{ submission_id, status: "queued" }` on success.  
  - `400 Bad Request` with validation errors array on failure.  
- Define `/status/{submission_id}` GET returning `{ status: "running"|"success"|"failed", errors?, results? }`.  
- Version all endpoints under `/api/v1/` to allow future changes.  
- Use consistent error object shape `{ field, message }`.

**Consequences**  
- Simplifies client logic with predictable schemas.  
- Supports multiple delivery modes (poll, SSE, WebSocket later).  
- Requires careful version management and backward compatibility.  
- Structured errors improve UX by pinpointing issues early.