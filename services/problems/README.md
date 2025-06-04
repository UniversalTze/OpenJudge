# Problems Service

This service is an API service that manages a structured set of coding problems, including metadata like difficulty, title, difficulty, 
topics, description, examples, constraints, test cases, hint and the date when the problems were created. It uses a relational database in 
PostgreSQL to store and retrieve problems. 

**Note**: Problems stored in the databases are language agnostic. (Tailored that all problems can be solved with programming languages user selects). 

## Technologies

**Language:** Python. (FastAPI framwework) </br> 
**Database:** PostgreSQL (deployed on AWS RDS) </br>

## Built in Python: FastAPI

## Additional Notes
- Either store the problems in DB (associated with an id or within a category and then a number then)

### Getting Started
- In the Postgress db, it will store an id that will generate the problem environment.
- Need to get the questions into DB somehow. 
- Using uv and fastapi with uvicorn

### Documentation
(Change what is below)
Initial API: 
- Assume front end will decide a language so no need to worry about that. 
- Recommendation service -> Library to do a fuzzle search. 
- Get end point for that. 
- Post end point for addind problems to it. 
- Auth header and how it validates it for a particular session


ASSIGNED TO: Tze Kheng Goh
