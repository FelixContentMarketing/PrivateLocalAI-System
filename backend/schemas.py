"""Pydantic-Modelle fuer Request/Response-Schemas."""

from __future__ import annotations

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ModelOption(BaseModel):
    id: str
    label: str
    price: str


class SettingsResponse(BaseModel):
    openrouter_api_key_set: bool
    selected_model: str
    available_models: list[ModelOption]
    log_level: str = "DEBUG"


class SettingsUpdateRequest(BaseModel):
    openrouter_api_key: str | None = None
    selected_model: str | None = None
    log_level: str | None = None
