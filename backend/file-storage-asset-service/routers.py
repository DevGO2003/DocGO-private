from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response, Request
from botocore.exceptions import ClientError
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
from services.general_file_service import GeneralFileService
from services.processing_service import FileProcessingService
from services.asset_service import AssetService
from schemas.file import (
    FileUploadResponse, SignedURLRequest, SignedURLResponse, FileVersion
)
from schemas.general_schemas import (
    FileProcessingRequest, FileProcessingResponse, AssetCreateRequest, AssetUpdateRequest,
    AssetResponse, GeneralFileRequest, GeneralFileResponse, FileSearchRequest,
    FileBackupRequest, FileBackupResponse, FileMetadataResponse
)
from schemas.response import RestResponse
from schemas.file_response import FileResponseDto, FileDetailResponseDto
from schemas.pagination import PaginatedResponse

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/file-storage-asset-service", tags=["File Storage Asset Service"])

# Khởi tạo services
file_service = FileStorageService()
general_file_service = GeneralFileService()
processing_service = FileProcessingService()
asset_service = AssetService()

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

        # Generate file URL
        file_url = None
        try:
            if S3_PUBLIC_BUCKET:
                file_url = build_public_url(file_info.s3_key)
            else:
                file_url = get_presigned_get_url(file_info.s3_key, expires_in_seconds=3600)
        except Exception as url_error:
            logger.warning(f"[URL_GENERATION_FAILED] Could not generate URL for {file_info.s3_key}: {url_error}")

        # Gửi sự kiện Kafka (best-effort) với URL
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
                    "version": file_info.version,
                    "fileUrl": file_url
                }
            }
            await producer.send_and_wait(KAFKA_FILE_UPLOADED_TOPIC, event_payload)
            logger.info(
                f"[KAFKA_PUBLISH_SUCCESS] topic={KAFKA_FILE_UPLOADED_TOPIC} payload={json.dumps(event_payload, ensure_ascii=False)}"
            )
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
                message="File đã được upload thành công",
                s3_key=file_info.s3_key,
                bucket=S3_BUCKET,
                file_url=file_url
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

@router.get("/debug/s3-config", summary="Debug S3 configuration")
async def debug_s3_config(request: Request):
    """
    Debug endpoint để kiểm tra S3 configuration.
    """
    from config import S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
    
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="S3 Configuration Debug",
        data={
            "bucket": S3_BUCKET,
            "endpoint": S3_ENDPOINT,
            "region": S3_REGION,
            "access_key_id": S3_ACCESS_KEY_ID[:10] + "..." if S3_ACCESS_KEY_ID else None,
            "secret_key": S3_SECRET_ACCESS_KEY[:10] + "..." if S3_SECRET_ACCESS_KEY else None
        },
        path=request.url.path
    )

@router.get("/files", summary="Lấy danh sách files với pagination chuẩn")
async def get_all_files(
    request: Request,
    page_number: int = Query(0, description="Số trang (mặc định: 0)", ge=0),
    page_size: int = Query(10, description="Kích thước trang (mặc định: 10)", ge=1, le=1000),
    sort_by: Optional[List[str]] = Query(None, description="Danh sách các trường để sắp xếp"),
    sort_direction: Optional[List[str]] = Query(None, description="Hướng sắp xếp (ASC/DESC)"),
    include_deleted: bool = Query(False, description="Có bao gồm files đã xóa không")
):
    """
    Lấy danh sách files với pagination theo chuẩn contract service.
    
    🔹 Đầu vào
    📄 pageNumber (tùy chọn, query)
    Loại: integer
    Mô tả: Số trang (mặc định: 0).
    
    📄 pageSize (tùy chọn, query)
    Loại: integer
    Mô tả: Kích thước trang (mặc định: 10).
    
    📄 sortBy (tùy chọn, query)
    Loại: List<String>
    Mô tả: Danh sách các trường để sắp xếp (filename, size, created_at, updated_at, content_type).
    
    📄 sortDirection (tùy chọn, query)
    Loại: List<String>
    Mô tả: Hướng sắp xếp (ASC/DESC).
    
    📄 includeDeleted (tùy chọn, query)
    Loại: boolean
    Mô tả: Có bao gồm files đã xóa không (mặc định: false).
    
    🔹 Đầu ra
    📝 data
    Loại: PaginatedResponse<FileResponseDto>
    Mô tả: Danh sách files với cấu trúc response chuẩn.
    """
    try:
        result = await file_service.get_all_files_paginated(
            page_number, page_size, sort_by, sort_direction, include_deleted
        )
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy {result.result.number_of_elements} files từ S3",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[GET_ALL_FILES_FAILED] Error getting files: {e}", exc_info=True)
        raise

@router.get("/files/{key:path}", summary="Lấy thông tin chi tiết file")
async def get_file_by_key(
    request: Request,
    key: str
):
    """
    Lấy thông tin chi tiết của một file cụ thể.
    
    🔹 Đầu vào
    📄 key (bắt buộc, path)
    Loại: string
    Mô tả: Key của file trong S3 bucket.
    
    🔹 Đầu ra
    📝 data
    Loại: FileDetailResponseDto
    Mô tả: Thông tin chi tiết của file bao gồm metadata, checksum, access count.
    """
    try:
        result = await file_service.get_file_by_key(key)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy thông tin chi tiết file '{key}'",
            data=result,
            path=request.url.path
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[GET_FILE_BY_KEY_FAILED] Error getting file {key}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting file: {e}")

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

# ==================== GENERAL FILE MANAGEMENT ENDPOINTS ====================

@router.post("/files/organize", summary="Tổ chức file vào thư mục")
async def organize_file(
    request: Request,
    file_id: str = Query(..., description="ID của file cần tổ chức"),
    folder_path: str = Query(..., description="Đường dẫn thư mục đích"),
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Tổ chức file vào thư mục cụ thể.
    """
    try:
        user_id_effective = user_id or "public"
        result = await general_file_service.organize_file(file_id, folder_path, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"File đã được tổ chức vào thư mục '{folder_path}'",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[ORGANIZE_FAILED] Error organizing file {file_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error organizing file: {str(e)}")

@router.post("/files/share", summary="Chia sẻ file")
async def share_file(
    request: Request,
    file_id: str = Query(..., description="ID của file cần chia sẻ"),
    user_id: Optional[str] = Query(None, description="ID của user"),
    permissions: Optional[Dict[str, List[str]]] = None
):
    """
    Chia sẻ file với quyền truy cập.
    """
    try:
        user_id_effective = user_id or "public"
        share_token = await general_file_service.share_file(file_id, user_id_effective, permissions)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="File đã được chia sẻ thành công",
            data={"share_token": share_token},
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[SHARE_FAILED] Error sharing file {file_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error sharing file: {str(e)}")

@router.get("/files/search", summary="Tìm kiếm files")
async def search_files(
    request: Request,
    query: Optional[str] = Query(None, description="Từ khóa tìm kiếm"),
    category: Optional[str] = Query(None, description="Danh mục"),
    file_type: Optional[str] = Query(None, description="Loại file"),
    user_id: Optional[str] = Query(None, description="ID của user"),
    page: int = Query(0, description="Số trang", ge=0),
    size: int = Query(10, description="Kích thước trang", ge=1, le=100)
):
    """
    Tìm kiếm files theo các tiêu chí.
    """
    try:
        user_id_effective = user_id or "public"
        search_request = FileSearchRequest(
            query=query,
            category=category,
            file_type=file_type
        )
        
        results = await general_file_service.search_files(search_request, user_id_effective, page, size)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Tìm thấy {len(results)} files",
            data=results,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[SEARCH_FAILED] Error searching files: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching files: {str(e)}")

@router.get("/files/{file_id}/metadata", summary="Lấy metadata file")
async def get_file_metadata(
    request: Request,
    file_id: str,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Lấy metadata chi tiết của file.
    """
    try:
        user_id_effective = user_id or "public"
        metadata = await general_file_service.get_file_metadata(file_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy metadata file '{file_id}'",
            data=metadata,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[METADATA_FAILED] Error getting metadata for file {file_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting metadata: {str(e)}")

@router.post("/files/backup", summary="Sao lưu files")
async def backup_files(
    request: Request,
    backup_request: FileBackupRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Tạo backup cho danh sách files.
    """
    try:
        user_id_effective = user_id or "public"
        result = await general_file_service.backup_files(backup_request, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã tạo backup cho {result.file_count} files",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[BACKUP_FAILED] Error creating backup: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating backup: {str(e)}")

# ==================== FILE PROCESSING ENDPOINTS ====================

@router.post("/process/convert", summary="Chuyển đổi file")
async def convert_file(
    request: Request,
    processing_request: FileProcessingRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Chuyển đổi định dạng file.
    """
    try:
        user_id_effective = user_id or "public"
        result = await processing_service.convert_file(processing_request, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="File đã được chuyển đổi thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[CONVERT_FAILED] Error converting file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error converting file: {str(e)}")

@router.post("/process/compress", summary="Nén file")
async def compress_file(
    request: Request,
    processing_request: FileProcessingRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Nén file với mức độ nén tùy chọn.
    """
    try:
        user_id_effective = user_id or "public"
        result = await processing_service.compress_file(processing_request, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="File đã được nén thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[COMPRESS_FAILED] Error compressing file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error compressing file: {str(e)}")

@router.post("/process/extract", summary="Giải nén file")
async def extract_file(
    request: Request,
    processing_request: FileProcessingRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Giải nén file archive (ZIP, RAR).
    """
    try:
        user_id_effective = user_id or "public"
        result = await processing_service.extract_file(processing_request, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="File đã được giải nén thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[EXTRACT_FAILED] Error extracting file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error extracting file: {str(e)}")

@router.post("/process/validate", summary="Kiểm tra file")
async def validate_file(
    request: Request,
    file_id: str = Query(..., description="ID của file cần kiểm tra"),
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Kiểm tra tính hợp lệ của file.
    """
    try:
        user_id_effective = user_id or "public"
        result = await processing_service.validate_file(file_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="File đã được kiểm tra",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[VALIDATE_FAILED] Error validating file {file_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error validating file: {str(e)}")

# ==================== ASSET MANAGEMENT ENDPOINTS ====================

@router.post("/assets", summary="Tạo asset")
async def create_asset(
    request: Request,
    asset_request: AssetCreateRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Tạo asset mới từ file.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.create_asset(asset_request, user_id_effective)
        
        return RestResponse(
            statusCode=201,
            shortMessage="Created",
            description="Asset đã được tạo thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[CREATE_ASSET_FAILED] Error creating asset: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating asset: {str(e)}")

@router.get("/assets/{asset_id}", summary="Lấy thông tin asset")
async def get_asset(
    request: Request,
    asset_id: str,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Lấy thông tin chi tiết asset.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.get_asset(asset_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy thông tin asset '{asset_id}'",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[GET_ASSET_FAILED] Error getting asset {asset_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting asset: {str(e)}")

@router.put("/assets/{asset_id}", summary="Cập nhật asset")
async def update_asset(
    request: Request,
    asset_id: str,
    asset_request: AssetUpdateRequest,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Cập nhật thông tin asset.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.update_asset(asset_id, asset_request, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Asset đã được cập nhật thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[UPDATE_ASSET_FAILED] Error updating asset {asset_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating asset: {str(e)}")

@router.delete("/assets/{asset_id}", summary="Xóa asset")
async def delete_asset(
    request: Request,
    asset_id: str,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Xóa asset (soft delete).
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.delete_asset(asset_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Asset đã được xóa thành công",
            data={"success": result},
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[DELETE_ASSET_FAILED] Error deleting asset {asset_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting asset: {str(e)}")

@router.get("/assets", summary="Lấy danh sách assets")
async def list_assets(
    request: Request,
    user_id: Optional[str] = Query(None, description="ID của user"),
    page: int = Query(0, description="Số trang", ge=0),
    size: int = Query(10, description="Kích thước trang", ge=1, le=100),
    category: Optional[str] = Query(None, description="Danh mục"),
    status: Optional[str] = Query(None, description="Trạng thái"),
    search: Optional[str] = Query(None, description="Từ khóa tìm kiếm")
):
    """
    Lấy danh sách assets với phân trang và lọc.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.list_assets(
            user_id_effective, page, size, category, status, search
        )
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy {len(result)} assets",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[LIST_ASSETS_FAILED] Error listing assets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing assets: {str(e)}")

@router.get("/assets/{asset_id}/versions", summary="Lấy phiên bản asset")
async def get_asset_versions(
    request: Request,
    asset_id: str,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Lấy danh sách tất cả phiên bản của asset.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.get_asset_versions(asset_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy {len(result)} phiên bản của asset",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[GET_VERSIONS_FAILED] Error getting versions for asset {asset_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting versions: {str(e)}")

@router.put("/assets/{asset_id}/restore", summary="Khôi phục asset")
async def restore_asset(
    request: Request,
    asset_id: str,
    user_id: Optional[str] = Query(None, description="ID của user")
):
    """
    Khôi phục asset đã xóa.
    """
    try:
        user_id_effective = user_id or "public"
        result = await asset_service.restore_asset(asset_id, user_id_effective)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Asset đã được khôi phục thành công",
            data=result,
            path=request.url.path
        )
    except Exception as e:
        logger.error(f"[RESTORE_ASSET_FAILED] Error restoring asset {asset_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error restoring asset: {str(e)}")
