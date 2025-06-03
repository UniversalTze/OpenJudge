# Run migrations into the DB. Curl request to leet code for their question bank and add it to DB. 

import json, logging, asyncio, asyncpg, os
from .database import engine, AsyncSessionLocal, Base
from .dbmodels import Problems 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

FILE_PATH = "problems/src/models/problems.json"

async def init_db():
    await wait_for_db(max_retries=10, delay=5)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db: 
        await seed_from_json(FILE_PATH, db)

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
    logger = logging.getLogger("Connected to DB")
    with open(FILE_PATH, "r", encoding="utf-8") as file:
        prob_set = json.load(file)
        for problem in prob_set:
            result = await db.execute(
                select(Problems).where(Problems.problem_id == str(problem["id"]))
            )
            existing = result.scalar_one_or_none()

            if existing: 
                logger.info(f"{problem['title']} already exists in DB. Skipping...")
                continue

            question = Problems(
                problem_id = problem["id"],
                problem_title = problem["title"],
                difficulty = problem["difficulty"],
                topics = problem["tags"],
                description=problem["description"],
                examples = json.dumps(problem["examples"]),
                constraints = problem["constraints"],
                test_cases = json.dumps(problem["testCases"]),
                hint = problem["solutionHint"])
            logger.info(f"Adding {problem["title"]} to DB")
            db.add(question)
            await db.commit()
            await db.refresh(question)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())