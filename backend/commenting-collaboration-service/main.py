from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os

from routers import collab


app = FastAPI(
    title=os.getenv("APP_NAME", "Commenting Collaboration Service"),
    version=os.getenv("APP_VERSION", "1.0.0"),
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

app.include_router(collab.router, prefix="/api/v1/commenting-collaboration-service")


@app.get("/")
async def root():
    return RedirectResponse(url="/docs", status_code=302)


