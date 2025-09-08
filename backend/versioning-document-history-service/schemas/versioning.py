from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
import uuid


class Snapshot(BaseModel):
    snapshotId: str = Field(default_factory=lambda: uuid.uuid4().hex)
    contractId: str
    version: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[str] = None
    checksum: Optional[str] = None
    size: Optional[int] = None
    note: Optional[str] = None


class HistoryEvent(BaseModel):
    eventId: str = Field(default_factory=lambda: uuid.uuid4().hex)
    contractId: str
    version: int
    eventType: str
    actor: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = None


class DiffRequest(BaseModel):
    leftVersion: int
    rightVersion: int
    mode: str = Field(default="text")


class ChangeItem(BaseModel):
    path: str
    changeType: str
    before: Optional[Any] = None
    after: Optional[Any] = None


class DiffResult(BaseModel):
    leftVersion: int
    rightVersion: int
    summary: str
    changes: List[ChangeItem] = []


class RestoreRequest(BaseModel):
    version: int
    reason: Optional[str] = None
    actorId: Optional[str] = None


class RestoreResult(BaseModel):
    contractId: str
    restoredFromVersion: int
    newVersion: int
    status: str
    note: Optional[str] = None


class PageResult(BaseModel):
    content: List[Any]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int
    number_of_elements: int


class PaginatedSnapshots(BaseModel):
    result: PageResult


