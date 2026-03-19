import os
import requests
from jose import jwt
from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv()

JWKS_URL = os.getenv("CLERK_JWKS_URL")


def get_jwks():
    response = requests.get(JWKS_URL)
    return response.json()


async def verify_clerk_token(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    jwks = get_jwks()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )

        return payload

    except Exception as e:
        print("JWT verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid token")