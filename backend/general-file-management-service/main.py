from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
from datetime import datetime
from routers import file_management_router
from config import settings

# Khởi tạo FastAPI app
app = FastAPI(
    title="General File Management Service",
    description="Dịch vụ quản lý file tổng quát, metadata, organization và search",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "General File Management Service",
        "version": "1.0.0",
        "port": 8018,
        "docs": "/docs",
        "health": "/health"
    }

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
    
    return JSONResponse(
        status_code=500,
        content={
            "apiVersion": "v1",
            "statusCode": 500,
            "shortMessage": "Internal Server Error",
            "description": f"Lỗi không lường trước: {str(exc)}",
            "data": None,
            "timestamp": datetime.utcnow().isoformat(),
            "requestId": request_id,
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8018,
        reload=True
    )
