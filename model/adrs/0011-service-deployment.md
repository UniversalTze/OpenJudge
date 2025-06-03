# 11. AWS Deployment Services  
**Date:** 2025-05-13
**Status:** Accepted  
**Summary**  
*In the context of* deploying and managing our microservices efficiently, *facing* the need for scalable, secure, and highly available infrastructure, *we decided* to use AWS-managed services including ECR/ECS for service deployment, ElastiCache for token revocation, S3 for object storage, SQS for execution queues, and RDS for databases, *to achieve* an automated and robust deployment pipeline, high availability, and efficient resource management.  

**Context**  
- We need a scalable and managed solution for deploying microservices.  
- Our authentication system requires a reliable mechanism for maintaining a token revocation list.  
- Object storage is required for handling file uploads and assets.  
- Asynchronous task execution must be managed efficiently with a queueing system.  
- Persistent and scalable database storage is necessary for core application data.  

**Decision**  
We decided to implement:  
- **Amazon Elastic Container Registry (ECR) & Elastic Container Service (ECS)** for deploying and managing containerized microservices.  
- **Amazon ElastiCache** (Redis) to store the token revocation list for fast lookup.  
- **Amazon S3** for storing user-generated content and application assets.  
- **Amazon SQS** to manage execution queues for processing background tasks asynchronously.  
- **Amazon RDS** for reliable and scalable database storage.  

**Consequences**  
- Services must be properly configured for autoscaling, monitoring, and security.  
- Ensuring efficient integration between these services requires careful orchestration.  
- Each service must be fine-tuned for performance optimization based on usage patterns.  