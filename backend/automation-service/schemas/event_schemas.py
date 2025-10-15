from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
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
    ttl: Optional[int] = Field(None)")

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
    user_id: Optional[str] = Field(None)")
