# Run migrations into the DB. Curl request to leet code for their question bank and add it to DB. 

import json, logging, asyncio, asyncpg, os
from bs4 import BeautifulSoup
# from database import engine, AsyncSessionLocal, Base
# from sqlalchemy.ext.asyncio import AsyncSession

FILE_PATH = "./problems.json"
"""



async def init_db():
    await wait_for_db(max_retries=10, delay=5)
    async with engine.begin() as conn:
        await conn.run_sync(dbmodels.Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db: 
        seed_from_json(FILE_PATH, db)

async def wait_for_db(max_retries: int, delay:int):
    con_logger = logging.getLogger("DB Connection starup")
    con_logger.setLevel(level=logging.INFO)
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    if not SQLALCHEMY_DATABASE_URI:
        raise RuntimeError("SQLALCHEMY_DATABASE_URI is not set in environment...")
    
    DB_URI = SQLALCHEMY_DATABASE_URI.replace('postgresql+asyncpg', 'postgresql')
    for attempt in range(max_retries):
        con_logger.info("Attempting to connect to Postgress")
        try:
            conn = await asyncpg.connect(DB_URI)
            await conn.close()
            con_logger.info("Database is ready after successful connection")
            return
        except Exception as e:
            con_logger.info(f"Connection attempt {attempt+1} failed: {str(e)}")
            await asyncio.sleep(delay)
    raise RuntimeError("Database connection failed after retries.")


async def seed_from_json(json_path: str, db:AsyncSession):
    with open(FILE_PATH, "r", encoding="utf-8") as file:
        prob_set = json.load(file)
        print(data)
"""

def work_out_json(file_path: str):
     with open(FILE_PATH, "r", encoding="utf-8") as file:
        prob_set = json.load(file)
        for problem in prob_set:
            prob_id = problem["id"]
            title = problem["title"]
            difficulty = problem["difficulty"]
            topics = problem["tags"]
            examples = json.dumps(problem["examples"])
            constraints = problem["constraints"]
            tests = json.dumps(problem["testCases"])
            hint = problem["solutionHint"]
            print(title)


if __name__ == "__main__":
    work_out_json(file_path=FILE_PATH)