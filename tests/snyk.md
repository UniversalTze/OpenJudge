# Snyk Security Report

To test the security of our application, we ran a static code security analysis tool.

### Auth

Dependencies: 

```bash
Testing /Users/ben/Documents/csse6400/project/services/auth...

✗ High severity vulnerability found in github.com/gofiber/fiber/v2/internal/schema
  Description: Improper Validation of Array Index
  Info: https://security.snyk.io/vuln/SNYK-GOLANG-GITHUBCOMGOFIBERFIBERV2INTERNALSCHEMA-10231766
  Introduced through: github.com/gofiber/fiber/v2@2.52.6
  From: github.com/gofiber/fiber/v2@2.52.6 > github.com/gofiber/fiber/v2/internal/schema@2.52.6
  Fixed in: 2.52.7



Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Package manager:   gomodules
Target file:       go.mod
Project name:      auth
Open source:       no
Project path:      /Users/ben/Documents/csse6400/project/services/auth
Licenses:          enabled

Tested 78 dependencies for known issues, found 1 issue, 1 vulnerable path.
```

Code:

```bash
Testing /Users/ben/Documents/csse6400/project/services/auth ...

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: api/auth/register.go, line 36 
   Info: The SHA1 hash (used in crypto.sha1.New) is insecure. Consider changing it to a secure hash algorithm


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/auth

Summary:

  1 Code issues found
  1 [Low] 
```

### Execution

