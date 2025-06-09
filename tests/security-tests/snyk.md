# Snyk Security Report

To test the security of our application, we ran a static code security analysis tool.

Snyk was able to perform dependency checking on a couple as well, but for the majority we just 
scanned the code as is. Lastly, we scanned the terraform one using snyk's IAC scanner.

### Auth

Dependencies: 

```
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

```
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

Code:
```

Testing /Users/ben/Documents/csse6400/project/services/execution ...


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/execution

Summary:

✔ Awesome! No issues were found.
```

### Frontend

Dependencies: 

```
Testing /Users/ben/Documents/csse6400/project/services/frontend...

Tested 256 dependencies for known issues, found 2 issues, 48 vulnerable paths.


Issues to fix by upgrading:

  Upgrade cmdk@1.0.0 to cmdk@1.0.1 to fix
  ✗ Regular Expression Denial of Service (ReDoS) [Medium Severity][https://security.snyk.io/vuln/SNYK-JS-BABELRUNTIME-10044504] in @babel/runtime@7.25.9
    introduced by react-error-boundary@4.1.2 > @babel/runtime@7.25.9 and 46 other path(s)

  Upgrade react-helmet-async@1.3.0 to react-helmet-async@2.0.0 to fix
  ✗ Regular Expression Denial of Service (ReDoS) [Medium Severity][https://security.snyk.io/vuln/SNYK-JS-BABELRUNTIME-10044504] in @babel/runtime@7.25.9
    introduced by react-error-boundary@4.1.2 > @babel/runtime@7.25.9 and 46 other path(s)


Issues with no direct upgrade or patch:
  ✗ Missing Release of Resource after Effective Lifetime [Medium Severity][https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116] in inflight@1.0.6
    introduced by react-query@3.39.3 > broadcast-channel@3.7.0 > rimraf@3.0.2 > glob@7.2.3 > inflight@1.0.6
  No upgrade or patch available



Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Package manager:   npm
Target file:       package-lock.json
Project name:      openjudge_application
Open source:       no
Project path:      /Users/ben/Documents/csse6400/project/services/frontend
Licenses:          enabled
```

Code:

```
Testing /Users/ben/Documents/csse6400/project/services/frontend ...

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/cookie-signature/index.js, line 50 
   Info: crypto.createHash hash (used in crypto.createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/etag/index.js, line 46 
   Info: crypto.createHash hash (used in crypto.createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/file-entry-cache/cache.js, line 47 
   Info: crypto.createHash hash (used in crypto.createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 911 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 942 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 1018 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/loader.js, line 902 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/loader.js, line 933 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/monaco-editor/dev/vs/loader.js, line 1009 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/tailwindcss/lib/lib/cacheInvalidation.js, line 75 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/vite/dist/node-cjs/publicUtils.cjs, line 3963 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/vite/dist/node/chunks/dep-BASfdaBA.js, line 2004 
   Info: createHash hash (used in createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Use of Password Hash With Insufficient Computational Effort 
   Path: node_modules/tailwindcss/src/lib/cacheInvalidation.js, line 23 
   Info: crypto.default.createHash hash (used in crypto.default.createHash) is insecure. Consider changing it to a secure hashing algorithm.

 ✗ [Low] Insufficient postMessage Validation 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 16862 
   Info: The origin of the received message is not checked. This means any site (even malicious) can send message to this window. If you don't expect this, consider checking the origin of sender.

 ✗ [Low] Insufficient postMessage Validation 
   Path: node_modules/monaco-editor/esm/vs/base/common/platform.js, line 111 
   Info: The origin of the received message is not checked. This means any site (even malicious) can send message to this window. If you don't expect this, consider checking the origin of sender.

 ✗ [Low] Insufficient postMessage Validation 
   Path: node_modules/vite/dist/client/client.mjs, line 545 
   Info: The origin of the received message is not checked. This means any site (even malicious) can send message to this window. If you don't expect this, consider checking the origin of sender.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.ts, line 44 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.ts, line 55 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/arktype/src/__tests__/__fixtures__/data.ts, line 6 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/arktype/src/__tests__/__fixtures__/data.ts, line 23 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/class-validator/src/__tests__/__fixtures__/data.ts, line 50 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/computed-types/src/__tests__/__fixtures__/data.ts, line 39 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/effect-ts/src/__tests__/__fixtures__/data.ts, line 75 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/effect-ts/src/__tests__/__fixtures__/data.ts, line 86 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/fluentvalidation-ts/src/__tests__/__fixtures__/data.ts, line 81 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/io-ts/src/__tests__/__fixtures__/data.ts, line 72 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/io-ts/src/__tests__/__fixtures__/data.ts, line 91 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/joi/src/__tests__/__fixtures__/data.ts, line 47 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/nope/src/__tests__/__fixtures__/data.ts, line 32 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/superstruct/src/__tests__/__fixtures__/data.ts, line 37 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typanion/src/__tests__/__fixtures__/data.ts, line 44 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typebox/src/__tests__/__fixtures__/data.ts, line 42 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typeschema/src/__tests__/__fixtures__/data.ts, line 46 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/valibot/src/__tests__/__fixtures__/data.ts, line 57 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/vest/src/__tests__/__fixtures__/data.ts, line 36 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/vine/src/__tests__/__fixtures__/data.ts, line 36 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/yup/src/__tests__/__fixtures__/data.ts, line 40 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/zod/src/__tests__/__fixtures__/data.ts, line 46 
   Info: Do not hardcode passwords in code. Found hardcoded password used in password.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/arktype/src/__tests__/__fixtures__/data.ts, line 24 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/computed-types/src/__tests__/__fixtures__/data.ts, line 40 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/effect-ts/src/__tests__/__fixtures__/data.ts, line 87 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/fluentvalidation-ts/src/__tests__/__fixtures__/data.ts, line 82 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/io-ts/src/__tests__/__fixtures__/data.ts, line 92 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/joi/src/__tests__/__fixtures__/data.ts, line 48 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/nope/src/__tests__/__fixtures__/data.ts, line 33 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/superstruct/src/__tests__/__fixtures__/data.ts, line 38 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typanion/src/__tests__/__fixtures__/data.ts, line 45 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typebox/src/__tests__/__fixtures__/data.ts, line 43 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/typeschema/src/__tests__/__fixtures__/data.ts, line 47 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/valibot/src/__tests__/__fixtures__/data.ts, line 58 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/vine/src/__tests__/__fixtures__/data.ts, line 37 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/yup/src/__tests__/__fixtures__/data.ts, line 41 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Use of Hardcoded Passwords 
   Path: node_modules/@hookform/resolvers/zod/src/__tests__/__fixtures__/data.ts, line 47 
   Info: Do not hardcode passwords in code. Found hardcoded password used in repeatPassword.

 ✗ [Low] Regular Expression Denial of Service (ReDoS) 
   Path: node_modules/fastq/test/promise.js, line 203 
   Info: Unsanitized user input from an exception flows into match, where it is used to build a regular expression. This may result in a Regular expression Denial of Service attack (reDOS).

 ✗ [Low] Regular Expression Denial of Service (ReDoS) 
   Path: node_modules/fastq/test/promise.js, line 216 
   Info: Unsanitized user input from an exception flows into match, where it is used to build a regular expression. This may result in a Regular expression Denial of Service attack (reDOS).

 ✗ [Low] Hardcoded Secret 
   Path: node_modules/@hookform/resolvers/arktype/src/__tests__/__fixtures__/data.ts, line 8 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [Low] Hardcoded Secret 
   Path: node_modules/@hookform/resolvers/effect-ts/src/__tests__/__fixtures__/data.ts, line 69 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [Low] Hardcoded Secret 
   Path: node_modules/@hookform/resolvers/effect-ts/src/__tests__/__fixtures__/data.ts, line 89 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [Low] Hardcoded Secret 
   Path: node_modules/@hookform/resolvers/io-ts/src/__tests__/__fixtures__/data.ts, line 73 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [Low] Hardcoded Secret 
   Path: node_modules/@hookform/resolvers/io-ts/src/__tests__/__fixtures__/data.ts, line 94 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [Medium] Allocation of Resources Without Limits or Throttling 
   Path: index.js, line 21 
   Info: Expensive operation (a file system operation) is performed by an endpoint handler which does not use a rate-limiting mechanism. It may enable the attackers to perform Denial-of-service attacks. Consider using a rate-limiting middleware such as express-limit.

 ✗ [Medium] Open Redirect 
   Path: node_modules/.vite/deps/react-router-dom.js, line 2120 
   Info: Unsanitized input from the request URL flows into replace, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.cjs.js, line 3150 
   Info: Unsanitized input from the request URL flows into replace, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.js, line 2708 
   Info: Unsanitized input from the request URL flows into replace, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.umd.js, line 3152 
   Info: Unsanitized input from the request URL flows into replace, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/router.ts, line 2697 
   Info: Unsanitized input from the request URL flows into replace, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/.vite/deps/react-router-dom.js, line 2122 
   Info: Unsanitized input from the request URL flows into assign, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.cjs.js, line 3152 
   Info: Unsanitized input from the request URL flows into assign, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.js, line 2710 
   Info: Unsanitized input from the request URL flows into assign, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/dist/router.umd.js, line 3154 
   Info: Unsanitized input from the request URL flows into assign, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Open Redirect 
   Path: node_modules/@remix-run/router/router.ts, line 2699 
   Info: Unsanitized input from the request URL flows into assign, where it is used as input for request redirection. This may result in an Open Redirect vulnerability.

 ✗ [Medium] Path Traversal 
   Path: node_modules/@babel/parser/bin/babel-parser.js, line 11 
   Info: Unsanitized input from a command line argument flows into fs.readFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to read arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/compile-dots.js, line 16 
   Info: Unsanitized input from a command line argument flows into fs.readFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to read arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/compile-dots.js, line 41 
   Info: Unsanitized input from a command line argument flows into fs.readFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to read arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/browserslist/cli.js, line 116 
   Info: Unsanitized input from a command line argument flows into fs.readFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to read arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/bundle.js, line 54 
   Info: Unsanitized input from a command line argument flows into fs.writeFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to write to arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/bundle.js, line 55 
   Info: Unsanitized input from a command line argument flows into fs.writeFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to write to arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/bundle.js, line 56 
   Info: Unsanitized input from a command line argument flows into fs.writeFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to write to arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/ajv/scripts/compile-dots.js, line 51 
   Info: Unsanitized input from a command line argument flows into fs.writeFileSync, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to write to arbitrary files.

 ✗ [Medium] Path Traversal 
   Path: node_modules/loose-envify/cli.js, line 8 
   Info: Unsanitized input from a command line argument flows into fs.createReadStream, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to read arbitrary files.

 ✗ [Medium] Improper Neutralization of Directives in Statically Saved Code 
   Path: node_modules/ajv/scripts/compile-dots.js, line 42 
   Info: Unsanitized input from a command line argument flows into dot.compile, where it is used to construct a template that gets rendered. This may result in a Server-Side Template Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 355 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 674 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 691 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 749 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 753 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 754 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/@eslint/eslintrc/lib/config-array-factory.js, line 787 
   Info: Unsanitized input from an exception flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/ajv/scripts/bundle.js, line 15 
   Info: Unsanitized input from a command line argument flows into require, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 725 
   Info: Unsanitized input from data from a remote resource flows into Function, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/monaco-editor/dev/vs/base/worker/workerMain.js, line 1979 
   Info: Unsanitized input from data from a remote resource flows into Function, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Code Injection 
   Path: node_modules/monaco-editor/dev/vs/loader.js, line 716 
   Info: Unsanitized input from data from a remote resource flows into Function, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.

 ✗ [Medium] Information Exposure 
   Path: index.js, line 6 
   Info: Disable X-Powered-By header for your Express app (consider using Helmet middleware), because it exposes information about the used framework to potential attackers.

 ✗ [Medium] Cleartext Transmission of Sensitive Information 
   Path: node_modules/express/lib/application.js, line 634 
   Info: http.createServer uses HTTP which is an insecure protocol and should not be used in code due to cleartext transmission of information. Data in cleartext in a communication channel can be sniffed by unauthorized actors. Consider using the https module instead.

 ✗ [High] Regular Expression Denial of Service (ReDoS) 
   Path: node_modules/ajv/scripts/compile-dots.js, line 71 
   Info: Unsanitized user input from a command line argument flows into match, where it is used to build a regular expression. This may result in a Regular expression Denial of Service attack (reDOS).

 ✗ [High] Regular Expression Denial of Service (ReDoS) 
   Path: node_modules/express/lib/router/index.js, line 585 
   Info: Unsanitized user input from the request URL flows into match, where it is used to build a regular expression. This may result in a Regular expression Denial of Service attack (reDOS).

 ✗ [High] Regular Expression Denial of Service (ReDoS) 
   Path: node_modules/tailwindcss/scripts/release-notes.js, line 11 
   Info: Unsanitized user input from a command line argument flows into RegExp, where it is used to build a regular expression. This may result in a Regular expression Denial of Service attack (reDOS).

 ✗ [High] Hardcoded Secret 
   Path: node_modules/prop-types/lib/ReactPropTypesSecret.js, line 10 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [High] Hardcoded Secret 
   Path: node_modules/prop-types/prop-types.js, line 816 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.

 ✗ [High] Hardcoded Secret 
   Path: node_modules/react-transition-group/dist/react-transition-group.js, line 357 
   Info: Avoid hardcoding values that are meant to be secret. Found a hardcoded string used in here.


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/frontend

Summary:

  100 Code issues found
  6 [High]   34 [Medium]   60 [Low] 
```


### Problems

Code: 

```
Testing /Users/ben/Documents/csse6400/project/services/problems ...


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/problems

Summary:

✔ Awesome! No issues were found.
```

### Submission

Code: 

```
Testing /Users/ben/Documents/csse6400/project/services/submission ...


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/submission

Summary:

✔ Awesome! No issues were found.
```

### Subscriber

Code: 

```
Testing /Users/ben/Documents/csse6400/project/services/subscriber ...


✔ Test completed

Organization:      ben-hdFEt9mZPkd5ZMk8ZWf9NV
Test type:         Static code analysis
Project path:      /Users/ben/Documents/csse6400/project/services/subscriber

Summary:

✔ Awesome! No issues were found.
```

### Terraform

IAC:

```
Snyk Infrastructure as Code

✔ Test completed.

Issues

Low Severity Issues: 36

  [Low] ALB does not drop invalid headers
  Info:    The application load balancer is not set to drop invalid headers.
           Maliciously crafted headers may be accepted by the load balancer
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-405
  Path:    resource > aws_lb[AuthenticationAPILoadBalancer]
  File:    authentication.tf
  Resolve: Set `drop_invalid_header_fields` to `true`

  [Low] Load balancer is internet facing
  Info:    Load balancer is internet facing. Increases attack vector
           reachability
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-48
  Path:    resource > aws_lb[AuthenticationAPILoadBalancer] > internal
  File:    authentication.tf
  Resolve: Set `internal` attribute to `true`

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource > aws_security_group[UserDatabaseSecurityGroup] >
           description
  File:    authentication.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource > aws_security_group[AuthenticationAPISecurityGroup] >
           description
  File:    authentication.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource >
           aws_security_group[AuthenticationAPILoadBalancerSecurityGroup] >
           description
  File:    authentication.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource >
           aws_security_group[AuthenticationAPILoadBalancerSecurityGroup] >
           egress
  File:    authentication.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[UserDatabaseSecurityGroup] > egress
  File:    authentication.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[AuthenticationAPISecurityGroup] >
           egress
  File:    authentication.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[ExecutionSecurityGroup] > egress
  File:    execution.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] ALB does not drop invalid headers
  Info:    The application load balancer is not set to drop invalid headers.
           Maliciously crafted headers may be accepted by the load balancer
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-405
  Path:    resource > aws_lb[FrontendLoadBalancer]
  File:    frontend.tf
  Resolve: Set `drop_invalid_header_fields` to `true`

  [Low] Load balancer is internet facing
  Info:    Load balancer is internet facing. Increases attack vector
           reachability
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-48
  Path:    resource > aws_lb[FrontendLoadBalancer] > internal
  File:    frontend.tf
  Resolve: Set `internal` attribute to `true`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[FrontendSecurityGroup] > egress
  File:    frontend.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[FrontendLoadBalancerSecurityGroup] >
           egress
  File:    frontend.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] ALB does not drop invalid headers
  Info:    The application load balancer is not set to drop invalid headers.
           Maliciously crafted headers may be accepted by the load balancer
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-405
  Path:    resource > aws_lb[APIGatewayLoadBalancer]
  File:    gateway.tf
  Resolve: Set `drop_invalid_header_fields` to `true`

  [Low] Load balancer is internet facing
  Info:    Load balancer is internet facing. Increases attack vector
           reachability
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-48
  Path:    resource > aws_lb[APIGatewayLoadBalancer] > internal
  File:    gateway.tf
  Resolve: Set `internal` attribute to `true`

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource > aws_security_group[TokenRevocationListSecurityGroup] >
           description
  File:    gateway.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[TokenRevocationListSecurityGroup] >
           egress
  File:    gateway.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[APIGatewayLoadBalancerSecurityGroup] >
           egress
  File:    gateway.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[APIGatewaySecurityGroup] > egress
  File:    gateway.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] ECR repository is not encrypted with customer managed key
  Info:    ECR repository is not encrypted with customer managed key. Scope of
           use of the key cannot be controlled via KMS/IAM policies
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-418
  Path:    resource > aws_ecr_repository[open-judge-ecr] >
           encryption_configuration
  File:    main.tf
  Resolve: Set `encryption_configuration.kms_key` attribute to customer managed
           KMS key

  [Low] ECR Registry allows mutable tags
  Info:    The AWS ECR registry does not enforce immutable tags. Image tags can
           be modified post deployment
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-126
  Path:    resource > aws_ecr_repository[open-judge-ecr] > image_tag_mutability
  File:    main.tf
  Resolve: Set `image_tag_mutability` attribute to `IMMUTABLE`

  [Low] ECS ContainerInsights disabled
  Info:    ECS ContainerInsights will not be enabled on the cluster. Performance
           log events will not be collected and displayed in CloudWatch
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-128
  Path:    resource > aws_ecs_cluster[open-judge-cluster] > setting
  File:    main.tf
  Resolve: Set `settings.name` attribute to `containerInsights`, and
           `settings.value` to `enabled`

  [Low] ECR image scanning is disabled
  Info:    The ECR image scan for known vulnerabilities is disabled. The known
           vulnerabilities will not be automatically discovered
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-61
  Path:    resource > aws_ecr_repository[open-judge-ecr] >
           image_scanning_configuration
  File:    main.tf
  Resolve: Set `image_scanning_configuration.scan_on_push` attribute to `true`

  [Low] ALB does not drop invalid headers
  Info:    The application load balancer is not set to drop invalid headers.
           Maliciously crafted headers may be accepted by the load balancer
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-405
  Path:    resource > aws_lb[ProblemsAPILoadBalancer]
  File:    problems.tf
  Resolve: Set `drop_invalid_header_fields` to `true`

  [Low] Load balancer is internet facing
  Info:    Load balancer is internet facing. Increases attack vector
           reachability
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-48
  Path:    resource > aws_lb[ProblemsAPILoadBalancer] > internal
  File:    problems.tf
  Resolve: Set `internal` attribute to `true`

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource > aws_security_group[ProblemAPILoadBalancerSecurityGroup] >
           description
  File:    problems.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] Security group description is missing
  Info:    The description field is missing in the security group. Increases the
           security management overhead
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-56
  Path:    resource > aws_security_group[ProblemDatabaseSecurityGroup] >
           description
  File:    problems.tf
  Resolve: Set `description` attribute to meaningful statement

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[ProblemDatabaseSecurityGroup] > egress
  File:    problems.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[ProblemAPILoadBalancerSecurityGroup] >
           egress
  File:    problems.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[problems_security_group] > egress
  File:    problems.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] ALB does not drop invalid headers
  Info:    The application load balancer is not set to drop invalid headers.
           Maliciously crafted headers may be accepted by the load balancer
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-405
  Path:    resource > aws_lb[SubmissionAPILoadBalancer]
  File:    submission.tf
  Resolve: Set `drop_invalid_header_fields` to `true`

  [Low] Load balancer is internet facing
  Info:    Load balancer is internet facing. Increases attack vector
           reachability
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-48
  Path:    resource > aws_lb[SubmissionAPILoadBalancer] > internal
  File:    submission.tf
  Resolve: Set `internal` attribute to `true`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[SubmissionResultReceiverSecurityGroup]
           > egress[1]
  File:    submission.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[SubmissionAPILoadBalancerSecurityGroup]
           > egress
  File:    submission.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[SubmissionAPISecurityGroup] > egress
  File:    submission.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

  [Low] AWS Security Group allows open egress
  Info:    The inline security group rule allows open egress. Open egress can be
           used to exfiltrate data to unauthorized destinations, and enable
           access to potentially malicious resources
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-73
  Path:    resource > aws_security_group[SubmissionDatabaseSecurityGroup] >
           egress
  File:    submission.tf
  Resolve: Set `egress.cidr_blocks` attribute to specific ranges e.g.
           `192.168.1.0/24`

Medium Severity Issues: 20

  [Medium] RDS automatic backup is disabled
  Info:    Automatic backup of AWS Relational Database is disabled. No automatic
           backups will occur, availability risk if disaster occurs and manual
           backups have not been set
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-408
  Path:    resource > aws_db_instance[UserDatabase] > backup_retention_period
  File:    authentication.tf
  Resolve: Set `resource.backup_retention_period` to `1` or more

  [Medium] RDS IAM authentication is disabled
  Info:    IAM database authentication is disabled, authentication tokens are
           not used to connect to DB instance. Users will connect to DB instance
           with password, which are less secure than temporary tokens which
           expire
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-414
  Path:    resource > aws_db_instance[UserDatabase] >
           iam_database_authentication_enabled
  File:    authentication.tf
  Resolve: Set `iam_database_authentication_enabled` to `true`.

  [Medium] Non-encrypted RDS instance at rest
  Info:    The DB instance storage is not encrypted by default. Should someone
           gain unauthorized access to the data they would be able to read the
           contents.
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-201
  Path:    resource > aws_db_instance[UserDatabase] > storage_encrypted
  File:    authentication.tf
  Resolve: Set `storage_encrypted` attribute to true

  [Medium] Load balancer endpoint does not enforce HTTPS
  Info:    Load balancer endpoint does not enforce HTTPS. The content could be
           intercepted and manipulated in transit
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-47
  Path:    resource > aws_lb_listener[AuthenticationAPILoadBalancerListener] >
           protocol
  File:    authentication.tf
  Resolve: Set the `protocol` attribute to `HTTPS` or `TLS`

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource >
           aws_security_group[FrontendLoadBalancerSecurityGroup] > ingress[0]
  File:    frontend.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource >
           aws_security_group[FrontendLoadBalancerSecurityGroup] > ingress[1]
  File:    frontend.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource >
           aws_security_group[APIGatewayLoadBalancerSecurityGroup] > ingress[1]
  File:    gateway.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource >
           aws_security_group[APIGatewayLoadBalancerSecurityGroup] > ingress[0]
  File:    gateway.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] ElastiCache cluster does not require authentication
  Info:    Elasticache cluster can be accessed without authentication token.
           Anyone with network access to the cluster can read cached data
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-215
  Path:    resource > aws_elasticache_replication_group[TokenRevocationList] >
           auth_token
  File:    gateway.tf
  Resolve: Add an external reference to `auth_token`. Do not add the secret
           directly into the file.

  [Medium] Non-Encrypted ElastiCache Replication Group
  Info:    The ElastiCache replication group is not encrypted at rest. That
           should someone gain unauthorized access to the data they would be
           able to read the contents.
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-71
  Path:    resource > aws_elasticache_replication_group[TokenRevocationList] >
           at_rest_encryption_enabled
  File:    gateway.tf
  Resolve: Set `at_rest_encryption_enabled` attribute to `true`

  [Medium] RDS automatic backup is disabled
  Info:    Automatic backup of AWS Relational Database is disabled. No automatic
           backups will occur, availability risk if disaster occurs and manual
           backups have not been set
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-408
  Path:    resource > aws_db_instance[ProblemDatabase] > backup_retention_period
  File:    problems.tf
  Resolve: Set `resource.backup_retention_period` to `1` or more

  [Medium] RDS IAM authentication is disabled
  Info:    IAM database authentication is disabled, authentication tokens are
           not used to connect to DB instance. Users will connect to DB instance
           with password, which are less secure than temporary tokens which
           expire
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-414
  Path:    resource > aws_db_instance[ProblemDatabase] >
           iam_database_authentication_enabled
  File:    problems.tf
  Resolve: Set `iam_database_authentication_enabled` to `true`.

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource > aws_security_group[problems_security_group] >
           ingress
  File:    problems.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] Non-encrypted RDS instance at rest
  Info:    The DB instance storage is not encrypted by default. Should someone
           gain unauthorized access to the data they would be able to read the
           contents.
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-201
  Path:    resource > aws_db_instance[ProblemDatabase] > storage_encrypted
  File:    problems.tf
  Resolve: Set `storage_encrypted` attribute to true

  [Medium] Load balancer endpoint does not enforce HTTPS
  Info:    Load balancer endpoint does not enforce HTTPS. The content could be
           intercepted and manipulated in transit
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-47
  Path:    resource > aws_lb_listener[ProblemsAPILoadBalancerListener] >
           protocol
  File:    problems.tf
  Resolve: Set the `protocol` attribute to `HTTPS` or `TLS`

  [Medium] RDS automatic backup is disabled
  Info:    Automatic backup of AWS Relational Database is disabled. No automatic
           backups will occur, availability risk if disaster occurs and manual
           backups have not been set
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-408
  Path:    resource > aws_db_instance[SubmissionDatabase] >
           backup_retention_period
  File:    submission.tf
  Resolve: Set `resource.backup_retention_period` to `1` or more

  [Medium] RDS IAM authentication is disabled
  Info:    IAM database authentication is disabled, authentication tokens are
           not used to connect to DB instance. Users will connect to DB instance
           with password, which are less secure than temporary tokens which
           expire
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-AWS-414
  Path:    resource > aws_db_instance[SubmissionDatabase] >
           iam_database_authentication_enabled
  File:    submission.tf
  Resolve: Set `iam_database_authentication_enabled` to `true`.

  [Medium] Security Group allows open ingress
  Info:    That inbound traffic is allowed to a resource from any source instead
           of a restricted range. That potentially everyone can access your
           resource
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-1
  Path:    input > resource > aws_security_group[SubmissionAPISecurityGroup] >
           ingress
  File:    submission.tf
  Resolve: Set `cidr_block` attribute with a more restrictive IP, for example
           `192.16.0.0/24`

  [Medium] Non-encrypted RDS instance at rest
  Info:    The DB instance storage is not encrypted by default. Should someone
           gain unauthorized access to the data they would be able to read the
           contents.
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-201
  Path:    resource > aws_db_instance[SubmissionDatabase] > storage_encrypted
  File:    submission.tf
  Resolve: Set `storage_encrypted` attribute to true

  [Medium] Load balancer endpoint does not enforce HTTPS
  Info:    Load balancer endpoint does not enforce HTTPS. The content could be
           intercepted and manipulated in transit
  Rule:    https://security.snyk.io/rules/cloud/SNYK-CC-TF-47
  Path:    resource > aws_lb_listener[SubmissionAPILoadBalancerListener] >
           protocol
  File:    submission.tf
  Resolve: Set the `protocol` attribute to `HTTPS` or `TLS`

-------------------------------------------------------

Test Summary

  Organization: ben-hdFEt9mZPkd5ZMk8ZWf9NV
  Project name: terraform

✔ Files without issues: 2
✗ Files with issues: 7
  Ignored issues: 0
  Total issues: 56 [ 0 critical, 0 high, 20 medium, 36 low ]

-------------------------------------------------------
```

