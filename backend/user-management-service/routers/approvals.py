from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from config.database import get_db
from services.approval_service import ApprovalService
from services.identity_service import identity_service
from schemas.approval import (
    UserApprovalCreate,
    UserApprovalUpdate,
    UserApprovalResponse,
    UserApprovalList,
    ApprovalSearchParams,
    BulkApprovalRequest
)
from models.user_approval import ApprovalStatus

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.post("/", response_model=UserApprovalResponse, status_code=201)
async def create_approval(
    approval_data: UserApprovalCreate,
    db: Session = Depends(get_db)
):
    """Create a new approval record"""
    try:
        approval = ApprovalService.create_approval(db, approval_data)
        return approval
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{approval_id}", response_model=UserApprovalResponse)
async def get_approval(
    approval_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Get approval by ID"""
    approval = ApprovalService.get_approval(db, approval_id, system_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval

@router.get("/user/{user_id}", response_model=UserApprovalResponse)
async def get_approval_by_user(
    user_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Get approval by user ID"""
    approval = ApprovalService.get_approval_by_user(db, user_id, system_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval

@router.put("/{approval_id}", response_model=UserApprovalResponse)
async def update_approval(
    approval_id: int,
    approval_data: UserApprovalUpdate,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Update approval status"""
    try:
        approval = ApprovalService.update_approval(db, approval_id, system_id, approval_data)
        if not approval:
            raise HTTPException(status_code=404, detail="Approval not found")
        
        # Sync with Identity Service
        await identity_service.sync_user_approval_status(
            approval.user_id, 
            approval.status.value, 
            approval.system_id
        )
        
        return approval
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{approval_id}", status_code=204)
async def delete_approval(
    approval_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Delete approval record"""
    success = ApprovalService.delete_approval(db, approval_id, system_id)
    if not success:
        raise HTTPException(status_code=404, detail="Approval not found")

@router.get("/", response_model=UserApprovalList)
async def search_approvals(
    system_id: str = Query(..., description="System identifier"),
    status: Optional[ApprovalStatus] = Query(None, description="Filter by approval status"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    approver_id: Optional[int] = Query(None, description="Filter by approver ID"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    """Search approvals with pagination and filtering"""
    search_params = ApprovalSearchParams(
        system_id=system_id,
        status=status,
        user_id=user_id,
        approver_id=approver_id,
        page=page,
        size=size
    )
    return ApprovalService.search_approvals(db, search_params)

@router.post("/bulk", response_model=list[UserApprovalResponse])
async def bulk_update_approvals(
    bulk_request: BulkApprovalRequest,
    db: Session = Depends(get_db)
):
    """Bulk update approval status for multiple users"""
    try:
        approvals = ApprovalService.bulk_update_approvals(db, bulk_request)
        
        # Sync with Identity Service for each user
        for approval in approvals:
            await identity_service.sync_user_approval_status(
                approval.user_id,
                approval.status.value,
                approval.system_id
            )
        
        return approvals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error bulk updating approvals: {str(e)}")

@router.get("/statistics/{system_id}")
async def get_approval_statistics(
    system_id: str,
    db: Session = Depends(get_db)
):
    """Get approval statistics for a system"""
    try:
        stats = ApprovalService.get_approval_statistics(db, system_id)
        return {
            "system_id": system_id,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting approval statistics: {str(e)}")

@router.post("/{approval_id}/approve")
async def approve_user(
    approval_id: int,
    system_id: str = Query(..., description="System identifier"),
    approver_id: int = Query(..., description="ID of the approver"),
    notes: Optional[str] = Query(None, description="Approval notes"),
    db: Session = Depends(get_db)
):
    """Approve a user (shortcut endpoint)"""
    try:
        approval_data = UserApprovalUpdate(
            status=ApprovalStatus.APPROVED,
            approver_id=approver_id,
            notes=notes
        )
        
        approval = ApprovalService.update_approval(db, approval_id, system_id, approval_data)
        if not approval:
            raise HTTPException(status_code=404, detail="Approval not found")
        
        # Sync with Identity Service
        await identity_service.sync_user_approval_status(
            approval.user_id,
            approval.status.value,
            approval.system_id
        )
        
        return {
            "message": "User approved successfully",
            "approval": approval
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving user: {str(e)}")

@router.post("/{approval_id}/reject")
async def reject_user(
    approval_id: int,
    system_id: str = Query(..., description="System identifier"),
    approver_id: int = Query(..., description="ID of the approver"),
    notes: str = Query(..., description="Rejection reason (required)"),
    db: Session = Depends(get_db)
):
    """Reject a user (shortcut endpoint)"""
    try:
        approval_data = UserApprovalUpdate(
            status=ApprovalStatus.REJECTED,
            approver_id=approver_id,
            notes=notes
        )
        
        approval = ApprovalService.update_approval(db, approval_id, system_id, approval_data)
        if not approval:
            raise HTTPException(status_code=404, detail="Approval not found")
        
        # Sync with Identity Service
        await identity_service.sync_user_approval_status(
            approval.user_id,
            approval.status.value,
            approval.system_id
        )
        
        return {
            "message": "User rejected successfully",
            "approval": approval
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting user: {str(e)}")

@router.get("/pending/{system_id}")
async def get_pending_approvals(
    system_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    """Get pending approvals for a system"""
    search_params = ApprovalSearchParams(
        system_id=system_id,
        status=ApprovalStatus.PENDING,
        page=page,
        size=size
    )
    return ApprovalService.search_approvals(db, search_params)

@router.get("/approved/{system_id}")
async def get_approved_users(
    system_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    """Get approved users for a system"""
    search_params = ApprovalSearchParams(
        system_id=system_id,
        status=ApprovalStatus.APPROVED,
        page=page,
        size=size
    )
    return ApprovalService.search_approvals(db, search_params)
