workspace {

  model {
    user = person "User" {
      description "A user of the system"
    }

    openJudge = softwareSystem "OpenJudge Deployment Diagram" "A transparent, learning-focused code evaluation platform" {
      frontendUI = container "Frontend UI" "Web app for code editing and feedback" "Vite.js"
      apiGateway = container "API Gateway" "FastAPI; routes requests & enforces security" "FastAPI"
      authService = container "Auth Service" "Go Fiber; login, JWTs" "Go/Fiber"
      problemService = container "Problem Service" "FastAPI; manages problems & test cases" "Python/FastAPI"
      submissionService = container "Submission Service" "FastAPI; cleans code, stores submissions, generates feedback" "Python/FastAPI"
      Psubmissionqueue = container "Python Submission Queue" "Python code submissions are placed on this queue for execution service to pick up" "Python/Celery"
      Jsubmissionqueue = container "Java Submission Queue" "Java code submissions are placed on this queue for execution service to pick up" "Python/Celery"
      outputqueue = container "Result Queue" "Results are sent back to Submission service" "Python/Celery"
      PexecutionService = container "Python Execution Service" "Orchestrates Python code execution and runs code in sandbox" "Python"
      JexecutionService = container "Java Execution Service" "Orchestrates Java code execution and runs code in sandbox" "Python"
      redisCache = container "Redis Cache" "Token revocation list and session management" "PostgreSQL"
      submissionDatabase = container "Submission Database" "PSQL; stores submissions and results" "PostgreSQL"
      problemDatabase = container "Problem Database" "PSQL; stores problems and test cases" "PostgreSQL"
      authDatabase = container "Auth Database" "Stores user credentials and authentication data" "PostgreSQL" 
      Computer = container "User" {
        description "User browse and attempts problems on platform"
        technology "React"
        tags application
      }
    }
    Computer -> frontendUI "User iteraction where they can write, submit code and view feedback"
    
    # Frontend to API Gateway
    frontendUI -> apiGateway "Sends HTTPS API calls"
    
    # API Gateway routing
    apiGateway -> authService "Validates user login and credentials"
    apiGateway -> problemService "Generate problem list or problem for user"
    apiGateway -> submissionService "Send code submissions"
    apiGateway -> redisCache "Checks token revocation list"
    
    # Service to database connections
    authService -> authDatabase "Stores/retrieves user data"
    submissionService -> submissionDatabase "Stores all user submissions to DB with result"
    problemService -> problemDatabase "Stores/retrieves problems & test cases"
    
    # Inter-service communications
    submissionService -> problemService "Internal API call for problem details"
    submissionService -> Psubmissionqueue "Python submission sent to message queue"
    Psubmissionqueue -> PexecutionService "Worker picks up tasks for python execution service"
    submissionService -> Jsubmissionqueue "Java submission sent to message queue"
    PexecutionService -> outputqueue "Output of Python run test cases sent back to result queue"
    Jsubmissionqueue -> JexecutionService "Worker picks up tasks for Java execution service"
    JexecutionService -> outputqueue "Output of Java run test cases sent back to result queue"
    outputqueue -> submissionService "Worker grabs this result and updates Submission db with result"


    deploymentEnvironment "Production" {
        deploymentNode "AWS Services" {
            deploymentNode "API Gateway" {
                containerInstance apiGateway
                technology "AWS ECS Fargate"
            }
            deploymentNode "frontend-UI" {
                containerInstance frontendUI
                technology "AWS ECS Fargate"
            }
            deploymentNode "Auth Service" {
                containerInstance authService
                technology "AWS ECS Fargate"
            }
            deploymentNode "Submission Service" {
                containerInstance submissionService
                technology "AWS ECS Fargate"
            }
            deploymentNode "Problem Service" {
                containerInstance problemService
                technology "AWS ECS Fargate"
            }
            deploymentNode "Redis Cache" {
                containerInstance redisCache
                technology "AWS Elasticache"
            }
            deploymentNode "Submission Database" {
                containerInstance submissionDatabase
                technology "AWS RDS"
            }
            deploymentNode "Authentication Database" {
                containerInstance authdatabase
                technology "AWS RDS"
            }
            deploymentNode "Problem Database" {
                containerInstance problemDatabase
                technology "AWS RDS"
            }
            deploymentNode "Submission Queue 1" {
                containerInstance Psubmissionqueue
                technology "AWS SQS Queue"
            }
            deploymentNode "Submission Queue 2" {
                containerInstance Jsubmissionqueue
                technology "AWS SQS Queue"
            }
            deploymentNode "Output Queue" {
                containerInstance outputqueue
                technology "AWS SQS Queue"
            }
            deploymentNode "Execution Service 1" {
                containerInstance PexecutionService
                technology "AWS ECS Fargate"
            }
            deploymentNode "Execution Service 2" {
                containerInstance JexecutionService
                technology "AWS ECS Fargate"
            }
            
            
      }
      
      deploymentNode "User's Browser" {
        containerInstance Computer
        technology "Google, Safari"
      }
    }
}

    

  views {
    deployment openJudge "Production" {
      include *
    }

    styles {
    
    element "browser" {
        background #C3E5E8
    }
    element "lambda" {
        background #FFB24B
    }
    element "Container" {
        shape roundedbox
    }

    element "Person" {
        shape person
    }

    element "InfrastructureNode" {
        shape hexagon
    }
    element "Database" {
        shape cylinder
        background #ce93d8
    }
    element "DatabaseNode" {
    shape box
    }
    }
  }
}