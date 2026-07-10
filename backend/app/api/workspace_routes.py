import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import verify_clerk_token
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.schemas.workspace_schema import (
    CreateWorkspaceRequest,
    CreateWorkspaceResponse,
    JoinWorkspaceRequest,
    WorkspaceOut,
    WorkspaceMembersResponse,
)
from app.services.workspace_service import (
    create_workspace,
    get_user_workspaces,
    join_workspace,
    get_workspace_members,
)
from app.services.document_service import check_workspace_membership

router = APIRouter()


def get_current_user(payload: dict, db: Session) -> User:
    clerk_id = payload["sub"]
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/workspace", response_model=CreateWorkspaceResponse)
async def create_workspace_route(
    body: CreateWorkspaceRequest,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    invite_code = create_workspace(db=db, name=body.name, user_id=user.id)
    return {"invite_code": invite_code}


@router.get("/workspace", response_model=list[WorkspaceOut])
async def list_workspaces_route(
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)
    workspaces = get_user_workspaces(db=db, user_id=user.id)
    return workspaces


@router.post("/workspaces/join")
async def join_workspace_route(
    body: JoinWorkspaceRequest,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)
    workspace, already_member = join_workspace(db=db, invite_code=body.invite_code, user_id=user.id)

    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if already_member:
        return {"message": "Already joined this workspace"}

    return {"message": "Joined workspace successfully"}


@router.get("/workspaces/{workspace_id}/members", response_model=WorkspaceMembersResponse)
async def list_workspace_members_route(
    workspace_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    # Allow if they are the owner OR a member
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.created_by != user.id and not check_workspace_membership(db, workspace_id, user.id):
        if user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Not authorized")

    members = get_workspace_members(db=db, workspace_id=workspace_id)
    return {
        "total_members": len(members),
        "members": [{"id": m.id, "name": m.name} for m in members],
    }


@router.delete("/workspaces/{workspace_id}")
async def delete_workspace_route(
    workspace_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.created_by != user.id and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete all chunks for documents in this workspace
    doc_ids = [d.id for d in db.query(Document.id).filter(Document.workspace_id == workspace_id).all()]
    if doc_ids:
        db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(doc_ids)).delete(synchronize_session=False)

    # Delete all documents
    db.query(Document).filter(Document.workspace_id == workspace_id).delete(synchronize_session=False)

    # Delete all members
    db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id).delete(synchronize_session=False)

    # Delete files from disk
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", str(workspace_id))
    if os.path.exists(uploads_dir):
        shutil.rmtree(uploads_dir, ignore_errors=True)

    db.delete(workspace)
    db.commit()

    return {"message": "Workspace deleted successfully"}


@router.delete("/workspaces/{workspace_id}/members/{member_user_id}")
async def remove_workspace_member_route(
    workspace_id: int,
    member_user_id: int,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Only the owner can remove someone else, OR a user can leave themselves
    is_owner = (workspace.created_by == user.id)
    is_leaving = (user.id == member_user_id)

    if not (is_owner or is_leaving) and user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Prevent owner from leaving
    if is_leaving and is_owner:
        raise HTTPException(status_code=400, detail="Owner cannot leave the workspace. Delete it instead.")

    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == member_user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="User is not a member of this workspace")

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}
