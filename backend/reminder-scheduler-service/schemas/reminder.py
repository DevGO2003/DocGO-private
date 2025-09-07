from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
import uuid


class Reminder(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    contractId: str
    type: str
    dueAt: datetime
    status: str = Field(default="PENDING")
    recipients: List[str]
    channel: List[str]
    note: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[str] = None


class CreateReminderRequest(BaseModel):
    contractId: str
    type: str
    dueAt: datetime
    recipients: List[str]
    channel: List[str]
    note: Optional[str] = None
    createdBy: Optional[str] = None


class PageResult(BaseModel):
    content: List[Any]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int
    number_of_elements: int


class PaginatedReminders(BaseModel):
    result: PageResult


