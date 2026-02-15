from fastapi import APIRouter

from backend.services.ollama_client import ollama_client

router = APIRouter()


@router.get("/health")
async def health_check():
    ollama_status = await ollama_client.check_health()
    return {
        "status": "healthy",
        "ollama": ollama_status,
    }
