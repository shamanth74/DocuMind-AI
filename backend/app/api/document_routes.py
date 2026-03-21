from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import verify_clerk_token
from app.models.user import User
from app.services.document_service import (
    validate_file_type,
    check_workspace_membership,
    upload_document,
    create_text_document,
    get_workspace_documents,
)
from app.schemas.workspace_schema import CreateTextDocumentRequest
from app.schemas.document_schema import DocumentOut

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

    # Only super_admin can upload
    if user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized to upload documents")

    # Validate file type
    file_type = validate_file_type(file.content_type)
    if not file_type:
        raise HTTPException(status_code=400, detail="Only PDF and text files are allowed")

    # Check workspace membership
    if not check_workspace_membership(db, workspace_id, user.id):
        raise HTTPException(status_code=403, detail="You are not a member of this workspace")

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

    if user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not check_workspace_membership(db, body.workspace_id, user.id):
        raise HTTPException(status_code=403, detail="You are not a member of this workspace")

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
            doc["file_url"] = f"/uploads/{d.workspace_id}/{d.title}"
        if d.file_type == "raw_text":
            doc["content"] = d.content
        result.append(doc)
    return result
