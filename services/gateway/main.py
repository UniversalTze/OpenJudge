from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from config import config
import httpx
import json
from middleware import authorise_request, process_time, rate_limit_middleware

AUTH_SERVICE_BASE_URL = config.AUTH_SERVICE_URL 
PROBLEM_SERVICE_BASE_URL = config.PROBLEM_SERVICE_URL 
SUBMISSION_SERVICE_BASE_URL = config.SUBMISSION_SERVICE_URL 

app = FastAPI(title="OpenJudge API Gateway")

# Security middleware
if config.ENV != "local":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[config.FRONTEND_URL],  # TODO: May need to add object storage URL
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

@app.on_event("startup")
async def startup_event():
    app.state.http_client = httpx.AsyncClient()

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.http_client.aclose()

async def forward_request(request: Request, target_url: str, client: httpx.AsyncClient):
    """
    Function to forward an HTTP request to a target URL
    """
    headers_to_forward = {
        k: v for k, v in request.headers.items()
        if k.lower() not in ['host', 'connection', 'transfer-encoding', 'content-length', 'user-agent']
    }
    headers_to_forward['user-agent'] = 'OpenJudgeAPIGateway/0.1'

    if 'content-type' in request.headers:
        headers_to_forward['content-type'] = request.headers['content-type']

    body = await request.body()

    try:
        rp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers_to_forward,
            params=request.query_params,
            content=body,
            timeout=30.0
        )

        response_headers = dict(rp.headers)
        response_headers.pop("transfer-encoding", None)
        response_headers.pop("content-encoding", None)

        return Response(
            content=rp.content,
            status_code=rp.status_code,
            headers=response_headers
        )
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail=f"Request to {target_url} timed out.")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Could not connect to {target_url}.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while contacting service at {target_url}.")


# Health check endpoints
@app.get("/health")
async def health_check():
    return "API Gateway operational"

@app.post("/auth/register")
async def register_user(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/register"
    return await forward_request(request, target_url, client)

@app.post("/auth/login")
async def login_user(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/login"
    return await forward_request(request, target_url, client)

@app.get("/auth/verify")
async def verify_email(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/verify"
    return await forward_request(request, target_url, client)

@app.post("/auth/refresh")
async def refresh_token(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/refresh"
    return await forward_request(request, target_url, client)

@app.post("/auth/forgot")
async def forgot_password(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/forgot"
    return await forward_request(request, target_url, client)

@app.post("/auth/reset")
async def reset_password(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/reset"
    return await forward_request(request, target_url, client)

@app.get("/auth/user")
async def get_user_info(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/user"
    return await forward_request(request, target_url, client)

@app.put("/auth/user")
async def update_user_info(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/user"
    return await forward_request(request, target_url, client)

@app.delete("/auth/user")
async def delete_user_account(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/user"
    return await forward_request(request, target_url, client)

@app.post("/auth/user/avatar")
async def upload_user_avatar(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/user/avatar"
    return await forward_request(request, target_url, client)

@app.delete("/auth/user/avatar")
async def delete_user_avatar(request: Request):
    client = request.app.state.http_client
    target_url = f"{AUTH_SERVICE_BASE_URL}/user/avatar"
    return await forward_request(request, target_url, client)

#PROBLEM ENDPOINTS
@app.get("/problems/problem/{lab_id}")
async def get_problem_details(request: Request, lab_id: str):
    client = request.app.state.http_client
    target_url = f"{PROBLEM_SERVICE_BASE_URL}/problem/{lab_id}"
    return await forward_request(request, target_url, client)

@app.get("/problems/health")
async def get_problems_service_health(request: Request):
    client = request.app.state.http_client
    target_url = f"{PROBLEM_SERVICE_BASE_URL}/health"
    return await forward_request(request, target_url, client)

#SUBMISSION ENDPOINTS
@app.post("/submissions/submit/{user_id}/{problem_id}/{language}")
async def submit_code_for_problem(request: Request, user_id: str, problem_id: str, language: str):
    client = request.app.state.http_client
    target_url = f"{SUBMISSION_SERVICE_BASE_URL}/submit/{user_id}/{problem_id}/{language}"
    return await forward_request(request, target_url, client)

@app.get("/submissions/{submission_id}")
async def get_submission_details(request: Request, submission_id: int):
    client = request.app.state.http_client
    target_url = f"{SUBMISSION_SERVICE_BASE_URL}/submissions/{submission_id}"
    return await forward_request(request, target_url, client)

@app.get("/submissions/health")
async def get_submission_service_health(request: Request):
    client = request.app.state.http_client
    target_url = f"{SUBMISSION_SERVICE_BASE_URL}/health"
    return await forward_request(request, target_url, client)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
