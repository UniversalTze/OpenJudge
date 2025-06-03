# 7. GoFiber for Auth Service  
**Date:** 2025-05-12
**Status:** Accepted  
**Summary**  
*In the context of* developing our authentication service, *facing* the need for high performance and low resource consumption, *we decided* to use GoFiber, *to achieve* fast request handling, efficient memory usage, and seamless integration with our infrastructure.  

**Context**  
- We need an authentication service that can handle high throughput efficiently.  
- We require a lightweight framework with minimal overhead.  
- We aim to leverage Go’s performance benefits for handling authentication requests.  
- We need an easy-to-use framework that integrates well with our existing CI/CD and containerization setup.  

**Decision**  
We decided to use GoFiber for our Auth service due to its lightweight nature, fast execution speeds, and built-in support for routing and middleware. GoFiber, being inspired by Express.js, allows for a simple yet powerful development experience while maximizing the performance benefits of Go.  

**Consequences**  
- Developers need to familiarize themselves with GoFiber’s routing and middleware mechanisms.  
- We need to ensure compatibility with authentication libraries and security best practices.  
- Proper benchmarking is required to optimize performance under load.  