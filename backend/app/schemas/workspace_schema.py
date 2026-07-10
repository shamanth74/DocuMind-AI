from pydantic import BaseModel
from typing import Optional


class CreateWorkspaceRequest(BaseModel):
    name: str


class CreateWorkspaceResponse(BaseModel):
    invite_code: str


class JoinWorkspaceRequest(BaseModel):
    invite_code: str


class WorkspaceOut(BaseModel):
    id: int
    name: str
    invite_code: str
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class MemberOut(BaseModel):
    id: int
    name: str


class WorkspaceMembersResponse(BaseModel):
    total_members: int
    members: list[MemberOut]


class CreateTextDocumentRequest(BaseModel):
    title: str
    content: str
    workspace_id: int
