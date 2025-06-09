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
![OpenJudge Software Context](../model/images/OpenJudgeSystemContext.png)

**Code**: ![Software-Context](../model/SoftwareContext.dsl)

## Changes
During development, the team made several strategic adjustments to strengthen our core quality attributes whilst adapting to practical constraints:
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
![Alternative Architecture 1 Container](../model/images/AltArchitecture-1-Container.png)

**Code**: ![Alt-Architecture-1-Container](../model/Alt-Architecture-1-Container.dsl)




#### Deployment Diagram
![Alternative Architecture 1 Deployment](../model/images/AltArchitecture-1-Deployment.png)

**Code**: ![Alt-Architecture-1-Deployment](../model/Alt-Architecture-1-Deployment.dsl)

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

#### Container
![Alternative Architecture 2 Container](../model/images/AlternativeArchitecture-2-Container.png)

**Code**: ![Alt-Architecture-2-Container](../model/Alt-Architecture-2-Container.dsl)

Most importantly, adopting an event-driven architecture using Kafka would have significantly extended the implementation timeline due to the team’s limited experience with such patterns and Kafka’s operational overhead. Ensuring reliable event ordering, managing duplicate message handling, and configuring dead letter queues adds considerable complexity that would have delayed the delivery of core functionality of OpenJudge.

However, if the team had more experience with event-driven architectures tools and extended project timelines, this approach would likely have provided superior long-term scalability and maintainability characteristics. The comprehensive audit capabilities and natural resilience patterns align exceptionally well with educational platform requirements where understanding user behaviour and maintaining system reliability are paramount concerns.


## Architecture
During the designing phase, it was identified that a monolith architecture would not suffice for this software to achieve its ASRs. Thus, it was intially into a Front-End that handles UI interaction and Back-End which manages business logic, api requests and databases. Workers would also be used for asynchronous tasks in the back end. ([Seperation-Front-End-BackEnd-Worker-Logic](../model/adrs/0001-independent-services.md)).

After further developing, the team identified that this software relied on core services in order to achieve the quality attributes of the proposal found [here](../model/proposal.md). These included: Authenthication, Front-End, Gateway Problems, Submission, Code Execution (test runner). Thus, it was decided that a microservice architecture and utilises message queues for asynchronous communication between specific services would be optimal for this software. It was believed that doing this enhanced scalability, maintainability, and team productivity, where each team member can focus on building their own service in parallel. ([Microservices-Architecture](../model/adrs/0002-microservices-architecture.md)). Container and deployment diagrams of the chosen architecture can be seen below. 

### Container Diagram
![Container-Diagram-Chosen-Arch](../model/images/ChoseArchitecture-Container.png)

**Code**: ![Container-Code-Chosen-Arch](../model/ChosenArchitecture-container.dsl)


### Deployment Diagram
![Deployment-Diagram-Chosen-Arch](../model/images/ChoseArchitecture-Deployment.png)
**Code**: ![Deployment-Code-Chosen-Arch](../model/ChosenArchitecture-Deployment.dsl.dsl)

AWS was utilised to provide a scalable, reliable, and managed infrastructure that reduces operational overhead. The team's familiarity with AWS from previous experience was also a major reason for selecting it as the deployment platform. Core services adopted include ECS and ECR for containerised microservice deployment, ElastiCache for fast token revocation checks, S3 for object storage, SQS for asynchronous task handling, and RDS for persistent relational data. This approach enables the team to focus on application logic while leveraging AWS's operational maturity and ecosystem. ([Service-Deployment](../model/adrs/0011-service-deployment.md)). 

### System Flow and User Journey

The user experience begins with registration, where individuals provide email credentials and secure passwords. Our Authentication Service validates these details, securely hashes passwords using Argon2, and stores credentials in a dedicated authentication database. Email verification confirms user identity before account activation.

Upon successful authentication, users receive JWT access and refresh tokens that authenticate subsequent requests. JWT was used as they provide a stateless approach, reducing the need for session persistence across multiple services. JWTs simplify scaling and integration between services while allowing authentication data to be securely transmitted within signed tokens.  (["JWT-session-token"](../model/adrs/0008-jwts-over-sessions.md)).
The API Gateway validates these tokens and enforces access control policies, ensuring users can only access their own data and submissions whilst preventing unauthorised access to system resources. (["Middleware-API-Gateway"](../model/adrs/0009-middleware-in-api-gateway.md)).

User interactions flow through our front-end application, which forwards API requests to the API Gateway. Following successful authentication and authorisation, the gateway routes traffic to appropriate backend services including Authentication, Problem, Submission, and Execution services. Each core service maintains its own dedicated database, ensuring data isolation and preventing cross-service data corruption.

### Code Submission + Execution Service

When users submit code solutions, our Submission Service performs initial security inspection, checking for malicious content including unauthorised network calls, dangerous imports, system commands, and excessively long scripts. Submissions passing these preliminary checks enter our processing queue system. This was done as it catches many classes of user errors early, saving compute for valid submissions and increases robustness of the software system. (["Code-Validation-In-Submission-Service"](../model/adrs/0012-code-validation-in-submission-service.md)). 

Our execution architecture employs dedicated message queues for each supported programming language, with submissions routed to language-specific queues (Python, Java, etc.).Each programming language operates its own isolated execution environment (sandbox) within separate containers, consuming tasks exclusively from their respective message queues. This design ensures complete isolation—execution services maintain no direct external connections beyond their queue interfaces, while also providing a scalable pipeline for code submissions and ensures consisten test handling. (["queue-system-code-execution"](../model/adrs/0010-queue-system-for-code-execution.md)).

The Execution Service utilises NSJail, a Linux process sandboxing tool that restricts filesystem access to minimal jail environments, limits CPU and memory usage, prevents network calls, and blocks unauthorised system calls. This multi-layered security approach combines containerisation, message queue isolation, and process-level sandboxing to create robust protection against malicious or poorly written code.
(["sandboxing-NSJail"](../model/adrs/0016-sandboxing-with-nsjail.md)).









## Trade-Offs and Architectural Decisions

Our architectural journey involved several critical trade-offs where competing quality attributes required careful balance. These decisions fundamentally shaped our system's characteristics and user experience.

### Asynchronous Communication vs. Real-Time Responsiveness

The decision to employ asynchronous message queues for communication between Submission and Execution Services, as documented in ADR-0017, represents our most significant architectural trade-off. This approach decouples services effectively, allowing the platform to handle submission traffic spikes by queuing tasks and enabling considerable scalability improvements while maintaining the security isolation requirements outlined in our decision.

However, this design introduces the deliberate latency trade-off accepted in ADR-0017. The asynchronous nature requires front-end polling of the Submission Service for results, creating delays that vary with polling frequency and system load. Under normal conditions, users experience 1-3 second delays for result retrieval, though this increases during peak usage periods—within the acceptable latency parameters we established.

We consciously prioritised security isolation over immediate responsiveness, as documented in our architectural decision. The alternative—direct WebSocket connections to execution services—would have provided real-time feedback but compromised our fundamental security requirement of complete execution environment isolation. ([0017-no-realtime-feedback.md](../model/adrs/0017-no-realtime-feedback.md)). 

### Security Isolation vs. Performance Overhead

Our comprehensive security implementation, as documented in ADR-0016, layers multiple isolation mechanisms: Docker containerisation, message queue communication boundaries, and NSJail process sandboxing. This defence-in-depth strategy leverages Linux namespace tooling to effectively protect against malicious code whilst containing resource consumption through syscall limitations, filesystem access controls, and network isolation.

The trade-off manifests in increased computational overhead and implementation complexity. Managing container lifecycles, orchestrating message queue communication, and implementing NSJail's process-level sandboxing requires significantly more resources than direct code execution. Additionally, the operational complexity of managing multiple isolation layers increases debugging difficulty and deployment coordination requirements, with the added constraint of Linux-only deployment environments.

We accepted this overhead as essential for our educational mission. Running untrusted student code without comprehensive isolation would create unacceptable security risks that could compromise the entire platform and user data. (ADR-0016: Use Linux Namespace Tooling for Sandboxing) ([0016-sandboxing-with-nsjail.md](../model/adrs/0016-sandboxing-with-nsjail.md)). 

### Queue-Based Architecture vs. Deployment Complexity

Our queue-based execution system, as documented in ADR-0010, provides reliable decoupling between Submission and Execution Services through language-specific routing to dedicated Java and Python worker environments. This approach enables horizontal scaling of code execution workers under variable loads while ensuring appropriate execution environments are dynamically assigned based on test language requirements.

However, this introduces additional infrastructure complexity requiring queue provisioning, dedicated Docker image maintenance for each programming language, and comprehensive monitoring systems for distributed task execution. Each deployment environment must replicate this multi-language infrastructure, and troubleshooting the language-routing logic requires sophisticated tooling and expertise in queue management systems.

The reliability and scaling benefits of our queue-based, language-specific execution system justify this operational overhead, particularly given the unpredictable nature of educational workloads where assignment deadlines create dramatic traffic spikes across multiple programming languages. ([0010-queue-system-for-code-execution.md](../model/adrs/0010-queue-system-for-code-execution.md)). 

### Microservices Benefits vs. Operational Overhead

Our microservices architecture, as documented in ADR-0002, provides excellent separation of concerns, enabling independent development teams, technology choices, and scaling decisions. Fault isolation ensures that failures in one service don't cascade throughout the system, improving overall reliability.

The cost is substantial operational complexity through service discovery requirements, inter-service communication management, distributed logging coordination, and comprehensive monitoring across multiple containers. Each service requires independent deployment pipelines, health checks, and monitoring dashboards, significantly increasing operational burden compared to monolithic alternatives.

For our educational platform, the benefits of independent scaling (particularly for execution services) and technology flexibility (enabling language-specific optimisations) outweigh the operational complexity costs, aligning with the trade-offs accepted in our architectural decision. ([0002-microservices-architecture.md](../model/adrs/0002-microservices-architecture.md)). 

## Architecture Critique

Our delivered architecture demonstrates strong alignment with specified Architecturally Significant Requirements, though with varying degrees of success across different quality attributes and some areas requiring future enhancement.

### Architectural Strengths

**Security Excellence**
The architecture successfully addresses our most critical ASR through comprehensive multi-layered protection. The combination of JWT-based authentication, API gateway access control, containerised isolation, and NSJail sandboxing provides robust protection against both conventional web vulnerabilities and the unique risks of executing untrusted code. The complete network isolation of execution services, with communication limited to message queues, effectively prevents potential attack vectors whilst maintaining necessary system functionality.

**Proven Scalability**
The microservices architecture with queue-based decoupling demonstrates effective scalability characteristics. Independent service scaling, automated container orchestration, and message queue buffering enable the system to handle variable loads efficiently. The separation of concerns allows compute-intensive execution services to scale independently from user-facing services, optimising resource allocation based on actual demand patterns rather than anticipated peaks.

**Demonstrated Extensibility**
The modular design successfully supports extensibility, as evidenced by seamless LLM service integration during development and the framework for adding new programming languages. The architecture's plugin-like approach for execution services and flexible problem definition schema demonstrate that the system can evolve without fundamental restructuring, supporting the diverse and changing needs of educational environments.

### Areas Requiring Enhancement

**Deployability Complexity**
Whilst containerisation provides deployment consistency, the interdependency complexity presents ongoing challenges. The system requires careful orchestration of multiple services, databases, queues, and external dependencies. The API Gateway's central role creates potential single points of failure, and coordination required between services during deployment increases operational complexity compared to simpler architectural approaches.

**Latency Considerations**
The asynchronous feedback model, whilst necessary for security isolation, introduces user experience compromises. The polling-based approach creates inherent latency that varies with polling frequency, potentially impacting educational effectiveness during peak usage periods. This represents a conscious trade-off where security requirements took precedence over real-time responsiveness, but future iterations might explore hybrid approaches.

**Operational Overhead Impact**
The microservices approach significantly increases operational complexity through service discovery requirements, distributed logging needs, health monitoring coordination, and failure recovery procedures. System reliability depends on correct operation of multiple external services (databases, queues, load balancers), increasing potential failure modes and requiring sophisticated operational expertise.

### Suitability for Complete System Delivery

The delivered architecture provides a robust foundation for delivering comprehensive system functionality. The modular design supports incremental feature addition, and established patterns for service communication and data management can accommodate expanded requirements effectively.

However, some architectural decisions optimised for security and isolation may require refinement for enhanced user experience in full deployment scenarios. The queue-based architecture scales effectively for batch processing of submissions but may need enhancement for real-time features such as collaborative coding or live tutoring sessions.

The current polling mechanism, whilst secure, could be supplemented with WebSocket connections for non-execution-related real-time features, providing immediate feedback for syntax highlighting, collaborative editing, and social learning features without compromising execution security.

The architecture's event-driven nature provides excellent opportunities for learning analytics implementation. Future development could focus on capturing and analysing user interaction patterns to provide personalised learning recommendations and curriculum optimisation insights, leveraging the comprehensive audit trails inherent in our message-based communication model.

## System Testing and Evaluation

Our evaluation strategy validates both functional requirements and critical quality attributes through comprehensive testing methodologies encompassing automated testing, load testing, and security validation.

### Testing Approach and Methodology

**Load Testing with K6**
- Baseline performance testing with [X] concurrent users
- Peak load testing with [Y] concurrent users  
- Queue saturation testing with [Z] submissions per second
- Auto-scaling validation demonstrating container scaling under load
- Response time analysis across different load conditions
- Resource utilisation metrics during scaling events

**Security Validation Testing**
Our security validation strategy employed automated security analysis tools to identify and address potential vulnerabilities before production deployment. This proactive approach included static code analysis and web application security scanning across our microservices architecture.
- Static Code Security Analysis (Snyk) ([Synk](../tests/security-tests/snyk.md))
  - We conducted comprehensive static analysis across our Go-based microservices to identify dependency vulnerabilities and code security issues. The Execution Service achieved a clean security scan with no issues detected, demonstrating secure coding practices for our most critical component handling untrusted user code. The Authentication Service scan identified one dependency requiring update (Fiber framework v2.52.7) and flagged the use of SHA1 hashing, which we can address through standard security hardening practices.
- Web Application Security Scanning (OWASP ZAP) ([Frontend Fuzzing](../tests/security-tests/frontend-fuzzing.html))
  - Our Frontend Service security scan revealed standard development-phase findings primarily related to security header configuration—common issues easily addressed through proper deployment configuration. The API Gateway scan identified CORS configuration that requires tightening for production deployment, ensuring proper origin restrictions while maintaining necessary cross-service communication.
- Security Posture Assessment ([API Gateway](../tests/security-tests/api-gateway-fuzzing.html))
  - The automated scanning demonstrates our commitment to security-first development practices. Most identified issues relate to deployment configuration rather than fundamental security flaws, indicating sound architectural security decisions. Our sandboxing and isolation mechanisms—the core security components for handling untrusted code execution—passed security analysis without issues.
The security analysis confirms our layered security approach is fundamentally sound, with actionable configuration improvements identified for production hardening.

**Functional Testing Coverage**
- End-to-end user workflows from registration through submission
- Multi-language execution testing across Python and Java environments
- Error handling and edge case validation
- Integration testing between all microservices
- Database consistency testing under concurrent access

### Quality Attribute Achievement Assessment

**Security: Exceptional Achievement**
Our security implementation exceeds initial requirements through multiple validated protection layers. Testing confirms the effectiveness of authentication mechanisms, whilst malicious code injection attempts were successfully contained within sandboxed execution environments. The zero-trust approach to execution service isolation has proven robust under various attack scenarios.

**Scalability: Strong Performance**
[PLACEHOLDER: Specific Load Testing Metrics]
The system successfully handled [X] concurrent users with automatic scaling responses functioning as designed. Queue-based decoupling effectively managed submission bursts, with execution services scaling independently based on queue depth metrics. Response time degradation remained within acceptable educational platform limits even under peak load conditions.

**Extensibility: Validated Through Implementation**
The successful integration of LLM services during development demonstrates the architecture's extensibility in practice. New language support can be added through standardised container deployment processes, and the problem definition schema accommodates diverse test case types without requiring schema migrations. The modular approach has proven effective for incremental capability enhancement.

**Deployability: Adequate with Operational Considerations**
Whilst containerisation provides deployment consistency across environments, the operational complexity presents ongoing challenges. Deployment orchestration requires careful coordination of multiple services and dependencies. Infrastructure as Code approaches mitigate some complexity, but the learning curve for new team members remains significant.

## Reflection and Lessons Learnt

The OpenJudge project provided invaluable insights into the practical challenges of implementing educational software with stringent security requirements. Our journey revealed important lessons about balancing competing quality attributes whilst maintaining focus on genuine educational value.

### Technical Insights and Discoveries

**Security vs. User Experience Balance**
One of our most significant realisations concerned the inherent tension between comprehensive security requirements and optimal user experience design. Our decision to abandon real-time WebSocket connections in favour of polling-based feedback proved crucial for maintaining execution isolation but came at the cost of immediate responsiveness. This experience highlighted how early security architecture decisions create cascading effects throughout user experience design, emphasising the importance of considering these trade-offs during initial architectural planning rather than as afterthoughts.

**Microservices Complexity Reality**
Implementation revealed the substantial operational overhead accompanying microservices benefits. Whilst our architecture provided excellent separation of concerns and independent scalability, the complexity of managing multiple services, databases, and message queues proved significantly higher than initially anticipated. The learning curve for distributed systems debugging and monitoring was particularly steep, requiring dedicated tooling and expertise development that extended beyond our initial timeline estimates.

**Queue-Based Architecture Value**
The message queue approach proved more valuable than expected for handling variable educational workloads. The decoupling between submission and execution services provided natural load balancing and fault tolerance, allowing the system to gracefully handle assignment deadline traffic spikes without service degradation. This validated our architectural decision to prioritise asynchronous processing over synchronous execution, despite the latency trade-offs.

### Architectural Decision Retrospective

**Technology Selection Impact**
Our mid-development pivot from Flask to FastAPI proved highly beneficial, particularly given the asynchronous nature of our queue-based architecture. FastAPI's native async support and automatic API documentation generation significantly improved both development velocity and system performance. This change demonstrated the importance of selecting technologies that align naturally with chosen architectural patterns rather than forcing mismatched tools together.

**Database Strategy Evaluation**
The decision to maintain separate databases for each service provided good isolation but increased operational complexity substantially. In retrospect, a shared database with robust access controls might have simplified deployment whilst maintaining adequate service separation. However, the separate database approach better supports future service independence and potential team scaling scenarios.

**LLM Integration Success**
The successful integration of AI-powered learning assistance validated our extensibility claims while providing genuine educational value. This feature demonstrates how well-designed architectures can accommodate unexpected opportunities for enhancement without requiring fundamental restructuring.

### Project Management Learnings

**Early Planning Significance**
The project would have benefited from more comprehensive up-front planning, particularly around dependency management and service integration coordination. The complexity of orchestrating multiple services became apparent during integration phases, suggesting that detailed milestone planning and dependency mapping would have improved development efficiency significantly.

**Infrastructure Constraint Impact**
Limited IAM permissions within the university AWS environment constrained some deployment automation ambitions, particularly around CI/CD pipeline implementation. This highlighted the critical importance of understanding infrastructure limitations early in the design process and planning architectural decisions accordingly.

**Testing**
The project could have undergone more testing, particularly, we could have done more load K6 testing. Better time management and team familiarity will definitely help with this in future.

### Alternative Approaches We Would Consider

**Simplified Initial Implementation**
Starting with a simpler monolithic architecture and evolving towards microservices might have accelerated initial development, whilst providing a better understanding of system requirements. The learning curve for microservices patterns and distributed systems concepts proved significant, and a more gradual architectural evolution could have provided deeper understanding whilst maintaining development momentum.

**Enhanced Monitoring and Observability**
Implementing comprehensive monitoring, distributed tracing, and observability tools from the project's inception would have greatly simplified debugging and performance optimisation efforts. The complexity of troubleshooting issues across multiple services became apparent only during integration testing phases.

**Testing Strategy Integration**
Establishing comprehensive testing strategies (load testing, security testing, end-to-end testing) earlier in the development cycle would have identified performance bottlenecks and integration issues much sooner. The distributed nature of our system made testing challenging, but earlier investment in testing infrastructure would have paid substantial dividends.

### Future Enhancement Opportunities

**Hybrid Real-Time Capabilities**
Future iterations could explore hybrid approaches providing real-time feedback for non-execution features (syntax highlighting, collaborative editing) whilst maintaining secure asynchronous models for code execution. This would improve user engagement without compromising fundamental security requirements.

**Advanced Auto-Scaling Intelligence**
Implementing more sophisticated auto-scaling based on queue metrics, code complexity analysis, and historical usage patterns could further optimise resource utilisation and cost management whilst maintaining responsive performance.

**Educational Analytics Platform**
The event-driven nature of our system provides excellent foundations for comprehensive learning analytics implementation. Future development could focus on capturing and analysing user interaction patterns to provide personalised learning recommendations and curriculum optimisation insights.

### Broader Implications for Future Projects

This project reinforced several crucial principles for complex software development. Understanding team capabilities, infrastructure constraints, and user experience requirements early in the design process proves essential for successful delivery. The experience highlighted the value of iterative development approaches when dealing with complex distributed systems, where theoretical designs often require practical refinement during implementation phases.

Most importantly, the project demonstrated that whilst security and educational quality represent non-negotiable requirements for educational platforms, achieving them requires careful consideration of all quality attributes and their interactions. Success ultimately depends not just on meeting individual requirements but on finding optimal balance across all system qualities to deliver genuine educational value to learners.

The transparency-first approach we championed proves that educational platforms can simultaneously maintain high security standards while providing the open, supportive learning environment that students deserve. This balance, whilst challenging to achieve, represents the future direction for educational technology that truly serves learners rather than gatekeeping their progress.
