# OpenJudge (Practical 5)

### Team Members
- Tze Kheng Goh
- Nitish Madhavan
- Yash Mittal
- Benjamin Schenk
- Mittun Sudhahar
- Aryaman Tiwari 

## Abstract
OpenJudge represents a fundamental reimagining of how code evaluation platforms should serve educational purposes. Unlike traditional competitive programming platforms that prioritise opacity and gatekeeping, our system places learning transparency at its core. The platform provides complete visibility into test cases, detailed feedback mechanisms, and comprehensive explanations that transform coding challenges from frustrating puzzles into meaningful learning experiences.

Using a microservices architecture addresses the critical quality attributes of security, scalability, extensibility, and deployability through containerised services, message queue-based asynchronous communication, and multi-layered security protocols. The system demonstrates practical scalability through independent service scaling, robust security through sandboxed code execution environments, and proven extensibility through modular language support and AI-powered learning assistance.

The delivered solution validates our architectural decisions whilst highlighting important trade-offs between security isolation and real-time responsiveness, ultimately prioritising security, educational value and system integrity over immediate feedback loops.

## Introduction

The OpenJudge platform addresses a persistent challenge in computer science education: the pedagogical limitations of traditional online judges that prioritise competitive assessment over genuine learning. Platforms such as LeetCode, whilst popular, often frustrate students with cryptic "Wrong Answer" responses and hidden test cases that provide little educational value.

THe solution fundamentally reimagines this approach by embracing transparency as a core educational principle. Every test case, expected output, and failure explanation becomes a learning opportunity rather than an obstacle to overcome through guesswork.

From the [proposal](../model/proposal.md), the key Architecturally Significant Requirements (ASRs) for this project were: 
- Security (Quality Attribute) - OpenJudge's core feature of executing potentially unsafe or malicious user submitted code leads to significant security risks alongside those already commonly place in web development.
- Scalability (Quality Attribute) - Given our quality attribute, OpenJudge must be designed to handle many concurrent users attempting to browse problems, submit code and connect to the frontend.
- Extensibility (Quality Attribute) - OpenJudge's MVP should be designed to be extensible - both for the addition of new features/services, and to handle more languages that users can solve problems in.
- Deployability (Quality Attribute) - Our quality attribute ensures we need to have a deployable architecture, in particular an automated and simple deployment process.

In addition, the functional requirements of the program were: 
- User Authentication: Implement basic verification processes, secure storage of password using salted hashing and authentication processes using JWT when using the services. 
- Open Test Case Evaluation: Provide a problem pool of at 10-15 questions with visible testcases and hidden testcases that can be viewed after submission. 
- Real Time Feedback: Test results must be returned to the user in a timely manner without extensive latency.
- Submission Feedback: Submissions should be stored in a database that includes timestamp, previous code submission and tests results. 
- Problem Browsing: Users can browse and view problems in a problem list organised by difficulty. Users can view each problem where a description is provided along with expected inputs, outputs and examples. 
- Secure Code Execution: A user-friendly UI will be provided for submitting code. Code will be executed in isolated, sandboxed Docker containers hosted on AWS (using services such as Fargate) along with basic load balancing implemented via AWS services.

A context diagram for our project has been provided:
![OpenJudge Software Context](2025_P5_OpenJudge/model/images/OpenJudgeSystemContext.png)


## Changes
During development, we made several strategic adjustments to strengthen our core quality attributes whilst adapting to practical constraints:
- Real-time to Asynchronous Feedback Model: Originally, to provide real-time feedback a persistent WebSocket connections. However, to maintain absolute security isolation of execution environments, an asynchronous polling-based approach was adpoted. This change preserves rapid feedback whilst ensuring no direct network connections can compromise sandbox integrity. In addition, delays on the scale of 1–2 seconds—such as those introduced by a small backlog in queues and periodic polling—are an acceptable trade-offs. ([0017-no-realtime-feedback](../model/adrs/0017-no-realtime-feedback.md)). 
- Extensibility Elevation: Initially conceived as a supporting requirement, extensibility became a primary ASR due to its fundamental importance for educational platforms serving diverse learning needs. The team's architecture now explicitly supports seamless integration of new programming languages and learning tools. ([0019-Extensibility](../model/adrs/0019-Extensibility-ASR.md)).
- AI-Enhanced Learning Integration: We expanded scope to include Large Language Model (LLM) integration, providing contextual hints and explanations for failed test cases. This enhancement directly supports our educational mission by offering tailored guidance rather than generic error messages. ([0020-LLM-Integration](../model/adrs/0020-LLM-Integration.md)).

## Architecture Options
During the design phase, two different architectures were considered. The two options were a mix of an event-driven architecture with microservices and Functions as a Service (FaaS) and a pure event-driven architecture. These architectures and their pros and cons will be discussed below. 

### Event Driven + Microservices + FaaS
This alternative architecture retains the existing microservices layout but replaces queue-based communication with a submission event broker to coordinate events between the submission and test services. Additionally, the problem service will use Lambda functions to fetch problems from the shared database, and the test service will now use language-specific Lambda functions in separate containers to execute user-submitted code and log the results to a shared external database with the Submission Service. A container-based image for all micro services has been provided below, and deployment diagrams have been illustrated to highlight the key differences.

#### Pros
- Combining an event-driven architecture with language-specific AWS Lambda functions for the test runner service provides significant benefits in scalability, security, and deployability. Scalability is achieved through service decoupling: the event broker facilitates asynchronous communication between the submission and test runner services, allowing each to scale independently with its own auto-scaling policies. Lambda functions also inherently scale with automatic autoscaling policies attached to them. 

- From a deployability standpoint, using Lambda eliminates the need to manage server infrastructure, reducing operational overhead and simplifying deployment. This serverless model also removes dependencies on long-running background services like queues or dedicated workers, making the system easier to deploy and maintain.

- In terms of security, AWS Lambda allows the use of fine-grained IAM roles, ensuring each function operates with the minimum required permissions. The architecture also maintains a single, centralised entry point for communication between services, similar to the current system. This new proposed design is expected to reduce overall architectural complexity compared to the existing solution, making it more practical to implement.

#### Cons
- One of the major concerns with this architecture is the security of executing untrusted code within Lambda functions. The FaaS execution environment provides limited customisation, particularly in fine-grained control over compute resources such as CPU time, memory, and execution timeouts. Without strict resource limits, this can lead to unintended behaviours, such as infinite loops or potential malicious code execution. 

- Additionally, relying on an external database introduces security risks, including exposure to unauthorised access and data breaches. This setup also retains a key latency inefficiency from the current architecture: the front-end service must poll the submission service, which in turn repeatedly polls for test results. 

- Most importantly, this design violates one of the core principles of the project: to fully sandbox the test runner service with no external dependencies beyond the input event queue. Introducing external connections undermines this goal and increases the system's attack surface.

#### Container Diagram 
![Alternative Architecture 1 Container](2025_P5_OpenJudge/model/images/AltArchitecture-1-Container.png)


#### Deployment Diagram
![Alternative Architecture 1 Container](2025_P5_OpenJudge/model/images/AltArchitecture-1-Deployment.png)

In contrast to this hybrid approach, the second alternative explored was a comprehensive pure event-driven architecture.

### Pure Event Driven Architecture
This alternative architecture represents a comprehensive event-driven approach, utilising Apache Kafka as the central event streaming platform to orchestrate all inter-service communication. Unlike the hybrid approach described above, this design eliminates direct service-to-service API calls entirely, instead routing all interactions through a centralised event bus with dedicated event sourcing capabilities via EventStore DB.

The architecture employs Apache Kafka topics to categorise different event types (submission events, authentication events, execution events), with each microservice acting as both an event producer and consumer. Kafka's partitioning mechanism distributes events across multiple brokers for horizontal scalability, whilst consumer groups ensure load balancing across service instances. Key Kafka concepts integral to this design include dead letter queues (DLQs) for handling failed message processing, offset management for tracking message consumption progress, and replication factors to ensure fault tolerance across the cluster. The EventStore DB provides event sourcing capabilities, maintaining an immutable log of all domain events that enables complete system state reconstruction and audit trail functionality.

#### Pros
- The pure event-driven approach offers several compelling advantages, particularly in scalability and operational resilience. Horizontal scaling becomes inherently natural through Kafka's partitioning strategy, where increased load automatically distributes across available service instances without manual intervention. The loose coupling achieved through event-driven communication ensures that service failures remain isolated—if the problem management service experiences downtime, code submissions can continue queuing through the event bus until the service recovers, providing graceful degradation rather than cascading failures.
- Event sourcing capabilities represent a significant architectural advantage, offering complete audit trails and the ability to replay system events for debugging, compliance, or analytical purposes. This proves particularly valuable for an educational platform where understanding user interaction patterns and submission histories is crucial for improving the learning experience. The asynchronous nature of event processing aligns perfectly with code execution workflows, where submissions naturally follow a queue-and-process pattern rather than requiring immediate synchronous responses.
- Operational observability improves dramatically through Kafka's built-in monitoring capabilities and the immutable event log, enabling comprehensive tracking of system behaviour and performance metrics. The architecture also supports temporal decoupling, allowing services to process events at their optimal pace without blocking other system components.

#### Cons
- However, this architectural approach introduces substantial complexity that must be carefully considered. Kafka operational complexity represents the most significant challenge, requiring specialised expertise in managing multi-node clusters, monitoring partition health, and handling broker failures. The learning curve for the development team would be considerable, encompassing understanding of consumer group coordination, partition assignment strategies, and exactly-once delivery semantics.
- Debugging distributed workflows becomes significantly more challenging compared to traditional REST API tracing. Identifying the root cause of a failed submission might require examining dozens of events across multiple Kafka topics and correlating them through the EventStore, demanding sophisticated observability tooling and expertise. Eventual consistency replaces the immediate consistency of traditional database transactions, requiring careful consideration of how data propagation delays might affect user experience.
- Infrastructure overhead increases substantially with the need to maintain Kafka clusters, Zookeeper ensembles (for older Kafka versions), and EventStore instances, along with their associated monitoring and backup systems. Event schema evolution presents ongoing challenges, as changes to event structures must maintain backward compatibility whilst enabling system evolution.

Most critically for this project, the implementation timeline would be significantly extended due to the team's unfamiliarity with event-driven patterns and Kafka's operational requirements. The complexity of achieving reliable event ordering, handling duplicate message processing, and implementing proper dead letter queue strategies would substantially delay the delivery of core functionality. Whilst this architecture offers superior long-term scalability and observability, the immediate practical constraints of team expertise and project timeline make it unsuitable for initial implementation, though it remains an excellent target for future architectural evolution once the team develops the necessary distributed systems expertise.


## Architecture
During the designing phase, we identified that a monolith architecture would not suffice for this software to achieve its ASRs. Thus, it was intially into a Front-End that handles UI interaction and Back-End which manages business logic, api requests and databases. Workers would also be used for asynchronous tasks in the backe end. [Seperation-Front-End-BackEnd-Worker-Logic](../model/adrs/0001-independent-services.md).

After further developing, the team identified that this software relied on core services in order to achieve the quality attributes of the proposal found [here](../model/proposal.md). These included: Authenthication, Front-End, Gateway Problems, Submission, Code Execution (test runner). Thus, it was decided that a microservice architecture and utilises message queues for asynchronous communication between specific services would be optimal for this software. It was believed that doing this enhanced scalability, maintainability, and team productivity, where each team member can focus on building their own service in parallel. [Microservices-Architecture](../model/adrs/0002-microservices-architecture.md).




## Trade-Offs
TODO: Describe and justify the trade-offs made in designing the architecture.
ASSIGNED TO:

## Critique + Evaluation
TODO: Describe how well the architecture supports delivering the complete system + Summarise testing results and justify how well the software achieves its quality attributes.
ASSIGNED TO:

## Reflection
TODO: Lessons learnt and what you would do differently.
ASSIGNED TO: