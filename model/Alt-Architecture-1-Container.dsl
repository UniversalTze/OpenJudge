workspace "Component Diagram Example" "A sample workspace with 3 components" {

    model {
        user = person "Client"

        softwareSystem = softwareSystem "Open Judge Event Driven" {
            webApp = container "Web Application - Front End" {
                tags "WebApp"
                technology "Next.js"
                frontend = component "Front End" {
                    description "Handles client User Interface"
                    technology "Next.js"
                }
                
                authController = component "Authentication Service" {
                    description "Handles login, registration requests, and authentication"
                    technology "Custom"
                }
    
                userService = component "User Service" {
                    description "Contains business logic for user management"
                    technology "JavaScript Service"
                }
    
                userRepository = component "User Repository" {
                    description "Handles database access for user data"
                    technology "PostgreSQL"
                    tags "Database"
                }
                user -> frontend "Send requests from here"
                frontend -> authController "Sends login/register requests"
                authController -> userService "Delegates to"
                userService -> userRepository "Reads from and writes to"
            }
 
            SubBroker = container "Submission Event Broker" "Coordinates generation of Submission and Test Runner" { 
                tags Broker
            }

            AuthenticationService = container "Authenticating User Service" "Authenticates and handles login requets. Returns refresh and session tokens" "Custom"
            Userdatabase = container "User Database" {
                description "secure salted storage of user credentials and information"
                technology "PostgreSQL"
                tags "Database"
            }
    
            Gateway = container "API Gateway" "Handles requests to all available services"
            webApp -> Gateway "Sends Login and auth requests for new session"
            webApp -> Gateway "Submission Problem"
            Gateway -> AuthenticationService "Sends to check login and auth status"
            
            AuthenticationService -> Userdatabase "Sends user credentials to be stored"
            
            Gateway -> SubBroker "Create Submission Event" 
            Subhandler = container "Submission Handler" "Handles the submission of Problem from User. Listener for Submission Event"
            ProblemRec = container "Test Runner Handler" "Run User's code and tests to see if correct. Listener for a Processing Submission Event"
            SubBroker -> Subhandler "Notification of Submission Event"
            Subhandler -> SubBroker "Send Processing Submission Event"
            SubBroker -> ProblemRec "Notification of Processing Submission Event"
            Subdatabase = container "Submission Database" {
                technology "PostgreSQL"
                tags "Database"
                description "storage of user submissions."
            }
            Subhandler -> Subdatabase "Stores User Submissions"
            
            ProblemRec -> Subdatabase "Update user submission with results"
            Gateway -> ProblemRec "Persistent Web Socket Connection for live results querying"

            
            
        }
        deploy = deploymentEnvironment "AWS" {
            webServer = deploymentNode "EC2 Instance" {
                webAppInstance = containerInstance webApp
            }
        }
    }
    

    views {

        container softwareSystem container_diagram {
            include *
            autolayout lr
            
        }

    
        
        styles {
            element "client" {
                shape box
                background #ba1e75
            }

            element "Software System" {
                background #d92389
            }
            element "Broker" {
                background #6FABE7
            }
            
            element "WebApp" {
                background #8AF6C1
            }

            element "Container" {
                background #FBF5B2
            }

            element "Component" {
                background #f48fb1
            }

            element "Database" {
                shape cylinder
                background #ce93d8
            }
        }
    }

    configuration {
        scope softwareSystem
    }
}
