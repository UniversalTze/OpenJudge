workspace {
  model {
    user = person "User" "Submits code and views feedback"
    submissionDatabase = softwareSystem "Submission Database" "PSQL; stores submissions and results" "Database"
    problemDatabase = softwareSystem "Problem Database" "PSQL; stores problems and test cases" "Database"
    authDatabase = softwareSystem "Auth Database" "Stores user credentials and authentication data" "Database" 
    redisCache = softwareSystem "Redis Cache" "Token revocation list and session management" "Database"
    llmService = softwareSystem "LLM Service" "External AI service for code feedback generation" "External"
  
    openJudge = softwareSystem "OpenJudge" "A transparent, learning-focused code evaluation platform" {
      frontendUI = container "Frontend UI" "Web app for code editing and feedback" "Vite.js"
      apiGateway = container "API Gateway" "FastAPI; routes requests & enforces security" "FastAPI"
      authService = container "Auth Service" "Go Fiber; login, JWTs" "Go/Fiber"
      problemService = container "Problem Service" "FastAPI; manages problems & test cases" "Python/FastAPI"
      submissionService = container "Submission Service" "FastAPI; cleans code, stores submissions, generates feedback" "Python/FastAPI"
      executionService = container "Execution Service" "Python; orchestrates code execution and runs code in sandbox" "Python"
    }
    

    
    # User interactions
    user -> frontendUI "Submits code and views feedback"
    
    # Frontend to API Gateway
    frontendUI -> apiGateway "HTTPS API calls"
    
    # API Gateway routing
    apiGateway -> authService "Validates JWTs"
    apiGateway -> problemService "CRUD operations on problems"
    apiGateway -> submissionService "Accepts code submissions"
    apiGateway -> redisCache "Checks token revocation list"
    
    # Service to database connections
    authService -> authDatabase "Stores/retrieves user data"
    submissionService -> submissionDatabase "Persists cleaned code & metadata"
    problemService -> problemDatabase "Stores/retrieves problems & test cases"
    
    # Inter-service communications
    submissionService -> problemService "Internal API call for problem details"
    submissionService -> executionService "Message Queue (input)"
    executionService -> submissionService "Message Queue (output)"
    submissionService -> llmService "API call for feedback generation"
  }
  
  views {
    container openJudge {
      include *
      autolayout lr
      title "OpenJudge Container Diagram"
    }  
    theme default
  }
}
