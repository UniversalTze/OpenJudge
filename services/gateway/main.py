from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from config import config
from middleware import authorise_request, process_time, rate_limit_middleware

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


# Health check endpoints
@app.get("/health")
async def health_check():
    return "API Gateway operational"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
