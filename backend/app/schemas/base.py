from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    """Базовая схема для всех моделей"""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 