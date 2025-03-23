from sqlalchemy.ext.asyncio import AsyncSession
from ..models.account import Account

async def seed_accounts(db: AsyncSession):
    """Заполняем базу тестовыми аккаунтами"""
    test_accounts = [
        Account(
            user_id=1,
            game="Dota 2",
            description="Immortal rank, 6000 MMR, все герои открыты",
            price=15000
        ),
        Account(
            user_id=1,
            game="CS:GO",
            description="Global Elite, инвентарь на 50к",
            price=25000
        ),
        Account(
            user_id=2,
            game="World of Warcraft",
            description="70 level, полная экипировка",
            price=8000
        ),
        Account(
            user_id=2,
            game="Genshin Impact",
            description="AR 60, все персонажи 90 уровня",
            price=45000
        ),
        Account(
            user_id=1,
            game="PUBG",
            description="Топ 100 игрок, редкие скины",
            price=12000
        )
    ]

    for account in test_accounts:
        db.add(account)
    
    await db.commit() 