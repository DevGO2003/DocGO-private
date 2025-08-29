from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import uuid
from datetime import datetime
from routers import file_management_router
from config import settings
from fastapi.openapi.utils import get_openapi
from schemas.response import RestResponse
from kafka_worker import worker

# Khởi tạo FastAPI app
app = FastAPI(
    title="General File Management Service",
    description="Dịch vụ quản lý file tổng quát, metadata, organization và search",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_version="3.0.3"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    file_management_router,
    prefix="/api/v1/general-file-management-service",
    tags=["General File Management Service"]
)

# Custom OpenAPI schema để đảm bảo tương thích với Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        openapi_version="3.0.3"
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Root endpoint → auto redirect to docs
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "General File Management Service",
        "timestamp": datetime.utcnow().isoformat(),
        "port": 8018
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = str(uuid.uuid4())
    response = RestResponse[
        dict
    ](
        apiVersion="v1",
        statusCode=500,
        shortMessage="Internal Server Error",
        description=f"Lỗi không lường trước: {str(exc)}",
        data=None,
        timestamp=datetime.utcnow().isoformat(),
        requestId=request_id,
        path=str(request.url)
    )
    return JSONResponse(status_code=500, content=response.model_dump())


@app.on_event("startup")
async def startup_event():
    """Khởi động Kafka worker khi service startup"""
    try:
        await worker.start()
        print("✅ Kafka worker started successfully")
    except Exception as e:
        # Không chặn service nếu Kafka không sẵn sàng
        print(f"⚠️ Kafka worker failed to start: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Dừng Kafka worker khi service shutdown"""
    try:
        await worker.stop()
        print("✅ Kafka worker stopped successfully")
    except Exception as e:
        print(f"⚠️ Error stopping Kafka worker: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8018,
        reload=True
    )
