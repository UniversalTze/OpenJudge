# XX. ECS Task Per Language
**Date:** 2025-06-XX
**Status:** Pending  
**Summary**  
*In the context of* supporting multiple programming languages for automated code execution, *facing* the challenge of dynamically assigning execution environments based on the test language and handling potentially disproportional load per language, *we decided* to implement an ECS based containerisation scheme, with independent auto-scaling groups per language, *to achieve* efficient and independently scalable environments for each language.  

**Context**  
- Our system must support running code in both Java and Python environments. This must be extensible to more environments in future.  
- We need a scalable approach to provide available and reliable environments based on the test language.
- A containerisation system able to run multiple languages in a single container would lead to larger docker images, slower deployment and backlogs of tests for each language.
- An ECS task per language enables the execution service to independently scale language test environments, whilst reducing the amount of set up per container.

**Decision**  
We decided to implement a task-based execution containerisation system where the code execution service contains multiple tasks for each language.
- The queue system (in a previous ADR) routes execution tasks to appropriate worker nodes based on the programming language.  
- The system listens for execution requests, fetches them from the queue, runs the code in the correct environment, and returns results asynchronously.  
- Each task can scale independently, enabling more efficient distribution of load to the server.

**Consequences**  
- Introducing a task-based system adds operational overhead for ECS task management.  
- Each execution environment requires its own dockerfile and execution environment.
- Proper monitoring and logging are necessary to ensure test execution reliability per language.  
- Additional infrastructure must be maintained to create a task per language.