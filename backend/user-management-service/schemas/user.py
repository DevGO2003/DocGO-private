from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from models.user_approval import ApprovalStatus

class UserProfileBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    email: EmailStr = Field(..., description="Email address of the user")
    system_id: str = Field(..., min_length=1, max_length=100, description="System identifier")
    metadata_json: Optional[Dict[str, Any]] = Field(None, description="Additional metadata as JSON")

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    metadata_json: Optional[Dict[str, Any]] = None

class UserProfileResponse(UserProfileBase):
    user_id: int
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
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
