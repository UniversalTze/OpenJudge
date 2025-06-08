workspace {
  model {
    user = person "User" "Submits code and views feedback"
    llmService = softwareSystem "LLM Service" "External AI service for code feedback generation" "External"
    
    openJudge = softwareSystem "OpenJudge" "A transparent, learning-focused code evaluation platform" {
      frontendUI = container "Frontend UI" "Web app for code editing and feedback" "Vite.js"
      apiGateway = container "API Gateway" "FastAPI; routes requests & enforces security" "FastAPI"
      authService = container "Auth Service" "Go Fiber; login, JWTs, token management" "Go/Fiber"
      problemService = container "Problem Service" "FastAPI; manages problems & test cases" "Python/FastAPI"
      submissionService = container "Submission Service" "FastAPI; code validation, queue management, result processing" "Python/FastAPI"
      pythonExecutionService = container "Python Execution Service" "Isolated Python code execution with NSJail sandboxing" "Python"
      javaExecutionService = container "Java Execution Service" "Isolated Java code execution with NSJail sandboxing" "Java"
    }
    
    # User flow - Define relationships in model section
    user -> frontendUI "Uses web interface" "HTTPS"
    
    # Frontend to API Gateway
    frontendUI -> apiGateway "Makes API calls" "HTTPS/REST"
    
    # API Gateway routing
    apiGateway -> authService "Authentication requests" "HTTP"
    apiGateway -> problemService "Problem operations" "HTTP"
    apiGateway -> submissionService "Submission operations" "HTTP"
    
    # Auth service connections
    authService -> authService "User data operations" "SQL"
    authService -> authService "Session management" "Redis"
    apiGateway -> authService "Token validation" "Redis"
    
    # Problem service connections
    problemService -> problemService "Problem data operations" "SQL"
    
    # Submission service connections
    submissionService -> submissionService "Submission data operations" "SQL"
    submissionService -> problemService "Internal API calls for problem details" "HTTP"
    submissionService -> llmService "AI feedback generation" "HTTPS/API"
    
    # Message queue flow
    submissionService -> pythonExecutionService "Python code submissions" "Message Queue"
    submissionService -> javaExecutionService "Java code submissions" "Message Queue"
    
    # Execution results back to submission service
    pythonExecutionService -> submissionService "Python execution results" "Message Queue"
    javaExecutionService -> submissionService "Java execution results" "Message Queue"
    
    productionEnvironment = deploymentEnvironment "Production" {
      # Frontend Server
      frontendServer = deploymentNode "Frontend Server" "Web application hosting" "Nginx + Docker" {
        frontendContainer = containerInstance frontendUI
      }
      
      # API Gateway Server
      gatewayServer = deploymentNode "API Gateway Server" "Request routing and authentication" "Docker" {
        apiGatewayContainer = containerInstance apiGateway
      }
      
      # Auth Service Server
      authServer = deploymentNode "Auth Service Server" "Authentication microservice" "Docker" {
        authContainer = containerInstance authService
      }
      
      # Problem Service Server
      problemServer = deploymentNode "Problem Service Server" "Problem management microservice" "Docker" {
        problemContainer = containerInstance problemService
      }
      
      # Submission Service Server
      submissionServer = deploymentNode "Submission Service Server" "Submission processing microservice" "Docker" {
        submissionContainer = containerInstance submissionService
      }
      
      # Message Queue Server
      queueServer = deploymentNode "Message Queue Server" "Asynchronous task processing" "RabbitMQ + Docker" {
        pythonQueue = infrastructureNode "Python Queue" "Python execution tasks" "RabbitMQ"
        javaQueue = infrastructureNode "Java Queue" "Java execution tasks" "RabbitMQ"
        outputQueue = infrastructureNode "Output Queue" "Execution results" "RabbitMQ"
      }
      
      # Execution Cluster - Isolated Environment
      executionCluster = deploymentNode "Execution Cluster" "Sandboxed code execution environment" "Docker + NSJail" {
        pythonRuntimeNode = deploymentNode "Python Runtime Node" "Python execution environment" "Docker + NSJail" {
          pythonExecutionContainer = containerInstance pythonExecutionService
        }
        javaRuntimeNode = deploymentNode "Java Runtime Node" "Java execution environment" "Docker + NSJail" {
          javaExecutionContainer = containerInstance javaExecutionService
        }
      }
      
      # Database Cluster
      databaseCluster = deploymentNode "Database Cluster" "Persistent data storage" "PostgreSQL" {
        authDatabase = infrastructureNode "Auth Database" "User authentication data" "PostgreSQL"
        problemDatabase = infrastructureNode "Problem Database" "Problems and test cases" "PostgreSQL"
        submissionDatabase = infrastructureNode "Submission Database" "Code submissions and results" "PostgreSQL"
      }
      
      # Redis Cache Server
      cacheServer = deploymentNode "Redis Cache Server" "Session and token management" "Redis + Docker" {
        redisCache = infrastructureNode "Redis Cache" "Token revocation and sessions" "Redis"
      }
    }
  }
  
  views {
    deployment openJudge productionEnvironment {
      include *
      autolayout bt
      title "OpenJudge Production Deployment"
      description "Microservices deployment with message queue architecture and isolated execution environments"
    }
    
    theme default
  }
}
