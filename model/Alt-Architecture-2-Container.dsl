workspace "OpenJudge Event-Driven Architecture" "Simple event-driven architecture alternative" {

    model {
        # People
        student = person "Student" "Computer science student"
        
        # External System
        containerRegistry = softwareSystem "Container Registry" "Docker execution environments" "External"
        
        # Main Software System
        openJudge = softwareSystem "OpenJudge Platform" "Event-driven code evaluation platform" {
            
            # Frontend
            frontend = container "Frontend" "Web interface for coding problems" "React.js" "Web Browser"
            
            # Gateway
            apiGateway = container "API Gateway" "Central entry point and routing" "Kong" "Gateway"
            
            # Event Infrastructure
            eventBus = container "Event Bus (Apache Kafka)" "Central event streaming hub for all service communication" "Apache Kafka" "Message Broker"
            
            # Core Services
            authService = container "Auth Service" "User authentication and authorization" "Node.js" "Auth Service"
            problemService = container "Problem Service" "Manages coding problems and test cases" "Node.js" "Problem Service"
            submissionService = container "Submission Service" "Handles code submission workflow" "Node.js" "Submission Service"
            executionService = container "Code Execution Service" "Executes code in isolated containers" "Python" "Execution Service"
            
            # Data Storage
            database = container "Database" "Primary data storage" "PostgreSQL" "Database"
            eventStore = container "Event Store" "Immutable event history" "EventStore" "Event Store"
        }
        
        # Simple Flow
        student -> frontend "Uses web interface"
        frontend -> apiGateway "API requests"
        apiGateway -> eventBus "Publishes events"
        
        # Event Bus Connections (Simplified)
        eventBus -> authService "Auth events"
        eventBus -> problemService "Problem events" 
        eventBus -> submissionService "Submission events"
        eventBus -> executionService "Execution events"
        
        # Data Storage (Simplified)
        submissionService -> database "Stores submissions"
        submissionService -> eventStore "Event history"
        
        # External
        executionService -> containerRegistry "Pulls containers"
    }

    views {
        systemContext openJudge "SystemContext" {
            include *
            autoLayout
        }
        
        container openJudge "EventDrivenArchitecture" "Simple event-driven architecture" {
            include *
            autoLayout lr
        }
        
        styles {
            element "Person" {
                background #2c3e50
                color #ffffff
                shape Person
            }
            element "External" {
                background #95a5a6
                color #ffffff
            }
            element "Web Browser" {
                background #3498db
                color #ffffff
                shape WebBrowser
            }
            element "Gateway" {
                background #e74c3c
                color #ffffff
            }
            element "Message Broker" {
                background #27ae60
                color #ffffff
                shape Pipe
            }
            element "Auth Service" {
                background #f39c12
                color #ffffff
            }
            element "Problem Service" {
                background #9b59b6
                color #ffffff
            }
            element "Submission Service" {
                background #1abc9c
                color #ffffff
            }
            element "Execution Service" {
                background #e91e63
                color #ffffff
            }
            element "Database" {
                background #34495e
                color #ffffff
                shape Cylinder
            }
            element "Event Store" {
                background #1565c0
                color #ffffff
                shape Cylinder
            }
        }
        
        themes default
    }
}