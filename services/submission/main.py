from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi import Depends, HTTPException
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
        if not code or code == "":
            raise HTTPException(status_code=400, detail="Please provide or edit the stub before submitting")
        
        if not all([user_id, problem_id, language, code]):
            raise HTTPException(status_code=400, detail="Missing required parameters")
        
        if language not in ["python", "java"]:
            raise HTTPException(status_code=400, detail="Unsupported language")
    
        try:
            clean_code(code, language)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Code validation failed: {str(e)}")
        
        client = request.app.state.http_client
        response = await client.get(f"{config.PROBLEMS_SERVICE_URL}/problems/{problem_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Problems service error")
        problem = response.json()
        
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        tests = json.loads(problem["test_cases"])
        inputs = [test["input"] for test in tests]
        outputs = [json.dumps(test["output"]) for test in tests]

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

        send(
            submission_id=str(submission.submission_id),
            submission_code=code,
            inputs=inputs,
            outputs=outputs,
            function_name=problem["function_name"],
            queue=language,
            client=request.app.state.celery
        )

        return JSONResponse(status_code=201, content={"submission_id": str(submission.submission_id), "status": "pending"})

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Error] Submission failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/submission/{submission_id}")
async def get_submission(submission_id: str, session: AsyncSession = Depends(get_session)):
    if not submission_id:
        raise HTTPException(status_code=400, detail="Submission ID is required")
    
    try:
        stmt = select(Submission).filter_by(submission_id=submission_id)
        result = await session.execute(stmt)
        submission = result.scalar_one_or_none()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        if submission.results and len(submission.results) == submission.num_tests and submission.status == "pending":
            submission.status = "passed" if all(result["passed"] for result in submission.results) else "failed"

        await session.commit()
        return submission
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

@app.get("/submission/history/{user_id}")
async def get_submission_history(user_id: str, session: AsyncSession = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    try:
        stmt = select(Submission).filter_by(user_id=user_id).order_by(Submission.created_at.desc())
        result = await session.execute(stmt)
        submissions = result.scalars().all()
        
        for submission in submissions:
            if submission.results and len(submission.results) == submission.num_tests and submission.status == "pending":
                submission.status = "passed" if all(result["passed"] for result in submission.results) else "failed"
        
        await session.commit()
    except Exception as e:
        print(f"[Error] Failed to retrieve submissions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found for this user")

    return [submission.to_dict() for submission in submissions]

@app.get("/submission/ai/{submission_id}")
async def get_submission_ai(submission_id: str, session: AsyncSession = Depends(get_session)):
    if not submission_id:
        raise HTTPException(status_code=400, detail="Submission ID is required")

    try:
        stmt = select(Submission).filter_by(submission_id=submission_id)
        result = await session.execute(stmt)
        submission = result.scalar_one_or_none()
    except Exception as e:
        print(f"[Error] Failed to retrieve submission: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission.results and len(submission.results) == submission.num_tests and submission.status == "pending":
        submission.status = "passed" if all(result["passed"] for result in submission.results) else "failed"

    if submission.status == "pending":
        raise HTTPException(status_code=400, detail="Submission is still being processed")

    if submission.status == "success":
        raise HTTPException(status_code=400, detail="Submission correct")

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
        raise HTTPException(status_code=502, detail="AI feedback service error")
