"""Auth-Router: Login, Registrierung, Logout, Session-Check, User-Verwaltung."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from backend.auth import (
    AUTH_COOKIE_NAME,
    AuthUser,
    build_auth_cookie,
    build_logout_cookie,
    hash_password,
    require_admin,
    sign_token,
    verify_password,
    verify_token,
)
from backend import user_db
from backend.schemas import RegisterRequest, LoginRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(request: RegisterRequest):
    if not request.name or not request.email or not request.password:
        raise HTTPException(400, "Name, E-Mail und Passwort erforderlich")

    if len(request.password) < 6:
        raise HTTPException(400, "Passwort muss mindestens 6 Zeichen lang sein")

    existing = await user_db.get_user_by_email(request.email)
    if existing:
        raise HTTPException(409, "E-Mail-Adresse ist bereits registriert")

    password_hash = hash_password(request.password)
    await user_db.create_user(
        email=request.email,
        password_hash=password_hash,
        name=request.name,
        role="user",
        is_active=False,
    )

    logger.info("Neuer User registriert (wartet auf Freischaltung): %s", request.email)

    return {
        "success": True,
        "message": (
            "Registrierung erfolgreich. Ein Administrator muss Ihr Konto "
            "freischalten, bevor Sie sich anmelden koennen."
        ),
    }


@router.post("/login")
async def login(login_data: LoginRequest, request: Request, response: Response):
    if not login_data.email or not login_data.password:
        raise HTTPException(400, "E-Mail und Passwort erforderlich")

    user = await user_db.get_user_by_email(login_data.email)

    if not user:
        raise HTTPException(401, "Ungueltige Anmeldedaten")

    if not user["is_active"]:
        raise HTTPException(
            403,
            "Ihr Konto wurde noch nicht freigeschaltet. "
            "Bitte wenden Sie sich an einen Administrator.",
        )

    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(401, "Ungueltige Anmeldedaten")

    await user_db.update_user(
        user["id"], last_login_at=datetime.now(timezone.utc).isoformat()
    )

    token = sign_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
        name=user.get("name"),
    )

    is_https = request.headers.get("x-forwarded-proto") == "https"
    cookie = build_auth_cookie(token, secure=is_https)
    response.set_cookie(**cookie)

    logger.info("User angemeldet: %s", user["email"])

    return {
        "success": True,
        "user": {
            "user_id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user["role"],
        },
    }


@router.post("/logout")
async def logout(response: Response):
    cookie = build_logout_cookie()
    response.set_cookie(**cookie)
    return {"success": True}


@router.get("/me")
async def me(request: Request):
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Nicht authentifiziert")

    user = verify_token(token)
    if not user:
        raise HTTPException(401, "Nicht authentifiziert")

    db_user = await user_db.get_user_by_id(user.user_id)
    if not db_user or not db_user["is_active"]:
        raise HTTPException(401, "Nicht authentifiziert")

    return {
        "user": {
            "user_id": db_user["id"],
            "email": db_user["email"],
            "name": db_user.get("name"),
            "role": db_user["role"],
        }
    }


# --- Admin: Benutzerverwaltung ---


@router.get("/users")
async def list_users(_admin: AuthUser = Depends(require_admin)):
    users = await user_db.list_users()
    return {"users": users}


@router.put("/users/{user_id}/activate")
async def activate_user(user_id: str, _admin: AuthUser = Depends(require_admin)):
    user = await user_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(404, "Benutzer nicht gefunden")

    await user_db.update_user(user_id, is_active=True)
    logger.info("User freigeschaltet: %s (durch %s)", user["email"], _admin.email)
    return {"success": True, "message": f"Benutzer {user['email']} freigeschaltet"}


@router.put("/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, _admin: AuthUser = Depends(require_admin)):
    user = await user_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(404, "Benutzer nicht gefunden")

    if user["id"] == _admin.user_id:
        raise HTTPException(400, "Sie koennen sich nicht selbst deaktivieren")

    await user_db.update_user(user_id, is_active=False)
    logger.info("User deaktiviert: %s (durch %s)", user["email"], _admin.email)
    return {"success": True, "message": f"Benutzer {user['email']} deaktiviert"}


@router.put("/users/{user_id}/role")
async def change_role(
    user_id: str,
    request: Request,
    _admin: AuthUser = Depends(require_admin),
):
    body = await request.json()
    new_role = body.get("role")
    if new_role not in ("user", "admin"):
        raise HTTPException(400, "Ungueltige Rolle")

    user = await user_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(404, "Benutzer nicht gefunden")

    await user_db.update_user(user_id, role=new_role)
    logger.info("Rolle geaendert: %s -> %s (durch %s)", user["email"], new_role, _admin.email)
    return {"success": True, "message": f"Rolle von {user['email']} auf {new_role} geaendert"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, _admin: AuthUser = Depends(require_admin)):
    user = await user_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(404, "Benutzer nicht gefunden")

    if user["id"] == _admin.user_id:
        raise HTTPException(400, "Sie koennen sich nicht selbst loeschen")

    await user_db.delete_user(user_id)
    logger.info("User geloescht: %s (durch %s)", user["email"], _admin.email)
    return {"success": True, "message": f"Benutzer {user['email']} geloescht"}
