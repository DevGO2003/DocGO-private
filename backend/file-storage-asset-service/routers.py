from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends, Response, Request
from typing import List, Optional
from uuid import uuid4
import os
from datetime import datetime, timedelta

from config import s3_client, S3_BUCKET, get_presigned_get_url, get_s3_client, get_bucket_name
from services.file_service import FileStorageService
from services.malware_scanner import MalwareScanner
from schemas.file import (
    FileUploadResponse, FileInfo, SignedURLRequest, SignedURLResponse, 
    FileListResponse, FileVersion
)
from schemas.response import RestResponse


router = APIRouter(prefix="/api/v1/file-storage-asset-service", tags=["File Storage Asset Service"])


@router.post("/files", summary="Upload file lên S3/Filebase với scan")
async def upload_file(
	request: Request,
	folder: str = Query("documents", description="Thư mục con trong bucket để lưu trữ"),
	file: UploadFile = File(...),
):
	"""
	🔹 Đầu vào
	
	📁 folder (tùy chọn, query)
	Loại: string
	Mô tả: Thư mục con trong bucket để lưu trữ file. Mặc định là "documents".
	
	📄 file (bắt buộc, body)
	Loại: UploadFile
	Mô tả: File cần upload lên S3/Filebase với scan.
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (201: tạo thành công, 400: file quá lớn, 500: lỗi server).
	
	📋 shortMessage
	Loại: string
	Mô tả: Thông báo ngắn gọn về kết quả.
	
	📝 data
	Loại: object
	Mô tả: Thông tin về file đã upload (bucket, key, url, filename, size, scan_status).
	"""
	try:
		# Kiểm tra kích thước file
		if file.size and file.size > 100 * 1024 * 1024:  # 100MB
			raise HTTPException(status_code=400, detail="File quá lớn (>100MB)")
		
		# Upload file với scan
		file_info = await file_service.upload_file(file, None)  # Không cần user_id
		
		response_data = {
			"bucket": S3_BUCKET, 
			"key": file_info.s3_key if hasattr(file_info, 's3_key') else f"{folder}/{uuid4().hex}_{file.filename}",
			"url": get_presigned_get_url(file_info.s3_key if hasattr(file_info, 's3_key') else f"{folder}/{uuid4().hex}_{file.filename}", 7 * 24 * 3600),
			"filename": file.filename,
			"size": file.size if hasattr(file, 'size') else 0,
			"scan_status": file_info.status if hasattr(file_info, 'status') else "completed"
		}
		
		return RestResponse(
			statusCode=201,
			shortMessage="Created",
			description="File đã được upload thành công với scan",
			data=response_data,
			path=request.url.path
		)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Upload error: {exc}")


@router.get("/files", summary="Liệt kê files theo prefix")
def list_objects(
	request: Request,
	prefix: str = Query("documents/", description="Prefix (thư mục) để liệt kê"),
	pageNumber: int = Query(0, description="Số trang (bắt đầu từ 0)"),
	pageSize: int = Query(10, description="Số lượng items trên mỗi trang"),
	sortBy: str = Query("key", description="Sắp xếp theo trường"),
	sortDirection: str = Query("asc", description="Hướng sắp xếp (asc/desc)")
):
	"""
	🔹 Đầu vào
	
	📁 prefix (tùy chọn, query)
	Loại: string
	Mô tả: Prefix (thư mục) để liệt kê các object. Mặc định là "documents/".
	
	🔢 pageNumber (tùy chọn, query)
	Loại: integer
	Mô tả: Số trang (bắt đầu từ 0). Mặc định là 0.
	
	🔢 pageSize (tùy chọn, query)
	Loại: integer
	Mô tả: Số lượng items trên mỗi trang. Mặc định là 10.
	
	📊 sortBy (tùy chọn, query)
	Loại: string
	Mô tả: Sắp xếp theo trường. Mặc định là "key".
	
	📊 sortDirection (tùy chọn, query)
	Loại: string
	Mô tả: Hướng sắp xếp (asc/desc). Mặc định là "asc".
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 204: không có dữ liệu, 500: lỗi server).
	
	📝 data
	Loại: array
	Mô tả: Danh sách các object với thông tin key và size.
	"""
	try:
		resp = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=prefix)
		items = [
			{"key": o["Key"], "size": o.get("Size", 0), "lastModified": o.get("LastModified")}
			for o in resp.get("Contents", [])
		]
		
		# Phân trang
		total_items = len(items)
		start_idx = pageNumber * pageSize
		end_idx = start_idx + pageSize
		paginated_items = items[start_idx:end_idx]
		
		# Sắp xếp
		reverse_sort = sortDirection.lower() == "desc"
		paginated_items.sort(key=lambda x: x.get(sortBy, ""), reverse=reverse_sort)
		
		if not paginated_items:
			return RestResponse(
				statusCode=204,
				shortMessage="No Content",
				description=f"Không có files nào với prefix '{prefix}'",
				data=None,
				path=request.url.path
			)
		
		return RestResponse(
			statusCode=200,
			shortMessage="Success",
			description=f"Đã liệt kê {len(paginated_items)}/{total_items} files với prefix '{prefix}'",
			data={
				"items": paginated_items,
				"pagination": {
					"pageNumber": pageNumber,
					"pageSize": pageSize,
					"totalItems": total_items,
					"totalPages": (total_items + pageSize - 1) // pageSize
				}
			},
			path=request.url.path
		)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"List error: {exc}")


@router.get("/files/{key:path}/url", summary="Tạo presigned download URL")
def get_download_url(
	request: Request,
	key: str,
	expires: int = Query(3600, description="Thời gian hết hạn URL (giây)")
):
	"""
	🔹 Đầu vào
	
	🔑 key (bắt buộc, path)
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
	Mô tả: Thông tin về URL download (url, expires).
	"""
	try:
		url = get_presigned_get_url(key, expires)
		return RestResponse(
			statusCode=200,
			shortMessage="Success",
			description=f"Đã tạo presigned URL cho key '{key}'",
			data={"url": url, "expires": expires},
			path=request.url.path
		)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"URL error: {exc}")


@router.delete("/files/{key:path}", summary="Xóa file")
def delete_object(
	request: Request,
	key: str
):
	"""
	🔹 Đầu vào
	
	🔑 key (bắt buộc, path)
	Loại: string
	Mô tả: Key của object cần xóa trong S3/Filebase.
	
	🔹 Đầu ra
	
	🔢 statusCode
	Loại: integer
	Mô tả: Mã trạng thái HTTP (200: thành công, 404: không tìm thấy, 500: lỗi server).
	
	📋 shortMessage
	Loại: string
	Mô tả: Thông báo ngắn gọn về kết quả.
	
	📝 data
	Loại: object
	Mô tả: Thông tin về object đã xóa (key).
	"""
	try:
		# Kiểm tra file có tồn tại không
		try:
			s3_client.head_object(Bucket=S3_BUCKET, Key=key)
		except Exception as head_exc:
			# Kiểm tra xem có phải lỗi 404 không
			error_code = None
			if hasattr(head_exc, 'response'):
				error_code = head_exc.response.get('Error', {}).get('Code')
			elif hasattr(head_exc, 'code'):
				error_code = head_exc.code
			
			if error_code == '404' or error_code == 'NoSuchKey':
				return RestResponse(
					statusCode=404,
					shortMessage="Not Found",
					description=f"Không tìm thấy file '{key}'",
					data=None,
					path=request.url.path
				)
			else:
				# Lỗi khác khi kiểm tra file
				return RestResponse(
					statusCode=500,
					shortMessage="Internal Server Error",
					description=f"Lỗi kiểm tra file: {str(head_exc)}",
					data=None,
					path=request.url.path
				)
		
		# File tồn tại, tiến hành xóa
		s3_client.delete_object(Bucket=S3_BUCKET, Key=key)
		return RestResponse(
			statusCode=200,
			shortMessage="Success",
			description=f"Đã xóa file '{key}' thành công",
			data={"key": key},
			path=request.url.path
		)
	except Exception as exc:
		return RestResponse(
			statusCode=500,
			shortMessage="Internal Server Error",
			description=f"Lỗi xóa file: {str(exc)}",
			data=None,
			path=request.url.path
		)


# Khởi tạo services
file_service = FileStorageService()

@router.post("/files/upload-with-scan", summary="Upload file với scan và versioning (v2)")
async def upload_file_with_scan(
    request: Request,
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
    Mô tả: Thông tin file đã upload với trạng thái scan và versioning
    """
    try:
        # Kiểm tra kích thước file
        if file.size and file.size > 100 * 1024 * 1024:  # 100MB
            raise HTTPException(status_code=400, detail="File quá lớn (>100MB)")
        
        # Upload file với malware scan
        file_info = await file_service.upload_file(file, user_id)
        
        return RestResponse(
            statusCode=201,
            shortMessage="Created",
            description="File đã được upload thành công với scan và versioning",
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
        raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")

@router.get("/files/{file_id}/download", summary="Download file")
async def download_file(
    request: Request,
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
    request: Request,
    file_id: str,
    request_body: SignedURLRequest,
    user_id: str = Query(..., description="ID của user tạo signed URL")
):
    """
    🔹 Đầu vào
    
    🔑 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần tạo signed URL
    
    📋 request_body (bắt buộc, body)
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
            file_id, user_id, request_body.expiration_minutes
        )
        
        file_info = await file_service._get_file_info(file_id, user_id)
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
        raise HTTPException(status_code=500, detail=f"Lỗi tạo signed URL: {str(e)}")

@router.get("/files/{file_id}/versions", summary="Lấy danh sách phiên bản của file")
async def get_file_versions(
    request: Request,
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
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy {len(versions)} phiên bản của file '{file_id}'",
            data=versions,
            path=request.url.path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy phiên bản file: {str(e)}")

@router.delete("/files/{file_id}", summary="Xóa file hoặc phiên bản cụ thể")
async def delete_file(
    request: Request,
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
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã xóa file '{file_id}' thành công",
            data={"success": result, "message": "File đã được xóa thành công"},
            path=request.url.path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa file: {str(e)}")

@router.post("/scan/directory", summary="Quét file cho toàn bộ thư mục")
async def scan_directory_files(
    request: Request,
    directory_path: str = Query(..., description="Đường dẫn thư mục cần quét")
):
    """
    🔹 Đầu vào
    
    📁 directory_path (bắt buộc, query)
    Loại: string
    Mô tả: Đường dẫn thư mục cần quét file
    
    🔹 Đầu ra
    
    📋 List[dict]
    Loại: array
    Mô tả: Kết quả quét file cho từng file
    """
    try:
        # Quét file thông thường (không malware scan)
        results = await file_service.scan_directory(directory_path)
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã quét {len(results)} files trong thư mục '{directory_path}'",
            data=results,
            path=request.url.path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi quét thư mục: {str(e)}")

@router.post("/scan/statistics", summary="Thống kê kết quả quét file")
async def get_scan_statistics(
    request: Request,
    scan_results: List[dict]
):
    """
    🔹 Đầu vào
    
    📋 scan_results (bắt buộc, body)
    Loại: List[dict]
    Mô tả: Danh sách kết quả quét file
    
    🔹 Đầu ra
    
    📊 dict
    Loại: object
    Mô tả: Thống kê tổng hợp kết quả quét
    """
    try:
        # Tính thống kê file thông thường
        stats = file_service.get_scan_statistics(scan_results)
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Đã tính thống kê kết quả quét file",
            data=stats,
            path=request.url.path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính thống kê: {str(e)}")
