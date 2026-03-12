"""Settings-Router: API Key, Modell-Auswahl verwalten."""

from __future__ import annotations

import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException

from backend.config import settings as cfg
from backend.auth import AuthUser, get_current_user, require_admin
from backend.schemas import ModelOption, SettingsResponse, SettingsUpdateRequest

router = APIRouter(tags=["settings"])

logger = logging.getLogger(__name__)


def _settings_file():
    return cfg.DATA_DIR / "settings.json"


def load_persistent_settings() -> None:
    sf = _settings_file()
    if not sf.exists():
        return

    try:
        data = json.loads(sf.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("Konnte settings.json nicht laden: %s", e)
        return

    if "selected_model" in data and not os.environ.get("SELECTED_MODEL"):
        valid_ids = [m["id"] for m in cfg.available_models]
        if data["selected_model"] in valid_ids:
            cfg.selected_model = data["selected_model"]

    if "openrouter_api_key" in data and not os.environ.get("OPENROUTER_API_KEY"):
        cfg.openrouter_api_key = data["openrouter_api_key"]


def _save_persistent_settings(**kwargs) -> None:
    data: dict = {}
    sf = _settings_file()
    if sf.exists():
        try:
            data = json.loads(sf.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            data = {}

    for key, value in kwargs.items():
        if value is not None:
            data[key] = value

    try:
        sf.parent.mkdir(parents=True, exist_ok=True)
        sf.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    except OSError as e:
        logger.error("Konnte settings.json nicht speichern: %s", e)


def _build_settings_response() -> SettingsResponse:
    level_raw = logging.getLogger("backend").level
    level = logging.getLevelName(level_raw) if level_raw else "DEBUG"

    return SettingsResponse(
        openrouter_api_key_set=bool(cfg.openrouter_api_key),
        selected_model=cfg.selected_model,
        available_models=[ModelOption(**m) for m in cfg.available_models],
        log_level=level,
    )


@router.get("/settings", response_model=SettingsResponse)
async def get_settings(_user: AuthUser = Depends(get_current_user)):
    return _build_settings_response()


@router.put("/settings", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdateRequest,
    _admin: AuthUser = Depends(require_admin),
):
    if request.openrouter_api_key is not None:
        cfg.openrouter_api_key = request.openrouter_api_key

    if request.selected_model is not None:
        valid_ids = [m["id"] for m in cfg.available_models]
        if request.selected_model not in valid_ids:
            raise HTTPException(400, f"Ungueltiges Modell. Erlaubt: {', '.join(valid_ids)}")
        cfg.selected_model = request.selected_model

    if request.log_level is not None:
        level = getattr(logging, request.log_level.upper(), logging.DEBUG)
        logging.getLogger("backend").setLevel(level)

    _save_persistent_settings(
        openrouter_api_key=request.openrouter_api_key,
        selected_model=request.selected_model,
        log_level=request.log_level,
    )

    return _build_settings_response()
