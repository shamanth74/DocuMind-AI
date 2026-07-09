from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
import os

# import models so SQLAlchemy detects them
from app.models import user
from app.models import workspace
from app.models import workspace_member
from app.models import document
from app.models import document_content
from app.models import document_chunk

from app.api import user_routes
from app.api import workspace_routes
from app.api import document_routes
from app.api import ai_routes


app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

# CORS configuration
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router)
app.include_router(workspace_routes.router)
app.include_router(document_routes.router)
app.include_router(ai_routes.router)

@app.get("/")
def root():
    return {"message": "DocuMind AI backend running"}