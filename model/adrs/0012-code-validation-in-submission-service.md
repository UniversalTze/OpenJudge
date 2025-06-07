# 12. Code Validation in Submission Service  
**Date:** 2025-05-XX  
**Status:** Accepted  

**Summary**  
*In the context of* accepting arbitrary user code for evaluation, *facing* risks of malicious content, infinite loops, and invalid syntax crashing our execution pipeline, *we decided* to introduce a pre-execution validation stage in the submission service *to achieve* early rejection of dangerous or malformed submissions and provide clear, immediate feedback.

**Context**  
- Submissions arrive via HTTP POST to the `/submit` endpoint.
- User code may contain syntax errors, prohibited imports (e.g., `os`, `sys`), or patterns that could hang the evaluator (e.g., infinite loops).
- Without validation, invalid code would consume resources, complicate error tracking, and delay feedback.

**Decision**  
We implemented a multi-step validation pipeline:
1. **Static Syntax Check**  
   - Run `python -m py_compile` to catch syntax errors before queuing.  
2. **AST Inspection**  
   - Parse the code into an AST and reject or sanitize prohibited nodes (e.g., `Import`, `Exec`, `Eval`).  
3. **Blacklist Enforcement**  
   - Scan source text for blacklisted keywords (`os.system`, `subprocess`, file I/O).  
4. **Loop Protection Heuristic**  
   - Detect unbounded `while True:` or massive list comprehensions and flag for manual review or automatic timeout.  
5. **Immediate Feedback**  
   - Return a structured JSON error report if any check fails, listing error type and location.

**Consequences**  
- Catches many classes of user errors early, saving compute for valid submissions.  
- Requires maintenance of blacklist and AST rules as new attack vectors appear.  
- May produce false positives (e.g., legitimate dynamic imports) that need rule tuning.  
- Adds a small latency to the “submit” call but greatly improves robustness.