import logging
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from models import crud
from models import get_db

problemRouter = APIRouter()
# problem_logs = logging.getLogger("app.requests")

@problemRouter.get('/problem/{lab_id}')
async def get_lab_results(lab_id: str,
                    request: Request = None, 
                    db:AsyncSession = Depends(get_db)):
    #check lab id (required) found in path
    # request_logs.info(f"Begin get request for lab results at {utils.get_time()}")
    if lab_id is None:
        # create error reponse (query malformed missing lab id)
        return JSONResponse(status_code=400)
    prob = await crud.get_problem(lab_id)
    if prob is None: 
        # (Error Response) Lab id not found in db. 
        return JSONResponse(status_code=404)

    # Send result later
    return JSONResponse(status_code=200) 