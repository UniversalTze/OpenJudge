from fastapi import FastAPI, Request
from problems import healthrouter, problemrouter


app = FastAPI()

app.include_router(healthrouter, prefix="/api/v1")
app.include_router(problemrouter, prefix="/api/v1")

