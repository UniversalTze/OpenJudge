# Authentication Service

This service provides secure authentication functionality for users signing in to OpenJudge. It 
exposes endpoints through an API Gateway and uses industry best practices including JWTs, 
email-based multi-factor authentication (MFA), rate-limitng, argon2 hashing, etc.

## Technologies

**Language:** Go </br>
**Database:** PostgreSQL (deployed on the compatible AWS RDS infra) </br>
**Cache/Session Store:** Redis (deployed on the compatible AWS ElastiCache infra) </br>
**Authentication Method:** JWTs </br>
**Email Service:** ...?

## Access URL

The service is accessible via the API Gateway `api.openjudge.com`. The base path for this service is 
`/auth`.

## Getting Started

TODO: Write documentation on how to run the service locally and how to deploy
ASSIGNED TO: Ben

## Documentation

### POST `/register` 

**Description:** Registers a new user </br></br>
**Request Headers:** 
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```
**Request Body:** 
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```
**Response:** 201 Created </br></br>
**Response Body:** 
```json
null
```
**Notes:** A new user will be created with the given information. The password will be checked to 
ensure it meets the complexity requirements, and cross-referenced with the haveIBeenPwned database. 
The password will be hashed using Argon2 before being stored in the database. 
</br> </br> 
A verification link will be created and an email will be sent to the user's email address. A flag 
will remain in the database to indicate that the user's email is not verified. </br>

**Errors:**
| Error Code | Description |
| --- | --- |
| 400 | Bad request. Invalid request body. |
| 500 | Internal server error. |


### POST `/login` 

**Description:** Logs in a user </br></br>
...

### POST `/verify` 

**Description:** Used to verify a user's email address </br></br>
...

### POST `/refresh` 

**Description:** Used to refresh a user's JWT </br></br>
...

### DELETE `/logout` 

**Description:** Used to log out a user </br></br>
...

### POST `/forgot` 

**Description:** Used to send a password reset email </br></br>
...

### POST `/reset` 

**Description:** Used to reset a user's password </br></br>
...

### GET `/user`

**Description:** Used to get a user's information </br></br>
...

### PUT `/user`

**Description:** Used to update a user's information </br></br>
...

### DELETE `/user`

**Description:** Used to delete a user's account </br></br>
...

### POST `/user/avatar`

**Description:** Used to upload a user's avatar </br></br>
...

### DELETE `/user/avatar`

**Description:** Used to delete a user's avatar </br></br>
...