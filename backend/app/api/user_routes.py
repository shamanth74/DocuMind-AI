import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from clerk_backend_api import Clerk

from app.core.database import get_db
from app.core.auth import verify_clerk_token
from app.services.user_service import sync_user

load_dotenv()

router = APIRouter()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)


@router.get("/me")
async def get_current_user(
    payload: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):

    clerk_id = payload["sub"]

    # Fetch user from Clerk
    clerk_user = clerk.users.get(user_id=clerk_id)

    # Safely extract email
    email = None
    if clerk_user.email_addresses:
        email = clerk_user.email_addresses[0].email_address

    name = clerk_user.first_name or ""

    user = sync_user(
        db=db,
        clerk_id=clerk_id,
        email=email,
        name=name
    )

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }