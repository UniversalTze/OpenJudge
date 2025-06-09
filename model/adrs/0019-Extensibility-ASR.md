# 19. Extensibility Elavation into Key ASR 
**Date:** 2025-05-24
**Status:** Accepted  

**Summary**  
In the context of making OpenJudge into a flexible educational platform, facing the need to support a growing number of programming languages, each with its own execution semantics and runtime, we decided to explicitly design the architecture to be extensible for language support — adding per-language submission queues and execution services.

**Context**  
- Users can submit code for numerous different langauges.
- To handle different langugages, it will require: 
    - Its own execution environment (to enforce language-specific security, time/memory limits, etc.).
    - Its own submission queue
- Educational needs vary: different courses teach different languages; instructors want to experiment with emerging languages.

**Decision**  
We decided that although there is a tradeoff in terms of deployability and operational overhead (more queues and execution services to manage), making extensibility for programming languages a primary ASR is critical for an educational platform like OpenJudge.
Supporting a wide variety of programming languages is essential to serve diverse courses, curricula, and learning needs. 

**Consequences**  
- Sacrificing deployability for extensibility
- More operation overhead in managing infrastructure to provide this.