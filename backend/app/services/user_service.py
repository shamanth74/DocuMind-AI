import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.models.user import User

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")


def sync_user(db: Session, clerk_id: str, email: str, name: str):

    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if user:
        return user

    role = "super_admin" if email == ADMIN_EMAIL else "member"

    user = User(
        clerk_id=clerk_id,
        email=email,
        name=name,
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user