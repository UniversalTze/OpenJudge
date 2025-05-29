from fastapi import FastAPI

app = FastAPI(
    title="OpenJudge API Gateway"
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)