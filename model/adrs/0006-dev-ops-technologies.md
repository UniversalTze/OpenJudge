# 6. Dev Ops Technologies
**Date:** 2025-05-11 \
**Status:** Proposed \
**Summary** \
*In the context of* delivering a project with a deployable architecture,
*facing* a complex architecture and limited CI/CD pipeline options, *we decided* to 
use Task, Docker, Terraform and Gitlab CI as our dev ops technologies, *to achieve* an efficient 
and simple development process, adopting common industry practice and infrastructure as code where
possible, *accepting* the complexity of setting up the tools initially. \
**Context** 
- For developer velocity, we need to have a speedy and iterable dev pipeline.
- We need to be able to deploy our project to AWS.
- We need to be able to manage our infrastructure as code.
- We need to be able to run our project locally in containers for testing and development.
- We need to be able to test and deploy our project using CI/CD.

**Decision** \
We decided to implement docker to build each service in a container. We decided to implement 
terraform to manage our infrastructure as code. We decided to implement gitlab ci for our 
ci/cd pipeline, as it can work with multiple services and is free. We decided to implement task
to manage our local development workflow. This means we can setup scripts to run commands such as
build, test, lint etc.
**Consequences** \
We'll have to learn how to use these tools, and setup the initial configuration. 