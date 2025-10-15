from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBSOCKET = "websocket"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    CANCELLED = "cancelled"

class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationTemplate(BaseModel):
    id: Optional[str] = None
    name: str = Field(...)
    type: NotificationType = Field(...)
    subject: Optional[str] = Field(None)")
    content: str = Field(...)
    variables: List[str] = Field(default=[])
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class NotificationRequest(BaseModel):
    type: NotificationType = Field(...)
    recipients: List[str] = Field(...)
    subject: Optional[str] = Field(None)")
    content: str = Field(...)
    template_id: Optional[str] = Field(None)")
    template_variables: Optional[Dict[str, Any]] = Field(None)
    priority: NotificationPriority = Field(default=NotificationPriority.NORMAL)
    scheduled_at: Optional[datetime] = Field(None)
    metadata: Optional[Dict[str, Any]] = Field(None)

class NotificationResponse(BaseModel):
    id: str = Field(...)
    type: NotificationType
    recipients: List[str]
    subject: Optional[str] = None
    content: str
    status: NotificationStatus
    priority: NotificationPriority
    created_at: datetime
    sent_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class NotificationHistoryRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
    type: Optional[NotificationType] = Field(None)
    status: Optional[NotificationStatus] = Field(None)
    start_date: Optional[datetime] = Field(None)
    end_date: Optional[datetime] = Field(None)

class NotificationHistoryResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class EmailNotificationRequest(BaseModel):
    to: List[EmailStr] = Field(...)
    cc: Optional[List[EmailStr]] = Field(None)
    bcc: Optional[List[EmailStr]] = Field(None)
    subject: str = Field(...)
    content: str = Field(...)
    html_content: Optional[str] = Field(None)
    attachments: Optional[List[Dict[str, Any]]] = Field(None)

class SMSNotificationRequest(BaseModel):
    to: List[str] = Field(...)
    content: str = Field(...)
    sender: Optional[str] = Field(None)

class PushNotificationRequest(BaseModel):
    user_ids: List[str] = Field(...)
    title: str = Field(...)
    content: str = Field(...)
    data: Optional[Dict[str, Any]] = Field(None)
    action_url: Optional[str] = Field(None)

class WebSocketNotificationRequest(BaseModel):
    user_ids: List[str] = Field(...)
    event: str = Field(...)
    data: Dict[str, Any] = Field(...)
