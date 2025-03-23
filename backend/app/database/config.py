from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# Загружаем переменные окружения
load_dotenv()

# Создаем директорию для базы данных если её нет
DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_DIR.mkdir(exist_ok=True)

# URL для подключения к БД
DATABASE_URL = f"sqlite+aiosqlite:///{DB_DIR}/trustytrade.db"

# Создаем асинхронный движок SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False}  # Нужно для SQLite
)

# Создаем фабрику асинхронных сессий
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncSession:
    """Функция-генератор для получения асинхронной сессии БД"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 