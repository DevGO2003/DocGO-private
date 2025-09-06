from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from models.user_approval import ApprovalStatus
from .role import RoleEnum, PermissionEnum

class UserProfileBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    email: EmailStr = Field(..., description="Email address of the user")
    system_id: str = Field(..., min_length=1, max_length=100, description="System identifier")
    department: Optional[str] = Field(None, max_length=255, description="Department of the user")
    position: Optional[str] = Field(None, max_length=255, description="Position of the user")
    role: Optional[RoleEnum] = Field(None, description="Role of the user")
    approval_level: Optional[int] = Field(None, ge=1, le=4, description="Approval level (1: employee, 2: manager, 3: director, 4: admin)")
    max_contract_value: Optional[int] = Field(None, ge=0, description="Maximum contract value can approve (VND)")
    metadata_json: Optional[Dict[str, Any]] = Field(None, description="Additional metadata as JSON")

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, max_length=255)
    position: Optional[str] = Field(None, max_length=255)
    role: Optional[RoleEnum] = None
    approval_level: Optional[int] = Field(None, ge=1, le=4)
    max_contract_value: Optional[int] = Field(None, ge=0)
    metadata_json: Optional[Dict[str, Any]] = None

class UserProfileResponse(UserProfileBase):
    user_id: int
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    permissions: Optional[List[PermissionEnum]] = Field(None, description="User permissions")
    
    class Config:
        from_attributes = True

class UserProfileList(BaseModel):
    users: list[UserProfileResponse]
    total: int
    page: int
    size: int

class UserProfileWithApproval(UserProfileResponse):
    approval_status: Optional[ApprovalStatus] = None
    approval_notes: Optional[str] = None
    approver_id: Optional[int] = None
    approved_at: Optional[datetime] = None

class UserSearchParams(BaseModel):
    system_id: str = Field(..., description="System identifier to filter by")
    full_name: Optional[str] = Field(None, description="Search by full name (partial match)")
    email: Optional[str] = Field(None, description="Search by email (partial match)")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(10, ge=1, le=100, description="Page size")
