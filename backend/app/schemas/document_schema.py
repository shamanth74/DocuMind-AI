from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentOut(BaseModel):
    id: int
    title: str
    file_type: str
    file_url: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime
