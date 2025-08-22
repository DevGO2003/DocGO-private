from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from models.user_approval import ApprovalStatus

class UserApprovalBase(BaseModel):
    user_id: int = Field(..., description="User ID to approve")
    system_id: str = Field(..., min_length=1, max_length=100, description="System identifier")
    notes: Optional[str] = Field(None, description="Approval notes")

class UserApprovalCreate(UserApprovalBase):
    pass

class UserApprovalUpdate(BaseModel):
    status: ApprovalStatus = Field(..., description="New approval status")
    approver_id: int = Field(..., description="ID of the approver")
    notes: Optional[str] = Field(None, description="Approval notes")

class UserApprovalResponse(UserApprovalBase):
    id: int
    status: ApprovalStatus
    approver_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserApprovalList(BaseModel):
    approvals: list[UserApprovalResponse]
    total: int
    page: int
    size: int

class ApprovalSearchParams(BaseModel):
    system_id: str = Field(..., description="System identifier to filter by")
    status: Optional[ApprovalStatus] = Field(None, description="Filter by approval status")
    user_id: Optional[int] = Field(None, description="Filter by user ID")
    approver_id: Optional[int] = Field(None, description="Filter by approver ID")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(10, ge=1, le=100, description="Page size")

class BulkApprovalRequest(BaseModel):
    user_ids: list[int] = Field(..., min_items=1, max_items=100, description="List of user IDs to approve")
    system_id: str = Field(..., description="System identifier")
    status: ApprovalStatus = Field(..., description="Approval status to set")
    approver_id: int = Field(..., description="ID of the approver")
    notes: Optional[str] = Field(None, description="Approval notes for all users")
