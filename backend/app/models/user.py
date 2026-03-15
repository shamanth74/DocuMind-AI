from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    clerk_id = Column(String, unique=True, index=True)

    email = Column(String, unique=True)

    name = Column(String)

    role = Column(String, default="member")

    created_at = Column(DateTime, default=datetime.utcnow)