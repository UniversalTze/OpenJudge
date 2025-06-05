from fastapi import FastAPI, Request
from problems.src.application import healthrouter, problemrouter


app = FastAPI()

app.include_router(healthrouter)
app.include_router(problemrouter)

