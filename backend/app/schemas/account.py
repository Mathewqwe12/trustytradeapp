from pydantic import BaseModel, Field
from typing import Optional
from .base import BaseSchema

class AccountBase(BaseModel):
    """Базовая схема игрового аккаунта"""
    user_id: int
    game: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)

class AccountCreate(AccountBase):
    """Схема для создания аккаунта"""
    pass

class AccountUpdate(BaseModel):
    """Схема для обновления аккаунта"""
    game: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)

class AccountInDB(AccountBase, BaseSchema):
    """Схема аккаунта в БД"""
    pass

class Account(AccountInDB):
    """Схема для ответа API"""
    pass 