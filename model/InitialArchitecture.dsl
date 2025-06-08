workspace "OpenJudge" "A CSSE6400 Project" {
  !identifiers hierarchical

  model {
    user = person "Customer" {
      description "User of the OpenJudge platform. Registers an account and attempts answers to code problems."
    }

    openJudge = softwareSystem "OpenJudge Service" {
      description "Allows users to register and attempt to solve Python code problems, and provides feedback."

      webapp = container "Webapp" {
        technology "Next.js"
        description "Serves UI/webpages, handles routing & data fetching (Presentation Layer)"
        
        landingPage = component "Landing Page" {
          technology "React / Next.js"
          description "Public-facing website pages."
        }

        loginPage = component "Authentication Views" {
          technology "React / Next.js"
          description "Pages such as register, login etc. Allows users to authenticate."
        }

        dashboardPage = component "Dashboard Views" {
          technology "React / Next.js"
          description "Pages to display problem lists and user progress"
        }

        codeEditorPage = component "Code Editor View" {
          technology "React / Next.js"
          description "View that allows users to attempt coding problems"
        }

        landingPage -> loginPage "Navigates to"
        loginPage -> dashboardPage "Navigates to"
        dashboardPage -> codeEditorPage "Navigates to"
      }

      backend = container "Backend" {
        technology "FastAPI"
        description "Handles requests for data, sends jobs to worker (Data Access & Business Logic Layers)"

        authController = component "Auth Controller" {
          technology "Python / FastAPI"
          description "Handles user authentication and registration"
        }
        
        users = component "Users" {
          technology "Python / SQL Model"
          description "User data model"
        }
        
        problems = component "Problems" {
          technology "Python / SQL Model"
          description "Problem data model"            
        }
        
        progress = component "Progress" {
          technology "Python / SQL Model"
          description "Progress data model"            
        }

        problemController = component "Problem Controller" {
          technology "Python / FastAPI"
          description "Serves coding problems and accepts solutions"
        }

        sqsDispatcher = component "SQS Controller" {
          technology "Python / AWS SDK"
          description "Sends submissions to SQS for worker processing"
        }

        problemController -> sqsDispatcher "Uses"
        problemController -> problems "Uses"
        problemController -> progress "Updates"
        progress -> problemController "Informs"
        progress -> users "Uses"
        authController -> users "Uses
      }

      worker = container "Worker" {
        technology "Python"
        description "Receives user code tests and returns results to backend"

        workerExecutable = component "Worker Service" {
          description "Runs the test suite over the provided code and returns results"
          technology "Python / AWS SDK"
        }

        testSuite = component "Test Suite" {
          description "Tests whether the given Python code submitted by the user meets the specification"
          technology "PyTest"
        }

        workerExecutable -> testSuite "Runs"
      }

      database = container "Database" {
        tags "DB"
        technology "PostgreSQL"
        description "Stores user data, problem definitions, and test results"
      }

      # Container relationships
      user -> webapp "Uses"
      user -> webapp.landingPage "Navigates to"
      webapp -> backend "API requests"
      backend -> worker "Submits job"
      worker -> backend "Returns results"
      backend -> database "Reads/writes"
      webapp.loginPage -> backend.authController "Makes API requests to"
      webapp.dashboardPage -> backend.progress "Fetch progress"
      webapp.codeEditorPage -> backend.problemController "Makes API requests to"
      backend.sqsDispatcher -> worker.workerExecutable "Lodges job via SQS"
      worker.workerExecutable -> backend.sqsDispatcher "Returns results via SQS subscription"
      backend.users -> database "Store and retrieve user data"
      backend.problems -> database "Store and retrieve problem data"
      backend.progress -> database "Store and retrieve progress data"
    }
  }

  views {
    systemContext openJudge {
      include *
      autolayout lr
      title "OpenJudge Context Diagram"
    }

    container openJudge {
      include *
      autolayout lr
      title "OpenJudge Container Diagram"
    }

    component openJudge.webapp {
      include *
      autolayout lr
      title "OpenJudge Components Diagram: Webapp"
    }

    component openJudge.backend {
      include *
      autolayout lr
      title "OpenJudge Components Diagram: Backend"
    }

    component openJudge.worker {
      include *
      autolayout lr
      title "OpenJudge Components Diagram: Worker"
    }

    styles {
      element "Software System" {
        background "#1168bd"
        color "#ffffff"
      }
      
      element "Container" {
        shape RoundedBox
        background "#438dd5"
        color "#ffffff"
      }

      element "Component" {
        shape Box
        background "#85bbf0"
        color "#000000"
      }

      element "Person" {
        shape Person
        background "#08427b"
        color "#ffffff"
      }

      element "DB" {
        shape Cylinder
        background "#bfffda"
        color "#000000"
      }
    }
    
  }

  configuration {
    scope softwaresystem
  }
  
}
