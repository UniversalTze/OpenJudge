# 20. LLM Integration for Feedback on User Submission 
**Date:** 2025-05-24
**Status:** Accepted  

**Summary**  
To enhance the education experienc of Open Judge, it was decided that that an LLM-based feedback on user submitted code is essential.  This will enable students to receive personalised, explainable insights beyond simple pass/fail test results.

**Context**  
- Users can submit their level of coding.
- After submission of code, the LLM can use data based on user skill and submission to provide feedback that can be tailored more towards the user and their learning curve. 

**Decision**  
It was decided that integrating an LLM-based feedback mechanism is necessary to provide a richer educational experience on OpenJudge.
Personalised feedback helps students not only understand what went wrong, but also why and how to improve. This would be implemented with an external API call to LLM services via Groq API 

**Consequences**  
- More logic is required in the submissions service to handle this external API call.  
- Adds potential network latency for user submissions with latency for result polling already existing. 