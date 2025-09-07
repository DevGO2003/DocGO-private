from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
import uuid


class Thread(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    contractId: str
    title: str
    participants: List[str] = []
    createdBy: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    deletedAt: Optional[datetime] = None
    lastMessageAt: Optional[datetime] = None
    totalComments: int = 0


class CreateThreadRequest(BaseModel):
    contractId: str
    title: str
    createdBy: str
    participants: Optional[List[str]] = None


class UpdateThreadRequest(BaseModel):
    title: Optional[str] = None
    participants: Optional[List[str]] = None


class EditHistory(BaseModel):
    editedAt: datetime
    editorId: str
    before: Optional[str]
    after: Optional[str]


class Comment(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    threadId: str
    content: str
    authorId: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    deletedAt: Optional[datetime] = None
    attachments: List[str] = []
    mentionedUserIds: List[str] = []
    editHistory: List[EditHistory] = []


class CreateCommentRequest(BaseModel):
    content: str
    attachments: Optional[List[str]] = None
    mentionedUserIds: Optional[List[str]] = None
    actorId: Optional[str] = None


class UpdateCommentRequest(BaseModel):
    content: str
    actorId: Optional[str] = None


class PageResult(BaseModel):
    content: List[Any]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int
    number_of_elements: int


class PaginatedThreads(BaseModel):
    result: PageResult


class PaginatedComments(BaseModel):
    result: PageResult


