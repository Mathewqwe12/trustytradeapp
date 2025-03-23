from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .base import BaseModel

class Account(BaseModel):
    """Модель игрового аккаунта"""
    __tablename__ = "accounts"

    user_id = Column(Integer, ForeignKey("users.id"))
    game = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    is_available = Column(Boolean, default=True)

    # Связи с другими таблицами
    owner = relationship("User", back_populates="accounts")
    deals = relationship("Deal", back_populates="account") 