# Authentication Service

This service provides secure authentication functionality for users signing in to OpenJudge. It
exposes endpoints through an API Gateway and uses industry best practices including JWTs,
email-based multi-factor authentication (MFA), rate-limitng, argon2 hashing, etc.

## Technologies

**Language:** Go </br> **Database:** PostgreSQL (deployed on the compatible AWS RDS infra) using
GORM </br> **Cache/Session Store:** Redis (deployed on the compatible AWS ElastiCache infra) </br>
**Authentication Method:** JWTs </br> 

## Getting Started

Run the service from root using the following command.

```
task run:auth
```

Test the service from root using the following command.

```
task test:auth
```

## Documentation

### POST `/register`

**Description:** Registers a new user </br></br> **Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "skill": "string",
  "email": "string",
  "password": "string"
}
```

**Notes:** A new user will be created with the given information. The password will be checked to
ensure it meets the complexity requirements, and cross-referenced with the haveIBeenPwned database.
The password will be hashed using Argon2 before being stored in the database. </br> </br> A
verification link will be created and an email will be sent to the user's email address. A flag will
remain in the database to indicate that the user's email is not verified. </br>

**Responses:**
| Status | Description |
| --- | --- |
| 201 | User registered successfully |
| 400 | Bad request. Invalid request body |
| 500 | Internal server error |

### POST `/login`

**Description:** Logs in a user </br></br> **Request Headers:**

```http
Content-Type: application/json
Accept: application/json
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

 **Response Body:**

```json
{
  "accessToken": "string"
}
```

**Notes:** On successful login, an access token and a refresh token are returned. The access token
is a JWT used for authenticating requests. The refresh token is an HTTP-only cookie used to refresh
the access token.

**Responses:**
| Status | Description |
| --- | --- |
| 200 | Login successful |
| 400 | Bad request. Invalid request body |
| 401 | Unauthorized. Invalid email or password |
| 500 | Internal server error. |

### POST `/verify`

**Description:** Verifies a user's email address using a token. <br/><br/> **Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "string"
}
```

**Responses:**
| Status | Description |
| --- | --- |
| 200 | Email verified successfully |
| 400 | Invalid or expired link |
| 500 | Internal server error |

### POST `/refresh`

**Description:** Refreshes a user's JWT using the refresh token cookie. <br/><br/> **Request Headers:**

```http
Accept: application/json
```

**Response Body:**

```json
{
  "accessToken": "string"
}
```

**Notes:** A new `refreshToken` is set as an HTTP-only cookie.

**Responses:**
| Status | Description |
| --- | --- |
| 200 | Token refreshed successfully |
| 400 | Bad request. Invalid request body |
| 401 | Refresh token not found or invalid |
| 500 | Internal server error |

### POST `/forgot`

**Description:** Sends a password reset email. <br/><br/> **Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "string"
}
```

**Responses:**
| Status | Description |
| --- | --- |
| 200 | Password reset email sent |
| 400 | Invalid request body, missing fields, or user not found |
| 500 | Internal server error |

### POST `/reset`

**Description:** Resets a user's password using a reset token. <br/><br/> **Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "string",
  "password": "string"
}
```

**Response:** 200 OK  

**Responses:**
| Status | Description |
| --- | --- |
| 200 | Password reset successfully |
| 400 | Invalid or expired link, weak or breached password |
| 500 | Internal server error |

### GET `/user`

**Description:** Gets the authenticated user's information. <br/><br/> **Request Headers:**

```http
Accept: application/json
Authorization: Bearer <accessToken>
```

**Response Body:**

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "skill": "string",
  "verified": true
}
```

**Responses:**
| Status | Description |
| --- | --- |
| 200 | User information retrieved successfully |
| 401 | Invalid or missing access token |
| 404 | User not found |
| 500 | Internal server error |

### PUT `/user`

**Description:** Updates the authenticated user's information. <br/><br/> **Request Headers:**

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**

```json
{
  "email": "string (optional)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```
**Notes:** At least one field is required. If the email is changed, a new verification email is sent and the user is marked as unverified.

**Responses:**
| Status | Description |
| --- | --- |
| 200 | User updated successfully |
| 400 | Invalid request body, no fields to update, or email already in use |
| 401 | Invalid or missing access token |
| 404 | User not found |
| 500 | Internal server error |

### DELETE `/user`

**Description:** Deletes the authenticated user's account. <br/><br/> **Request Headers:**

```http
Authorization: Bearer <accessToken>
```
**Responses:**
| Status | Description |
| --- | --- |
| 204 | User deleted successfully |
| 401 | Invalid or missing access token |
| 404 | User not found |
| 500 | Internal server error |