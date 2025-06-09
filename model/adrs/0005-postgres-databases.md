**Date:** 2025-05-13 \
**Status:** Accepted \
**Summary** \
*In the context of* delivering a project with that requires storing persistent user data, 
a postgress db was proposed to the group. This service was used due to the simplicity in 
establishing a database with necessary schemas. PostgreSQL was also chosen because it is 
widely used across the industry and programming communities, is well-documented, and all 
team members are already familiar with it.

**Context** 
For this project, data that needs to be stored include: 
- User information and avatar (additive)
- List of problems available to the user and the metadata.
- List of problems attempted by specific user. 
- Session token ids (for security) and other security JWT tokens from our Auth service.
- User submissions. 
- List of problems completed by user. 

**Decision** \
We decided to implement use PostgreSQL for persisent storage for some of the things highlighted in the context. 
Given the team’s familiarity with PostgreSQL and the tightening exam deadlines, we decided it was the most optimal decision to proceed with the PostgreSQL.

**Consequences** \
The team miss out on an oppurtunity to potentially explore with non-relational databases and how they work with data. 
Additonal overhead for processing JSON items from the Problem, Test Runner and Front End service may be encountered. 