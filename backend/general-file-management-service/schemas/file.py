from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class FileStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"
    PROCESSING = "processing"

class FileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    IMAGE = "image"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    OTHER = "other"

class FileCategory(BaseModel):
    id: str = Field(..., description="ID danh mục")
    name: str = Field(..., description="Tên danh mục")
    description: Optional[str] = Field(None, description="Mô tả danh mục")
    parent_id: Optional[str] = Field(None, description="ID danh mục cha")
    created_at: datetime = Field(..., description="Thời gian tạo")
    updated_at: datetime = Field(..., description="Thời gian cập nhật")

class FileMetadata(BaseModel):
    title: Optional[str] = Field(None, description="Tiêu đề file")
    description: Optional[str] = Field(None, description="Mô tả file")
    tags: List[str] = Field(default=[], description="Tags của file")
    category: Optional[str] = Field(None, description="Danh mục file")
    author: Optional[str] = Field(None, description="Tác giả file")
    keywords: List[str] = Field(default=[], description="Từ khóa")
    custom_fields: dict = Field(default={}, description="Trường tùy chỉnh")

class FileInfo(BaseModel):
    file_id: str = Field(..., description="ID duy nhất của file")
    filename: str = Field(..., description="Tên file gốc")
    file_size: int = Field(..., description="Kích thước file (bytes)")
    file_type: FileType = Field(..., description="Loại file")
    mime_type: str = Field(..., description="MIME type")
    status: FileStatus = Field(..., description="Trạng thái file")
    metadata: FileMetadata = Field(..., description="Metadata của file")
    file_path: str = Field(..., description="Đường dẫn file")
    checksum: str = Field(..., description="Checksum MD5")
    created_at: datetime = Field(..., description="Thời gian tạo")
    updated_at: datetime = Field(..., description="Thời gian cập nhật")
    created_by: str = Field(..., description="Người tạo")
    system_id: str = Field(..., description="ID hệ thống")
    version: int = Field(default=1, description="Phiên bản file")

class FileUploadResponse(BaseModel):
    file_id: str = Field(..., description="ID duy nhất của file")
    filename: str = Field(..., description="Tên file gốc")
    file_size: int = Field(..., description="Kích thước file (bytes)")
    status: FileStatus = Field(..., description="Trạng thái upload")
    upload_time: datetime = Field(..., description="Thời gian upload")
    message: str = Field(..., description="Thông báo kết quả")

class FileSearchRequest(BaseModel):
    query: str = Field(..., description="Từ khóa tìm kiếm")
    categories: Optional[List[str]] = Field(None, description="Danh mục cần tìm")
    file_types: Optional[List[FileType]] = Field(None, description="Loại file cần tìm")
    tags: Optional[List[str]] = Field(None, description="Tags cần tìm")
    date_from: Optional[datetime] = Field(None, description="Từ ngày")
    date_to: Optional[datetime] = Field(None, description="Đến ngày")
    size_min: Optional[int] = Field(None, description="Kích thước tối thiểu")
    size_max: Optional[int] = Field(None, description="Kích thước tối đa")
    page_number: int = Field(0, ge=0, description="Số trang")
    page_size: int = Field(10, ge=1, le=100, description="Kích thước trang")
    sort_by: str = Field("created_at", description="Sắp xếp theo trường")
    sort_direction: str = Field("desc", description="Hướng sắp xếp (asc/desc)")

class FileSearchResponse(BaseModel):
    files: List[FileInfo] = Field(..., description="Danh sách file tìm thấy")
    total_count: int = Field(..., description="Tổng số file")
    page_number: int = Field(..., description="Số trang hiện tại")
    page_size: int = Field(..., description="Kích thước trang")
    total_pages: int = Field(..., description="Tổng số trang")
    search_time_ms: float = Field(..., description="Thời gian tìm kiếm (ms)")
    suggestions: List[str] = Field(default=[], description="Gợi ý tìm kiếm")
