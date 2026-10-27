from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.examinations import router as examinations_router
from app.api.v1.radiologist import router as radiologist_router
from app.api.v1.dashboard import router as dashboard_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(examinations_router)
api_v1_router.include_router(radiologist_router)
api_v1_router.include_router(dashboard_router)
