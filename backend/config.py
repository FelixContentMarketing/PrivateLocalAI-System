"""Konfiguration fuer den Kanzlei Kissling KI-Assistenten."""

from __future__ import annotations

import os
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    # Ollama (lokal oder Docker-Netzwerk)
    ollama_base_url: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    host: str = os.environ.get("HOST", "0.0.0.0")
    port: int = int(os.environ.get("PORT", "8000"))
    cors_origins: list[str] = [
        o.strip()
        for o in os.environ.get(
            "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
        ).split(",")
        if o.strip()
    ]
    default_temperature: float = 0.3
    default_max_tokens: int = 4096

    # Pfade
    PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = Path(__file__).resolve().parent.parent / "data"
    USER_DB_PATH: Path = Path(__file__).resolve().parent.parent / "data" / "users.db"

    # Auth / JWT
    jwt_secret: str = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
    admin_email: str = os.environ.get("ADMIN_EMAIL", "")
    admin_password: str = os.environ.get("ADMIN_PASSWORD", "")

    # OpenRouter API (Cloud)
    openrouter_api_key: str = os.environ.get("OPENROUTER_API_KEY", "")
    selected_model: str = os.environ.get("SELECTED_MODEL", "google/gemini-2.5-flash")
    max_tokens: int = 8192

    available_models: list[dict] = [
        {
            "id": "google/gemini-2.5-flash",
            "label": "Gemini 2.5 Flash",
            "price": "$0.30 / $2.50 pro M Token",
        },
        {
            "id": "google/gemini-3-flash-preview",
            "label": "Gemini 3 Flash",
            "price": "Preview (Preis TBD)",
        },
        {
            "id": "google/gemini-2.5-flash-lite-preview-06-17",
            "label": "Gemini 2.5 Flash Lite",
            "price": "$0.10 / $0.40 pro M Token",
        },
        {
            "id": "qwen/qwen2.5-vl-72b-instruct",
            "label": "Qwen 2.5 VL 72B",
            "price": "$0.80 / $0.80 pro M Token",
        },
        {
            "id": "deepseek/deepseek-r1-0528",
            "label": "DeepSeek R1",
            "price": "$0.55 / $2.19 pro M Token",
        },
        {
            "id": "anthropic/claude-sonnet-4",
            "label": "Claude Sonnet 4",
            "price": "$3.00 / $15.00 pro M Token",
        },
        {
            "id": "openai/gpt-4o",
            "label": "GPT-4o",
            "price": "$2.50 / $10.00 pro M Token",
        },
    ]

    model_config = {"arbitrary_types_allowed": True}


settings = Settings()
