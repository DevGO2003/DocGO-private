from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from datetime import datetime, timezone
import uuid

from .routers import router as versioning_router


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_envelope(status_code: int, short_message: str, description: str, data, path: str, request_id: str):
    return {
        "apiVersion": "v1",
        "statusCode": status_code,
        "shortMessage": short_message,
        "description": description,
        "data": data,
        "timestamp": iso_now(),
        "requestId": request_id,
        "path": path,
    }


app = FastAPI(
    title="Versioning Document History Service",
    description="Dịch vụ quản lý phiên bản và lịch sử tài liệu cho DocGO",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    try:
        response = await call_next(request)
        return response
    except Exception as exc:  # fallback 500 envelope
        envelope = build_envelope(
            500,
            "Internal Server Error",
            "Đã xảy ra lỗi không lường trước.",
            None,
            request.url.path,
            request.state.request_id,
        )
        return JSONResponse(status_code=500, content=envelope)


@app.get("/")
async def root(request: Request):
    return build_envelope(200, "Success", "Versioning Document History Service is running.", {"service": "versioning-document-history-service"}, request.url.path, request.state.request_id)


app.include_router(versioning_router)


