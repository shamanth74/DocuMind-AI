import random
import string

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.user import User


def generate_invite_code(length: int = 6) -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


def create_workspace(db: Session, name: str, user_id: int) -> str:
    max_retries = 5

    for _ in range(max_retries):
        invite_code = generate_invite_code()

        workspace = Workspace(name=name, invite_code=invite_code, created_by=user_id)
        db.add(workspace)

        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            continue

        member = WorkspaceMember(workspace_id=workspace.id, user_id=user_id)
        db.add(member)
        db.commit()

        return invite_code

    raise Exception("Failed to generate unique invite code after retries")


def get_user_workspaces(db: Session, user_id: int) -> list[Workspace]:
    return (
        db.query(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .filter(WorkspaceMember.user_id == user_id)
        .all()
    )


def join_workspace(db: Session, invite_code: str, user_id: int):
    workspace = db.query(Workspace).filter(Workspace.invite_code == invite_code).first()
    if not workspace:
        return None, False

    existing = (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == workspace.id,
            WorkspaceMember.user_id == user_id,
        )
        .first()
    )
    if existing:
        return workspace, True

    member = WorkspaceMember(workspace_id=workspace.id, user_id=user_id)
    db.add(member)
    db.commit()
    return workspace, False


def get_workspace_members(db: Session, workspace_id: int) -> list:
    return (
        db.query(User.id, User.name)
        .join(WorkspaceMember, WorkspaceMember.user_id == User.id)
        .filter(WorkspaceMember.workspace_id == workspace_id)
        .all()
    )
