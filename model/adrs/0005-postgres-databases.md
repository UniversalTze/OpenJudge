TODO: Write an ADR about choosing postgres for our databases.
ASSIGNED TO: 

https://csse6400.uqcloud.net/handouts/adr.pdf using this format

**Date:** 2025-05-13 \
**Status:** Proposed \
**Summary** \
*In the context of* delivering a project with that requires storing persistent user data, 
a postgress db was proposed to the group. This service was used due to the simplicity in 
establishing a database with necessary schemas. PostgreSQL was also chosen because it is 
widely used across the industry and programming communities, is well-documented, and all 
team members are already familiar with it.

**Context** 
For this project, data that needs to be stored include: 
- User information.
- List of problem attempted by specific user. 
- Session token id (for security).
- Answer that user submits.
- Potentially what was last entered by user. 

**Decision** \
We decided to implement use PostgreSQL for persisent storage for some of the things highlighted in the context. 
A Non SQL databse may also be needed for this system due to some of the data having no structure. DynamoDB could be an 
option. 
**Consequences** \
We may have to learn to use 2 different databases which may increase cost. We will also have to learn about
Dynamo DB and how to setup the initial configuration. 