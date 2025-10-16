

from datetime import datetime
from typing import List, Optional, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field
from enum import Enum

T = TypeVar('T')


class ViewType(str, Enum):
    
    CARD = "card"
    TABLE = "table"
    DETAIL = "detail"
    FULL = "full"


# ============================================================================
# FILE VIEW SCHEMAS
# ============================================================================

class FileCardView(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    file_type: str = Field(...)
    status: str = Field(...)
    upload_time: datetime = Field(...)
    file_url: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileTableView(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    file_type: str = Field(...)
    file_size: int = Field(...)
    status: str = Field(...)
    upload_time: datetime = Field(...)
    uploaded_by: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileSummaryView(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)
    status: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FileMinimalView(BaseModel):
    
    file_id: str = Field(...)
    filename: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ============================================================================
# BATCH JOB VIEW SCHEMAS
# ============================================================================

class BatchJobCardView(BaseModel):
    
    job_id: str = Field(...)
    job_name: str = Field(...)
    status: str = Field(...)
    created_at: datetime = Field(...)
    progress: int = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BatchJobTableView(BaseModel):
    
    job_id: str = Field(...)
    job_name: str = Field(...)
    status: str = Field(...)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    progress: int = Field(...)
    total_files: int = Field(...)
    processed_files: int = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BatchJobSummaryView(BaseModel):
    
    job_id: str = Field(...)
    job_name: str = Field(...)
    status: str = Field(...)
    progress: int = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BatchJobMinimalView(BaseModel):
    
    job_id: str = Field(...)
    job_name: str = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ============================================================================
# PAGINATED RESPONSE WITH VIEW
# ============================================================================

class PaginatedViewResponse(BaseModel, Generic[T]):
    
    view: str = Field(...)
    items: List[T] = Field(...)
    pagination: Dict[str, Any] = Field(...)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ============================================================================
# VIEW MAPPER UTILITIES
# ============================================================================

class ViewMapper:
    
    
    @staticmethod
    def map_file_to_view(file_data: Dict[str, Any], view_type: ViewType) -> BaseModel:
        
        if view_type == ViewType.CARD:
            return FileCardView(
                file_id=file_data["file_id"],
                filename=file_data["filename"],
                file_type=file_data["file_type"],
                status=file_data["status"],
                upload_time=file_data["upload_time"],
                file_url=file_data["file_url"]
            )
        elif view_type == ViewType.TABLE:
            return FileTableView(
                file_id=file_data["file_id"],
                filename=file_data["filename"],
                file_type=file_data["file_type"],
                file_size=file_data["file_size"],
                status=file_data["status"],
                upload_time=file_data["upload_time"],
                uploaded_by=file_data["uploaded_by"]
            )
        else:
            # DETAIL hoặc FULL: trả dữ liệu đầy đủ (tạm thời trả thẳng dữ liệu gốc)
            return file_data
    
    @staticmethod
    def map_batch_job_to_view(job_data: Dict[str, Any], view_type: ViewType) -> BaseModel:
        
        if view_type == ViewType.CARD:
            return BatchJobCardView(
                job_id=job_data["job_id"],
                job_name=job_data["job_name"],
                status=job_data["status"],
                created_at=job_data["created_at"],
                progress=job_data["progress"]
            )
        elif view_type == ViewType.TABLE:
            return BatchJobTableView(
                job_id=job_data["job_id"],
                job_name=job_data["job_name"],
                status=job_data["status"],
                created_at=job_data["created_at"],
                updated_at=job_data["updated_at"],
                progress=job_data["progress"],
                total_files=job_data["total_files"],
                processed_files=job_data["processed_files"]
            )
        else:
            # DETAIL hoặc FULL
            return job_data
