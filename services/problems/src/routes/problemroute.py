from fastapi import APIRouter, Request, Depends
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from problems.src.models import crud, get_db, schemas

problemrouter = APIRouter()


@problemrouter.get("/problems/{id}") 
async def get_problem(id: str, db: AsyncSession = Depends(get_db)):
    prob = await crud.get_problem(db, id)
    if prob is None:
        return PlainTextResponse(status_code=404, content="Problem not found.")
    
    result = schemas.Problem_Response(
        problem_id=prob.problem_id,
        problem_title=prob.problem_title,
        difficulty=prob.difficulty,
        topics=prob.topics,
        description=prob.description,
        examples=prob.examples,
        constraints= prob.constraints,
        function_name=prob.function_name,
        return_type=prob.return_type,
        test_cases=prob.test_cases,
        hint=prob.hint,
        created_at=prob.created_at.isoformat(timespec='seconds'))
    return JSONResponse(status_code=200, content=result.dict()) 

@problemrouter.get("/problems")
async def get_problems(db: AsyncSession = Depends(get_db)):
    problems = await crud.get_problems(db)
    if not problems:
        return PlainTextResponse(status_code=404, content="No problems found.")
    result = [schemas.Problem_Response(
        problem_id=prob.problem_id,
        problem_title=prob.problem_title,
        difficulty=prob.difficulty,
        topics=prob.topics,
        description=prob.description,
        examples=prob.examples,
        constraints= prob.constraints,
        function_name=prob.function_name,
        return_type=prob.return_type,
        test_cases=prob.test_cases,
        hint=prob.hint,
        created_at=prob.created_at.isoformat(timespec='seconds')) for prob in problems]
    return JSONResponse(content=[r.dict() for r in result], status_code=200)