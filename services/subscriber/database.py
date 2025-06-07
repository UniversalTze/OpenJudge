from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config import config

async def connect_db() -> AsyncSession:
    engine = create_async_engine(config.SUBMISSION_DATABASE_URL, echo=False, future=True, pool_size=2, max_overflow=0)
    async_session = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
    return async_session()