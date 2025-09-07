from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import uuid
from datetime import datetime
from routers import router
from config import settings
from fastapi.openapi.utils import get_openapi
from schemas.response import RestResponse


app = FastAPI(
    title="Health Monitoring Agent",
    description="Tác nhân giám sát sức khỏe hệ thống",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_version="3.0.3",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1/health-monitoring-agent")


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        openapi_version="3.0.3",
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = str(uuid.uuid4())
    response = RestResponse[dict](
        apiVersion="v1",
        statusCode=500,
        shortMessage="Internal Server Error",
        description=f"Lỗi không lường trước: {str(exc)}",
        data=None,
        timestamp=datetime.utcnow(),
        requestId=request_id,
        path=str(request.url),
    )
    return JSONResponse(status_code=500, content=response.model_dump())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.service_port, reload=True)


