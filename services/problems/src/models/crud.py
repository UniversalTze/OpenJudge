# DB operations

from sqlalchemy.ext.asyncio import AsyncSession
from . import dbmodels
from sqlalchemy import select

async def get_problem(db:AsyncSession, request: str): #should only be one entry of as request is id whihc is primary key
    stmt = select(dbmodels.Problems).filter(dbmodels.Problems.problem_id == request)
    result = await db.execute(stmt)
    return result.scalars().one_or_none()