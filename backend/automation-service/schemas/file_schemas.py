

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    file_size: int = Field(...)
    file_type: str = Field(...)
    status: str = Field(...)
    upload_time: datetime = Field(...)
    message: str = Field(...)
    s3_key: str = Field(...)
    bucket: str = Field(...)
    file_url: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileDownloadResponse(BaseModel):
    
    filename: str = Field(...)
    content_type: str = Field(...)
    file_content: bytes = Field(...)
    file_size: int = Field(...)

    class Config:
        json_encoders = {
            bytes: lambda v: v.decode('utf-8', errors='ignore')
        }


class FileMetadata(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    s3_key: str = Field(...)
    bucket: str = Field(...)
    file_size: int = Field(...)
    file_type: str = Field(...)
    status: str = Field(...)
    upload_time: datetime = Field(...)
    uploaded_by: str = Field(...)
    metadata: Dict[str, str] = Field(default_factory=dict)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileListResponse(BaseModel):
    
    files: List[FileMetadata] = Field(...)
    total_elements: int = Field(...)
    total_pages: int = Field(...)
    current_page: int = Field(...)
    page_size: int = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileDetailsResponse(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    file_size: int = Field(...)
    file_type: str = Field(...)
    status: str = Field(...)
    upload_time: datetime = Field(...)
    uploaded_by: str = Field(...)
    s3_key: str = Field(...)
    bucket: str = Field(...)
    file_url: str = Field(...)
    checksum: Optional[str] = Field(None)
    access_count: int = Field(0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
