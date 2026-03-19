from pydantic import BaseModel


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

    class Config:
        from_attributes = True


class MemberOut(BaseModel):
    id: int
    name: str


class WorkspaceMembersResponse(BaseModel):
    total_members: int
    members: list[MemberOut]
