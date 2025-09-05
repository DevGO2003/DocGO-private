from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response, Request
from typing import List, Optional
from uuid import uuid4
import os
from datetime import datetime, timedelta
import logging
import json
from aiokafka import AIOKafkaProducer

from config import (
    S3_BUCKET, get_presigned_get_url, KAFKA_BOOTSTRAP_SERVERS, KAFKA_FILE_UPLOADED_TOPIC,
    KAFKA_CLIENT_ID, KAFKA_MESSAGE_KEY_FIELD, MAX_FILE_SIZE, ALLOWED_FILE_TYPES,
    is_s3_enabled, S3_PUBLIC_BUCKET, build_public_url
)
from services.file_service import FileStorageService
from schemas.file import (
    FileUploadResponse, SignedURLRequest, SignedURLResponse, FileVersion
)
from schemas.response import RestResponse

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/file-storage-asset-service", tags=["File Storage Asset Service"])

# Khởi tạo service
file_service = FileStorageService()

# Kafka producer singleton
_producer: Optional[AIOKafkaProducer] = None

async def get_kafka_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        _producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            client_id=KAFKA_CLIENT_ID,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            acks="all",
        )
        await _producer.start()
    return _producer

@router.post("/files", summary="Upload file với scan và versioning")
async def upload_file_with_scan(
    request: Request,
    file: UploadFile = File(...),
    folder: Optional[str] = Query(None, description="Thư mục con tùy chọn trong bucket"),
    user_id: Optional[str] = Query(None, description="ID của user upload file (mặc định: public)")
):
    """
    Upload một file, thực hiện quét malware, và trả về thông tin file đã lưu.
    Mỗi lần upload sẽ tạo ra một file_id mới.
    """
    correlation_id = request.headers.get("x-correlation-id") or str(uuid4())
    user_id_effective = user_id or "public"
    
    try:
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File quá lớn (> {MAX_FILE_SIZE} bytes)")

        ext = (file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else '')
        allowed = [x.strip().lower() for x in ALLOWED_FILE_TYPES]
        if ext and allowed and ext not in allowed:
            raise HTTPException(status_code=400, detail=f"Loại file không được phép: .{ext}")

        file_info = await file_service.upload_file(file, user_id_effective, folder)

        # Gửi sự kiện Kafka (best-effort)
        try:
            producer = await get_kafka_producer()
            event_payload = {
                "eventVersion": "v1",
                "eventType": "FileUploaded",
                "eventId": uuid4().hex,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "source": "file-storage-asset-service",
                "correlationId": correlation_id,
                "actor": {"userId": user_id_effective},
                "data": {
                    "fileId": file_info.file_id,
                    "filename": file_info.filename,
                    "contentType": file.content_type,
                    "size": file_info.file_size,
                    "bucket": S3_BUCKET,
                    "key": file_info.s3_key,
                    "folder": folder,
                    "version": file_info.version
                }
            }
            await producer.send_and_wait(KAFKA_FILE_UPLOADED_TOPIC, event_payload)
        except Exception as kafka_error:
            logger.error(f"[KAFKA_PUBLISH_FAILED] Could not publish event: {kafka_error}")

        return RestResponse(
            statusCode=201,
            shortMessage="Created",
            description="File đã được upload thành công.",
            data=FileUploadResponse(
                file_id=file_info.file_id,
                filename=file_info.filename,
                file_size=file_info.file_size,
                file_type=file_info.file_type,
                status=file_info.status,
                upload_time=file_info.upload_time,
                message="File đã được upload thành công"
            ),
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[UPLOAD_FAILED] Error during file upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")

@router.get("/files/{file_id}/download", summary="Download file")
async def download_file(
    file_id: str,
    user_id: Optional[str] = Query(None, description="ID của user download file (mặc định: public)"),
    version: Optional[int] = Query(None, description="Phiên bản file cụ thể (nếu không có, tải bản mới nhất)")
):
    """
    Tải về nội dung của một file dựa trên file_id và user_id.
    Có thể chỉ định phiên bản cụ thể.
    """
    try:
        user_id_effective = user_id or "public"
        if version:
            file_content = await file_service.download_file(file_id, user_id_effective, version)
            file_info = await file_service._get_file_info(file_id, user_id_effective, version)
            filename = file_info.filename if file_info else "downloaded_file"
        else:
            latest_info = file_service._get_latest_file_info(file_id, user_id_effective)
            if not latest_info:
                raise HTTPException(status_code=404, detail="File not found.")
            file_content = await file_service.download_file(file_id, user_id_effective, latest_info.version)
            filename = latest_info.filename
        
        return Response(
            content=file_content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"[DOWNLOAD_FAILED] Error downloading file {file_id}: {e}", exc_info=True)
        raise

@router.post("/files/{file_id}/signed-url", summary="Tạo signed URL để download file")
async def create_signed_url(
    request: Request,
    file_id: str,
    request_body: SignedURLRequest,
    user_id: Optional[str] = Query(None, description="ID của user tạo signed URL (mặc định: public)")
):
    """
    Tạo một URL có chữ ký, có thời hạn để download phiên bản mới nhất của file.
    """
    try:
        user_id_effective = user_id or "public"
        signed_url = file_service.generate_signed_url(
            file_id, user_id_effective, request_body.expiration_minutes
        )
        
        file_info = file_service._get_latest_file_info(file_id, user_id_effective)
        expiration_time = datetime.utcnow() + timedelta(minutes=request_body.expiration_minutes)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã tạo signed URL cho file '{file_id}'",
            data=SignedURLResponse(
                file_id=file_id,
                signed_url=signed_url,
                expiration_time=expiration_time,
                filename=file_info.filename if file_info else "unknown"
            ),
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[SIGNED_URL_FAILED] Error for file {file_id}: {e}", exc_info=True)
        raise

@router.get("/files/{file_id}/versions", summary="Lấy danh sách phiên bản của file", response_model=RestResponse[List[FileVersion]])
async def get_file_versions(
    request: Request,
    file_id: str,
    user_id: Optional[str] = Query(None, description="ID của user xem phiên bản file (mặc định: public)")
):
    """
    Lấy danh sách tất cả các phiên bản đã upload của một file.
    """
    try:
        user_id_effective = user_id or "public"
        versions = await file_service.get_file_versions(file_id, user_id_effective)
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy {len(versions)} phiên bản của file '{file_id}'",
            data=versions,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[GET_VERSIONS_FAILED] Error for file {file_id}: {e}", exc_info=True)
        raise

@router.delete("/files/{file_id}", summary="Xóa file hoặc phiên bản cụ thể")
async def delete_file(
    request: Request,
    file_id: str,
    user_id: Optional[str] = Query(None, description="ID của user xóa file (mặc định: public)"),
    version: Optional[int] = Query(None, description="Phiên bản cụ thể cần xóa (nếu không có thì xóa tất cả)")
):
    """
    Xóa một phiên bản cụ thể của file, hoặc xóa toàn bộ file (tất cả các phiên bản).
    """
    try:
        user_id_effective = user_id or "public"
        result = await file_service.delete_file(file_id, user_id_effective, version)
        message = f"Đã xóa phiên bản {version} của file '{file_id}'." if version else f"Đã xóa toàn bộ file '{file_id}'."
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=message,
            data={"success": result},
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[DELETE_FAILED] Error for file {file_id}: {e}", exc_info=True)
        raise
