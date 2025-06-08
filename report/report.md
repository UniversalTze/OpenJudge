# OpenJudge (Practical 5)

### Team Members
Tze Kheng Goh
Nitish Madhavan
Yash Mittal
Benjamin Schenk
Mittun Sudhahar
Aryaman Tiwari 

## Abstract
OpenJudge is a learning-oriented code evaluation platform that prioritizes transparency over the 
traditionally opaque test suites found on most learning platforms like LeetCode. Designed as an 
alternative to those platforms, this system distinguishes itself by providing complete visibility 
of the test cases with detailed feedback mechanisms that enable users to understand their coding 
mistakes rather than receiving cryptic pass/fail notifications. 

The key Architecturally Significant Requirements (ASRs) for this project were: 
- Security (Quality Attribute) - OpenJudge's core feature of executing potentially unsafe or malicious user submitted code leads to significant security risks alongside those already commonly place in web development.
- Scalability (Quality Attribute) - Given our quality attribute, OpenJudge must be designed to handle many concurrent users attempting to browse problems, submit code and connect to the frontend.
- Extensibility (Quality Attribute) - OpenJudge's MVP should be designed to be extensible - both for the addition of new features/services, and to handle more languages that users can solve problems in.
- Deployability (Quality Attribute) - Our quality attribute ensures we need to have a deployable architecture, in particular an automated and simple deployment process.
- Transparent Learning Focused Platform: The initial scope of the project involved having a problem solving platform focused on education and helping the user to solve problems rather than hiding the solution or focusing on competition between users.

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
TODO: Describe and justify any changes made to the project from what was outlined in the proposal.
ASSIGNED TO:

## Architecture Options
TODO: What architectural design patterns were considered and their pros and cons.

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





## Architecture
TODO: Describe the software architecture in detail.
ASSIGNED TO:

## Trade-Offs
TODO: Describe and justify the trade-offs made in designing the architecture.
ASSIGNED TO:

## Critique + Evaluation
TODO: Describe how well the architecture supports delivering the complete system + Summarise testing results and justify how well the software achieves its quality attributes.
ASSIGNED TO:

## Reflection
TODO: Lessons learnt and what you would do differently.
ASSIGNED TO: