from fastapi import APIRouter, Depends

from backend.auth import AuthUser, get_current_user
from backend.config import settings as cfg
from backend.services.ollama_client import ollama_client
from backend.services.hardware_detector import detect_hardware
from backend.services.model_recommender import recommend_model

router = APIRouter()


@router.get("/models")
async def list_models(_user: AuthUser = Depends(get_current_user)):
    models = await ollama_client.list_models()
    hardware = detect_hardware()
    installed_names = [m["name"] for m in models]
    recommendation = recommend_model(hardware, installed_names)

    return {
        "models": models,
        "recommended": recommendation["recommended_model"],
        "recommendation_reason": recommendation["reason"],
    }


@router.get("/cloud-models")
async def list_cloud_models(_user: AuthUser = Depends(get_current_user)):
    return {
        "models": cfg.available_models,
        "selected": cfg.selected_model,
        "api_key_set": bool(cfg.openrouter_api_key),
    }
