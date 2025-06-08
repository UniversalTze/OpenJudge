workspace "OpenJudge System" "A transparent, learning-focused code evaluation platform" {

    model {
        user = person "User" "Person" "Submits code and views feedback"
        
        openJudge = softwareSystem "OpenJudge" "Software System" "A transparent, learning-focused code evaluation platform"
        
        user -> openJudge "Submits code and views feedback"
    }

    views {
        systemContext openJudge "SystemContext" {
            include *
            autoLayout lr
        }
        theme default
    }
}
