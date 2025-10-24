from fastapi import APIRouter
from app.models.response.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    🔹 Output
    📝 data
    Type: HealthResponse
    Description: Service health status
    """
    return HealthResponse(
        statusCode=200,
        shortMessage="Healthy",
        description="Automation Service is running",
        data={
            "status": "healthy",
            "service": "automation-service",
            "version": "2.0.0"
        }
    )
