Cloned from project-proposal-2025 repo.

# OpenJudge: A Learning-Oriented Code Evaluation Platform

## Abstract
For most computer science students, platforms like LeetCode have become an essential part of learning to code. But have you ever wondered—how would you build a LeetCode clone yourself, and what goes on behind the scenes in the code? More importantly, What can we do to make it more rookie-friendly?

This project aims to build a learning-focused code evaluation platform that puts education first. Unlike traditional online judges that hide test cases and simply return “Wrong Answer,” our platform will open up all test cases—including edge cases and step-by-step test visibility to help users truly understand their mistakes.

Users can submit their code and get instant feedback. If the code fails, the platform will clearly show which test case failed, what the expected and actual outputs were,so that users can debug more effectively without struggling on vague error messages or hidden edge cases.

This project focuses on transparency and learning-oriented feedback, turning the process of solving coding problems into a meaningful learning experience—not just a race to pass hidden tests.


## Author
Name: Harold Hao

Student number: 49552405

## Functionality
The complete system is a learning-oriented online judge platform designed to help students understand, debug, and grow through algorithmic problem-solving.

Users can submit their code and receive detailed evaluation results. Unlike traditional online judge platforms that only show limited pass/fail messages, our platform makes all test cases visible, so that users can learn from their mistakes and build a deeper understanding of the problem without struggling on vague error messages or hidden edge cases.

### Features
- User Authentication
  - Users can register and log in using their email and password.
  - Stateless session management with JWT stored in secure cookies.
  - Passwords are stored securely using salted hashing.

- Open Test Case Evaluation
  - All test cases are visible to users after submission.
  - The open test cases will include both the input and the expected output.

- Submission history
  - Users can view a list of their past submissions for each problem.
  - Each submission record includes the timestamp, code snapshot, and test case results.

- Problem Browsing
  - Users can browse a list of available problems categorized by topic and difficulty.
  - Each problem page includes the description, input/output format.

- Real-time Feedback and Secure Code Execution
  - The platform runs evaluation soon after a user submits code.
  - The feedback will contain the input and expected output for each test case that did not pass.
  - The system is designed to handle multiple submissions concurrently, ensuring consistent feedback even under high load.
  - Each submission is executed in an isolated Docker container to ensure safety, prevent interference, and allow for consistent results.


## Scope
The MVP will focus on delivering the minimum working flow:

- User Authentication
  - Implement basic email/password authentication using JWT and secure cookies,with passwords securely stored using salted hashing.

- Open Test Case Evaluation
  - Provide a static set of 5–10 Python-only problems with visible test cases.
  - Each problem will include visible test cases (input and expected output) accessible after submission.

- Submission history
  - Store past submissions per user for review. Each submission record includes the timestamp, code snapshot, and test case results.

- Problem Browsing
  - Users can browse and view problems in a simple list, organized by difficulty.
  - Each problem page will show the full description, input/output format. 

- Real-time Feedback and Secure Code Execution
  - Build a user-friendly UI for submitting code and receiving feedback
  - Code will be executed in isolated Docker containers to ensure security, consistency, and fault isolation.
  - The containerized execution environment will be hosted on AWS, leveraging services such as EC2 or Fargate.
  - Basic load balancing will be implemented using AWS. 

## Quality Attributes

### Security
Security refers to the ability of the system to maintain normal operation and protect sensitive data when faced with malicious input or misuse. As the platform allows user registration and code submission, key risks include unauthorized access, code injection, and denial-of-service through resource abuse.

User credentials will be stored using strong password hashing algorithms such as bcrypt or Argon2, ensuring that no plain-text passwords are retained. Access control will be enforced to restrict users from accessing others’ private data or submissions. All code will be executed within sandboxed environments to isolate untrusted code and prevent it from affecting the system or other users.

### Scalability

Scalability refers to the system’s ability to handle varying user loads without performance degradation. The platform will be deployed on AWS using EC2 instances behind an Application Load Balancer to evenly distribute incoming traffic. Compute-intensive tasks such as code execution will run in separate worker instances that can be scaled horizontally based on demand. This architecture allows different components to scale independently, ensuring consistent performance under high concurrency. 

### Deployability 

Deployability refers to how easily the software and its required infrastructure can be provisioned, updated, and released. The system will be deployed on AWS using EC2 instances, with infrastructure managed through code to enable reproducibility. A continuous deployment pipeline will be used to automate building, testing, and releasing new versions of the application. This ensures that updates can be delivered consistently and with minimal manual effort. The use of containerization further simplifies deployment by allowing the application to be packaged and launched in a predictable environment.


## Evaluation

### Security
The security of the system will be evaluated through targeted manual checks.
First, we will create several test users and manually inspect the database to ensure that their passwords are properly encrypted using salted hashes, rather than stored in plain text.

Second, we will manually review (with the help of LLMs) the Docker configuration to ensure that it is securely set up and that the containerized code cannot affect the host system. This includes checking for insecure volume mounts or the use of privileged containers.

### Scalability
Scalability will be evaluated using load testing tools such as Apache JMeter by simulating multiple concurrent users performing common actions such as visiting problem pages or submitting code. The tests will help assess how the system behaves under increased traffic, measuring key performance metrics such as response time, error rate, and throughput. This approach ensures that the platform can scale to meet user demand and remain responsive during peak usage periods.

### Deployability
Deployability will be evaluated by following a documented manual deployment process on a clean EC2 instance. The process should complete successfully with minimal manual steps, demonstrating that the system can be deployed reliably in a consistent environment.