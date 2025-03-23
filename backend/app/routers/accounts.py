from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database.config import get_db
from ..models.account import Account
from ..schemas.account import AccountCreate, AccountUpdate, Account as AccountSchema

router = APIRouter()

@router.post("/accounts/", response_model=AccountSchema)
async def create_account(account: AccountCreate, db: AsyncSession = Depends(get_db)):
    """Создание нового аккаунта"""
    # Проверяем существование пользователя
    from ..models.user import User
    query = select(User).where(User.id == account.user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_account = Account(
        user_id=account.user_id,
        game=account.game,
        description=account.description,
        price=account.price
    )
    db.add(db_account)
    await db.commit()
    await db.refresh(db_account)
    return db_account

@router.get("/accounts/", response_model=List[AccountSchema])
async def read_accounts(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """Получение списка аккаунтов"""
    query = select(Account).offset(skip).limit(limit)
    result = await db.execute(query)
    accounts = result.scalars().all()
    return accounts

@router.get("/accounts/{account_id}", response_model=AccountSchema)
async def read_account(account_id: int, db: AsyncSession = Depends(get_db)):
    """Получение информации об аккаунте по ID"""
    query = select(Account).where(Account.id == account_id)
    result = await db.execute(query)
    account = result.scalar_one_or_none()
    
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.get("/accounts/user/{user_id}", response_model=List[AccountSchema])
async def read_user_accounts(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получение списка аккаунтов пользователя"""
    query = select(Account).where(Account.user_id == user_id)
    result = await db.execute(query)
    accounts = result.scalars().all()
    return accounts

@router.put("/accounts/{account_id}", response_model=AccountSchema)
async def update_account(account_id: int, account: AccountUpdate, db: AsyncSession = Depends(get_db)):
    """Обновление информации об аккаунте"""
    query = select(Account).where(Account.id == account_id)
    result = await db.execute(query)
    db_account = result.scalar_one_or_none()
    
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Обновляем только предоставленные поля
    for field, value in account.dict(exclude_unset=True).items():
        setattr(db_account, field, value)
    
    await db.commit()
    await db.refresh(db_account)
    return db_account

@router.delete("/accounts/{account_id}")
async def delete_account(account_id: int, db: AsyncSession = Depends(get_db)):
    """Удаление аккаунта"""
    query = select(Account).where(Account.id == account_id)
    result = await db.execute(query)
    account = result.scalar_one_or_none()
    
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    await db.delete(account)
    await db.commit()
    return {"ok": True} 