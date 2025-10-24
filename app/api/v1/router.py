from fastapi import APIRouter
from app.api.v1.endpoints import documents, contracts, ocr, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(documents.router)
api_router.include_router(contracts.router)
api_router.include_router(ocr.router)
api_router.include_router(health.router)
