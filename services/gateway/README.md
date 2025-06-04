# API Gateway Service

The API gateway acts as a proxy for the frontend requests and provides a number of security 
middleware such as rate limiting, CORS and XSS protection etc.

## Getting Started

Run the service from root using the following command.

```
task run:gateway
```

Test the service from root using the following command.

```
task test:gateway
```

## Documentation

The API Gateway is built with FastAPI, using Redis for a token revocation list and window rate 
limiter.The API Gateway follows the same endpoints/structure as the underlying services. The only new
endpoint is /logout.

### POST `/logout`

**Description:** Logs out a user </br></br> **Request Headers:**

```http
Authorization: Bearer <accessToken>
```

**Notes:** Adds the refresh token and access token to the TRL.

**Responses:**
| Status | Description |
| --- | --- |
| 200 | User logged out successfully |
| 500 | Internal server error |