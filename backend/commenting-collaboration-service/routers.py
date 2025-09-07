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


