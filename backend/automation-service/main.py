from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from fastapi.openapi.utils import get_openapi
from starlette.middleware.base import BaseHTTPMiddleware
import routers
from contract_router import router as contract_router
from file_router import router as file_router
from simple_test_route import router as simple_test_router
import time

# Hot reload test
print(f"🔥 HOT RELOAD TEST: {time.time()}")
from config_router import router as config_router
import os
import asyncio
from datetime import datetime
import uuid
# Legacy Kafka worker disabled by default; guarded at runtime
# from services.notification_service import NotificationService
from services.batch_service import BatchService
from config import Config
from global_instances import event_service, audit_service, batch_service

app = FastAPI(
    title="Automation Service API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_version="3.1.0",
    openapi_url="/api-docs"
)

# Actor/Correlation middleware per MDC 06
class ActorCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Correlation ID
        correlation_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
        # Actor detection with sensible defaults
        actor = request.headers.get("X-Actor")
        if not actor:
            # Try to derive from gateway headers/user context if any in the future
            actor = "system"

        # Attach to request.state for downstream usage
        request.state.correlation_id = correlation_id
        request.state.actor = actor

        response = await call_next(request)
        # Propagate headers back for traceability
        response.headers["X-Correlation-Id"] = correlation_id
        response.headers["X-Actor"] = actor
        return response

# Register middleware early
app.add_middleware(ActorCorrelationMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Explicit origins are required when allow_credentials=True
    allow_origins=[
        *Config.get_cors_origins(),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router)
app.include_router(contract_router)
app.include_router(file_router)
app.include_router(simple_test_router)
app.include_router(config_router)

# Services are now imported from global_instances to avoid circular imports

# Custom OpenAPI schema để đảm bảo tương thích với Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
        openapi_version="3.1.0"
    )
    # Tags metadata với icon và mô tả tiếng Việt
    tags_metadata = [
        {
            "name": "🤖 APIs Xử lý AI",
            "description": "APIs xử lý trí tuệ nhân tạo - Trích xuất nội dung, phân loại tài liệu, tóm tắt hợp đồng, xử lý ngôn ngữ tự nhiên"
        },
        {
            "name": "📁 APIs Quản lý File",
            "description": "APIs quản lý file và lưu trữ - Upload, download, quản lý file đính kèm và tài liệu"
        },
        {
            "name": "📦 APIs Xử lý Batch",
            "description": "APIs xử lý hàng loạt - Xử lý nhiều tài liệu cùng lúc, quản lý job và tiến trình"
        },
        {
            "name": "⚙️ APIs Kiểm tra Hệ thống",
            "description": "APIs kiểm tra và cấu hình hệ thống - Health check, cấu hình S3, kiểm tra kết nối"
        },
        {
            "name": "🏠 APIs Gốc",
            "description": "APIs gốc của service - Health check, thông tin service, chuyển hướng"
        }
    ]
    # Merge/override tags metadata
    existing_tags = openapi_schema.get("tags") or []
    openapi_schema["tags"] = tags_metadata + [t for t in existing_tags if t.get("name") not in {m["name"] for m in tags_metadata}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/", summary="Trang chủ", tags=["🏠 APIs Gốc"])
async def read_root():
    
    return RedirectResponse(url="/docs", status_code=302)

@app.get("/swagger-ui/index.html", summary="Swagger UI", tags=["🏠 APIs Gốc"])
async def swagger_ui_redirect():
    
    return RedirectResponse(url="/docs", status_code=302)

@app.get("/health", summary="Health check", tags=["🏠 APIs Gốc"])
async def health_check():
    
    from schemas.response import RestResponse
    
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Automation Service is running and healthy",
        data={
            "status": "healthy",
            "service": "Automation Service",
            "version": "2.0.0",
            "ai_model": "Gemini 2.0 Flash",
            "supported_formats": ["docx", "pdf", "txt"],
            "timestamp": datetime.now().isoformat()
        },
        path="/health"
    )

@app.on_event("startup")
async def on_startup():
    try:
        # Initialize all services
        # await notification_service.initialize()
        await audit_service.initialize()
        await batch_service.initialize()
        await event_service.initialize()
        
        # Start event processing
        await event_service.start_event_processing()
        
        # Start Kafka worker (legacy) if explicitly enabled
        if os.getenv("KAFKA_WORKER_ENABLED", "false").lower() == "true":
            from kafka_worker import worker
            await worker.start()
        
        print("Automation Service started successfully with all integrations")
    except Exception as e:
        print(f"Error during startup: {e}")
        # Không chặn service nếu một số service không sẵn sàng
        pass

@app.on_event("shutdown")
async def on_shutdown():
    try:
        # Stop all services
        # await notification_service.close()
        await audit_service.close()
        await batch_service.close()
        await event_service.close()
        if os.getenv("KAFKA_WORKER_ENABLED", "false").lower() == "true":
            try:
                from kafka_worker import worker
                await worker.stop()
            except Exception:
                pass
        
        print("Automation Service shutdown completed")
    except Exception as e:
        print(f"Error during shutdown: {e}")
        pass

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    
    from schemas.response import ErrorResponse
    
    error_details = []
    for error in exc.errors():
        error_details.append(f"{'.'.join(str(loc) for loc in error['loc'])}: {error['msg']}")
    
    error_response = ErrorResponse(
        statusCode=400,
        shortMessage="Bad Request",
        description="Validation failed",
        error="; ".join(error_details),
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=200,  # Luôn trả về HTTP 200
        content=error_response.model_dump(mode='json')
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    
    from schemas.response import ErrorResponse
    
    # Map HTTP status codes to statusCode trong RestResponse
    status_code_mapping = {
        400: 400,  # Bad Request
        401: 401,  # Unauthorized
        403: 403,  # Forbidden
        404: 404,  # Not Found
        409: 409,  # Conflict
        422: 422,  # Unprocessable Entity
        500: 500   # Internal Server Error
    }
    
    mapped_status_code = status_code_mapping.get(exc.status_code, 500)
    
    error_response = ErrorResponse(
        statusCode=mapped_status_code,
        shortMessage="Error",
        description=str(exc.detail) if exc and getattr(exc, "detail", None) else "HTTP error",
        error=exc.detail,
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=200,  # Luôn trả về HTTP 200
        content=error_response.model_dump(mode='json')
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    
    from schemas.response import ErrorResponse
    
    error_response = ErrorResponse(
        statusCode=500,
        shortMessage="Internal Server Error",
        description=f"An unexpected error occurred: {str(exc)}",
        error=str(exc),
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=200,  # Luôn trả về HTTP 200
        content=error_response.model_dump(mode='json')
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
