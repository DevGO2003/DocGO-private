from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends, Response
from typing import List, Optional
from uuid import uuid4
import os
from datetime import datetime, timedelta

from config import s3_client, S3_BUCKET, get_presigned_get_url, get_s3_client, get_bucket_name
from services.file_service import FileStorageService
from services.malware_scanner import MalwareScanner
from schemas.file import (
    FileUploadResponse, FileInfo, SignedURLRequest, SignedURLResponse, 
    FileListResponse, FileVersion, MalwareScanResult
)


router = APIRouter(prefix="/api/v1/file-storage-asset-service", tags=["File Storage"])


@router.post("/upload", summary="Upload a file to S3/Filebase")
async def upload_file(
	folder: str = Query("assets", description="Thư mục con trong bucket để lưu trữ"),
	file: UploadFile = File(...),
):
	"""
	🔹 Đầu vào
	
	📁 folder (tùy chọn, query)
	Loại: string
	Mô tả: Thư mục con trong bucket để lưu trữ file. Mặc định là "assets".
	
	📄 file (bắt buộc, body)
	Loại: UploadFile
	Mô tả: File cần upload lên S3/Filebase.
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 500: lỗi server).
	
	📋 shortMessage
	Loại: string
	Mô tả: Thông báo ngắn gọn về kết quả.
	
	📝 data
	Loại: object
	Mô tả: Thông tin về file đã upload (bucket, key, url).
	"""
	try:
		unique_name = f"{uuid4().hex}_{file.filename}"
		object_key = f"{folder}/{unique_name}"
		s3_client.upload_fileobj(file.file, S3_BUCKET, object_key)
		url = get_presigned_get_url(object_key, 7 * 24 * 3600)
		return {
			"statusCode": 200,
			"shortMessage": "Success",
			"data": {"bucket": S3_BUCKET, "key": object_key, "url": url},
		}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Upload error: {exc}")


@router.get("/list", summary="List objects by prefix")
def list_objects(prefix: str = Query("assets/", description="Prefix (thư mục) để liệt kê")):
	"""
	🔹 Đầu vào
	
	📁 prefix (tùy chọn, query)
	Loại: string
	Mô tả: Prefix (thư mục) để liệt kê các object. Mặc định là "assets/".
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 500: lỗi server).
	
	📝 data
	Loại: array
	Mô tả: Danh sách các object với thông tin key và size.
	"""
	try:
		resp = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
		items = [
			{"key": o["Key"], "size": o.get("Size", 0)}
			for o in resp.get("Contents", [])
		]
		return {"statusCode": 200, "data": items}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"List error: {exc}")


@router.get("/url", summary="Get presigned download URL")
def get_download_url(key: str, expires: int = 3600):
	"""
	🔹 Đầu vào
	
	🔑 key (bắt buộc, query)
	Loại: string
	Mô tả: Key của object trong S3/Filebase.
	
	⏰ expires (tùy chọn, query)
	Loại: integer
	Mô tả: Thời gian hết hạn của URL (giây). Mặc định là 3600 giây (1 giờ).
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 500: lỗi server).
	
	📝 data
	Loại: object
	Mô tả: Thông tin về URL download (url).
	"""
	try:
		url = get_presigned_get_url(key, expires)
		return {"statusCode": 200, "data": {"url": url}}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"URL error: {exc}")


@router.delete("/delete", summary="Delete an object")
def delete_object(key: str):
	"""
	🔹 Đầu vào
	
	🔑 key (bắt buộc, query)
	Loại: string
	Mô tả: Key của object cần xóa trong S3/Filebase.
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 500: lỗi server).
	
	📋 shortMessage
	Loại: string
	Mô tả: Thông báo ngắn gọn về kết quả.
	
	📝 data
	Loại: object
	Mô tả: Thông tin về object đã xóa (key).
	"""
	try:
		s3_client.delete_object(Bucket=S3_BUCKET, Key=key)
		return {"statusCode": 200, "shortMessage": "Deleted", "data": {"key": key}}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Delete error: {exc}")


# Khởi tạo services
file_service = FileStorageService()
malware_scanner = MalwareScanner()

@router.post("/files/upload", summary="Upload file với malware scan và versioning")
async def upload_file_with_scan(
    file: UploadFile = File(...),
    user_id: str = Query(..., description="ID của user upload file")
):
    """
    🔹 Đầu vào
    
    📄 file (bắt buộc, body)
    Loại: UploadFile
    Mô tả: File cần upload (PDF, DOCX, TXT, hình ảnh)
    
    👤 user_id (bắt buộc, query)
    Loại: string
    Mô tả: ID của user đang upload file
    
    🔹 Đầu ra
    
    📋 FileUploadResponse
    Loại: object
    Mô tả: Thông tin file đã upload với trạng thái malware scan
    """
    try:
        # Kiểm tra kích thước file
        if file.size and file.size > 100 * 1024 * 1024:  # 100MB
            raise HTTPException(status_code=400, detail="File quá lớn (>100MB)")
        
        # Upload file với malware scan
        file_info = await file_service.upload_file(file, user_id)
        
        return FileUploadResponse(
            file_id=file_info.file_id,
            filename=file_info.filename,
            file_size=file_info.file_size,
            file_type=file_info.file_type,
            status=file_info.status,
            upload_time=file_info.upload_time,
            message="File đã được upload thành công"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")

@router.get("/files/{file_id}/download", summary="Download file")
async def download_file(
    file_id: str,
    user_id: str = Query(..., description="ID của user download file"),
    version: int = Query(1, description="Phiên bản file (mặc định: 1)")
):
    """
    🔹 Đầu vào
    
    🔑 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần download
    
    👤 user_id (bắt buộc, query)
    Loại: string
    Mô tả: ID của user đang download file
    
    🔢 version (tùy chọn, query)
    Loại: integer
    Mô tả: Phiên bản file (mặc định: 1)
    
    🔹 Đầu ra
    
    📄 File content
    Loại: bytes
    Mô tả: Nội dung file để download
    """
    try:
        file_content = await file_service.download_file(file_id, user_id, version)
        file_info = await file_service._get_file_info(file_id, user_id)
        
        response = Response(content=file_content)
        response.headers["Content-Disposition"] = f"attachment; filename={file_info.filename}"
        response.headers["Content-Type"] = "application/octet-stream"
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi download file: {str(e)}")

@router.post("/files/{file_id}/signed-url", summary="Tạo signed URL để download file")
async def create_signed_url(
    file_id: str,
    request: SignedURLRequest,
    user_id: str = Query(..., description="ID của user tạo signed URL")
):
    """
    🔹 Đầu vào
    
    🔑 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần tạo signed URL
    
    📋 request (bắt buộc, body)
    Loại: SignedURLRequest
    Mô tả: Thông tin request (expiration_minutes)
    
    👤 user_id (bắt buộc, query)
    Loại: string
    Mô tả: ID của user tạo signed URL
    
    🔹 Đầu ra
    
    📋 SignedURLResponse
    Loại: object
    Mô tả: Signed URL để download file
    """
    try:
        signed_url = file_service.generate_signed_url(
            file_id, user_id, request.expiration_minutes
        )
        
        file_info = await file_service._get_file_info(file_id, user_id)
        expiration_time = datetime.utcnow() + timedelta(minutes=request.expiration_minutes)
        
        return SignedURLResponse(
            file_id=file_id,
            signed_url=signed_url,
            expiration_time=expiration_time,
            filename=file_info.filename if file_info else "unknown"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo signed URL: {str(e)}")

@router.get("/files/{file_id}/versions", summary="Lấy danh sách phiên bản của file")
async def get_file_versions(
    file_id: str,
    user_id: str = Query(..., description="ID của user xem phiên bản file")
):
    """
    🔹 Đầu vào
    
    🔑 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần xem phiên bản
    
    👤 user_id (bắt buộc, query)
    Loại: string
    Mô tả: ID của user xem phiên bản file
    
    🔹 Đầu ra
    
    📋 List[FileVersion]
    Loại: array
    Mô tả: Danh sách các phiên bản của file
    """
    try:
        versions = await file_service.get_file_versions(file_id, user_id)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy phiên bản file: {str(e)}")

@router.delete("/files/{file_id}", summary="Xóa file hoặc phiên bản cụ thể")
async def delete_file(
    file_id: str,
    user_id: str = Query(..., description="ID của user xóa file"),
    version: Optional[int] = Query(None, description="Phiên bản cụ thể cần xóa (nếu không có thì xóa tất cả)")
):
    """
    🔹 Đầu vào
    
    🔑 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần xóa
    
    👤 user_id (bắt buộc, query)
    Loại: string
    Mô tả: ID của user xóa file
    
    🔢 version (tùy chọn, query)
    Loại: integer
    Mô tả: Phiên bản cụ thể cần xóa (nếu không có thì xóa tất cả)
    
    🔹 Đầu ra
    
    📋 boolean
    Loại: boolean
    Mô tả: True nếu xóa thành công
    """
    try:
        result = await file_service.delete_file(file_id, user_id, version)
        return {"success": result, "message": "File đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa file: {str(e)}")

@router.post("/scan/directory", summary="Quét malware cho toàn bộ thư mục")
async def scan_directory_malware(
    directory_path: str = Query(..., description="Đường dẫn thư mục cần quét")
):
    """
    🔹 Đầu vào
    
    📁 directory_path (bắt buộc, query)
    Loại: string
    Mô tả: Đường dẫn thư mục cần quét malware
    
    🔹 Đầu ra
    
    📋 List[MalwareScanResult]
    Loại: array
    Mô tả: Kết quả quét malware cho từng file
    """
    try:
        results = await malware_scanner.scan_directory(directory_path)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi quét thư mục: {str(e)}")

@router.post("/scan/statistics", summary="Thống kê kết quả quét malware")
async def get_scan_statistics(
    scan_results: List[MalwareScanResult]
):
    """
    🔹 Đầu vào
    
    📋 scan_results (bắt buộc, query)
    Loại: List[MalwareScanResult]
    Mô tả: Danh sách kết quả quét malware
    
    🔹 Đầu ra
    
    📊 dict
    Loại: object
    Mô tả: Thống kê tổng hợp kết quả quét
    """
    try:
        stats = malware_scanner.get_scan_statistics(scan_results)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính thống kê: {str(e)}")
