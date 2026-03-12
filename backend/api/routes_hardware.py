from fastapi import APIRouter, Depends

from backend.auth import AuthUser, get_current_user
from backend.services.hardware_detector import detect_hardware
from backend.services.model_recommender import recommend_model

router = APIRouter()


@router.get("/hardware")
async def get_hardware_info(_user: AuthUser = Depends(get_current_user)):
    hardware = detect_hardware()
    recommendation = recommend_model(hardware)

    return {
        **hardware,
        **recommendation,
    }
