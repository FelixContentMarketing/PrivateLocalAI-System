"""Datenbank-Abstraktion: SQLite fuer User-Management."""

from __future__ import annotations

import logging
import sqlite3
from contextlib import contextmanager
from typing import Any, Generator

logger = logging.getLogger(__name__)


class DBConnection:
    def __init__(self, conn: Any):
        self._conn = conn

    def execute(self, sql: str, params: tuple | list = ()) -> int:
        cursor = self._conn.execute(sql, params)
        return cursor.rowcount

    def fetchone(self, sql: str, params: tuple | list = ()) -> dict | None:
        row = self._conn.execute(sql, params).fetchone()
        return dict(row) if row else None

    def fetchall(self, sql: str, params: tuple | list = ()) -> list[dict]:
        rows = self._conn.execute(sql, params).fetchall()
        return [dict(r) for r in rows]

    def commit(self) -> None:
        self._conn.commit()


@contextmanager
def get_connection(sqlite_path: str | None = None) -> Generator[DBConnection, None, None]:
    path = sqlite_path or ":memory:"
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield DBConnection(conn)
    finally:
        conn.close()


def init_tables() -> None:
    """Erstellt die Users-Tabelle."""
    from backend.config import settings as cfg

    cfg.DATA_DIR.mkdir(parents=True, exist_ok=True)
    sqlite_path = str(cfg.USER_DB_PATH)

    with get_connection(sqlite_path) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                is_active INTEGER NOT NULL DEFAULT 0,
                last_login_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
    logger.info("SQLite: Users-Tabelle initialisiert: %s", sqlite_path)
