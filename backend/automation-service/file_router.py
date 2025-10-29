

from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Response, Form, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from typing import List, Optional
import os
from collections import deque
import io
import json
import uuid
from datetime import datetime, timezone
import asyncio
import httpx

from schemas.file_schemas import FileUploadResponse, FileDownloadResponse, FileListResponse, FileDetailsResponse
from schemas.response import RestResponse
from schemas.view_schemas import ViewType, ViewMapper, PaginatedViewResponse
from services.file_service import FileStorageService
from services.file_api_builder import build_file_api_payload
from config import Config
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService
from services.file_service import FileStorageService
from services.websocket_manager import WebSocketManager
# from services.event_service import EventService  # DISABLED - Requires Redis
from services.async_processor import async_processor
from services.progress_service import ProgressService
from services.extract_file_service import ExtractFileService
from services.contract_summary_service import ContractSummaryService
from utils.binary_filter import safe_log_dict, safe_log_text
from services.kafka_publisher_v3 import KafkaPublisherV3  # Assuming it exists or use direct aiokafka

# Create router
router = APIRouter(prefix="/api/v1/automation-service/files", tags=["APIs Quản lý File"])

# Initialize services
file_service = FileStorageService()
ocr_service = OCRService()
ai_service = AutomationService()
websocket_manager = WebSocketManager()
# Import global event_service instance
# from global_instances import event_service  # DISABLED - Requires Redis

# Direct Kafka producer for publishing events (no Redis needed)
from aiokafka import AIOKafkaProducer
import json

# Global Kafka producer
kafka_producer = None

async def get_kafka_producer():
    global kafka_producer
    if kafka_producer is None:
        from config import Config
        kafka_producer = AIOKafkaProducer(
            bootstrap_servers=Config.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await kafka_producer.start()
    return kafka_producer

async def publish_kafka_event(event: dict, document_id: str = None):
    try:
        producer = await get_kafka_producer()
        # Use single topic as per EVENT-ARCHITECTURE-V3.md
        topic = "docgo-file-events"
        # Use fileId as the Kafka key (fallback to documentId for backward compatibility)
        key = document_id or event.get("data", {}).get("fileId") or event.get("data", {}).get("documentId", "unknown")
        await producer.send_and_wait(topic, event, key=key.encode('utf-8'))
        print(f"[DEBUG] Published -> topic={topic} key={key}")
    except Exception as e:
        print(f"[WARN] Kafka publish failed ({topic}): {e}")
progress_service = ProgressService()
extract_file_service = ExtractFileService()
contract_summary_service = ContractSummaryService()

# Recent uploads in-memory queue (most recent last)
RECENT_UPLOADS = deque(maxlen=50)


@router.post("", summary="Upload document", tags=["📁 APIs Quản lý File"])
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    repository_id: str = Form(...),
):
    return await upload_document(request=request, file=file, repository_id=repository_id)


@router.get("/{file_id}/download", summary="Download file")
async def download_file(
    file_id: str,
    user_id: Optional[str] = Query(None),
    version: Optional[int] = Query(None)
):
    
    try:
        response = file_service.download_file(file_id, user_id, version)
        
        # Create streaming response
        file_stream = io.BytesIO(response.file_content)
        
        return StreamingResponse(
            io.BytesIO(response.file_content),
            media_type=response.content_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{response.filename}\"",
                "Content-Length": str(response.file_size)
            }
        )
    except HTTPException as e:
        raise e


@router.get("", summary="Danh sách files với projection", response_model=RestResponse[PaginatedViewResponse])
async def get_all_files(
    view: str = Query("table"),
    page_number: int = Query(0),
    page_size: int = Query(10),
    sort_by: Optional[List[str]] = Query(None),
    sort_direction: Optional[List[str]] = Query(None),
    include_deleted: bool = Query(False)
):
    
    try:
        # Validate view type
        try:
            view_type = ViewType(view.lower())
        except ValueError:
            view_type = ViewType.TABLE
        
        # Get files from service
        response = file_service.get_all_files(page_number, page_size, sort_by, sort_direction, include_deleted)
        
        # Map files to view
        view_items = []
        for file_data in response.files:
            # Convert file data to dict if needed
            if hasattr(file_data, 'dict'):
                file_dict = file_data.dict()
            else:
                file_dict = file_data
            
            # Map to view
            view_item = ViewMapper.map_file_to_view(file_dict, view_type)
            view_items.append(view_item)
        
        # Create paginated view response
        paginated_response = PaginatedViewResponse(
            view=view_type.value,
            items=view_items,
            pagination={
                "page": response.current_page,
                "size": response.page_size,
                "totalElements": response.total_elements,
                "totalPages": response.total_pages
            }
        )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Lấy danh sách file thành công",
            data=paginated_response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )


@router.get("/recent", summary="Top uploads gần đây", response_model=RestResponse[List[dict]])
async def get_recent_uploads(limit: int = Query(5)):
    try:
        # Get most recent items first
        items = list(RECENT_UPLOADS)
        if not items:
            return RestResponse(
                apiVersion="v1",
                statusCode=200,
                shortMessage="Success",
                description="Không có uploads gần đây",
                data=[],
                timestamp=datetime.now().isoformat(),
                requestId=str(uuid.uuid4()),
                path="/api/v1/automation-service/files/recent"
            )
        items = list(reversed(items))[: max(1, min(50, limit))]
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Lấy danh sách upload gần đây thành công",
            data=items,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/recent"
        )
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/recent"
        )


@router.post("/presign", summary="Tạo presigned URL để upload trực tiếp")
async def presign_upload(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    filename = body.get("filename") or body.get("fileName") or "upload.bin"
    content_type = body.get("contentType") or "application/octet-stream"
    repository_id = body.get("repository_id") or body.get("repositoryId")

    if not filename:
        raise HTTPException(status_code=400, detail="filename required")

    file_id = str(uuid.uuid4())
    s3_enabled = os.getenv("S3_ENABLED", "false").lower() == "true"
    s3_bucket = os.getenv("S3_BUCKET", "devgo2003-docgo-bucket")
    s3_endpoint = os.getenv("S3_ENDPOINT", "https://s3.filebase.com")
    s3_region = os.getenv("S3_REGION", "us-east-1")
    s3_access_key = os.getenv("S3_ACCESS_KEY_ID", "")
    s3_secret_key = os.getenv("S3_SECRET_ACCESS_KEY", "")

    folder = body.get("folder") or "files"
    s3_key = f"{folder}/{file_id}_{filename}"

    if not s3_enabled or not s3_access_key or not s3_secret_key:
        raise HTTPException(status_code=500, detail="S3 presign is not enabled")

    try:
        import boto3
        from botocore.config import Config as BotoConfig
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            region_name=s3_region,
            aws_access_key_id=s3_access_key,
            aws_secret_access_key=s3_secret_key,
            config=BotoConfig(signature_version='s3v4', s3={'addressing_style': 'path'})
        )
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': s3_bucket, 'Key': s3_key, 'ContentType': content_type},
            ExpiresIn=900
        )
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Presigned URL created",
            data={
                "method": "PUT",
                "uploadUrl": upload_url,
                "fileKey": s3_key,
                "fileId": file_id,
                "repositoryId": repository_id
            },
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/presign"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Presign failed: {e}")


@router.post("/complete", summary="Hoàn tất upload trực tiếp và xử lý nền")
async def complete_upload(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    file_key = body.get("fileKey")
    file_id = body.get("fileId")
    repository_id = body.get("repository_id") or body.get("repositoryId")
    content_type = body.get("contentType") or None
    size = body.get("size") or 0

    if not file_key or not file_id:
        raise HTTPException(status_code=400, detail="fileKey and fileId are required")

    s3_enabled = os.getenv("S3_ENABLED", "false").lower() == "true"
    s3_bucket = os.getenv("S3_BUCKET", "devgo2003-docgo-bucket")
    s3_endpoint = os.getenv("S3_ENDPOINT", "https://s3.filebase.com")
    s3_region = os.getenv("S3_REGION", "us-east-1")
    s3_access_key = os.getenv("S3_ACCESS_KEY_ID", "")
    s3_secret_key = os.getenv("S3_SECRET_ACCESS_KEY", "")

    if not s3_enabled or not s3_access_key or not s3_secret_key:
        raise HTTPException(status_code=500, detail="S3 not enabled")

    try:
        import boto3
        from botocore.config import Config as BotoConfig
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            region_name=s3_region,
            aws_access_key_id=s3_access_key,
            aws_secret_access_key=s3_secret_key,
            config=BotoConfig(signature_version='s3v4', s3={'addressing_style': 'path'})
        )
        s3_client.head_object(Bucket=s3_bucket, Key=file_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Uploaded object not found: {e}")

    try:
        await progress_service.start(file_id)
    except Exception:
        pass

    return RestResponse(
        apiVersion="v1",
        statusCode=202,
        shortMessage="Accepted",
        description="Upload completed. Processing started.",
        data={
            "fileId": file_id,
            "fileKey": file_key,
            "repositoryId": repository_id,
            "size": size,
            "contentType": content_type
        },
        timestamp=datetime.now().isoformat(),
        requestId=str(uuid.uuid4()),
        path="/api/v1/automation-service/files/complete"
    )
@router.get("/{file_id}", summary="Chi tiết file", response_model=RestResponse[dict])
async def get_file_details(
    file_id: str
):
    
    try:
        response = file_service.get_file_details(file_id)
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )


@router.delete("/{file_id}", summary="Xóa file", response_model=RestResponse[dict])
async def delete_file(
    file_id: str,
    user_id: Optional[str] = Query(None),
    version: Optional[int] = Query(None)
):
    
    try:
        result = file_service.delete_file(file_id, user_id, version)
        response = {"success": result}
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )


@router.get("/check-version", summary="Kiểm tra version conflict", response_model=RestResponse[dict])
async def check_file_version(
    filename: str = Query(...),
    file_size: int = Query(...),
    last_modified: Optional[str] = Query(None)
):
    
    try:
        existing_files = await file_service.get_files_by_name(filename)
        if not existing_files:
            return RestResponse(
                apiVersion="v1",
                statusCode=200,
                shortMessage="Success",
                data={
                    "hasConflict": False,
                    "existingFile": None,
                    "currentFile": {
                        "filename": filename,
                        "size": file_size,
                        "lastModified": last_modified
                    },
                    "conflictType": "none",
                    "message": "File mới, không có xung đột phiên bản"
                },
                timestamp=datetime.now().isoformat(),
                requestId=str(uuid.uuid4()),
                path="/api/v1/automation-service/files/check-version"
            )
        latest_file = max(existing_files, key=lambda x: x.get('created_at', ''))
        size_conflict = latest_file.get('size', 0) != file_size
        timestamp_conflict = False
        if last_modified and latest_file.get('last_modified'):
            try:
                from datetime import datetime as _dt
                current_time = _dt.fromisoformat(last_modified.replace('Z', '+00:00'))
                existing_time = _dt.fromisoformat(latest_file['last_modified'].replace('Z', '+00:00'))
                timestamp_conflict = current_time < existing_time
            except:
                timestamp_conflict = False
        conflict_type = "none"
        if size_conflict and timestamp_conflict:
            conflict_type = "both"
        elif size_conflict:
            conflict_type = "size"
        elif timestamp_conflict:
            conflict_type = "timestamp"
        has_conflict = conflict_type != "none"
        if has_conflict:
            if conflict_type == "size":
                message = f"File '{filename}' da ton tai voi kich thuoc khac ({latest_file.get('size', 0)} bytes vs {file_size} bytes)"
            elif conflict_type == "timestamp":
                message = f"File '{filename}' da ton tai voi thoi gian sua doi moi hon"
            else:
                message = f"File '{filename}' da ton tai voi ca kich thuoc va thoi gian sua doi khac"
        else:
            message = f"File '{filename}' da ton tai nhung khong co xung dot version"
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data={
                "hasConflict": has_conflict,
                "existingFile": {
                    "id": latest_file.get('id', ''),
                    "filename": latest_file.get('filename', ''),
                    "size": latest_file.get('size', 0),
                    "lastModified": latest_file.get('last_modified', ''),
                    "version": latest_file.get('version', '1.0')
                },
                "currentFile": {
                    "filename": filename,
                    "size": file_size,
                    "lastModified": last_modified
                },
                "conflictType": conflict_type,
                "message": message
            },
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/check-version"
        )
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/check-version"
        )


# Unified upload implementation (helper used by upload_file)
def detect_mime_type(file_content: bytes, filename: str, client_content_type: str) -> str:
    """
    Detect correct MIME type from file content and extension.
    Falls back to client-provided content type if detection fails.
    """
    # Check file extension first
    if filename:
        filename_lower = filename.lower()
        if filename_lower.endswith('.docx'):
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif filename_lower.endswith('.doc'):
            return 'application/msword'
        elif filename_lower.endswith('.pdf'):
            return 'application/pdf'
        elif filename_lower.endswith('.txt'):
            return 'text/plain'
        elif filename_lower.endswith('.json'):
            return 'application/json'
    
    # Check file signature (magic bytes)
    if len(file_content) >= 4:
        # DOCX files start with PK (ZIP signature)
        if file_content[:2] == b'PK':
            # Check if it's a DOCX by looking for specific ZIP entries
            try:
                # Look for word/document.xml in the ZIP structure
                if b'word/document.xml' in file_content[:1024]:
                    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            except:
                pass
        
        # PDF files start with %PDF
        if file_content[:4] == b'%PDF':
            return 'application/pdf'
        
        # JSON files start with { or [
        if file_content[0] in [b'{', b'[']:
            return 'application/json'
    
    # Fallback to client-provided content type
    return client_content_type or 'application/octet-stream'

async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    repository_id: str | None = Form(None),
):
    """
    Unified document upload endpoint with full audit logging, event publishing, error handling, and retry.
    - Always async processing via Kafka queue, returns 201 with correlationId for progress tracking.
    """
    from services.audit_service import audit_service
    from utils.retry_helper import retry_async
    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        # Get file content
        file_content = await file.read()
        filename = file.filename
        mime_type = file.content_type or 'application/octet-stream'
        size = len(file_content)
        
        # 1. Validate (keep existing)
        if size > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(status_code=413, detail="File too large")
        
        # 2. Upload to S3 sync (fast)
        file_id = await file_service.upload_to_s3(file_content, filename, mime_type, folder='documents')
        file_url = f"https://s3.filebase.com/devgo2003-docgo-bucket/files/{file_id}_{filename.replace(' ', '_')}"
        
        # Log audit
        await audit_service.log_event(
            action="file_uploaded",
            user_id="system",  # From auth
            repository_id=repository_id,
            file_id=file_id,
            correlation_id=correlation_id
        )
        
        # 3. Publish Kafka event for background processing
        event_data = {
            "eventType": "FILE_UPLOAD_REQUESTED",
            "fileId": file_id,
            "repository_id": repository_id,
            "user_id": "system",  # From request
            "correlationId": correlation_id,
            "filename": filename,
            "size": size,
            "mimeType": mime_type,
            "timestamp": now_iso
        }
        await kafka_publisher.publish('upload-processing-queue', event_data)  # Use aiokafka send if needed
        
        logger.info(f"Upload queued: fileId={file_id}, correlationId={correlation_id}")
        
        # 4. Return fast response like curl example
        return {
            "apiVersion": "v1",
            "timestamp": now_iso,
            "requestId": correlation_id,
            "path": request.url.path,
            "statusCode": 201,
            "shortMessage": "Created",
            "description": "Document created, processing queued in background",
            "data": {
                "fileId": file_id,
                "fileUrl": file_url,
                "correlationId": correlation_id
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Alias removed as requested; single POST at files root is the canonical endpoint




@router.get("/events/{job_id}/status", summary="Trạng thái xử lý JSON", tags=["📁 APIs Quản lý File"])
async def get_event_status(job_id: str):
    await progress_service.initialize()
    status = await progress_service.get_status(job_id)
    if not status:
        return RestResponse(
            apiVersion="v1",
            statusCode=404,
            shortMessage="Not Found",
            description="Job không tồn tại hoặc đã hết hạn",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/events/{job_id}/status"
        )
    return RestResponse(
        apiVersion="v1",
        statusCode=200,
        shortMessage="Success",
        description="Lấy trạng thái job thành công",
        data=status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        requestId=str(uuid.uuid4()),
        path=f"/api/v1/automation-service/files/events/{job_id}/status"
    )


@router.websocket("/ws/document/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    """WebSocket endpoint for real-time document processing progress"""
    try:
        await websocket_manager.connect(websocket, document_id)
        
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "documentId": document_id,
            "message": "Connected to document processing updates"
        })
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for client messages (ping/pong)
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
