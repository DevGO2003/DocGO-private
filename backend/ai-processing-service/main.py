from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from fastapi.openapi.utils import get_openapi
import routers
import os
from datetime import datetime
import uuid

app = FastAPI(
    title="AI Processing Service",
    description="Một dịch vụ xử lý tài liệu sử dụng AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_version="3.0.3"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router)

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

@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint - tự động redirect sang /docs để hiển thị API documentation
    """
    return RedirectResponse(url="/docs", status_code=302)

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint - kiểm tra trạng thái service
    """
    return {
        "status": "healthy",
        "service": "AI Processing Service",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "ai_model": "Gemini 2.0 Flash",
        "supported_formats": ["docx", "pdf", "txt"]
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """
    Validation error handler - trả về RestResponse format cho lỗi validation
    """
    from schemas.response import ErrorResponse
    
    error_details = []
    for error in exc.errors():
        error_details.append(f"{'.'.join(str(loc) for loc in error['loc'])}: {error['msg']}")
    
    error_response = ErrorResponse(
        statusCode=422,
        shortMessage="Validation Error",
        description="Dữ liệu đầu vào không hợp lệ",
        error="; ".join(error_details),
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump(mode='json')
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Custom HTTP exception handler - trả về RestResponse format
    """
    from schemas.response import ErrorResponse
    
    error_response = ErrorResponse(
        statusCode=exc.status_code,
        shortMessage="Error",
        description=f"HTTP {exc.status_code}: {exc.detail}",
        error=exc.detail,
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(mode='json')
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    General exception handler - trả về RestResponse format
    """
    from schemas.response import ErrorResponse
    
    error_response = ErrorResponse(
        statusCode=500,
        shortMessage="Internal Server Error",
        description="Lỗi không lường trước xảy ra trong quá trình xử lý",
        error=str(exc),
        path=str(request.url),
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump(mode='json')
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8017)