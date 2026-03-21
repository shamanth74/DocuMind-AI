import os
from typing import Optional

from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.workspace_member import WorkspaceMember
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.text_chunker import split_text_into_chunks


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


def save_file_locally(workspace_id: int, filename: str, file_bytes: bytes) -> str:
    """Save file to uploads/{workspace_id}/ directory and return the file path."""
    ws_dir = os.path.join(UPLOAD_DIR, str(workspace_id))
    os.makedirs(ws_dir, exist_ok=True)
    file_path = os.path.join(ws_dir, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path


def parse_file_content(file_bytes: bytes, file_type: str) -> str:
    """Extract text content from file bytes based on type."""
    if file_type == "pdf":
        text = extract_text_from_pdf(file_bytes)
    else:
        text = file_bytes.decode("utf-8", errors="replace")
    return text


def _chunks_exist(db: Session, document_id: int) -> bool:
    """Check if chunks already exist for a document (prevents duplicates)."""
    return (
        db.query(DocumentChunk.id)
        .filter(DocumentChunk.document_id == document_id)
        .first()
        is not None
    )


def _store_chunks_bulk(db: Session, document_id: int, chunk_texts: list):
    """Bulk insert chunks for a document."""
    if _chunks_exist(db, document_id):
        return

    objects = [
        DocumentChunk(
            document_id=document_id,
            chunk_text=text,
            chunk_index=i,
        )
        for i, text in enumerate(chunk_texts)
    ]
    db.bulk_save_objects(objects)
    db.commit()


def upload_document(
    db: Session,
    file: UploadFile,
    workspace_id: int,
    user_id: int,
    file_type: str,
) -> Document:
    file_bytes = file.file.read()

    # Extract text
    content = parse_file_content(file_bytes, file_type)

    # Generate chunks and validate
    chunk_texts = split_text_into_chunks(content)
    if not content.strip() or not chunk_texts:
        raise ValueError("Unable to process document. No valid content extracted.")

    # Save file locally only after validation
    save_file_locally(workspace_id, file.filename, file_bytes)

    # Save document to DB
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

    # Bulk insert chunks
    _store_chunks_bulk(db, document.id, chunk_texts)

    return document


def create_text_document(
    db: Session,
    title: str,
    content: str,
    workspace_id: int,
    user_id: int,
) -> Document:
    # Generate chunks and validate
    chunk_texts = split_text_into_chunks(content)
    if not content.strip() or not chunk_texts:
        raise ValueError("Unable to process document. No valid content extracted.")

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

    # Bulk insert chunks
    _store_chunks_bulk(db, document.id, chunk_texts)

    return document


def get_workspace_documents(db: Session, workspace_id: int) -> list:
    return (
        db.query(Document)
        .filter(Document.workspace_id == workspace_id)
        .all()
    )
