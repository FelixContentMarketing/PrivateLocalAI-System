from fastapi import APIRouter

from backend.config import settings as cfg
from backend.services.ollama_client import ollama_client

router = APIRouter()


@router.get("/health")
async def health_check():
    ollama_status = await ollama_client.check_health()
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "openrouter": {
            "configured": bool(cfg.openrouter_api_key),
        },
    }
