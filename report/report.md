# OpenJudge (Practical 5)

### Team Members
Tze Kheng Goh
Nitish Madhavan
Yash Mittal
Benjamin Schenk
Mittun Sudhahar
Aryaman Tiwari 

### Abstract
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

## Changes
TODO: Describe and justify any changes made to the project from what was outlined in the proposal.
ASSIGNED TO:

## Architecture Options
TODO: What architectural design patterns were considered and their pros and cons.
ASSIGNED TO:

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