# OpenJudge

## Links

[openjudge.software](https://www.openjudge.software)

**Youtube Demo**: [openjudge.Demo](https://www.youtube.com/watch?v=n1Z3grA97Mg)

## Getting Started

First, install Task. Second, use the following commands:
```bash
task deploy:                Deploy the project.
task destroy:               Destroy the project.
task down:                  Tear down local docker containers for the project.
task import:                Import the project.
task run:                   Run the project in development mode.
task down:auth:             Tear down local docker containers for authentication service
task down:execution:        Tear down local docker containers for execution service
task down:frontend:         Tear down local docker containers for frontend service
task down:problems:         Run the problems service in development mode.
task down:submission:       Tears down submission service containers
task down:subscriber:       Tears down subscriber service containers
task run:auth:              Run the authentication service in development mode.
task run:execution:         Run the execution service in development mode.
task run:frontend:          Run the frontend service in development mode.
task run:gateway:           Run the API Gateway in development mode.
task run:problems:          Run the problems service in development mode.
task run:submission:        Run the submission service in development mode.
task run:subscriber:        Run the subscriber service in development mode.
task test:gateway:          Run the API Gateway in development mode, and then runs unit tests against this service.
```

## Summary
This project utilises a microservice architecture and was deployed on AWS. More information on this project about tradeoff, testing, design etc can be found [here](./report/report.md). 
To run this service in its intended environment, copy the [.envfile](./.env.example) into a .env file and fill in the necessary information/keys required (**# put ....**).  
For CI/CD pipeline, **TaskFile**, was used to simplify running commands to start services. Code has been written for Github actions (for pushes to main to ensure continous functionality), but it has been turned off for this as it was disabled during the development of our project. **Terraform** was also used to manage our infrastructure when deploying to AWS. 
