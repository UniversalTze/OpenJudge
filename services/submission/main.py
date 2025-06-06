from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from config import config
import httpx
import json
from contextlib import asynccontextmanager
from database import create_tables, get_session
from q import celery_client, send
from validation import clean_code
from models import Submission
from groq import AsyncGroq
from feedback import get_ai_feedback

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    app.state.http_client = httpx.AsyncClient()
    app.state.celery = celery_client
    app.state.groq = AsyncGroq(api_key=config.GROQ_API_KEY)
    yield
    await app.state.http_client.aclose()

app = FastAPI(title="OpenJudge API Gateway", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return "Submissions service operational"

@app.post("/submission")
async def submit_code(request: Request, session: AsyncSession = Depends(get_session)):
    try:
        data = await request.json()
        user_id = data.get("user_id")
        problem_id = data.get("problem_id")
        language = data.get("language", "").lower()
        code = data.get("code", "")
        
        if not all([user_id, problem_id, language, code]):
            return "Missing required parameters", 400
        
        if language not in ["python", "java"]:
            return "Unsupported language", 400

        try:
            clean_code(code, language)
        except ValueError as e:
            return f"Code validation failed: {str(e)}", 400
        
        client = request.app.state.http_client
        response = await client.get(f"{config.PROBLEMS_SERVICE_URL}/problems/{problem_id}")
        if response.status_code != 200:
            return response.text, 502
        problem = response.json()
        
        if not problem:
            return "Problem not found", 404
        
        tests = json.loads(problem["test_cases"]) 
        inputs = [test["input"] for test in tests]
        outputs = [test["output"] for test in tests]

        submission = Submission(
            user_id=user_id,
            problem_id=problem_id,
            function_name=problem["function_name"],
            language=language,
            num_tests=len(tests),
            code=code,
            results=[],
            status="pending"
        )
        session.add(submission)
        await session.commit()
        
        payload = {
            "submission_id": submission.submission_id,
            "submission_code": code,
            "inputs": inputs,
            "outputs": outputs,
            "function_name": problem["function_name"],
        }
        
        send(payload, language, request.app.state.celery)
        
        return JSONResponse(status_code=201, content={"submission_id": submission.submission_id, "status": "pending"})
    
    except Exception as e:
        print(f"[Error] Submission failed: {e}")
        return "Internal server error", 500

@app.get("/submission/{submission_id}")
async def get_submission(submission_id: str, session: AsyncSession = Depends(get_session)):
    stmt = select(Submission).filter_by(submission_id=submission_id)
    result = await session.execute(stmt)
    submission = result.scalar_one_or_none()
    
    if not submission:
        return JSONResponse(status_code=404, content={"error": "Submission not found"})
    
    return JSONResponse(content=submission.to_dict())

@app.get("/submissions/history/{user_id}")
async def get_submission_history(user_id: str, session: AsyncSession = Depends(get_session)):
    stmt = select(Submission).filter_by(user_id=user_id).order_by(Submission.created_at.desc())
    result = await session.execute(stmt)
    submissions = result.scalars().all()
    
    if not submissions:
        return "No submissions found for this user", 404

    return [submission.to_dict() for submission in submissions]

@app.get("/submissions/ai/{submission_id}")
async def get_submission_ai(submission_id: str, session: AsyncSession = Depends(get_session)):
    stmt = select(Submission).filter_by(submission_id=submission_id)
    result = await session.execute(stmt)
    submission = result.scalar_one_or_none()

    if not submission:
        return "Submission not found", 404
    
    if submission.status == "pending":
        return "Submission is still being processed", 400
    
    if submission.status == "success":
        return "Submission correct", 400

    try:
        response = await get_ai_feedback(
            submission.code,
            submission.inputs,
            submission.outputs,
            app.state.groq
        )
        return response
    except Exception as e:
        print(f"[Error] AI feedback failed: {e}")
        return JSONResponse(status_code=502, content={"error": "AI feedback service error"})