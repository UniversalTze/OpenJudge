# Demonstration Video

## Link 

[Insert]

## Script

### Introduction

Hello, I'm [Insert], showcasing OpenJudge, a learning-oriented code evaluation platform that our 
team has developed as an alternative to traditional online educational platforms like LeetCode.

OpenJudge addresses a fundamental problem in how students learn to solve coding problems. 
Traditional platforms hide test cases and provide minimal feedback, leaving students frustrated 
when they receive cryptic "Wrong Answer" messages without understanding what went wrong. OpenJudge 
flips this approach by prioritizing transparency, making all test cases visible and providing 
detailed feedback to help users truly understand their mistakes and improve as programmers.

The key Architecturally Significant Requirements (ASRs) for this project were: Security, Scalability
and Deployability. These were a key focus for our implementation. In our MVP, we ensured it was as 
secure as possible, could be deployed at ease through a CI/CD pipeline, and was built to perform
well and scale with ease. We deployed our application using AWS services designed to scale as needed.
Lastly, our decision to go with a microservices architecture resulted in a highly extensible product
that can be adapted to suit the demands of our audience or key stakeholders.

The developed MVP successfully delivers all core functional requirements from the original proposal. 
Users can register and authenticate securely using email and password credentials, with JWT-based 
session management ensuring stateless security. The system provides open test case evaluation 
across a problem bank of twenty problems, that are language agnostic. We designed the platform to 
accommodate both Python and Java code submissions, to demonstrate the diversity of the system. The 
problems range from basic algorithms to more complex data structure challenges. Each problem 
displays complete test cases with visible inputs and expected outputs after submission. Users can 
browse problems organized by difficulty levels, submit their code through an intuitive interface, 
and access submission history that tracks their progress over time. Lastly, our platform runs the 
user's code in a secure and sandboxed environment, providing intuitive feedback quickly. 

The delivered system closely aligns with the original MVP proposal. with one key change. While the 
original proposal mentioned real-time feedback, our team decided not to go ahead with this. Not 
only would it increase operational difficulty and architectural complexity (as it would need to 
involve a web-socket), it would also result in a less secure program (failing one of our key 
ASRs). If the web-socket is connected straight to the code execution service, the environment would
no longer be properly sandboxed, and it would bypass the API Gateway we created that enforces our 
content, security and access control policies. Other than that, the scope remained as is for the MVP.

### Functional Requirements

