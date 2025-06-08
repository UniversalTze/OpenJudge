workspace {
  model {
    user = person "User" "Submits code and views feedback"
    llmService = softwareSystem "LLM Service" "External AI service for code feedback generation" "External"
  
    openJudge = softwareSystem "OpenJudge" "A transparent, learning-focused code evaluation platform" {
      frontendUI = container "Frontend UI" "Web app for code editing and feedback" "Vite.js"
      apiGateway = container "API Gateway" "FastAPI; routes requests & enforces security" "FastAPI"
      authService = container "Auth Service" "Go Fiber; login, JWTs" "Go/Fiber"
      problemService = container "Problem Service" "FastAPI; manages problems & test cases" "Python/FastAPI"
      submissionService = container "Submission Service" "FastAPI; cleans code, stores submissions, generates feedback" "Python/FastAPI"
      submissionqueue = container "Submission Queues" "Submissions are placed on this queue for execution service to pick up" "Python/Celery" 
      outputqueue = container "Result Queue" "Results are sent back to Submission service" "Python/Celery"
      executionService = container "Execution Service" "Python; orchestrates code execution and runs code in sandbox" "Python"
      redisCache = container "Redis Cache" "Token revocation list and session management" "PostgreSQL"
      submissionDatabase = container "Submission Database" "PSQL; stores submissions and results" "PostgreSQL"
      problemDatabase = container "Problem Database" "PSQL; stores problems and test cases" "PostgreSQL"
      authDatabase = container "Auth Database" "Stores user credentials and authentication data" "PostgreSQL" 
    }
    

    
    # User interactions
    user -> frontendUI "User iteraction where they can write, submit code and views feedback"
    
    # Frontend to API Gateway
    frontendUI -> apiGateway "HTTPS API calls"
    
    # API Gateway routing
    apiGateway -> authService "Validates user login and credentials"
    apiGateway -> problemService "Generate problem list or problem for user"
    apiGateway -> submissionService "Send user code submissions"
    apiGateway -> redisCache "Checks token revocation list"
    
    # Service to database connections
    authService -> authDatabase "Stores/retrieves user data"
    submissionService -> submissionDatabase "Stores all user submissions to DB with result"
    problemService -> problemDatabase "Stores/retrieves problems & test cases"
    
    # Inter-service communications
    submissionService -> problemService "Internal API call for problem details"
    submissionService -> submissionqueue "Submission sent to message queue"
    submissionqueue -> executionService "Worker picks up tasks for execution service"
    submissionService -> llmService "API call for feedback generation"
    executionService -> outputqueue "Output of test cases sent back to result queue"
    outputqueue -> submissionService "Worker grabs this result and updates Submission db with result"
    
    
  }
  
  views {
    container openJudge {
      include *
      title "OpenJudge Container Diagram"
    }  
    theme default
  }
}
