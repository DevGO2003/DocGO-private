from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    # Legacy event types
    FILE_UPLOADED = "file.uploaded"
    AI_PROCESSING_STARTED = "ai.processing.started"
    AI_PROCESSING_COMPLETED = "ai.processing.completed"
    AI_PROCESSING_FAILED = "ai.processing.failed"
    NOTIFICATION_SENT = "notification.sent"
    NOTIFICATION_FAILED = "notification.failed"
    BATCH_JOB_STARTED = "batch.job.started"
    BATCH_JOB_COMPLETED = "batch.job.completed"
    BATCH_JOB_FAILED = "batch.job.failed"
    CONTRACT_CREATED = "contract.created"
    CONTRACT_UPDATED = "contract.updated"
    CONTRACT_DELETED = "contract.deleted"
    
    # New event types matching Cursor rules
    AUTOMATION_STARTED = "AutomationStarted"
    AUTOMATION_COMPLETED = "AutomationCompleted"
    AUTOMATION_FAILED = "AutomationFailed"
    FILE_UPLOADED_NEW = "FileUploaded"
    FILE_PROCESSED = "FileProcessed"
    DOCUMENT_CLASSIFIED = "DocumentClassified"
    CONTRACT_SUMMARY_UPDATED = "ContractSummaryUpdated"
    DOCUMENT_CREATED = "DocumentCreated"

class EventStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class EventPayload(BaseModel):
    eventVersion: str = Field(default="v1")
    eventType: EventType = Field(...)
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(...)
    correlationId: str = Field(...)
    actor: Optional[Dict[str, Any]] = Field(None)
    data: Dict[str, Any] = Field(...)
    metadata: Optional[Dict[str, Any]] = Field(None)

class EventHandlerRequest(BaseModel):
    event: EventPayload = Field(...)
    handler_type: str = Field(...)
    retry_count: int = Field(default=0, ge=0)
    max_retries: int = Field(default=3, ge=0)

class EventHandlerResponse(BaseModel):
    success: bool = Field(...)
    message: str = Field(...)
    processed_at: datetime = Field(...)
    retry_count: int = Field(...)
    next_retry_at: Optional[datetime] = Field(None)

class EventSubscriptionRequest(BaseModel):
    channels: List[str] = Field(...)
    handler_type: str = Field(...)
    auto_ack: bool = Field(default=True)

class EventSubscriptionResponse(BaseModel):
    subscription_id: str = Field(...)
    channels: List[str]
    status: str = Field(...)
    created_at: datetime

class EventPublishRequest(BaseModel):
    channel: str = Field(...)
    event: EventPayload = Field(...)
    ttl: Optional[int] = Field(None)

class EventPublishResponse(BaseModel):
    success: bool = Field(...)
    message: str = Field(...)
    published_at: datetime = Field(...)

class EventHistoryRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
    event_type: Optional[EventType] = Field(None)
    source: Optional[str] = Field(None)
    status: Optional[EventStatus] = Field(None)
    start_date: Optional[datetime] = Field(None)
    end_date: Optional[datetime] = Field(None)

class EventHistoryResponse(BaseModel):
    events: List[EventPayload]
    total: int
    page: int
    limit: int
    total_pages: int

class WebSocketEvent(BaseModel):
    event_type: str = Field(...)
    data: Dict[str, Any] = Field(...)
    timestamp: datetime = Field(...)
    user_id: Optional[str] = Field(None)

# New event models matching Cursor rules
class AutomationStartedEvent(BaseModel):
    """Event published when automation processing starts"""
    correlationId: str = Field(...)
    fileName: str = Field(...)
    fileSize: int = Field(...)
    contentType: str = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class FileUploadedEvent(BaseModel):
    """Event published when file is uploaded to S3"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileUrl: str = Field(...)
    fileName: str = Field(...)
    fileSize: int = Field(...)
    contentType: str = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class FileProcessedEvent(BaseModel):
    """Event published when file processing is completed"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    processingStatus: str = Field(...)
    ocrText: Optional[str] = Field(None)
    classificationResult: Optional[Dict[str, Any]] = Field(None)
    summaryResult: Optional[Dict[str, Any]] = Field(None)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class DocumentClassifiedEvent(BaseModel):
    """Event published when document classification is completed"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    isContract: bool = Field(...)
    category: str = Field(...)
    confidence: float = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class ContractSummaryUpdatedEvent(BaseModel):
    """Event published when contract summary is updated"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    summaryResult: Dict[str, Any] = Field(...)
    contractMetadata: Optional[Dict[str, Any]] = Field(None)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class DocumentCreatedEvent(BaseModel):
    """Event published when document is created in File Management Service"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    documentType: str = Field(...)
    category: str = Field(...)
    fileUrl: str = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class AutomationCompletedEvent(BaseModel):
    """Event published when automation processing is completed"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    processingStatus: str = Field(...)
    duration: Optional[float] = Field(None)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class AutomationFailedEvent(BaseModel):
    """Event published when automation processing fails"""
    correlationId: str = Field(...)
    documentId: str = Field(...)
    fileName: str = Field(...)
    errorMessage: str = Field(...)
    errorType: str = Field(...)
    retryable: bool = Field(default=True)
    retryCount: int = Field(default=0)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())
