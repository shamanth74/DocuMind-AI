import os
from typing import Optional

from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.document import Document
from app.models.workspace_member import WorkspaceMember
from app.utils.pdf_parser import extract_text_from_pdf


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "text",
}


def validate_file_type(content_type: str) -> Optional[str]:
    """Returns file_type string if valid, None otherwise."""
    return ALLOWED_TYPES.get(content_type)


def check_workspace_membership(db: Session, workspace_id: int, user_id: int) -> bool:
    return (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        .first()
        is not None
    )


def save_file_locally(filename: str, file_bytes: bytes) -> str:
    """Save file to uploads/ directory and return the file path."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path


def parse_file_content(file_bytes: bytes, file_type: str) -> str:
    """Extract text content from file bytes based on type."""
    if file_type == "pdf":
        text = extract_text_from_pdf(file_bytes)
    else:
        text = file_bytes.decode("utf-8", errors="replace")

    if len(text.strip()) < 50:
        raise ValueError("Unable to retrieve text from file. File may be incompatible.")

    return text


def upload_document(
    db: Session,
    file: UploadFile,
    workspace_id: int,
    user_id: int,
    file_type: str,
) -> Document:
    file_bytes = file.file.read()

    # Parse content first — if this fails, file won't be saved
    content = parse_file_content(file_bytes, file_type)

    # Save file locally only after successful parsing
    save_file_locally(file.filename, file_bytes)

    # Save to DB
    document = Document(
        workspace_id=workspace_id,
        title=file.filename,
        file_type=file_type,
        content=content,
        uploaded_by=user_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def create_text_document(
    db: Session,
    title: str,
    content: str,
    workspace_id: int,
    user_id: int,
) -> Document:
    document = Document(
        workspace_id=workspace_id,
        title=title,
        file_type="raw_text",
        content=content,
        uploaded_by=user_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_workspace_documents(db: Session, workspace_id: int) -> list:
    return (
        db.query(
            Document.id,
            Document.title,
            Document.file_type,
            Document.created_at,
        )
        .filter(Document.workspace_id == workspace_id)
        .all()
    )

