"""Datenbank-Abstraktion: PostgreSQL (Produktion) oder SQLite (Entwicklung)."""

from __future__ import annotations

import logging
import os
import sqlite3
from contextlib import contextmanager
from typing import Any, Generator

logger = logging.getLogger(__name__)

DATABASE_URL: str = os.environ.get("DATABASE_URL", "")


def is_postgres() -> bool:
    return bool(DATABASE_URL)


class DBConnection:
    def __init__(self, conn: Any, backend: str):
        self._conn = conn
        self._backend = backend

    def execute(self, sql: str, params: tuple | list = ()) -> int:
        if self._backend == "pg":
            cur = self._conn.cursor()
            cur.execute(sql, params or None)
            return cur.rowcount
        else:
            sql = sql.replace("%s", "?")
            cursor = self._conn.execute(sql, params)
            return cursor.rowcount

    def fetchone(self, sql: str, params: tuple | list = ()) -> dict | None:
        if self._backend == "pg":
            cur = self._conn.cursor()
            cur.execute(sql, params or None)
            row = cur.fetchone()
            return dict(row) if row else None
        else:
            sql = sql.replace("%s", "?")
            row = self._conn.execute(sql, params).fetchone()
            return dict(row) if row else None

    def fetchall(self, sql: str, params: tuple | list = ()) -> list[dict]:
        if self._backend == "pg":
            cur = self._conn.cursor()
            cur.execute(sql, params or None)
            return [dict(r) for r in cur.fetchall()]
        else:
            sql = sql.replace("%s", "?")
            rows = self._conn.execute(sql, params).fetchall()
            return [dict(r) for r in rows]

    def commit(self) -> None:
        self._conn.commit()


@contextmanager
def get_connection(sqlite_path: str | None = None) -> Generator[DBConnection, None, None]:
    if is_postgres():
        import psycopg2
        import psycopg2.extras

        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            yield DBConnection(conn, "pg")
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    else:
        path = sqlite_path or ":memory:"
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        try:
            yield DBConnection(conn, "sqlite")
        finally:
            conn.close()


def init_tables() -> None:
    """Erstellt die Users-Tabelle."""
    from backend.config import settings as cfg

    if is_postgres():
        _init_tables_pg()
    else:
        cfg.DATA_DIR.mkdir(parents=True, exist_ok=True)
        _init_tables_sqlite(str(cfg.USER_DB_PATH))


def _init_tables_pg() -> None:
    with get_connection() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                is_active BOOLEAN NOT NULL DEFAULT FALSE,
                last_login_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        db.commit()
    logger.info("PostgreSQL: Users-Tabelle initialisiert")


def _init_tables_sqlite(path: str) -> None:
    with get_connection(path) as db:
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
    logger.info("SQLite: Users-Tabelle initialisiert: %s", path)
