from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from config import config
import httpx
from middleware import authorise_request, process_time, rate_limit_middleware
from contextlib import asynccontextmanager
from forward import forward_request
import redis.asyncio as redis
import jwt


# Lifespan event to manage HTTP client
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient()
    pool = redis.ConnectionPool.from_url(
        config.REDIS_URL,
        max_connections=10,
        decode_responses=True,
    )
    app.state.redis_client = redis.Redis.from_pool(pool)
    yield
    await app.state.http_client.aclose()
    await app.state.redis_client.aclose()


app = FastAPI(title="OpenJudge API Gateway", lifespan=lifespan)

# Security middleware
if config.ENV != "local":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[config.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=[config.FRONTEND_URL])
    app.add_middleware(HTTPSRedirectMiddleware)

# Process time, rate limiting, and authorization middleware
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(process_time)
app.middleware("http")(authorise_request)


# Health check endpoints
@app.get("/health")
async def health_check():
    return "API Gateway operational"


@app.get("/status")
async def status_check(request: Request):
    client = request.app.state.http_client
    auth_response = await client.get(f"{config.AUTH_SERVICE_URL}/health")
    problem_response = await client.get(f"{config.PROBLEM_SERVICE_URL}/health")
    submission_response = await client.get(
        f"{config.SUBMISSION_SERVICE_URL}/health"
    )
    return {
        "auth_service": auth_response.json(),
        "problem_service": problem_response.json(),
        "submission_service": submission_response.json(),
    }


# Authentication endpoints
@app.post("/register")
async def register_user(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/register"
    return await forward_request(request, target_url, client)


@app.post("/login")
async def login_user(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/login"
    return await forward_request(request, target_url, client)


@app.post("/verify")
async def verify_email(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/verify"
    return await forward_request(request, target_url, client)


@app.post("/refresh")
async def refresh_token(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/refresh"
    return await forward_request(request, target_url, client)


@app.post("/forgot")
async def forgot_password(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/forgot"
    return await forward_request(request, target_url, client)


@app.post("/reset")
async def reset_password(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/reset"
    return await forward_request(request, target_url, client)


@app.get("/user")
async def get_user_info(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/user"
    return await forward_request(request, target_url, client)


@app.put("/user")
async def update_user_info(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/user"
    return await forward_request(request, target_url, client)


@app.delete("/user")
async def delete_user_account(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.AUTH_SERVICE_URL}/user"
    return await forward_request(request, target_url, client)


@app.get("/logout")
async def logout_user(request: Request):
    redis = request.app.state.redis_client
    accessToken = request.headers.get("Authorization")
    if accessToken and accessToken.startswith("Bearer "):
        accessToken = accessToken.split(" ")[1]
        try:
            payload = jwt.decode(
                accessToken, config.JWT_PUBLIC_KEY, algorithms=["EdDSA"]
            )
            jti = payload.get("jti")
            if jti:
                await redis.set(f"revoked:{jti}", "true", ex=3600)
        except Exception as e:
            pass
    refreshToken = request.cookies.get("refreshToken")
    if refreshToken:
        try:
            payload = jwt.decode(
                refreshToken, config.JWT_PUBLIC_KEY, algorithms=["EdDSA"]
            )
            jti = payload.get("jti")
            if jti:
                await redis.set(f"revoked:{jti}", "true", ex=2592000)
        except Exception as e:
            pass
    return Response(
        content="Logged out successfully",
        status_code=200,
        headers={
            "Set-Cookie": "refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
        }
    )


# Problem endpoints
@app.get("/problems?id={id}")
async def get_problem_details(request: Request, id: int):
    client = request.app.state.http_client
    target_url = f"{config.PROBLEM_SERVICE_URL}/problems?id={id}"
    return await forward_request(request, target_url, client)


@app.get("/problems")
async def list_problems(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.PROBLEM_SERVICE_URL}/problems"
    return await forward_request(request, target_url, client)


# Submission endpoints
@app.post("/submissions")
async def submit_code_for_problem(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submissions"
    return await forward_request(request, target_url, client)


@app.get("/submissions?id={id}")
async def get_submission_details(request: Request, id: int):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submissions?id={id}"
    return await forward_request(request, target_url, client)


@app.get("/submissions")
async def list_user_submissions(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submissions"
    return await forward_request(request, target_url, client)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
