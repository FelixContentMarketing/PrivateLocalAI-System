from fastapi import APIRouter

from backend.services.ollama_client import ollama_client
from backend.services.hardware_detector import detect_hardware
from backend.services.model_recommender import recommend_model

router = APIRouter()


@router.get("/models")
async def list_models():
    models = await ollama_client.list_models()
    hardware = detect_hardware()
    installed_names = [m["name"] for m in models]
    recommendation = recommend_model(hardware, installed_names)

    return {
        "models": models,
        "recommended": recommendation["recommended_model"],
        "recommendation_reason": recommendation["reason"],
    }
