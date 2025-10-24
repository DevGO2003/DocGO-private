from fastapi import APIRouter, File, UploadFile, Header, HTTPException, Body, Request, Query, Form, WebSocket, WebSocketDisconnect
import logging
import asyncio

# Setup logger
logger = logging.getLogger(__name__)
import aiohttp
from docx import Document
import PyPDF2
import os
from config import Config
import os
import google.generativeai as genai
import json
import uuid
from datetime import datetime, timezone
from schemas.response import RestResponse
from schemas.contract_summary import ContractSummary, ContractSummaryResponse
from bs4 import BeautifulSoup
from pptx import Presentation
from openpyxl import load_workbook
from striprtf.striprtf import rtf_to_text
import csv
from services.ai_processing_service import AutomationService
from services.file_service import FileStorageService

# Document processor removed - not used
# Removed unused service imports
# from schemas.notification_schemas import (
#     NotificationRequest, NotificationHistoryRequest, NotificationTemplate,
#     EmailNotificationRequest, SMSNotificationRequest, PushNotificationRequest,
#     WebSocketNotificationRequest
# )
from schemas.batch_schemas import (
    BatchJobRequest, BatchJobStatusRequest, BatchJobListRequest,
    BatchJobCancelRequest, BatchJobRetryRequest, BatchProcessingRequest,
    BatchProcessingResponse
)
# Event schemas removed - using direct dict for Kafka events
from schemas.view_schemas import ViewType, ViewMapper, PaginatedViewResponse

router = APIRouter(prefix="/api/v1/automation-service")
# Removed deprecated /documents/upload endpoint as requested


@router.websocket("/documents/progress/{document_id}")
async def documents_progress_ws(websocket: WebSocket, document_id: str):
    from services.websocket_manager import websocket_manager
    
    await websocket_manager.connect(websocket, document_id)
    
    try:
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for client messages (ping/pong, etc.)
                message = await websocket.receive_text()
                logger.info(f"Received message from {document_id}: {message}")
                
                # Handle ping/pong or other client messages
                if message == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for {document_id}")
                break
            except Exception as e:
                logger.error(f"Error in WebSocket for {document_id}: {e}")
                break
    except Exception as e:
        logger.error(f"WebSocket error for {document_id}: {e}")
    finally:
        await websocket_manager.disconnect(websocket, document_id)

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)


def read_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs if para.text])

def read_pdf(file_path: str) -> str:
    text = ""
    with open(file_path, "rb") as f:
        pdf_reader = PyPDF2.PdfReader(f)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    return text


def ask_gemini(api_key: str, content: str, question: str) -> str:
    # Deprecated: AI endpoints removed
    return ""

# Removed: /document/extract and /document/classify endpoints

# API Test: Lấy cấu hình Gemini
@router.get("/gemini/get-config", summary="Lấy cấu hình Gemini", tags=["⚙️ APIs Kiểm tra Hệ thống"])
async def get_gemini_config(request: Request):
    try:
        # Lấy cấu hình Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        # Lấy cấu hình service
        service_name = os.getenv("SERVICE_NAME", "automation-service")
        host = os.getenv("HOST", "0.0.0.0")
        port = os.getenv("PORT", "8003")
        debug = os.getenv("DEBUG", "false")
        
        # Lấy cấu hình Kafka
        kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
        kafka_group_id = os.getenv("KAFKA_GROUP_ID", "automation-service")
        
        # Lấy cấu hình Redis
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = os.getenv("REDIS_PORT", "6379")
        redis_db = os.getenv("REDIS_DB", "0")
        
        # Tạo response data
        config_data = {
            "gemini": {
                "api_key": {
                    "exists": api_key is not None,
                    "length": len(api_key) if api_key else 0,
                    "masked": f"{api_key[:8]}...{api_key[-4:]}" if api_key and len(api_key) > 12 else "N/A" if not api_key else api_key,
                    "status": "CONFIGURED" if api_key else "NOT_CONFIGURED"
                },
                "model": model,
                "status": "READY" if api_key else "NOT_CONFIGURED"
            },
            "service": {
                "name": service_name,
                "host": host,
                "port": port,
                "debug": debug.lower() == "true",
                "version": "2.0.0"
            },
            "kafka": {
                "bootstrap_servers": kafka_servers,
                "group_id": kafka_group_id,
                "status": "CONFIGURED"
            },
            "redis": {
                "host": redis_host,
                "port": redis_port,
                "database": redis_db,
                "status": "CONFIGURED"
            },
            "system": {
                "python_path": os.getcwd(),
                "environment": os.getenv("NODE_ENV", "development"),
                "env_files": {
                    "dotenv_loaded": True,
                    "env_exists": os.path.exists("env/.env"),
                    "env_example_exists": os.path.exists("env/.env.example")
                }
            }
        }
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=config_data,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )
        
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )


# ==================== NOTIFICATION APIs ====================
# TEMPORARILY DISABLED - Missing twilio dependency

# Initialize services (will be initialized in main.py)
# Removed unused service instances

# Batch processing endpoint removed - batch_service.py deleted

# Batch status endpoint removed - batch_service.py deleted

# Batch jobs endpoint removed - batch_service.py deleted


@router.get("/health", summary="Health check", tags=["🏥 APIs Kiểm tra Hệ thống"])
async def health_check():
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
        path="/api/v1/automation-service/health"
    )


