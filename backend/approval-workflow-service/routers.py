from fastapi import APIRouter, Request, HTTPException
from typing import Optional
from datetime import datetime
import uuid

from schemas.response import RestResponse
from schemas.workflow import (
    CreateWorkflowRequest, Workflow,
    CreateApprovalRequest, Approval,
    ApproveRequest, RejectRequest,
)
from services.approval_service import ApprovalService


router = APIRouter(tags=["Approval Workflow Service"])
service = ApprovalService()


@router.post("/workflows", summary="Tạo workflow phê duyệt")
async def create_workflow(request: Request, body: CreateWorkflowRequest):
    wf = service.create_workflow(body)
    return RestResponse(
        statusCode=201,
        shortMessage="Created",
        description="Tạo workflow thành công",
        data=wf,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


@router.get("/workflows/{workflow_id}", summary="Lấy chi tiết workflow")
async def get_workflow(request: Request, workflow_id: str):
    wf = service.get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow không tồn tại")
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Lấy chi tiết workflow thành công",
        data=wf,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


@router.post("/approvals", summary="Tạo approval instance cho contract")
async def create_approval(request: Request, body: CreateApprovalRequest):
    ap = service.create_approval(body)
    return RestResponse(
        statusCode=201,
        shortMessage="Created",
        description="Tạo approval thành công",
        data=ap,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


@router.get("/approvals/{approval_id}", summary="Lấy chi tiết approval")
async def get_approval(request: Request, approval_id: str):
    ap = service.get_approval(approval_id)
    if not ap:
        raise HTTPException(status_code=404, detail="Approval không tồn tại")
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Lấy chi tiết approval thành công",
        data=ap,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


@router.put("/approvals/{approval_id}/approve", summary="Duyệt bước hiện tại")
async def approve(request: Request, approval_id: str, body: ApproveRequest):
    ap = service.approve(approval_id, body.actorId, body.reason)
    if not ap:
        raise HTTPException(status_code=404, detail="Approval không tồn tại")
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Đã duyệt bước hiện tại",
        data=ap,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


@router.put("/approvals/{approval_id}/reject", summary="Từ chối bước hiện tại")
async def reject(request: Request, approval_id: str, body: RejectRequest):
    ap = service.reject(approval_id, body.actorId, body.reason)
    if not ap:
        raise HTTPException(status_code=404, detail="Approval không tồn tại")
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Đã từ chối bước hiện tại",
        data=ap,
        path=request.url.path,
        timestamp=datetime.utcnow(),
        requestId=str(uuid.uuid4()),
    )


