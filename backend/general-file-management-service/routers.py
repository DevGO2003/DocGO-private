from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
import uuid
from datetime import datetime
from schemas.file import (
    FileInfo, FileUploadResponse, FileSearchRequest, 
    FileSearchResponse, FileCategory, FileMetadata
)
from services.file_service import FileManagementService
from schemas.response import RestResponse

# Khởi tạo router
file_management_router = APIRouter()

# Khởi tạo service
file_service = FileManagementService()

@file_management_router.post("/files/upload", response_model=RestResponse[FileUploadResponse])
async def upload_file(
    file: UploadFile = File(...),
    category: Optional[str] = Query(None, description="Danh mục file"),
    tags: Optional[str] = Query(None, description="Tags phân cách bởi dấu phẩy"),
    description: Optional[str] = Query(None, description="Mô tả file")
):
    """
    🔹 Đầu vào
    📁 file (bắt buộc, body)
    Loại: UploadFile
    Mô tả: File cần upload
    
    🏷️ category (tùy chọn, query)
    Loại: string
    Mô tả: Danh mục file
    
    🏷️ tags (tùy chọn, query)
    Loại: string
    Mô tả: Tags phân cách bởi dấu phẩy
    
    🔹 Đầu ra
    📄 file_id
    Loại: string
    Mô tả: ID duy nhất của file
    
    📄 filename
    Loại: string
    Mô tả: Tên file gốc
    
    📄 status
    Loại: string
    Mô tả: Trạng thái upload
    """
    try:
        result = await file_service.upload_file(
            file=file,
            category=category,
            tags=tags.split(",") if tags else [],
            description=description
        )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=201,
            shortMessage="Success",
            description="File đã được upload thành công",
            data=result,
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/general-file-management-service/files/upload"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Lỗi khi upload file: {str(e)}"
        )

@file_management_router.get("/files", response_model=RestResponse[List[FileInfo]])
async def get_files(
    page_number: int = Query(0, ge=0, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Kích thước trang"),
    category: Optional[str] = Query(None, description="Lọc theo danh mục"),
    search_term: Optional[str] = Query(None, description="Từ khóa tìm kiếm"),
    sort_by: str = Query("created_at", description="Sắp xếp theo trường"),
    sort_direction: str = Query("desc", description="Hướng sắp xếp (asc/desc)")
):
    """
    🔹 Đầu vào
    📄 page_number (tùy chọn, query)
    Loại: integer
    Mô tả: Số trang (bắt đầu từ 0)
    
    📄 page_size (tùy chọn, query)
    Loại: integer
    Mô tả: Kích thước trang (1-100)
    
    🏷️ category (tùy chọn, query)
    Loại: string
    Mô tả: Lọc theo danh mục
    
    🔍 search_term (tùy chọn, query)
    Loại: string
    Mô tả: Từ khóa tìm kiếm
    
    🔹 Đầu ra
    📄 files
    Loại: List[FileInfo]
    Mô tả: Danh sách file
    """
    try:
        files = await file_service.get_files(
            page_number=page_number,
            page_size=page_size,
            category=category,
            search_term=search_term,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Lấy danh sách file thành công",
            data=files,
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/general-file-management-service/files"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lấy danh sách file: {str(e)}"
        )

@file_management_router.get("/files/{file_id}", response_model=RestResponse[FileInfo])
async def get_file_info(file_id: str):
    """
    🔹 Đầu vào
    🆔 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file
    
    🔹 Đầu ra
    📄 file_info
    Loại: FileInfo
    Mô tả: Thông tin chi tiết file
    """
    try:
        file_info = await file_service.get_file_info(file_id)
        
        if not file_info:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy file"
            )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Lấy thông tin file thành công",
            data=file_info,
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/general-file-management-service/files/{file_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lấy thông tin file: {str(e)}"
        )

@file_management_router.put("/files/{file_id}/metadata")
async def update_file_metadata(
    file_id: str,
    metadata: FileMetadata
):
    """
    🔹 Đầu vào
    🆔 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file
    
    📝 metadata (bắt buộc, body)
    Loại: FileMetadata
    Mô tả: Metadata mới cho file
    
    🔹 Đầu ra
    📄 success
    Loại: boolean
    Mô tả: Trạng thái cập nhật
    """
    try:
        success = await file_service.update_file_metadata(file_id, metadata)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy file"
            )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Cập nhật metadata thành công",
            data={"success": True},
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/general-file-management-service/files/{file_id}/metadata"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi cập nhật metadata: {str(e)}"
        )

@file_management_router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """
    🔹 Đầu vào
    🆔 file_id (bắt buộc, path)
    Loại: string
    Mô tả: ID của file cần xóa
    
    🔹 Đầu ra
    📄 success
    Loại: boolean
    Mô tả: Trạng thái xóa
    """
    try:
        success = await file_service.delete_file(file_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy file"
            )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Xóa file thành công",
            data={"success": True},
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/general-file-management-service/files/{file_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xóa file: {str(e)}"
        )

@file_management_router.get("/categories", response_model=RestResponse[List[FileCategory]])
async def get_categories():
    """
    🔹 Đầu vào
    Không có
    
    🔹 Đầu ra
    📄 categories
    Loại: List[FileCategory]
    Mô tả: Danh sách danh mục file
    """
    try:
        categories = await file_service.get_categories()
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Lấy danh sách danh mục thành công",
            data=categories,
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/general-file-management-service/categories"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lấy danh sách danh mục: {str(e)}"
        )

@file_management_router.post("/search", response_model=RestResponse[FileSearchResponse])
async def search_files(search_request: FileSearchRequest):
    """
    🔹 Đầu vào
    🔍 search_request (bắt buộc, body)
    Loại: FileSearchRequest
    Mô tả: Yêu cầu tìm kiếm
    
    🔹 Đầu ra
    📄 search_results
    Loại: FileSearchResponse
    Mô tả: Kết quả tìm kiếm
    """
    try:
        results = await file_service.search_files(search_request)
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Tìm kiếm file thành công",
            data=results,
            timestamp=datetime.utcnow().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/general-file-management-service/search"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi tìm kiếm file: {str(e)}"
        )
