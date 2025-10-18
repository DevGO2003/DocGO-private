from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    # Chỉ giữ lại 3 event cần thiết
    FILE_METADATA_RECORDED = "file.metadata.recorded"
    FILE_PLAINTEXT_EXTRACTED = "file.plaintext.extracted"
    CONTRACT_SUMMARY_GENERATED = "contract.summary.generated"

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

# Event models cho 3 event cần thiết
class FileMetadataRecordedEvent(BaseModel):
    """Event published when file metadata is recorded"""
    correlationId: str = Field(...)
    fileId: str = Field(...)
    fileName: str = Field(...)
    fileSize: int = Field(...)
    contentType: str = Field(...)
    fileUrl: str = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class FilePlaintextExtractedEvent(BaseModel):
    """Event published when plaintext is extracted from file"""
    correlationId: str = Field(...)
    fileId: str = Field(...)
    fileName: str = Field(...)
    plaintext: str = Field(...)
    hasPlaintext: bool = Field(...)
    hasJson: bool = Field(...)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())

class ContractSummaryGeneratedEvent(BaseModel):
    """Event published when contract summary is generated"""
    correlationId: str = Field(...)
    fileId: str = Field(...)
    fileName: str = Field(...)
    summaryResult: Dict[str, Any] = Field(...)
    contractMetadata: Optional[Dict[str, Any]] = Field(None)
    userId: str = Field(default="system")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())
