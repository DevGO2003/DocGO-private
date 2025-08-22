from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional
import os
import tempfile
import uuid
from datetime import datetime

from config.database import get_db
from services.user_service import UserService
from services.identity_service import identity_service
from schemas.user import (
    UserProfileCreate, 
    UserProfileUpdate, 
    UserProfileResponse, 
    UserProfileList,
    UserSearchParams,
    UserProfileWithApproval
)
from models.user_approval import ApprovalStatus

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserProfileResponse, status_code=201)
async def create_user(
    user_data: UserProfileCreate,
    db: Session = Depends(get_db)
):
    """Create a new user profile"""
    try:
        user = UserService.create_user_profile(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user(
    user_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Get user profile by ID"""
    user = UserService.get_user_profile(db, user_id, system_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/email/{email}", response_model=UserProfileResponse)
async def get_user_by_email(
    email: str,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Get user profile by email"""
    user = UserService.get_user_by_email(db, email, system_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user(
    user_id: int,
    user_data: UserProfileUpdate,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user = UserService.update_user_profile(db, user_id, system_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Delete user profile"""
    success = UserService.delete_user_profile(db, user_id, system_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/", response_model=UserProfileList)
async def search_users(
    system_id: str = Query(..., description="System identifier"),
    full_name: Optional[str] = Query(None, description="Search by full name"),
    email: Optional[str] = Query(None, description="Search by email"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    """Search users with pagination and filtering"""
    search_params = UserSearchParams(
        system_id=system_id,
        full_name=full_name,
        email=email,
        page=page,
        size=size
    )
    return UserService.search_users(db, search_params)

@router.post("/{user_id}/avatar", response_model=UserProfileResponse)
async def upload_avatar(
    user_id: int,
    system_id: str = Form(..., description="System identifier"),
    file: UploadFile = File(..., description="Avatar image file"),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    # Validate file type
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
    file_extension = file.filename.split('.')[-1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (5MB max)
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400, 
            detail="File size too large. Maximum size is 5MB"
        )
    
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Upload to S3 and update profile
        avatar_url = UserService.upload_avatar(
            db, user_id, system_id, temp_file_path, file_extension
        )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if not avatar_url:
            raise HTTPException(status_code=500, detail="Failed to upload avatar")
        
        # Get updated user profile
        user = UserService.get_user_profile(db, user_id, system_id)
        return user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading avatar: {str(e)}")

@router.delete("/{user_id}/avatar", status_code=204)
async def delete_avatar(
    user_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Delete user avatar"""
    user = UserService.get_user_profile(db, user_id, system_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.avatar_url:
        raise HTTPException(status_code=404, detail="User has no avatar")
    
    # Delete from S3
    success = UserService.delete_user_avatar(user.avatar_url)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete avatar")
    
    # Update profile
    user.avatar_url = None
    user.updated_at = datetime.utcnow()
    db.commit()

@router.get("/{user_id}/with-approval", response_model=UserProfileWithApproval)
async def get_user_with_approval(
    user_id: int,
    system_id: str = Query(..., description="System identifier"),
    db: Session = Depends(get_db)
):
    """Get user profile with approval status"""
    user = UserService.get_user_profile(db, user_id, system_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get approval status
    from services.approval_service import ApprovalService
    approval = ApprovalService.get_approval_by_user(db, user_id, system_id)
    
    # Create response with approval info
    response_data = UserProfileWithApproval(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        metadata_json=user.metadata_json,
        system_id=user.system_id,
        created_at=user.created_at,
        updated_at=user.updated_at,
        approval_status=approval.status if approval else None,
        approval_notes=approval.notes if approval else None,
        approver_id=approval.approver_id if approval else None,
        approved_at=approval.approved_at if approval else None
    )
    
    return response_data

@router.get("/{user_id}/roles")
async def get_user_roles(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user roles from Identity Service"""
    try:
        roles = await identity_service.get_user_roles(user_id)
        return {"user_id": user_id, "roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user roles: {str(e)}")

@router.get("/system/{system_id}/with-approvals")
async def get_users_with_approvals(
    system_id: str,
    db: Session = Depends(get_db)
):
    """Get all users with their approval status for a system"""
    users_with_approvals = UserService.get_users_with_approval_status(db, system_id)
    
    result = []
    for user, approval in users_with_approvals:
        user_data = {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "system_id": user.system_id,
            "created_at": user.created_at,
            "approval_status": approval.status if approval else None,
            "approval_notes": approval.notes if approval else None,
            "approver_id": approval.approver_id if approval else None
        }
        result.append(user_data)
    
    return {"users": result, "total": len(result)}
