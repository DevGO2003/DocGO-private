from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional
from datetime import datetime
import uuid

from schemas.response import RestResponse
from schemas.reminder import (
    CreateReminderRequest, Reminder,
    PaginatedReminders,
)
from services.reminder_service import ReminderService


router = APIRouter(tags=["Reminder Scheduler Service"])
service = ReminderService()


@router.post("/reminders", summary="Tạo reminder mới")
async def create_reminder(request: Request, body: CreateReminderRequest):
    rem = service.create_reminder(body)
    return RestResponse(statusCode=201, shortMessage="Created", description="Tạo reminder thành công", data=rem, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))


@router.get("/reminders", summary="Liệt kê reminders")
async def list_reminders(request: Request,
    pageNumber: int = Query(0, ge=0),
    pageSize: int = Query(10, ge=1, le=100),
    contractId: Optional[str] = None,
    status: Optional[str] = None,
):
    result = service.list_reminders(contractId, status, pageNumber, pageSize)
    if result.number_of_elements == 0:
        return RestResponse(statusCode=204, shortMessage="No Content", description="Không có reminder.", data=None, path=request.url.path, timestamp=datetime.utcnow(), requestId=str(uuid.uuid4()))
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Đã lấy {result.number_of_elements} reminders", data=PaginatedReminders(result=result), path=request.url.path)


@router.get("/reminders/{reminder_id}", summary="Chi tiết reminder")
async def get_reminder(request: Request, reminder_id: str):
    rem = service.get_reminder(reminder_id)
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Lấy chi tiết reminder thành công", data=rem, path=request.url.path)


@router.delete("/reminders/{reminder_id}", summary="Huỷ reminder")
async def cancel_reminder(request: Request, reminder_id: str):
    ok = service.cancel_reminder(reminder_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Reminder không tồn tại")
    return RestResponse(statusCode=200, shortMessage="Success", description="Đã huỷ reminder", data={"success": True}, path=request.url.path)


@router.post("/simulate-tick", summary="Trigger tick thủ công (debug)")
async def simulate_tick(request: Request):
    count = service.tick()
    return RestResponse(statusCode=200, shortMessage="Success", description=f"Tick xử lý {count} reminders đến hạn", data={"processed": count}, path=request.url.path)


