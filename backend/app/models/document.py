from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(Integer, ForeignKey("workspaces.id"))

    title = Column(String)

    type = Column(String)

    file_url = Column(String)

    uploaded_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)