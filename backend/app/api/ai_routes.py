from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import verify_clerk_token
from app.models.user import User
from app.schemas.ai_schema import AIQueryRequest, AIQueryResponse
from app.services.document_service import check_workspace_membership
from app.services.ai_service import ask_question

router = APIRouter()


def get_current_user(payload: dict, db: Session) -> User:
    clerk_id = payload["sub"]
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/ai/query", response_model=AIQueryResponse)
async def ai_query_route(
    body: AIQueryRequest,
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db),
):
    user = get_current_user(payload, db)

    if not check_workspace_membership(db, body.workspace_id, user.id):
        raise HTTPException(status_code=403, detail="You are not a member of this workspace")

    try:
        answer = ask_question(db=db, workspace_id=body.workspace_id, question=body.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI query failed: {str(e)}")

    return {"answer": answer}
