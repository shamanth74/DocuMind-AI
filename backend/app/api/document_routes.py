import os
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import verify_clerk_token
from app.models.user import User
from app.models.workspace import Workspace
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.document_service import (
    validate_file_type,
    check_workspace_membership,
    upload_document,
    create_text_document,
    get_workspace_documents,
)
from app.schemas.workspace_schema import CreateTextDocumentRequest
from app.schemas.document_schema import DocumentOut
from app.services.document_service import UPLOAD_DIR

logger = logging.getLogger(__name__)

router = APIRouter()


def get_current_user(payload: dict, db: Session) -> User:
    clerk_id = payload["sub"]
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/documents")
async def upload_document_route(
    file: UploadFile = File(...),
    workspace_id: int = Form(...),
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    # Only workspace owner can upload
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    if workspace.created_by != user.id and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized to upload documents")

    # Validate file type
    file_type = validate_file_type(file.content_type)
    if not file_type:
        raise HTTPException(status_code=400, detail="Only PDF and text files are allowed")

    # Upload and parse
    try:
        document = upload_document(
            db=db,
            file=file,
            workspace_id=workspace_id,
            user_id=user.id,
            file_type=file_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

    return {
        "message": "Document uploaded successfully",
        "document": {
            "id": document.id,
            "title": document.title,
            "file_type": document.file_type,
            "workspace_id": document.workspace_id,
        },
    }


@router.post("/documents/text")
async def create_text_document_route(
    body: CreateTextDocumentRequest,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    workspace = db.query(Workspace).filter(Workspace.id == body.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    if workspace.created_by != user.id and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    document = create_text_document(
        db=db,
        title=body.title,
        content=body.content,
        workspace_id=body.workspace_id,
        user_id=user.id,
    )

    return {
        "message": "Document created successfully",
        "document": {
            "id": document.id,
            "title": document.title,
            "file_type": document.file_type,
            "workspace_id": document.workspace_id,
        },
    }


@router.get("/documents")
async def list_documents_route(
    workspace_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    if not check_workspace_membership(db, workspace_id, user.id):
        raise HTTPException(status_code=403, detail="You are not a member of this workspace")

    documents = get_workspace_documents(db=db, workspace_id=workspace_id)
    result = []
    for d in documents:
        doc = {
            "id": d.id,
            "title": d.title,
            "file_type": d.file_type,
            "file_url": None,
            "content": None,
            "created_at": d.created_at,
        }
        if d.file_type in ("pdf", "text"):
            doc["file_url"] = f"/documents/{d.id}/download"
        if d.file_type == "raw_text":
            doc["content"] = d.content
        result.append(doc)
    return result


@router.get("/documents/{document_id}/download")
async def download_document_route(
    document_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    """
    Authenticated file download. Verifies JWT and workspace membership
    before streaming the file. Replaces the previous public StaticFiles mount.
    """
    user = get_current_user(payload, db)

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Verify the requester is a member of the document's workspace
    if not check_workspace_membership(db, document.workspace_id, user.id):
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    # Stream file-based documents (PDF / text)
    if document.file_type in ("pdf", "text"):
        file_path = os.path.join(UPLOAD_DIR, str(document.workspace_id), document.title)
        if not os.path.exists(file_path):
            logger.error(f"File missing on disk: {file_path}")
            raise HTTPException(status_code=404, detail="File not found on disk")

        media_type = "application/pdf" if document.file_type == "pdf" else "text/plain"
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=document.title,
        )

    # Return raw text content directly
    if document.file_type == "raw_text":
        return Response(
            content=document.content or "",
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{document.title}"'},
        )

    raise HTTPException(status_code=400, detail="Unsupported file type")


@router.delete("/documents/{document_id}")
async def delete_document_route(
    document_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    workspace = db.query(Workspace).filter(Workspace.id == document.workspace_id).first()
    if workspace and workspace.created_by != user.id and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete chunks
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()

    # Delete file from disk
    if document.file_type in ("pdf", "text"):
        file_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "uploads",
            str(document.workspace_id), document.title
        )
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}
