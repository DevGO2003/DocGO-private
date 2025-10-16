

from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Response, Form, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from typing import List, Optional
import io
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
from services.event_service import EventService
from services.async_processor import async_processor
from services.progress_service import ProgressService

# Create router
router = APIRouter(prefix="/api/v1/automation-service/files", tags=["APIs Quản lý File"])

# Initialize services
file_service = FileStorageService()
ocr_service = OCRService()
ai_service = AutomationService()
websocket_manager = WebSocketManager()
event_service = EventService()
progress_service = ProgressService()


@router.post("", summary="Upload document", tags=["📁 APIs Quản lý File"])
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    metadata: str | None = Form(None),
):
    return await upload_document(request=request, file=file, metadata=metadata)


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
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    metadata: str | None = Form(None),
):
    """
    Unified document upload endpoint with full audit logging, event publishing, error handling, and retry.
    - Small files (<2MB): sync processing, returns 201
    - Large files (>=2MB): async processing, returns 202
    - Builds payload matching File Management API schema
    - Non-contract documents have contract=null
    """
    from services.audit_service import audit_service
    from utils.retry_helper import retry_async
    from schemas.event_schemas import (
        AutomationStartedEvent, FileUploadedEvent, DocumentClassifiedEvent, 
        ContractSummaryUpdatedEvent, DocumentCreatedEvent, AutomationCompletedEvent, AutomationFailedEvent
    )
    
    correlation_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        # Get file size from content-length header
        size = int(request.headers.get("content-length") or 0)
        sync_mode = size < 2 * 1024 * 1024  # 2MB threshold
        
        # Start audit logging
        await audit_service.log_processing_session({
            "correlationId": correlation_id,
            "documentId": None,  # Will be set after file upload
            "fileName": file.filename,
            "fileSize": size,
            "contentType": file.content_type,
            "metadata": {"syncMode": sync_mode, "userAgent": request.headers.get("user-agent")}
        })
        
        # Log automation started event
        await audit_service.log_event({
            "eventVersion": "v1",
            "eventType": "AutomationStarted",
            "correlationId": correlation_id,
            "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
            "data": {
                "fileName": file.filename,
                "fileSize": size,
                "contentType": file.content_type,
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
                file, folder="documents", user_id="system",
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
            
            # Log file uploaded event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "FileUploaded",
                "correlationId": correlation_id,
                "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                "data": {
                    "documentId": file_id,
                    "fileUrl": file_url,
                    "fileName": file.filename,
                    "fileSize": size,
                    "contentType": file.content_type
                },
                "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
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
        
        # 2) Run OCR with retry
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "OCR_PROCESSING",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            # Read file content for OCR
            file_content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            ocr_text = await retry_async(
                ocr_service.extract_text_from_file,
                file_content, file.content_type,
                max_retries=2,
                backoff_factor=1.5,
                exceptions=(Exception,),
                on_retry=lambda retry_count, e: print(f"OCR retry {retry_count}: {e}")
            )
            
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
        
        # 3) Run classification with retry
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "AI_CLASSIFICATION",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            classification_result = await retry_async(
                ai_service.classify_document,
                ocr_text, file.filename,
                max_retries=2,
                backoff_factor=1.5,
                exceptions=(Exception,),
                on_retry=lambda retry_count, e: print(f"Classification retry {retry_count}: {e}")
            )
            is_contract = bool(classification_result.get("isContract", False))
            
            await audit_service.add_session_step(correlation_id, {
                "stepName": "AI_CLASSIFICATION",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"isContract": is_contract, "category": classification_result.get("category")}
            })
            
            # Log document classified event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "DocumentClassified",
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
            print(f"Classification failed, using fallback: {e}")
            classification_result = {
                "isContract": file.filename.lower().endswith(('.pdf', '.docx')),
                "confidence": 0.5,
                "category": "Tài liệu thông thường"
            }
            is_contract = bool(classification_result.get("isContract"))
        
        # 4) Run summarization and extract contract metadata if contract
        summary_result = None
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
                
                await audit_service.add_session_step(correlation_id, {
                    "stepName": "AI_SUMMARIZATION",
                    "status": "COMPLETED",
                    "completedAt": datetime.now(timezone.utc),
                    "result": {"hasSummary": bool(summary_result)}
                })
                
                # Log contract summary updated event
                await audit_service.log_event({
                    "eventVersion": "v1",
                    "eventType": "ContractSummaryUpdated",
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
                summary_result = {"summary": f"Tóm tắt hợp đồng {file.filename}"}
        
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
        
        # 6) Persist to File Management Service with retry
        try:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "FILE_MGMT_SAVE",
                "status": "STARTED",
                "startedAt": datetime.now(timezone.utc)
            })
            
            async def save_to_file_mgmt():
                file_mgmt_url = Config.get_document_service_url()
                async with httpx.AsyncClient(timeout=10) as client:
                    resp = await client.post(
                        f"{file_mgmt_url}/api/v1/file-storage-asset-service/files", 
                        json=api_doc_payload
                    )
                    if resp.status_code >= 400:
                        raise Exception(f"File Management Service error: {resp.status_code} - {resp.text}")
                    return resp.json()
            
            saved = await retry_async(
                save_to_file_mgmt,
                max_retries=3,
                backoff_factor=2.0,
                exceptions=(Exception,),
                on_retry=lambda retry_count, e: print(f"File Management save retry {retry_count}: {e}")
            )
            
            await audit_service.add_session_step(correlation_id, {
                "stepName": "FILE_MGMT_SAVE",
                "status": "COMPLETED",
                "completedAt": datetime.now(timezone.utc),
                "result": {"documentId": saved.get("data", {}).get("id")}
            })
            
            # Log document created event
            await audit_service.log_event({
                "eventVersion": "v1",
                "eventType": "DocumentCreated",
                "correlationId": correlation_id,
                "actor": {"userId": "system", "userRole": "system", "ip": request.client.host if request.client else None},
                "data": {
                    "documentId": file_id,
                    "fileName": file.filename,
                    "documentType": overview_document_type,
                    "category": classification_result.get("category", "Unknown"),
                    "fileUrl": file_url
                },
                "metadata": {"source": "automation-service", "serviceVersion": "1.0.0"}
            })
            
        except Exception as e:
            await audit_service.add_session_step(correlation_id, {
                "stepName": "FILE_MGMT_SAVE",
                "status": "FAILED",
                "completedAt": datetime.now(timezone.utc),
                "error": str(e)
            })
            await audit_service.log_error({
                "correlationId": correlation_id,
                "errorType": "FILE_MGMT_SAVE_FAILED",
                "errorMessage": str(e),
                "step": "FILE_MGMT_SAVE",
                "retryable": True,
                "retryCount": 3
            })
            print(f"Warning: File Management Service not available: {e}")
            saved = {"data": {"id": file_id}}  # Fallback to mock response
        
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
                "eventType": "AutomationCompleted",
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
                    "documentId": saved.get("data", {}).get("id"),
                    "fileUrl": file_url,
                    "classificationResult": classification_result,
                    "summaryResult": summary_result,
                    "processingStatus": "COMPLETED",
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
                await event_service.publish_event({
                    "eventType": "DocumentUploaded",
                    "documentId": file_id,
                    "fileUrl": file_url,
                    "filename": file.filename,
                    "fileSize": size,
                    "contentType": file.content_type,
                    "userId": "system"
                })
                
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
                    "processingStatus": "PROCESSING",
                    "websocketUrl": f"ws://localhost:8003/ws/document/{file_id}",
                    "correlationId": correlation_id
                },
            })
        
        return body
        
    except Exception as e:
        # Log automation failed event
        await audit_service.log_event({
            "eventVersion": "v1",
            "eventType": "AutomationFailed",
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


@router.post("/events/analyze-json", summary="Phân tích 1 JSON qua Kafka", tags=["📁 APIs Quản lý File"])
async def analyze_json_event(request: Request, payload: dict):
    await progress_service.initialize()
    job_id = str(uuid.uuid4())
    corr_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
    client_ip = request.client.host if request.client else None
    await progress_service.init_job(job_id, total=1)
    now_iso = datetime.now(timezone.utc).isoformat()
    message = {
        "eventVersion": "v1",
        "eventType": "JsonAnalysisRequested",
        "eventId": str(uuid.uuid4()),
        "timestamp": now_iso,
        "source": "automation-service",
        "correlationId": corr_id,
        "actor": {"userId": "system", "userRole": "system", "ip": client_ip},
        "data": {"jobId": job_id, "index": 0, "payload": payload},
        "metadata": {"serviceVersion": "1.0.0"}
    }
    await event_service.publish_kafka(Config.JSON_ANALYZE_TOPIC if hasattr(Config, 'JSON_ANALYZE_TOPIC') else "json.analyze", message)
    return RestResponse(
        apiVersion="v1",
        statusCode=202,
        shortMessage="Accepted",
        description="JSON accepted for analysis",
        data={"jobId": job_id},
        timestamp=now_iso,
        requestId=corr_id,
        path=str(request.url)
    )


@router.post("/events/analyze-batch", summary="Phân tích nhiều JSON qua Kafka", tags=["📁 APIs Quản lý File"])
async def analyze_batch_event(request: Request, payloads: list[dict]):
    if not isinstance(payloads, list) or len(payloads) == 0:
        return RestResponse(
            apiVersion="v1",
            statusCode=400,
            shortMessage="Bad Request",
            description="Payload phải là mảng JSON và không rỗng",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )
    await progress_service.initialize()
    job_id = str(uuid.uuid4())
    corr_id = request.headers.get("X-Correlation-Id") or str(uuid.uuid4())
    client_ip = request.client.host if request.client else None
    await progress_service.init_job(job_id, total=len(payloads))
    now_iso = datetime.now(timezone.utc).isoformat()
    for idx, item in enumerate(payloads):
        message = {
            "eventVersion": "v1",
            "eventType": "JsonAnalysisRequested",
            "eventId": str(uuid.uuid4()),
            "timestamp": now_iso,
            "source": "automation-service",
            "correlationId": corr_id,
            "actor": {"userId": "system", "userRole": "system", "ip": client_ip},
            "data": {"jobId": job_id, "index": idx, "payload": item},
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await event_service.publish_kafka(Config.JSON_ANALYZE_TOPIC if hasattr(Config, 'JSON_ANALYZE_TOPIC') else "json.analyze", message)
    return RestResponse(
        apiVersion="v1",
        statusCode=202,
        shortMessage="Accepted",
        description="Batch JSON accepted for analysis",
        data={"jobId": job_id, "total": len(payloads)},
        timestamp=now_iso,
        requestId=corr_id,
        path=str(request.url)
    )


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


