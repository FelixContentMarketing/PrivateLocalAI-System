"""Authentifizierung: Passwort-Hashing, JWT-Tokens, FastAPI-Dependencies."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, Request

from backend.config import settings as cfg

logger = logging.getLogger(__name__)

AUTH_COOKIE_NAME = "kk-auth-token"
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


@dataclass
class AuthUser:
    """Authentifizierter Benutzer (aus JWT-Payload)."""
    user_id: str
    email: str
    role: str
    name: str | None


# --- Passwort ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


# --- JWT ---

def sign_token(user_id: str, email: str, role: str, name: str | None) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, cfg.jwt_secret, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> AuthUser | None:
    try:
        payload = jwt.decode(token, cfg.jwt_secret, algorithms=[JWT_ALGORITHM])
        return AuthUser(
            user_id=payload["user_id"],
            email=payload["email"],
            role=payload["role"],
            name=payload.get("name"),
        )
    except jwt.ExpiredSignatureError:
        logger.debug("JWT abgelaufen")
        return None
    except jwt.InvalidTokenError:
        logger.debug("Ungueltiger JWT")
        return None


# --- Cookie ---

def build_auth_cookie(token: str, secure: bool = False) -> dict:
    return {
        "key": AUTH_COOKIE_NAME,
        "value": token,
        "httponly": True,
        "samesite": "lax",
        "max_age": JWT_EXPIRY_DAYS * 24 * 60 * 60,
        "secure": secure,
        "path": "/",
    }


def build_logout_cookie() -> dict:
    return {
        "key": AUTH_COOKIE_NAME,
        "value": "",
        "httponly": True,
        "samesite": "lax",
        "max_age": 0,
        "path": "/",
    }


# --- FastAPI Dependencies ---

async def get_current_user(request: Request) -> AuthUser:
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")

    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")

    from backend.user_db import get_user_by_id
    db_user = await get_user_by_id(user.user_id)
    if not db_user or not db_user["is_active"]:
        raise HTTPException(status_code=403, detail="Account deaktiviert")

    user.role = db_user["role"]
    return user


async def require_admin(request: Request) -> AuthUser:
    user = await get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin-Rechte erforderlich")
    return user
