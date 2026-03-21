from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base


class WorkspaceMember(Base):

    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"))

    user_id = Column(Integer, ForeignKey("users.id"))

    joined_at = Column(DateTime, default=datetime.utcnow)