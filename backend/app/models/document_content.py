from sqlalchemy import Column, Integer, ForeignKey, Text
from app.core.database import Base


class DocumentContent(Base):

    __tablename__ = "document_contents"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(Integer, ForeignKey("documents.id"))

    content = Column(Text)