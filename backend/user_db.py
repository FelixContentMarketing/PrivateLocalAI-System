"""User-Datenbank: CRUD-Operationen fuer Benutzer."""

from __future__ import annotations

import asyncio
import logging
import uuid

from backend.config import settings as cfg
from backend.database import get_connection, is_postgres

logger = logging.getLogger(__name__)


def _db_path() -> str | None:
    """Gibt den SQLite-Pfad zurueck, oder None bei PostgreSQL."""
    return None if is_postgres() else str(cfg.USER_DB_PATH)


def _init_db_sync() -> None:
    if not is_postgres():
        cfg.DATA_DIR.mkdir(parents=True, exist_ok=True)
    from backend.database import init_tables
    init_tables()


async def init_db() -> None:
    await asyncio.to_thread(_init_db_sync)


def _create_user_sync(
    email: str,
    password_hash: str,
    name: str,
    role: str = "user",
    is_active: bool = False,
) -> dict:
    user_id = str(uuid.uuid4())
    with get_connection(_db_path()) as db:
        db.execute(
            "INSERT INTO users (id, email, password_hash, name, role, is_active) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (user_id, email.lower(), password_hash, name.strip(), role, int(is_active)),
        )
        db.commit()
        return db.fetchone("SELECT * FROM users WHERE id = %s", (user_id,))


async def create_user(
    email: str, password_hash: str, name: str,
    role: str = "user", is_active: bool = False,
) -> dict:
    return await asyncio.to_thread(
        _create_user_sync, email, password_hash, name, role, is_active
    )


def _get_user_by_email_sync(email: str) -> dict | None:
    with get_connection(_db_path()) as db:
        return db.fetchone("SELECT * FROM users WHERE email = %s", (email.lower(),))


async def get_user_by_email(email: str) -> dict | None:
    return await asyncio.to_thread(_get_user_by_email_sync, email)


def _get_user_by_id_sync(user_id: str) -> dict | None:
    with get_connection(_db_path()) as db:
        return db.fetchone("SELECT * FROM users WHERE id = %s", (user_id,))


async def get_user_by_id(user_id: str) -> dict | None:
    return await asyncio.to_thread(_get_user_by_id_sync, user_id)


def _list_users_sync() -> list[dict]:
    with get_connection(_db_path()) as db:
        return db.fetchall(
            "SELECT id, email, name, role, is_active, last_login_at, created_at "
            "FROM users ORDER BY is_active ASC, name ASC"
        )


async def list_users() -> list[dict]:
    return await asyncio.to_thread(_list_users_sync)


def _update_user_sync(user_id: str, **fields) -> dict | None:
    if not fields:
        return _get_user_by_id_sync(user_id)
    with get_connection(_db_path()) as db:
        set_parts = []
        vals = []
        for k, v in fields.items():
            set_parts.append(f"{k} = %s")
            vals.append(v)
        vals.append(user_id)
        db.execute(
            f"UPDATE users SET {', '.join(set_parts)} WHERE id = %s",
            vals,
        )
        db.commit()
        return db.fetchone("SELECT * FROM users WHERE id = %s", (user_id,))


async def update_user(user_id: str, **fields) -> dict | None:
    return await asyncio.to_thread(_update_user_sync, user_id, **fields)


def _delete_user_sync(user_id: str) -> bool:
    with get_connection(_db_path()) as db:
        count = db.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        return count > 0


async def delete_user(user_id: str) -> bool:
    return await asyncio.to_thread(_delete_user_sync, user_id)


def _upsert_user_sync(
    email: str, password_hash: str, name: str, role: str, is_active: bool
) -> dict:
    with get_connection(_db_path()) as db:
        existing = db.fetchone("SELECT id FROM users WHERE email = %s", (email.lower(),))
        if existing:
            user_id = existing["id"]
            db.execute(
                "UPDATE users SET password_hash = %s, name = %s, role = %s, is_active = %s WHERE id = %s",
                (password_hash, name.strip(), role, int(is_active), user_id),
            )
        else:
            user_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO users (id, email, password_hash, name, role, is_active) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, email.lower(), password_hash, name.strip(), role, int(is_active)),
            )
        db.commit()
        return db.fetchone("SELECT * FROM users WHERE id = %s", (user_id,))


async def upsert_user(
    email: str, password_hash: str, name: str, role: str, is_active: bool
) -> dict:
    return await asyncio.to_thread(
        _upsert_user_sync, email, password_hash, name, role, is_active
    )
