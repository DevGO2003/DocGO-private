from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
from uuid import uuid4

from config import s3_client, S3_BUCKET, get_presigned_get_url


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


