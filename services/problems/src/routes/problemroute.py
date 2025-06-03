import logging
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from problems.src.models import crud, get_db, schemas

problemrouter = APIRouter()
# problem_logs = logging.getLogger("app.requests")

@problemrouter.get('/problems/{question_id}')
async def get_lab_results(question_id: str,
                    request: Request = None, 
                    db:AsyncSession = Depends(get_db)):
    #check lab id (required) found in path
    # request_logs.info(f"Begin get request for lab results at {utils.get_time()}")
    if question_id is None:
        # create error reponse (query malformed missing lab id)
        error = {"error": "Question is not provided.", 
                "detail": "Question id must be provided in the url"}
        return JSONResponse(status_code=400, content=error)
    prob = await crud.get_problem(db, question_id)
    if prob is None: 
        # (Error Response) Lab id not found in db. 
        error = {"error": "Problem ID not found.", 
                "detail": "Problem ID was not found in the Database."}
        return JSONResponse(status_code=404, content=error)

    # Send result later
    result = schemas.Problem_Response(
        problem_id=prob.problem_id,
        problem_title=prob.problem_title,
        difficulty=prob.difficulty,
        topics=prob.topics,
        description=prob.description,
        examples=prob.examples,
        constraints= prob.constraints,
        test_cases=prob.test_cases,
        hint=prob.hint,
        created_at=prob.created_at.isoformat(timespec='seconds'))
    return JSONResponse(status_code=200, content=result.dict()) 