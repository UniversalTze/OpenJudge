from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
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

# Process time, rate limiting, and authorization middleware
# app.middleware("http")(process_time)
# app.middleware("http")(rate_limit_middleware)
# app.middleware("http")(authorise_request)

# # Security middleware
# app.add_middleware(
#     CORSMiddleware,
#     # allow_origins=["*"] if config.ENV == "local" else [config.FRONTEND_URL, config.GATEWAY_LB_DNS],
#     allow_origins=["*"],    allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# TODO - ADD BACK IN HTTPS WHEN IMPLEMENTED
# if config.ENV != "local":
#     app.add_middleware(TrustedHostMiddleware, 
#                        allowed_hosts=[config.FRONTEND_URL,
#                                       config.GATEWAY_LB_DNS, 
#                                       "172.31.*"])
#     app.add_middleware(HTTPSRedirectMiddleware)

# Health check endpoints
@app.get("/health")
async def health_check():
    print("Received health check get request")
    return Response(status_code=200, content="API Gateway operational")


@app.get("/status")
async def status_check(request: Request):
    client = request.app.state.http_client
    
    response = {
        "auth_service": "unknown",
        "problems_service": "unknown",
        "submission_service": "unknown",
    }
    
    try:
        r = await client.get(f"{config.AUTH_SERVICE_URL}/health")
        if r.status_code != 200:
            response["auth_service"] = "unavailable"
        else:
            response["auth_service"] = "operational"
    except Exception as e:
        response["auth_service"] = "unavailable"
    try:
        r = await client.get(
            f"{config.PROBLEMS_SERVICE_URL}/health"
        )
        if r.status_code != 200:
            response["problems_service"] = "unavailable"
        else:
            response["problems_service"] = "operational"
    except:
        response["problems_service"] = "unavailable"
    try:
        r = await client.get(
            f"{config.SUBMISSION_SERVICE_URL}/health"
        )
        if r.status_code != 200:
            response["submission_service"] = "unavailable"
        else:
            response["submission_service"] = "operational"
    except:
        response["submission_service"] = "unavailable"

    if (
        response["auth_service"] == "operational"
        and response["problems_service"] == "operational"
        and response["submission_service"] == "operational"
    ):
        return JSONResponse(content=response, status_code=200)
    else:
        return JSONResponse(content=response, status_code=503)


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
@app.get("/problems/{id}")
async def get_problem_details(request: Request, id: str):
    client = request.app.state.http_client
    target_url = f"{config.PROBLEMS_SERVICE_URL}/problems/{id}"
    return await forward_request(request, target_url, client)


@app.get("/problems")
async def list_problems(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.PROBLEMS_SERVICE_URL}/problems"
    return await forward_request(request, target_url, client)


# Submission endpoints
@app.post("/submission")
async def submit_code_for_problem(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submission"
    return await forward_request(request, target_url, client)


@app.get("/submission/{id}")
async def get_submission_details(request: Request, id: str):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submission/{id}"
    return await forward_request(request, target_url, client)


@app.get("/submission")
async def list_user_submissions(request: Request):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submission/history/{request.state.user}"
    return await forward_request(request, target_url, client)

@app.get("/submission/ai/{id}")
async def get_ai_submission_details(request: Request, id: str):
    client = request.app.state.http_client
    target_url = f"{config.SUBMISSION_SERVICE_URL}/submission/ai/{id}"
    return await forward_request(request, target_url, client)