from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware, TrustedHostMiddleware, HTTPSRedirectMiddleware
from config import config
from middleware import authorise_request, process_time


app = FastAPI(title="OpenJudge API Gateway")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        config.FRONTEND_URL,
        config.AUTH_SERVICE_URL,
        config.SUBMISSION_SERVICE_URL,
        config.PROBLEM_SERVICE_URL,
    ], # May need to add object storage URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Host header validation
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=[config.FRONTEND_URL]
)

# Add HTTPS redirect middleware if not in development
if config.ENV != "development":
    app.add_middleware(HTTPSRedirectMiddleware)

app.middleware("http", process_time)
app.middleware("http", authorise_request)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
