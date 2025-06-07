# 13. Persistent Submission History with Test Results  
**Date:** 2025-05-19
**Status:** Accepted  

**Summary**  
*In the context of* improving learning outcomes by allowing students to reflect on their previous attempts, *facing* the need for visibility into prior submissions and results, *we decided* to persist all submission attempts with detailed test case outcomes *to achieve* a traceable learning record per user.

**Context**  
- Students benefit from reviewing failed attempts and improving incrementally.
- Data such as timestamp, code, and test outcomes are useful for self-reflection.
- This aligns with the platform’s educational goals of transparency and insight.

**Decision**  
The system records every submission:
- A database model captures code, problem ID, timestamp, and all test case outputs.
- This history is queryable via a user dashboard.
- Failed test cases show expected vs. actual output to encourage learning.

**Consequences**  
- Supports a deeper learning loop through visible mistakes and progress.
- Increases database size with every submission — requires storage planning.
- Provides groundwork for analytics or future AI-based feedback tools.
- Must handle privacy and visibility carefully (e.g., private submissions).