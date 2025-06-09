workspace {

  model {
    user = person "User" {
      description "A user of the system"
    }

    softwareSystem = softwareSystem "Open Judge FaaS Problem and Test Runner FaaS Deployment Diagram" {
      webApp = container "API Gateway" {
        description "Handles HTTP requests"
        technology "React"
      }
      subdatabase = container "Submission Database" {
        technology "PostgreSQL"
        description "Databse that stores user submissions and metadata about it"
        tags "Database"
        }
      database = container "Problem Database" {
        technology "PostgreSQL"
        description "Database for storage of problems. Shared Database with Submissions DB"
        tags "Database"
        }

      lambda = container "Get Problem Lambda" {
        description "Generate the problem that user has selected or list of problems for user to view."
        technology "AWS Lambda - python (FASTApi)"
        tags "lambda"
      }
      runner = container "Test Runner Language 2 Lambda" {
        description "Function to run a suite of tests for specific language (python)."
        technology "AWS Lambda - Python"
        tags "lambda"
      }
      
      rec = container "Test Runner Language 1 Lambda" {
        description "Function to run a suite of tests for specific language (Java)."
        technology "AWS Lambda - Java"
        tags "lambda"
      }
      
      stub = container "Test Runner Language N Lambda" {
        description "Function to run a suite of tests for specific language supported by Lambda."
        technology "AWS Lambda - supported languages"
        tags "lambda"
      }
      
      
      Computer = container "Web Application" {
        description "User browse and attempts problems on platform"
        technology "React"
        tags application
      }
    
    user -> webApp "Uses"
    webApp -> lambda "Send Search for Problems Request"
    computer -> webApp "Search for Problems"
    lambda -> database "Query for wanted problem to attempt"
    webApp -> rec "Send Test Runner Problems Request for Java"
    rec -> subdatabase "Query Submission DB for submission to run. Then store results back DB for submission ID"
    webApp -> runner "Send Test Runner Problems Request for Python"
    webApp -> stub "Send Test Runner Problems Request for language supported by Lambda"
    runner -> subdatabase "Query Submission DB for submission to run. Then store results back DB for submission ID"
    stub -> subdatabase "Query Submission DB for submission to run. Then store results back DB for submission ID"
    
    

    }

    deploymentEnvironment "Production" {
        deploymentNode "AWS Services" {
            deploymentNode "API Gateway" {
                containerInstance webApp
            }
    
        deploymentNode "Problem Search Function" {
            containerInstance lambda
            technology python
            }
        deploymentNode "Problem Database Host" {
            containerInstance database
            technology "PostgreSQL"
            }
        deploymentNode "Test Runner 1" {
            containerInstance rec
            technology "Java"
            }
        deploymentNode "Submission Database Host" {
            containerInstance subdatabase
            technology "PostgreSQL"
            }
        deploymentNode "Test Runner 2" {
            containerInstance runner
            technology "Python"
            }
        deploymentNode "Test Runner N" {
            containerInstance stub
            technology "Other languages supported by Lambda"
            }
            
      }
      
      deploymentNode "User's Browser" {
        containerInstance Computer
        technology "Google, Safari"
      }
    }
}
    

  views {
    deployment softwareSystem "Production" {
      include *
      autoLayout lr
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
    }
  }
}
