from fastapi import FastAPI

app = FastAPI(
    title="Code Execution Service",
    description="API for executing code submissions and returning results.",
    version="1.0.0",
)

@app.get(
    "/",
    summary="Root Endpoint",
    description="This endpoint returns a welcome message to indicate the API is running.",
    response_description="A JSON object containing a welcome message."
)
def read_root():
    return {"message": "Hello, FastAPI!"}
