import hashlib
import hmac
import time
from typing import Dict
from fastapi import HTTPException, Request
from dotenv import load_dotenv
import os
from ..config import settings
from jose import jwt

# Загружаем переменные окружения
load_dotenv()

# Получаем токен бота из переменных окружения
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN not set in environment variables")

def verify_telegram_data(data: Dict) -> bool:
    """
    Проверяет данные авторизации от Telegram
    
    Args:
        data: Словарь с данными от Telegram Web App
        
    Returns:
        bool: True если данные верны, иначе False
    """
    if not all(key in data for key in ["hash", "auth_date"]):
        return False
    
    # Проверяем актуальность данных (не старше 24 часов)
    auth_date = int(data["auth_date"])
    if time.time() - auth_date > 86400:
        return False
    
    # Получаем хеш от Telegram
    received_hash = data.pop("hash")
    
    # Создаем строку для проверки
    check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    
    # Создаем secret key из токена бота
    secret = hashlib.sha256(BOT_TOKEN.encode()).digest()
    
    # Вычисляем хеш
    computed_hash = hmac.new(
        secret,
        check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return computed_hash == received_hash

async def verify_telegram_auth(request: Request):
    """
    Middleware для проверки Telegram авторизации
    
    Args:
        request: FastAPI Request объект
        
    Raises:
        HTTPException: если авторизация не прошла
    """
    # В режиме разработки пропускаем проверку
    if settings.ENV == "development":
        return
    
    # Пропускаем некоторые эндпоинты без авторизации
    if request.url.path in ["/", "/docs", "/redoc", "/openapi.json"]:
        return
    
    # Получаем данные авторизации из заголовка
    auth_data = request.headers.get("X-Telegram-Auth-Data")
    if not auth_data:
        raise HTTPException(
            status_code=401,
            detail="No Telegram authentication data provided"
        )
    
    try:
        # Парсим данные
        import json
        data = json.loads(auth_data)
        
        # Проверяем данные
        if not verify_telegram_data(data):
            raise HTTPException(
                status_code=401,
                detail="Invalid Telegram authentication data"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication error: {str(e)}"
        ) 