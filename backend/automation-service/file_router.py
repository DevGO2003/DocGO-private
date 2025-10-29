

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
    - Small files (<2MB): sync processing, returns 201
    - Large files (>=2MB): async processing, returns 202
    - Builds payload matching File Management API schema
    - Non-contract documents have contract=null
    - repository_id: Optional repository ID to associate with the document
    """
    from services.audit_service import audit_service
    from utils.retry_helper import retry_async
    # Event schemas removed - using direct dict for Kafka events
    
    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        # Get file size from content-length header
        size = int(request.headers.get("content-length") or 0)
        sync_mode = True  # TEMPORARILY: Always use sync processing (was: size < 2 * 1024 * 1024)
        
        # Read file content for MIME type detection
        print(f"[DEBUG_READ1] Reading file for MIME detection...")
        file_content = await file.read()
        print(f"[DEBUG_READ1] Read {len(file_content)} bytes")
        await file.seek(0)  # Reset file pointer
        print(f"[DEBUG_READ1] Seeked back to position 0")
        
        # Detect correct MIME type
        detected_mime_type = detect_mime_type(file_content, file.filename, file.content_type)
        print(f"[DEBUG] MIME type detection: filename='{file.filename}', client='{file.content_type}', detected='{detected_mime_type}'")
        
        # Start audit logging
        await audit_service.log_processing_session({
            "correlationId": correlation_id,
            "documentId": None,  # Will be set after file upload
            "fileName": file.filename,
            "fileSize": size,
            "contentType": detected_mime_type,
            "metadata": {"syncMode": sync_mode, "userAgent": request.headers.get("user-agent")}
        })
        
        # Log file upload event
        await audit_service.log_event({
            "eventVersion": "v1",
            "eventType": "FILE_UPLOAD_STARTED",
            "correlationId": correlation_id,
            "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
            "data": {
                "fileName": file.filename,
                "fileSize": size,
                "contentType": detected_mime_type,
                "syncMode": sync_mode
            },
            "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
        })
        
        # 1) Upload to S3 with retry
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "S3_UPLOAD",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            upload_result = await retry_async(
                file_service.upload_file,
                file, folder="files", user_id="system",
                max_retries=3,
                backoff_factor=2.0,
                exceptions=(Exception,),
                on_retry=lambda retry_count, e: print(f"S3 upload retry {retry_count}: {e}")
            )
            file_url = upload_result.file_url
            file_id = upload_result.file_id
            
            await audit_service.add_session_step(correlation_id, {
                "stepName": "S3_UPLOAD",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"fileUrl": file_url, "fileId": file_id}
            })
            
            # Log file upload completed event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "FILE_UPLOAD_COMPLETED",
                "correlationId": correlation_id,
                "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                "data": {
                    "fileId": file_id,
                    "fileUrl": file_url,
                    "fileName": file.filename,
                    "fileSize": size,
                    "contentType": file.content_type
                },
                "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
            })

            # Add to recent uploads queue
            RECENT_UPLOADS.append({
                "fileId": file_id,
                "fileName": file.filename,
                "fileSize": size,
                "contentType": detected_mime_type,
                "fileUrl": file_url,
                "repositoryId": repository_id,
                "uploadedAt": now_iso,
            })
            
        except Exception as e:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "S3_UPLOAD",
                "status": "FAILED",
                "completedAt": datetime.now(timezone.utc),
                "error": str(e)
            })
            await audit_service.log_error({
                "correlationId": correlation_id,
                "errorType": "S3_UPLOAD_FAILED",
                "errorMessage": str(e),
                "step": "S3_UPLOAD",
                "retryable": True,
                "retryCount": 3
            })
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
        
        # 2) Run OCR / extract plaintext using unified OCR service
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "OCR_PROCESSING",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            print(f"[DEBUG_READ2] Reading file for OCR processing...")
            file_content = await file.read()
            await file.seek(0)
            print(f"[DEBUG_READ2] Read {len(file_content)} bytes")
            
            # Sử dụng OCR service thống nhất để trích xuất text và metadata
            extraction_result = await retry_async(
                ocr_service.extract_text_and_metadata,
                file_content, file.filename, detected_mime_type,
                max_retries=2,
                backoff_factor=1.5,
                exceptions=(Exception,),
                on_retry=lambda retry_count, e: print(f"OCR retry {retry_count}: {e}")
            )
            
            # Log OCR result safely (filter binary data)
            print(f"[DEBUG] OCR extraction result: {safe_log_dict(extraction_result)}")
            if extraction_result["success"]:
                ocr_text = extraction_result["text"]
                plaintext_text = ocr_text
                json_content_text = None
                print(f"[DEBUG] OCR text extracted, length: {len(ocr_text) if ocr_text else 0}, preview: {safe_log_text(ocr_text, 100)}")
                
                # Xử lý JSON content riêng biệt
                if file.content_type and file.content_type.lower() == "application/json":
                    json_content_text = extraction_result["text"]
            else:
                # OCR thất bại - không có fallback, trả về null
                print(f"[DEBUG] OCR failed: {extraction_result.get('error', 'Unknown error')}")
                ocr_text = None
                plaintext_text = None
                json_content_text = None
            
            await audit_service.add_session_step(correlation_id, {
                "stepName": "OCR_PROCESSING",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"textLength": len(ocr_text) if ocr_text else 0}
            })
            
        except Exception as e:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "OCR_PROCESSING",
                "status": "FAILED",
                "completedAt": datetime.now(timezone.utc),
                "error": str(e)
            })
            await audit_service.log_error({
                "correlationId": correlation_id,
                "errorType": "OCR_FAILED",
                "errorMessage": str(e),
                "step": "OCR_PROCESSING",
                "retryable": True,
                "retryCount": 2
            })
            print(f"OCR failed, using filename: {e}")
            ocr_text = f"OCR failed for {file.filename}"
            if plaintext_text is None:
                plaintext_text = ocr_text

        # Helper builders for sample.json-compatible document
        def _now_iso():
            return datetime.now(timezone.utc).isoformat()

        def build_file_processed_payload(
            file_id: str,
            file_url: str,
            filename: str,
            content_type: str,
            size: int,
            ocr_text_val: str | None,
            classification_result_val: dict,
        ):
            """Build FileProcessed event payload"""
            return {
                "id": file_id,
                "filename": filename,
                "contentType": content_type,
                "size": size,
                "storage": {
                    "url": file_url,
                    "type": "s3" if Config.S3_ENABLED else "local"
                },
                "processing": {
                    "status": "COMPLETED",
                    "ocr": {"text": ocr_text_val, "status": "SUCCESS" if ocr_text_val else "SKIPPED"},
                    "classification": classification_result_val,
                    "processedAt": _now_iso()
                },
                "metadata": {
                    "fileSystem": {
                        "dateModified": _now_iso(),
                        "dateAdded": _now_iso(),
                        "mediaFilename": filename,
                        "originalFilename": filename,
                        "originalFileSize": size,
                        "originalMimeType": content_type
                    }
                },
                "audit": {
                    "createdAt": _now_iso(),
                    "createdBy": "system",
                    "updatedAt": _now_iso(),
                    "updatedBy": "system",
                    "isDeleted": False,
                    "version": 1
                }
            }

        def build_sample_document_payload(
            document_id: str,
            file_url: str,
            filename: str,
            content_type: str,
            size: int,
            ocr_text_val: str | None,
            classification_result_val: dict,
            summary_result_val: dict | None,
        ):
            is_contract_local = bool(classification_result_val.get("isContract"))
            category_local = classification_result_val.get("category", "Tài liệu thông thường")
            now_local = _now_iso()

            overview = {
                "title": filename,
                "status": "ACTIVE",
                "documentType": "CONTRACT" if is_contract_local else "GENERAL",
                "contractType": (summary_result_val or {}).get("contractType"),
                "category": category_local,
                "tags": [],
                "ownerUserId": "system",
                "new": True
            }

            contract = None
            if is_contract_local:
                contract = {
                    "effectiveDate": (summary_result_val or {}).get("effectiveDate"),
                    "expiryDate": (summary_result_val or {}).get("expiryDate"),
                    "totalValue": (summary_result_val or {}).get("totalValue"),
                    "currency": (summary_result_val or {}).get("currency"),
                    "summary": (summary_result_val or {}).get("summary"),
                    "parties": (summary_result_val or {}).get("parties", []),
                    "payment": (summary_result_val or {}).get("payment"),
                    "clauses": (summary_result_val or {}).get("clauses", {"key": [], "unfavorable": []}),
                    "reminders": (summary_result_val or {}).get("reminders", []),
                    "risk": (summary_result_val or {}).get("risk"),
                    "compliance": (summary_result_val or {}).get("compliance")
                }

            content = {
                "plaintext": ocr_text_val or None,
                "ocr": {"text": None, "status": None},
                "classification": classification_result_val,
                "processing": {"status": "COMPLETED", "error": None}
            }

            file_block = {
                "id": document_id,
                "name": filename,
                "type": content_type,
                "size": size,
                "version": 1
            }

            storage = {
                "s3": {
                    "url": file_url,
                    "bucket": None,
                    "objectKey": None,
                    "region": None,
                    "contentType": content_type,
                    "size": size,
                    "versionId": None,
                    "checksum": {"originalMD5": None, "archiveMD5": None}
                },
                "local": {
                    "path": None,
                    "filename": filename,
                    "mimeType": content_type,
                    "size": size,
                    "mtime": None,
                    "revision": None
                }
            }

            versioning = {
                "currentVersion": 1,
                "versionTag": "1.0.0",
                "previousVersion": None,
                "changeSummary": None,
                "changedFields": [],
                "diff": {},
                "history": [
                    {
                        "version": 1,
                        "versionTag": "1.0.0",
                        "changedAt": now_local,
                        "changedBy": "system",
                        "changeType": "CREATE",
                        "storage": {"s3": {"versionId": None}, "local": {"revision": None}}
                    }
                ]
            }

            metadata_block = {
                "fileSystem": {
                    "dateModified": None,
                    "dateAdded": now_local,
                    "mediaFilename": filename,
                    "originalFilename": filename,
                    "originalMD5": None,
                    "originalFileSize": size,
                    "originalMimeType": content_type,
                    "archiveMD5": None,
                    "archiveFileSize": size
                }
            }

            audit_block = {
                "createdAt": now_local,
                "createdBy": "system",
                "updatedAt": now_local,
                "updatedBy": "system",
                "deletedAt": None,
                "deletedBy": None,
                "isDeleted": False,
                "version": 1
            }

            return {
                "id": document_id,
                "overview": overview,
                "contract": contract,
                "content": content,
                "file": file_block,
                "storage": storage,
                "versioning": versioning,
                "metadata": metadata_block,
                "audit": audit_block
            }
        
        # 3) Run classification with retry
        # Khai báo biến is_contract trước khối try để tránh lỗi scope
        is_contract = False
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "AI_CLASSIFICATION",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            # Pre-check with SmartSampler (keyword-based confidence)
            print(f"[DEBUG] SmartSampler pre-check starting...")
            from utils.smart_sampler import SmartSampler
            
            keyword_confidence = 0.0
            classification_method = "AI"
            
            if plaintext_text and len(plaintext_text.strip()) > 0:
                keyword_confidence = SmartSampler.get_contract_confidence(plaintext_text)
                print(f"[DEBUG] SmartSampler keyword confidence: {keyword_confidence}")
                print(f"[DEBUG] SmartSampler keywords found: {SmartSampler.CONTRACT_KEYWORDS}")
                
                # If high confidence from keywords, skip AI and use SmartSampler result
                if keyword_confidence >= 0.7:
                    print(f"[DEBUG] SmartSampler high confidence ({keyword_confidence}), skipping AI classification")
                    classification_result = {
                        "documentType": "contract",
                        "isContract": True,
                        "confidence": keyword_confidence,
                        "reasons": ["Phát hiện từ khóa hợp đồng rõ ràng từ SmartSampler"],
                        "contractSubtype": None,
                        "category": "Hợp đồng",
                        "language": "vi"
                    }
                    classification_method = "SmartSampler"
                else:
                    print(f"[DEBUG] SmartSampler confidence {keyword_confidence} < 0.7, using AI classification")
                    print(f"[DEBUG] Using extracted text for AI classification, text length: {len(plaintext_text)}")
                    classification_result = await retry_async(
                        ai_service.classify_document,
                        plaintext_text, file.filename,
                        max_retries=2,
                        backoff_factor=1.5,
                        exceptions=(Exception,),
                        on_retry=lambda retry_count, e: print(f"AI classification retry {retry_count}: {e}")
                    )
                    classification_method = "AI"
            else:
                print(f"[DEBUG] No text content, sending file directly to AI for classification")
                # Gửi file trực tiếp cho AI để xử lý
                file_content = await file.read()
                await file.seek(0)
                classification_result = await retry_async(
                    ai_service.classify_document_from_file,
                    file_content, file.filename, detected_mime_type,
                    max_retries=2,
                    backoff_factor=1.5,
                    exceptions=(Exception,),
                    on_retry=lambda retry_count, e: print(f"AI file classification retry {retry_count}: {e}")
                )
                classification_method = "AI"
            
            # Log classification safely
            print(f"[DEBUG] AI Classification result: {safe_log_dict(classification_result)}")
            is_contract = bool(classification_result.get("isContract", False))
            print(f"[DEBUG] is_contract from AI: {is_contract}")
            print(f"[DEBUG] Classification method: {classification_method}, SmartSampler confidence: {keyword_confidence}")
            
            await audit_service.add_session_step(correlation_id, {
                "stepName": "AI_CLASSIFICATION",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"isContract": is_contract, "category": classification_result.get("category")}
            })
            
            # Log document classified event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "FILE_CONTENT_EXTRACTED",
                "correlationId": correlation_id,
                "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                "data": {
                    "documentId": file_id,
                    "fileName": file.filename,
                    "isContract": is_contract,
                    "category": classification_result.get("category", "Unknown"),
                    "confidence": classification_result.get("confidence", 0.0)
                },
                "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
            })
            
        except Exception as e:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "AI_CLASSIFICATION",
                "status": "FAILED",
                "completedAt": datetime.now(timezone.utc),
                "error": str(e)
            })
            await audit_service.log_error({
                "correlationId": correlation_id,
                "errorType": "AI_CLASSIFICATION_FAILED",
                "errorMessage": str(e),
                "step": "AI_CLASSIFICATION",
                "retryable": True,
                "retryCount": 2
            })
            print(f"Classification failed, no fallback: {e}")
            # No fallback - AI only
            classification_result = {
                "isContract": False,
                "confidence": 0.0,
                "category": "Unknown",
                "documentType": "NOT_DOCUMENT",
                "language": None,
                "reasons": ["AI classification failed"]
            }
            is_contract = False
            print(f"[DEBUG] AI Classification failed, is_contract: {is_contract}")
        
        # 4) Run summarization and extract contract metadata if contract
        summary_result = None
        print(f"[DEBUG] About to check contract condition: is_contract={is_contract}")
        if is_contract:
            try:
                await audit_service.add_session_step(correlation_id, {
                    "stepName": "AI_SUMMARIZATION",
                    "status": "STARTED",
                    "startedAt": datetime.now(timezone.utc)
                })
                
                summary_result = await retry_async(
                    ai_service.generate_contract_summary,
                    ocr_text, file.filename,
                    max_retries=2,
                    backoff_factor=1.5,
                    exceptions=(Exception,),
                    on_retry=lambda retry_count, e: print(f"Summarization retry {retry_count}: {e}")
                )
                # Log summary safely
                print(f"[DEBUG] Summary result: {safe_log_dict(summary_result) if summary_result else None}")
                
                await audit_service.add_session_step(correlation_id, {
                    "stepName": "AI_SUMMARIZATION",
                    "status": "COMPLETED",
                    "completedAt": datetime.now(timezone.utc),
                    "result": {"hasSummary": bool(summary_result)}
                })
                
                # Log contract summary updated event
                await audit_service.log_event({
                    "eventVersion": "v1",
                    "eventType": "CONTRACT_SUMMARY_GENERATED",
                    "correlationId": correlation_id,
                    "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                    "data": {
                        "documentId": file_id,
                        "fileName": file.filename,
                        "summaryResult": summary_result,
                        "contractMetadata": {
                            "effectiveDate": summary_result.get("effectiveDate") if summary_result else None,
                            "expiryDate": summary_result.get("expiryDate") if summary_result else None,
                            "totalValue": summary_result.get("totalValue") if summary_result else None,
                            "currency": summary_result.get("currency") if summary_result else None
                        }
                    },
                    "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
                })
                
            except Exception as e:
                await audit_service.add_session_step(correlation_id, {
                    "stepName": "AI_SUMMARIZATION",
                    "status": "FAILED",
                    "completedAt": datetime.now(timezone.utc),
                    "error": str(e)
                })
                await audit_service.log_error({
                    "correlationId": correlation_id,
                    "errorType": "AI_SUMMARIZATION_FAILED",
                    "errorMessage": str(e),
                    "step": "AI_SUMMARIZATION",
                    "retryable": True,
                    "retryCount": 2
                })
                print(f"Contract processing failed: {e}")
                # KHÔNG dùng fallback - để null nếu AI fail
                summary_result = None
        
        # Di chuyển khai báo overview_document_type ra ngoài khối if để tránh lỗi scope
        overview_document_type = "CONTRACT" if is_contract else "GENERAL"
        
        # 5) Build payload matching sample schema
        api_doc_payload = build_file_api_payload(
            file_id=file_id,
            file_url=file_url,
            filename=file.filename,
            content_type=file.content_type,
            size=size,
            ocr_text=ocr_text,
            classification_result=classification_result,
            overview_document_type=overview_document_type,
            contract_metadata=None,  # Now using summary_result directly
            summary_result=summary_result,
            now_iso=now_iso,
        )
        
        # 6) Publish 3 Kafka events (best-effort) for metadata, plaintext, and contract summary
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "METADATA_PUBLISH",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            # Only publish if Kafka is enabled
            if getattr(Config, 'KAFKA_ENABLED', False):
                try:
                    # Calculate hash values for file integrity first
                    import hashlib
                    md5_hash = hashlib.md5(file_content).hexdigest()
                    sha256_hash = hashlib.sha256(file_content).hexdigest()
                    
                    # 1) file.metadata.recorded - Enhanced payload theo sample.json
                    storage_block = {
                        "type": "s3" if Config.S3_ENABLED else "local",
                        "s3": {
                            "url": file_url,
                            "bucket": getattr(Config, 'S3_BUCKET', 'docgo-storage'),
                            "objectKey": f"documents/{file_id}/{file.filename}",
                            "region": getattr(Config, 'S3_REGION', 'us-east-1'),
                            "contentType": file.content_type,
                            "size": size,
                            "versionId": None,
                            "checksum": {
                                "originalMD5": md5_hash,
                                "archiveMD5": None
                            }
                        } if Config.S3_ENABLED else None,
                        "local": {
                            "path": file_url,
                            "filename": file.filename,
                            "mimeType": detected_mime_type,
                            "size": size,
                            "mtime": None,
                            "revision": None
                        } if not Config.S3_ENABLED else None
                    }
                    
                    print(f"[DEBUG] Preparing publish -> topic=docgo-file-events eventType=FILE_UPLOAD_COMPLETED fileId={file_id} size={size} mimeType={detected_mime_type}")
                    
                    metadata_evt = {
                        "eventVersion": "1.0",
                        "eventType": "FILE_UPLOAD_COMPLETED",
                        "eventId": str(uuid.uuid4()),
                        "timestamp": now_iso,
                        "source": "automation-service",
                        "correlationId": correlation_id,
                        "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                        "data": {
                            "fileId": file_id,
                            "fileName": file.filename,
                            "mimeType": detected_mime_type,
                            "size": size,
                            "ownerUserId": "system",
                            "storage": storage_block,
                            "file": {
                                "id": file_id,
                                "name": file.filename,
                                "type": file.content_type,
                                "size": size,
                                "hash": {
                                    "md5": md5_hash,
                                    "sha256": sha256_hash
                                },
                                "permissions": None,  # Should come from user management, not hardcoded,
                                "security": None,  # Should come from security config, not hardcoded,
                                "version": 1
                            },
                            "metadata": {
                                "fileSystem": {
                                    "dateModified": now_iso,
                                    "dateAdded": now_iso,
                                    "mediaFilename": file.filename,
                                    "originalFilename": file.filename,
                                    "originalMD5": md5_hash,
                                    "originalFileSize": size,
                                    "originalMimeType": file.content_type,
                                    "archiveMD5": None,
                                    "archiveFileSize": None
                                },
                                "technical": {
                                    "encoding": None,  # Should be detected, not hardcoded
                                    "lineEnding": None,  # Should be detected, not hardcoded
                                    "bom": None,  # Should be detected, not hardcoded
                                    "compression": None,  # Should be detected, not hardcoded
                                    "pages": None,
                                    "wordCount": len(plaintext_text.split()) if plaintext_text else 0,
                                    "characterCount": len(plaintext_text) if plaintext_text else 0
                                }
                            },
                            "version": 1
                        },
                        "metadata": {"serviceVersion": "1.0.0", "region": "VN"}
                    }
                    await publish_kafka_event(metadata_evt, file_id)
                    print(f"[DEBUG] Published -> topic=docgo-file-events eventType=FILE_UPLOAD_COMPLETED fileId={file_id}")

                    # 2) FILE_CONTENT_EXTRACTED - Enhanced payload theo EVENT-ARCHITECTURE-V3.md
                    print(f"[DEBUG] Preparing publish -> topic=docgo-file-events eventType=FILE_CONTENT_EXTRACTED fileId={file_id} hasPlaintext={bool(plaintext_text)} hasJson={bool(json_content_text)}")
                    
                    # Enhanced classification result - Match EVENT-ARCHITECTURE-V3.md enums
                    enhanced_classification = None  # Phase 1: set classification = null in FILE_CONTENT_EXTRACTED
                    
                    # Extract key terms from plaintext (simple extraction)
                    # Phase 1: remove keyTerms/sections/summary from FILE_CONTENT_EXTRACTED
                    
                    # Create extractedText (cleaned version)
                    extracted_text = " ".join(plaintext_text.split()) if plaintext_text else None
                    
                    # Filter binary content before sending to Kafka
                    from utils.binary_filter import is_likely_binary
                    
                    # plaintext: Set to None if binary content (indicates unextractable/binary file)
                    # This tells the repository service that the file content is binary/unreadable
                    safe_plaintext = None if (plaintext_text and is_likely_binary(plaintext_text)) else plaintext_text
                    
                    # extractedText: Keep human-readable text even if original file was binary
                    # This allows the repository to have readable content when available
                    # Only filter if the extracted text itself is binary (shouldn't happen with proper extraction)
                    safe_extracted_text = extracted_text
                    if extracted_text and is_likely_binary(extracted_text):
                        print(f"[WARN] Extracted text appears binary, this shouldn't happen with proper extraction")
                        safe_extracted_text = None
                    
                    if safe_plaintext is None and plaintext_text is not None:
                        print(f"[WARN] Binary content detected, setting plaintext to None (indicates binary file, size: {len(plaintext_text)} bytes)")
                        print(f"[INFO] extractedText will contain readable content if extraction was successful")
                    
                    plaintext_evt = {
                        "eventVersion": "1.0",
                        "eventType": "FILE_CONTENT_EXTRACTED",
                        "eventId": str(uuid.uuid4()),
                        "timestamp": now_iso,
                        "source": "automation-service",
                        "correlationId": correlation_id,
                        "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                        "data": {
                            "fileId": file_id,
                            "title": file.filename,
                            "plaintext": safe_plaintext,  # Raw text (filtered)
                            "extractedText": safe_extracted_text,  # Cleaned text (filtered)
                            # Phase 1: remove summary/keyTerms/sections
                            "ocr": {
                                "text": safe_plaintext if file.content_type.lower() != "application/json" else None,  # Use filtered version (None for binary)
                                "status": "COMPLETED" if plaintext_text else "SKIPPED",  # COMPLETED, FAILED, PROCESSING, SKIPPED
                                "engine": "TESSERACT",  # GEMINI_VISION, TESSERACT, TESSERACT_FALLBACK, PADDLEOCR
                                "confidence": 1.0 if plaintext_text else 0.0,  # Enhanced field
                                "processedAt": now_iso,  # Enhanced field
                                "processingTime": 0.0,  # Enhanced field
                                # Phase 1: merge extraction fields into ocr
                                "method": "DIRECT",
                                "extractedAt": now_iso,
                                "characterCount": len(plaintext_text) if plaintext_text else 0,
                                "wordCount": len(plaintext_text.split()) if plaintext_text else 0,
                                "error": None,  # Enhanced field
                                "metadata": None  # Should come from actual OCR metadata, not fake data
                            },
                            # Phase 1: remove extraction object; summarization -> aiSummarization removed
                            "jsonContent": json_content_text,
                            "jsonAnalysisStatus": "PARSED" if json_content_text else None,
                            "classification": enhanced_classification,
                            "processing": {"status": "COMPLETED", "error": None}  # COMPLETED, PROCESSING, FAILED
                        },
                        "metadata": {"serviceVersion": "1.0.0", "region": "VN"}
                    }
                    await publish_kafka_event(plaintext_evt, file_id)
                    print(f"[DEBUG] Published -> topic=docgo-file-events eventType=FILE_CONTENT_EXTRACTED fileId={file_id}")

                    # 3) CONTRACT_SUMMARY_GENERATED (if contract) - Enhanced payload theo EVENT-ARCHITECTURE-V3.md
                    contract_condition = bool(classification_result.get("isContract")) and summary_result
                    print(f"[DEBUG] Contract condition check: isContract={classification_result.get('isContract')}, summary_result={summary_result is not None}, condition={contract_condition}")
                    if contract_condition:
                        print(f"[DEBUG] Preparing publish -> topic=docgo-file-events eventType=CONTRACT_SUMMARY_GENERATED documentId={file_id}")
                        
                        # Prepare FULL contract metadata theo EVENT-ARCHITECTURE-V3.md - AI không trả về thì null
                        contract_metadata = {
                            # Basic fields - AI không trả về thì null (NO FALLBACK VALUES)
                            "type": summary_result.get("type"),  # SERVICE_AGREEMENT, PURCHASE_AGREEMENT, etc. - No fallback, use null
                            "effectiveDate": summary_result.get("effectiveDate"),
                            "expiryDate": summary_result.get("expiryDate"),
                            "totalValue": summary_result.get("totalValue"),
                            "currency": summary_result.get("currency"),  # USD, VND, EUR, JPY - No fallback, use null
                            "summary": summary_result.get("summary"),
                            "project": summary_result.get("project"),
                            "department": summary_result.get("department"),
                            "priority": summary_result.get("priority"),  # HIGH, MEDIUM, LOW - No fallback, use null
                            "confidentiality": summary_result.get("confidentiality"),  # CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED - No fallback, use null
                            "repositoryId": repository_id,  # Optional repository ID from upload param
                            
                            # Parties - ensure full structure with id, type, contact, representative (default to empty list if not present)
                            "parties": [
                                {
                                    "id": party.get("id") if isinstance(party, dict) else None,
                                    "name": party.get("name") if isinstance(party, dict) else party,
                                    "type": party.get("type"),  # CLIENT, VENDOR, PARTNER, GUARANTOR - No fallback, use null
                                    "role": party.get("role") if isinstance(party, dict) else None,
                                    "contact": {
                                        "email": party.get("email") or party.get("contact", {}).get("email") if isinstance(party, dict) else None,
                                        "phone": party.get("contact", {}).get("phone") if isinstance(party, dict) else None,
                                        "address": party.get("address") or party.get("contact", {}).get("address") if isinstance(party, dict) else None
                                    },
                                    "representative": {
                                        "name": party.get("representative", {}).get("name") if isinstance(party, dict) else None,
                                        "position": party.get("position") or party.get("representative", {}).get("position") if isinstance(party, dict) else None,
                                        "email": party.get("representative", {}).get("email") if isinstance(party, dict) else None
                                    },
                                    "taxCode": party.get("taxCode") if isinstance(party, dict) else None
                                }
                                for party in summary_result.get("parties", [])
                            ] if summary_result.get("parties") else [],
                            
                            # Payment - full structure with schedule
                            "payment": {
                                "schedule": summary_result.get("payment", {}).get("schedule"),
                                "method": summary_result.get("payment", {}).get("method"),  # BANK_TRANSFER, CREDIT_CARD, WIRE, CHECK, CASH, DIGITAL_WALLET - No fallback, use null
                                "paymentMethod": summary_result.get("payment", {}).get("paymentMethod")
                            },
                            
                            # Clauses - full structure
                            "clauses": {
                                "key": summary_result.get("clauses", {}).get("key"),
                                "unfavorable": summary_result.get("clauses", {}).get("unfavorable"),
                                "intellectualProperty": summary_result.get("clauses", {}).get("intellectualProperty"),
                                "confidentiality": summary_result.get("clauses", {}).get("confidentiality"),
                                "warranty": summary_result.get("clauses", {}).get("warranty"),
                                "termination": summary_result.get("clauses", {}).get("termination")
                            },
                            
                            # Reminders - full structure (default to empty list if not present)
                            "reminders": [
                                {
                                    "date": reminder.get("date") if isinstance(reminder, dict) else None,
                                    "type": reminder.get("type"),  # PAYMENT_DUE, MILESTONE_REVIEW, EXPIRY_WARNING, CONTRACT_RENEWAL - No fallback, use null
                                    "title": reminder.get("title") if isinstance(reminder, dict) else None,
                                    "description": reminder.get("description") if isinstance(reminder, dict) else None,
                                    "notifyBefore": reminder.get("notifyBefore") if isinstance(reminder, dict) else None,
                                    "status": reminder.get("status"),  # PENDING, SENT, RESOLVED, OVERDUE - No fallback, use null
                                    "assignedTo": reminder.get("assignedTo") if isinstance(reminder, dict) else None
                                }
                                for reminder in summary_result.get("reminders", [])
                            ] if summary_result.get("reminders") else [],
                            
                            # Risk - full structure
                            "risk": {
                                "level": summary_result.get("risk", {}).get("level") or summary_result.get("risk", {}).get("riskLevel"),  # LOW, MEDIUM, HIGH - No fallback, use null
                                "score": summary_result.get("risk", {}).get("score"),
                                "factors": summary_result.get("risk", {}).get("factors"),
                                "mitigations": summary_result.get("risk", {}).get("mitigations") or summary_result.get("risk", {}).get("mitigationProposals"),
                                "advice": summary_result.get("risk", {}).get("advice")
                            },
                            
                            # Compliance - full structure
                            "compliance": {
                                "status": summary_result.get("compliance", {}).get("status") or summary_result.get("compliance", {}).get("complianceStatus"),  # COMPLIANT, NON_COMPLIANT, PENDING_REVIEW, IN_AUDIT - No fallback, use null
                                "requirements": summary_result.get("compliance", {}).get("requirements"),
                                "regulations": summary_result.get("compliance", {}).get("regulations"),
                                "certifications": summary_result.get("compliance", {}).get("certifications"),
                                "issues": summary_result.get("compliance", {}).get("issues"),
                                "recommendations": summary_result.get("compliance", {}).get("recommendations")
                            }
                        }
                        
                        # Prepare clauses with all section
                        clauses = {}
                        if summary_result and isinstance(summary_result, dict):
                            # Priority: Use AI's "all" clauses if available
                            if "clauses" in summary_result and "all" in summary_result["clauses"] and summary_result["clauses"]["all"]:
                                # Use AI's all clauses directly (preferred)
                                clauses["all"] = summary_result["clauses"]["all"]
                                
                                # Also extract key/favorable/unfavorable from AI if provided
                                if "key" in summary_result["clauses"]:
                                    clauses["key"] = summary_result["clauses"]["key"]
                                if "favorable" in summary_result["clauses"]:
                                    clauses["favorable"] = summary_result["clauses"]["favorable"]
                                if "unfavorable" in summary_result["clauses"]:
                                    clauses["unfavorable"] = summary_result["clauses"]["unfavorable"]
                            else:
                                # Build all clauses from key/favorable/unfavorable
                                all_clauses = []
                                if "clauses" in summary_result:
                                    # Process key clauses
                                    if "key" in summary_result["clauses"]:
                                        for clause in summary_result["clauses"]["key"]:
                                            all_clauses.append({
                                                "name": clause.get("name"),
                                                "description": clause.get("description", "") + (" Đây là điều khoản quan trọng vì " + clause.get("advice", "") if clause.get("importance") == "HIGH" else ""),
                                                "content": clause.get("content"),
                                                "importance": clause.get("importance"),
                                                "risk": clause.get("risk"),
                                                "advice": clause.get("advice"),
                                                "pageNumber": clause.get("pageNumber")
                                            })
                                    
                                    # Process favorable clauses (no risk field)
                                    if "favorable" in summary_result["clauses"]:
                                        for clause in summary_result["clauses"]["favorable"]:
                                            all_clauses.append({
                                                "name": clause.get("name"),
                                                "description": clause.get("description", ""),
                                                "content": clause.get("content"),
                                                "importance": clause.get("importance", "MEDIUM"),
                                                "advice": clause.get("advice", ""),
                                                "pageNumber": clause.get("pageNumber")
                                            })
                                    
                                    # Process unfavorable clauses
                                    if "unfavorable" in summary_result["clauses"]:
                                        for clause in summary_result["clauses"]["unfavorable"]:
                                            all_clauses.append({
                                                "name": clause.get("name"),
                                                "description": clause.get("description", ""),
                                                "content": clause.get("content"),
                                                "importance": "LOW",  # Unfavorable clauses are typically low importance
                                                "risk": clause.get("risk", "HIGH"),
                                                "advice": clause.get("advice", ""),
                                                "pageNumber": clause.get("pageNumber")
                                            })
                                
                                clauses["all"] = all_clauses
                        
                        # Add clauses to contract_metadata
                        contract_metadata["clauses"] = clauses

                        # Add fileId and other fields to contract_metadata for event routing
                        contract_metadata["fileId"] = file_id
                        
                        contract_evt = {
                            "eventVersion": "1.0",
                            "eventType": "CONTRACT_SUMMARY_GENERATED",
                            "eventId": str(uuid.uuid4()),
                            "timestamp": now_iso,
                            "source": "automation-service",
                            "correlationId": correlation_id,
                            "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                            "data": contract_metadata,
                            "metadata": {"serviceVersion": "1.0.0", "region": "VN"}
                        }
                        await publish_kafka_event(contract_evt, file_id)
                        print(f"[DEBUG] Published -> topic=docgo-file-events eventType=CONTRACT_SUMMARY_GENERATED fileId={file_id}")
                except Exception as pub_err:
                    print(f"[WARN] Kafka publish failed (non-blocking): {pub_err}")

            await audit_service.add_session_step(correlation_id, {
                "stepName": "METADATA_PUBLISH",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"documentId": file_id}
            })
            
        except Exception as e:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "METADATA_PUBLISH",
                "status": "FAILED",
                "completedAt": datetime.now(timezone.utc),
                "error": str(e)
            })
            await audit_service.log_error({
                "correlationId": correlation_id,
                "errorType": "METADATA_PUBLISH_FAILED",
                "errorMessage": str(e),
                "step": "METADATA_PUBLISH",
                "retryable": True,
                "retryCount": 3
            })
            print(f"Warning: Metadata publish failed: {e}")
            # Fallback: no blocking
        
        # 7) Return appropriate response
        body = {
            "apiVersion": "v1",
            "timestamp": now_iso,
            "requestId": correlation_id,
            "path": str(request.url),
        }
        
        if sync_mode:
            # Update processing session as completed
            await audit_service.update_processing_session(correlation_id, {
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "documentId": file_id
            })
            
            # Log automation completed event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "FILE_CONTENT_EXTRACTED",
                "correlationId": correlation_id,
                "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                "data": {
                    "documentId": file_id,
                    "fileName": file.filename,
                    "processingStatus": "COMPLETED",
                    "duration": None  # Could calculate if needed
                },
                "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
            })
            
            body.update({
                "statusCode": 201,
                "shortMessage": "Created",
                "description": "Document created and processed (sync)",
                "data": {
                    "fileId": file_id,
                    "fileUrl": file_url,
                    "correlationId": correlation_id
                },
            })
        else:
            # Async processing: Start background task
            try:
                # Start async processing task
                import asyncio
                asyncio.create_task(async_processor.process_document_async({
                    "documentId": file_id,
                    "fileUrl": file_url,
                    "filename": file.filename,
                    "contentType": file.content_type,
                    "fileSize": size,
                    "correlationId": correlation_id
                }))
                
                # Publish initial event
                # DISABLED - Requires Redis
                # await event_service.publish_event({
                #     "eventType": "file.metadata.recorded",
                #     "documentId": file_id,
                #     "fileUrl": file_url,
                #     "filename": file.filename,
                #     "fileSize": size,
                #     "contentType": file.content_type,
                #     "userId": "system"
                # })
                
                # Notify WebSocket clients
                await websocket_manager.broadcast_progress(file_id, {
                    "status": "PROCESSING",
                    "message": "Document uploaded, starting processing...",
                    "progress": 10
                })
                
            except Exception as e:
                print(f"Async processing setup failed: {e}")
                await audit_service.log_error({
                    "correlationId": correlation_id,
                    "errorType": "ASYNC_SETUP_FAILED",
                    "errorMessage": str(e),
                    "step": "ASYNC_SETUP",
                    "retryable": False,
                    "retryCount": 0
                })
            
            body.update({
                "statusCode": 202,
                "shortMessage": "Accepted", 
                "description": "Document accepted for processing (async)",
                "data": {
                    "documentId": file_id,
                    "fileUrl": file_url,
                    "websocketUrl": f"ws://localhost:8003/ws/document/{file_id}",
                    "correlationId": correlation_id
                },
            })
        
        return body
        
    except Exception as e:
        # Log automation failed event
        await audit_service.log_event({
            "eventVersion": "v1",
            "eventType": "file.metadata.recorded",
            "correlationId": correlation_id,
            "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
            "data": {
                "documentId": None,
                "fileName": file.filename,
                "errorMessage": str(e),
                "errorType": "UPLOAD_FAILED",
                "retryable": True,
                "retryCount": 0
            },
            "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
        })
        
        # Update processing session as failed
        await audit_service.update_processing_session(correlation_id, {
            "status": "FAILED",
            "completedAt": datetime.now(timezone.utc)
        })
        
        # Log error
        await audit_service.log_error({
            "correlationId": correlation_id,
            "errorType": "UPLOAD_FAILED",
            "errorMessage": str(e),
            "step": "UPLOAD_PROCESS",
            "retryable": True,
            "retryCount": 0
        })
        
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


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
