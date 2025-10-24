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
from services.document_processor import DocumentProcessor
from services.file_service import FileStorageService

# Initialize document processor
document_processor = DocumentProcessor()
# from services.notification_service import NotificationService
# from services.batch_service import BatchService  # DISABLED - Requires Redis
# from services.event_service import EventService  # DISABLED - Requires Redis
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
# notification_service = NotificationService()
# batch_service = BatchService()  # DISABLED - Requires Redis
# Import global event_service instance
# from global_instances import event_service  # DISABLED - Requires Redis

# DISABLED - Requires Redis
# @router.post("/batch/process", summary="Xử lý batch", tags=["📦 APIs Xử lý Batch"])
async def process_batch_api_disabled(
    request: Request,
    batch_request: BatchProcessingRequest
):
    try:
        await batch_service.initialize()
        
        # Tạo batch job
        job_request = BatchJobRequest(
            type="ai_processing",
            name=f"Batch processing {len(batch_request.files)} files",
            data={
                "files": batch_request.files,
                "processing_type": batch_request.processing_type,
                "options": batch_request.options or {},
                "callback_url": batch_request.callback_url
            }
        )
        
        job = await batch_service.create_batch_job(job_request)
        
        # Bắt đầu xử lý job
        asyncio.create_task(batch_service.process_batch_job(job.id))
        
        result = BatchProcessingResponse(
            job_id=job.id,
            total_files=len(batch_request.files),
            estimated_time=len(batch_request.files) * 30,  # 30 seconds per file
            status_url=f"/api/v1/automation-service/batch/status/{job.id}"
        )
        
        return RestResponse(
            statusCode=201,
            shortMessage="Created",
            data=result.model_dump(),
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )

# DISABLED - Requires Redis
# @router.get("/batch/status/{job_id}", summary="Trạng thái job", tags=["📦 APIs Xử lý Batch"])
async def get_batch_job_status_api_disabled(
    request: Request,
    job_id: str
):
    try:
        await batch_service.initialize()
        result = await batch_service.get_batch_job_status(job_id)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            data=result.model_dump(),
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
        
    except ValueError as e:
        return RestResponse(
            statusCode=404,
            shortMessage="Not Found",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
    except Exception as e:
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )

@router.get("/batch/jobs", summary="Danh sách jobs với projection", tags=["📦 APIs Xử lý Batch"])
async def get_batch_jobs_api(
    request: Request,
    view: ViewType = Query(ViewType.TABLE),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    job_type: str = Query(None),
    status: str = Query(None),
    priority: str = Query(None)
):
    try:
        logger.info(f"Retry OCR request for document: {document_id}")
        
        result = await document_processor.retry_ocr(document_id)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            data=result,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        logger.error(f"Retry OCR failed: {str(e)}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )


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


