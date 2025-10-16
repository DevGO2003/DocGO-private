from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class BatchJobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BatchJobType(str, Enum):
    AI_PROCESSING = "ai_processing"
    NOTIFICATION_SEND = "notification_send"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    FILE_PROCESSING = "file_processing"

class BatchJobPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class BatchJobRequest(BaseModel):
    type: BatchJobType = Field(...)
    name: str = Field(...)
    description: Optional[str] = Field(None)
    data: Dict[str, Any] = Field(...)
    priority: BatchJobPriority = Field(default=BatchJobPriority.NORMAL)
    scheduled_at: Optional[datetime] = Field(None)
    max_retries: int = Field(default=3, ge=0, le=10)
    timeout: Optional[int] = Field(None, ge=1)
    metadata: Optional[Dict[str, Any]] = Field(None)

class BatchJobResponse(BaseModel):
    id: str = Field(...)
    type: BatchJobType
    name: str
    description: Optional[str] = None
    status: BatchJobStatus
    priority: BatchJobPriority
    progress: int = Field(0, ge=0, le=100)
    data: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    retry_count: int = Field(0, ge=0)
    max_retries: int
    timeout: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class BatchJobStatusRequest(BaseModel):
    job_id: str = Field(...)

class BatchJobListRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
    type: Optional[BatchJobType] = Field(None)
    status: Optional[BatchJobStatus] = Field(None)
    priority: Optional[BatchJobPriority] = Field(None)
    start_date: Optional[datetime] = Field(None)
    end_date: Optional[datetime] = Field(None)

class BatchJobListResponse(BaseModel):
    jobs: List[BatchJobResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class BatchJobCancelRequest(BaseModel):
    job_id: str = Field(...)

class BatchJobRetryRequest(BaseModel):
    job_id: str = Field(...)

class BatchProcessingRequest(BaseModel):
    files: List[Dict[str, Any]] = Field(...)
    processing_type: Literal["extract", "summarize", "classify"] = Field(...)
    options: Optional[Dict[str, Any]] = Field(None)
    callback_url: Optional[str] = Field(None)

class BatchProcessingResponse(BaseModel):
    job_id: str = Field(...)
    total_files: int = Field(...)
    estimated_time: Optional[int] = Field(None)
    status_url: str = Field(...)

class BatchJobProgress(BaseModel):
    job_id: str
    status: BatchJobStatus
    progress: int
    current_item: Optional[str] = None
    total_items: int
    processed_items: int
    failed_items: int
    estimated_remaining: Optional[int] = None
    last_updated: datetime
