from pydantic import BaseModel


class AIQueryRequest(BaseModel):
    workspace_id: int
    question: str


class AIQueryResponse(BaseModel):
    answer: str
