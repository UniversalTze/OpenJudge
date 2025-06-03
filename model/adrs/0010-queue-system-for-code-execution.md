# 10. Queue System for Java and Python Code Execution  
**Date:** 2025-05-13
**Status:** Accepted  
**Summary**  
*In the context of* supporting multiple programming languages for automated code execution, *facing* the challenge of dynamically assigning execution environments based on the test language, *we decided* to implement a queue-based execution system with separate images for Java and Python, *to achieve* efficient, scalable, and language-specific execution while ensuring consistent test handling.  

**Context**  
- Our system must support running code in both Java and Python environments.  
- We need a scalable approach to dynamically assign execution tasks based on the test language.  
- A direct synchronous execution model would introduce performance bottlenecks and resource constraints.  
- A queue system allows for efficient task distribution without overwhelming compute resources.  

**Decision**  
We decided to implement a queue-based execution system where code execution requests are placed in a queue.  
- The queue system routes execution tasks to appropriate worker nodes based on the programming language.  
- Dedicated execution environments (Docker images) are maintained for Java and Python to ensure proper isolation.  
- The system listens for execution requests, fetches them from the queue, runs the code in the correct environment, and returns results asynchronously.  

**Consequences**  
- Introducing a queue system adds operational overhead for queue management.  
- Each execution environment requires consistent configuration and updates to support different versions of Java and Python.  
- Proper monitoring and logging are necessary to ensure test execution reliability.  
- Latency may vary based on queue size and available compute resources.  