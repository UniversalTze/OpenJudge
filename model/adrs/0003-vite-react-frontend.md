# 3. Vite for Frontend Service  
**Date:** 2025-04-25  
**Status:** Accepted  
**Summary**  
*In the context of* delivering a web application with a modern and reactive interface, *facing* functional requirements and a team familiar with React and TypeScript, *we decided* to build our frontend service with Vite and React, *to achieve* a fast and efficient development process, a responsive and performant UI, and a scalable architecture, *accepting* the complexity of the framework.  

**Context**  
- We need to build a web application to interface with our user base.  
- It needs to be modern, performant, responsive, and reactive.  
- We require a fast development environment with optimized build times.  

**Decision**  
We decided to go with Vite and React for our frontend service. Our team is familiar with React, and Vite provides a lightweight development setup with fast hot module replacement (HMR) and optimized build performance. We gain the benefits of an efficient bundling process, instant feedback loops, and a simplified configuration compared to heavier frameworks.  

**Consequences**  
- This will mean members of our team need to familiarize themselves with Vite’s architecture and optimizations.  
- The lack of built-in server-side rendering may require additional configurations if needed.  
- We need to ensure compatibility with existing tooling and deployment strategies. 