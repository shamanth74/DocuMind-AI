from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class Workspace(Base):

    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    invite_code = Column(String, unique=True)

    created_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)