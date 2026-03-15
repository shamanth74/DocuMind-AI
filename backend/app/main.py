from fastapi import FastAPI

from app.core.database import Base, engine

# import models so SQLAlchemy detects them
from app.models import user
from app.models import workspace
from app.models import workspace_member
from app.models import document
from app.models import document_content
from app.models import document_chunk

app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "DocuMind AI backend running"}