from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional
from datetime import datetime
import uuid

from schemas.response import RestResponse
from schemas.versioning import (
    Snapshot, HistoryEvent, DiffRequest, DiffResult, RestoreRequest, RestoreResult,
    PaginatedSnapshots
)
from services.versioning_service import VersioningService


router = APIRouter(tags=["Versioning Document History Service"])
service = VersioningService()


@router.get("/snapshots", summary="Danh sách snapshots")
async def list_snapshots(request: Request,
    pageNumber: int = Query(0, ge=0),
    pageSize: int = Query(10, ge=1, le=100),
    contractId: Optional[str] = None,
    createdBy: Optional[str] = None
):
    result = service.list_snapshots(contractId, createdBy, pageNumber, pageSize)
    if result.number_of_elements == 0:
        return RestResponse(statusCode=204, shortMessage="No Content", description="Không có snapshot.", data=None, path=request.url.path)
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Đã lấy {result.number_of_elements} snapshots", data=PaginatedSnapshots(result=result), path=request.url.path)


@router.get("/{contract_id}/history", summary="Lịch sử phiên bản")
async def get_history(request: Request, contract_id: str,
    fromTime: Optional[str] = None,
    toTime: Optional[str] = None,
    actor: Optional[str] = None,
    eventType: Optional[str] = None
):
    events = service.get_history(contract_id, fromTime, toTime, actor, eventType)
    if not events:
        return RestResponse(statusCode=204, shortMessage="No Content", description="Không có lịch sử.", data=None, path=request.url.path)
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Đã lấy {len(events)} sự kiện", data=events, path=request.url.path)


@router.post("/{contract_id}/diff", summary="So sánh hai phiên bản")
async def diff_versions(request: Request, contract_id: str, body: DiffRequest):
    diff = service.compute_diff(contract_id, body.leftVersion, body.rightVersion, body.mode)
    return RestResponse(statusCode=200, shortMessage="Success", description="So sánh hai phiên bản", data=diff, path=request.url.path)


@router.put("/{contract_id}/restore", summary="Khôi phục về phiên bản chỉ định")
async def restore_version(request: Request, contract_id: str, body: RestoreRequest):
    restored = service.restore_version(contract_id, body.version, body.reason, body.actorId)
    if restored is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng/phiên bản")
    return RestResponse(statusCode=200, shortMessage="Success", description="Khôi phục phiên bản thành công", data=restored, path=request.url.path)

from fastapi import APIRouter, Request, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Generic, TypeVar
from datetime import datetime, timezone
import uuid
from .services.versioning_service import VersioningService, init_db


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


router = APIRouter(prefix="/api/v1/versioning-document-history-service", tags=["Versioning Document History Service"])
service = VersioningService()
init_db()


class Snapshot(BaseModel):
    snapshotId: str
    contractId: str
    version: int
    createdAt: str
    createdBy: str
    checksum: Optional[str] = None
    size: Optional[int] = None
    note: Optional[str] = None


class HistoryEvent(BaseModel):
    eventId: str
    contractId: str
    version: int
    eventType: str
    actor: str
    timestamp: str
    metadata: Optional[dict] = None


class DiffRequest(BaseModel):
    leftVersion: int = Field(..., ge=1)
    rightVersion: int = Field(..., ge=1)
    mode: str = Field("text", pattern="^(text|json|semantic)$")


class Change(BaseModel):
    path: str
    changeType: str
    before: Optional[str] = None
    after: Optional[str] = None


class DiffResult(BaseModel):
    leftVersion: int
    rightVersion: int
    summary: str
    changes: List[Change]


class RestoreRequest(BaseModel):
    version: int = Field(..., ge=1)
    reason: str


class RestoreResult(BaseModel):
    contractId: str
    restoredFromVersion: int
    newVersion: int
    status: str
    note: Optional[str] = None


T = TypeVar("T")


class PaginatedResponse(Generic[T], BaseModel):
    pageNumber: int
    pageSize: int
    totalElements: int
    totalPages: int
    items: List[T]


@router.get("/healthz", summary="Health check")
async def healthz():
    return {"status": "ok"}


@router.get(
    "/snapshots",
    summary="Danh sách snapshot",
    description=(
        "Trả về danh sách snapshot theo bộ lọc.\n\n"
        "Đầu vào\n"
        "📄 pageNumber (tùy chọn, query) — số trang\n"
        "📄 pageSize (tùy chọn, query) — kích thước trang\n"
        "🔎 searchTerm (tùy chọn, query) — chuỗi tìm kiếm\n"
        "📌 contractId (tùy chọn, query) — lọc theo hợp đồng\n\n"
        "Đầu ra\n"
        "📦 data — PaginatedResponse<Snapshot> hoặc null khi không có dữ liệu (statusCode: 204)"
    ),
)
async def list_snapshots(request: Request, pageNumber: int = 0, pageSize: int = 10, searchTerm: Optional[str] = None, contractId: Optional[str] = None):
    result = service.list_snapshots(pageNumber, pageSize, searchTerm, contractId)
    if result.total_elements == 0:
        return build_envelope(204, "No Content", "Không có snapshot nào.", None, request.url.path, str(uuid.uuid4()))

    resp = PaginatedResponse[Snapshot](
        pageNumber=result.page_number,
        pageSize=result.page_size,
        totalElements=result.total_elements,
        totalPages=result.total_pages,
        items=[
            Snapshot(
                snapshotId=s.snapshot_id,
                contractId=s.contract_id,
                version=s.version,
                createdAt=s.created_at.isoformat() if s.created_at else iso_now(),
                createdBy=s.created_by,
                checksum=s.checksum,
                size=s.size,
                note=s.note,
            )
            for s in result.items
        ],
    )
    return build_envelope(200, "Success", "Lấy danh sách snapshot thành công.", resp.model_dump(), request.url.path, str(uuid.uuid4()))


@router.get(
    "/{contractId}/history",
    summary="Lịch sử phiên bản",
    description=(
        "Lấy timeline sự kiện phiên bản của hợp đồng.\n\n"
        "Đầu vào\n"
        "🆔 contractId (bắt buộc, path) — mã hợp đồng\n\n"
        "Đầu ra\n"
        "📦 data — List<HistoryEvent> hoặc null khi không có dữ liệu (statusCode: 204)"
    ),
)
async def get_history(request: Request, contractId: str):
    orm_events = service.get_history(contractId)
    if not orm_events:
        return build_envelope(204, "No Content", "Không có lịch sử nào.", None, request.url.path, str(uuid.uuid4()))
    events = [
        HistoryEvent(
            eventId=e.event_id,
            contractId=e.contract_id,
            version=e.version,
            eventType=e.event_type,
            actor=e.actor,
            timestamp=e.timestamp.isoformat() if e.timestamp else iso_now(),
            metadata={}
        )
        for e in orm_events
    ]
    return build_envelope(200, "Success", "Lấy lịch sử thành công.", [e.model_dump() for e in events], request.url.path, str(uuid.uuid4()))


@router.post(
    "/{contractId}/diff",
    summary="So sánh hai phiên bản",
    description=(
        "So sánh hai phiên bản của hợp đồng.\n\n"
        "Đầu vào\n"
        "🆔 contractId (bắt buộc, path)\n"
        "📄 body DiffRequest (bắt buộc)\n\n"
        "Đầu ra\n"
        "📦 data — DiffResult"
    ),
)
async def compute_diff(request: Request, contractId: str, payload: DiffRequest = Body(...)):
    diff_dict = service.compute_diff(contractId, payload.leftVersion, payload.rightVersion, payload.mode)
    result = DiffResult(**diff_dict)
    return build_envelope(200, "Success", "Tính diff thành công.", result.model_dump(), request.url.path, str(uuid.uuid4()))


@router.put(
    "/{contractId}/restore",
    summary="Khôi phục phiên bản",
    description=(
        "Khôi phục hợp đồng về phiên bản cụ thể và phát sự kiện chuẩn.\n\n"
        "Đầu vào\n"
        "🆔 contractId (bắt buộc, path)\n"
        "📄 body RestoreRequest (bắt buộc)\n\n"
        "Đầu ra\n"
        "📦 data — RestoreResult"
    ),
)
async def restore_version(request: Request, contractId: str, payload: RestoreRequest = Body(...)):
    restored = service.restore_version(contractId, payload.version, payload.reason, actor="system")
    result = RestoreResult(**restored)
    return build_envelope(200, "Success", "Khôi phục phiên bản thành công.", result.model_dump(), request.url.path, str(uuid.uuid4()))


