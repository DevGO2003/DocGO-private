from fastapi import APIRouter, Request, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Generic, TypeVar
from datetime import datetime, timezone
import uuid


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_envelope(status_code: int, short_message: str, description: str, data, path: str, request_id: str):
    return {
        "apiVersion": "v1",
        "statusCode": status_code,
        "shortMessage": short_message,
        "description": description,
        "data": data,
        "timestamp": iso_now(),
        "requestId": request_id,
        "path": path,
    }


router = APIRouter(prefix="/api/v1/commenting-collaboration-service", tags=["Commenting Collaboration Service"])


class Thread(BaseModel):
    id: str
    contractId: str
    title: str
    participants: List[str] = []
    createdBy: str
    createdAt: str
    updatedAt: Optional[str] = None
    deletedAt: Optional[str] = None
    lastMessageAt: Optional[str] = None
    totalComments: int = 0


class Comment(BaseModel):
    id: str
    threadId: str
    content: str
    authorId: str
    createdAt: str
    updatedAt: Optional[str] = None
    deletedAt: Optional[str] = None
    attachments: List[str] = []
    mentionedUserIds: List[str] = []
    editHistory: List[dict] = []


class CreateThreadRequest(BaseModel):
    contractId: str
    title: str
    createdBy: str
    participants: Optional[List[str]] = None


class UpdateThreadRequest(BaseModel):
    title: Optional[str] = None
    participants: Optional[List[str]] = None


class CreateCommentRequest(BaseModel):
    content: str
    attachments: Optional[List[str]] = None
    mentionedUserIds: Optional[List[str]] = None
    actorId: str


class UpdateCommentRequest(BaseModel):
    content: str
    editorId: str


T = TypeVar("T")


class Page(Generic[T], BaseModel):
    content: List[T]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int
    number_of_elements: int


@router.post("/threads", summary="Tạo thread mới")
async def create_thread(request: Request, payload: CreateThreadRequest):
    thread = Thread(
        id=str(uuid.uuid4()),
        contractId=payload.contractId,
        title=payload.title,
        participants=payload.participants or [],
        createdBy=payload.createdBy,
        createdAt=iso_now(),
    )
    return build_envelope(201, "Created", "Tạo thread thành công.", thread.model_dump(), request.url.path, str(uuid.uuid4()))


@router.get("/threads", summary="Danh sách thread theo bộ lọc và phân trang")
async def list_threads(request: Request, pageNumber: int = 0, pageSize: int = 10, contractId: Optional[str] = None, createdBy: Optional[str] = None):
    page = Page[Thread](content=[], total_elements=0, total_pages=0, page_number=pageNumber, page_size=pageSize, number_of_elements=0)
    if page.total_elements == 0:
        return build_envelope(204, "No Content", "Không có thread nào.", None, request.url.path, str(uuid.uuid4()))
    return build_envelope(200, "Success", "Lấy danh sách thread thành công.", page.model_dump(), request.url.path, str(uuid.uuid4()))


@router.get("/threads/{threadId}", summary="Chi tiết thread")
async def get_thread(request: Request, threadId: str):
    return build_envelope(404, "Not Found", "Thread không tồn tại.", None, request.url.path, str(uuid.uuid4()))


@router.put("/threads/{threadId}", summary="Cập nhật thread")
async def update_thread(request: Request, threadId: str, payload: UpdateThreadRequest):
    return build_envelope(200, "Success", "Cập nhật thread thành công.", {"id": threadId, **(payload.model_dump(exclude_none=True))}, request.url.path, str(uuid.uuid4()))


@router.delete("/threads/{threadId}", summary="Xoá mềm thread")
async def delete_thread(request: Request, threadId: str):
    return build_envelope(200, "Success", "Xoá mềm thread thành công.", {"id": threadId, "deleted": True}, request.url.path, str(uuid.uuid4()))


@router.post("/threads/{threadId}/comments", summary="Tạo comment mới trong thread")
async def create_comment(request: Request, threadId: str, payload: CreateCommentRequest):
    comment = Comment(
        id=str(uuid.uuid4()),
        threadId=threadId,
        content=payload.content,
        authorId=payload.actorId,
        createdAt=iso_now(),
        attachments=payload.attachments or [],
        mentionedUserIds=payload.mentionedUserIds or [],
    )
    return build_envelope(201, "Created", "Tạo comment thành công.", comment.model_dump(), request.url.path, str(uuid.uuid4()))


@router.get("/threads/{threadId}/comments", summary="Danh sách comment theo phân trang")
async def list_comments(request: Request, threadId: str, pageNumber: int = 0, pageSize: int = 10, sortDirection: str = "asc"):
    page = Page[Comment](content=[], total_elements=0, total_pages=0, page_number=pageNumber, page_size=pageSize, number_of_elements=0)
    if page.total_elements == 0:
        return build_envelope(204, "No Content", "Không có comment nào.", None, request.url.path, str(uuid.uuid4()))
    return build_envelope(200, "Success", "Lấy danh sách comment thành công.", page.model_dump(), request.url.path, str(uuid.uuid4()))


@router.put("/comments/{commentId}", summary="Chỉnh sửa comment")
async def update_comment(request: Request, commentId: str, payload: UpdateCommentRequest):
    edit_record = {"editedAt": iso_now(), "editorId": payload.editorId}
    return build_envelope(200, "Success", "Cập nhật comment thành công.", {"id": commentId, "editHistory": [edit_record], "content": payload.content}, request.url.path, str(uuid.uuid4()))


@router.delete("/comments/{commentId}", summary="Xoá mềm comment")
async def delete_comment(request: Request, commentId: str):
    return build_envelope(200, "Success", "Xoá mềm comment thành công.", {"id": commentId, "deleted": True}, request.url.path, str(uuid.uuid4()))

from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional, List
from datetime import datetime
import uuid

from schemas.response import RestResponse
from schemas.collab import (
    CreateThreadRequest, UpdateThreadRequest, Thread,
    CreateCommentRequest, UpdateCommentRequest, Comment,
    PaginatedThreads, PaginatedComments,
)
from services.collab_service import CollaborationService


router = APIRouter(tags=["Commenting Collaboration Service"])
service = CollaborationService()


@router.post("/threads", summary="Tạo thread")
async def create_thread(request: Request, body: CreateThreadRequest):
    thread = service.create_thread(body)
    return RestResponse(statusCode=201, shortMessage="Created", description="Tạo thread thành công", data=thread, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))


@router.get("/threads", summary="Liệt kê threads")
async def list_threads(request: Request,
    pageNumber: int = Query(0, ge=0),
    pageSize: int = Query(10, ge=1, le=100),
    contractId: Optional[str] = None,
    createdBy: Optional[str] = None,
    sortBy: Optional[str] = "createdAt",
    sortDirection: Optional[str] = "DESC",
):
    result = service.list_threads(contractId, createdBy, pageNumber, pageSize, sortBy, sortDirection)
    if result.number_of_elements == 0:
        return RestResponse(statusCode=204, shortMessage="No Content", description="Không có thread.", data=None, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Đã lấy {result.number_of_elements} threads", data=PaginatedThreads(result=result), path=request.url.path)


@router.get("/threads/{thread_id}", summary="Chi tiết thread")
async def get_thread(request: Request, thread_id: str):
    thread = service.get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Lấy chi tiết thread thành công", data=thread, path=request.url.path)


@router.put("/threads/{thread_id}", summary="Cập nhật thread")
async def update_thread(request: Request, thread_id: str, body: UpdateThreadRequest):
    thread = service.update_thread(thread_id, body)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Cập nhật thread thành công", data=thread, path=request.url.path)


@router.delete("/threads/{thread_id}", summary="Xoá thread")
async def delete_thread(request: Request, thread_id: str):
    ok = service.delete_thread(thread_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Thread không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Đã xoá thread", data={"success": True}, path=request.url.path)


@router.post("/threads/{thread_id}/comments", summary="Tạo comment")
async def create_comment(request: Request, thread_id: str, body: CreateCommentRequest):
    comment = service.create_comment(thread_id, body)
    if not comment:
        raise HTTPException(status_code=404, detail="Thread không tồn tại")
    return RestResponse(statusCode=201, shortMessage="Created", description="Tạo comment thành công", data=comment, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))


@router.get("/threads/{thread_id}/comments", summary="Liệt kê comments")
async def list_comments(request: Request, thread_id: str,
    pageNumber: int = Query(0, ge=0),
    pageSize: int = Query(10, ge=1, le=100),
    sortBy: Optional[str] = "createdAt",
    sortDirection: Optional[str] = "ASC",
):
    result = service.list_comments(thread_id, pageNumber, pageSize, sortBy, sortDirection)
    if result.number_of_elements == 0:
        return RestResponse(statusCode=204, shortMessage="No Content", description="Không có comment.", data=None, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Đã lấy {result.number_of_elements} comments", data=PaginatedComments(result=result), path=request.url.path)


@router.put("/comments/{comment_id}", summary="Chỉnh sửa comment")
async def update_comment(request: Request, comment_id: str, body: UpdateCommentRequest):
    comment = service.update_comment(comment_id, body)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Cập nhật comment thành công", data=comment, path=request.url.path)


@router.delete("/comments/{comment_id}", summary="Xoá comment")
async def delete_comment(request: Request, comment_id: str):
    ok = service.delete_comment(comment_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Comment không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Đã xoá comment", data={"success": True}, path=request.url.path)


