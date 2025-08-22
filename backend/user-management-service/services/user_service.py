from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Tuple
from models.user_profile import UserProfile
from models.user_approval import UserApproval, ApprovalStatus
from schemas.user import UserProfileCreate, UserProfileUpdate, UserSearchParams, UserProfileList
from schemas.approval import UserApprovalCreate, UserApprovalUpdate
from config.s3 import s3_service
import os
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class UserService:
    
    @staticmethod
    def create_user_profile(db: Session, user_data: UserProfileCreate) -> UserProfile:
        """Create a new user profile"""
        try:
            # Check if user already exists with same email and system_id
            existing_user = db.query(UserProfile).filter(
                and_(
                    UserProfile.email == user_data.email,
                    UserProfile.system_id == user_data.system_id
                )
            ).first()
            
            if existing_user:
                raise ValueError(f"User with email {user_data.email} already exists in system {user_data.system_id}")
            
            # Create new user profile
            db_user = UserProfile(**user_data.dict())
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"Created user profile: {db_user.user_id}")
            return db_user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user profile: {e}")
            raise
    
    @staticmethod
    def get_user_profile(db: Session, user_id: int, system_id: str) -> Optional[UserProfile]:
        """Get user profile by ID and system_id"""
        return db.query(UserProfile).filter(
            and_(
                UserProfile.user_id == user_id,
                UserProfile.system_id == system_id
            )
        ).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str, system_id: str) -> Optional[UserProfile]:
        """Get user profile by email and system_id"""
        return db.query(UserProfile).filter(
            and_(
                UserProfile.email == email,
                UserProfile.system_id == system_id
            )
        ).first()
    
    @staticmethod
    def update_user_profile(
        db: Session, 
        user_id: int, 
        system_id: str, 
        user_data: UserProfileUpdate
    ) -> Optional[UserProfile]:
        """Update user profile"""
        try:
            db_user = UserService.get_user_profile(db, user_id, system_id)
            if not db_user:
                return None
            
            # Update only provided fields
            update_data = user_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_user, field, value)
            
            db_user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"Updated user profile: {user_id}")
            return db_user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user profile: {e}")
            raise
    
    @staticmethod
    def delete_user_profile(db: Session, user_id: int, system_id: str) -> bool:
        """Delete user profile"""
        try:
            db_user = UserService.get_user_profile(db, user_id, system_id)
            if not db_user:
                return False
            
            # Delete avatar from S3 if exists
            if db_user.avatar_url:
                UserService.delete_user_avatar(db_user.avatar_url)
            
            # Delete related approvals
            db.query(UserApproval).filter(
                and_(
                    UserApproval.user_id == user_id,
                    UserApproval.system_id == system_id
                )
            ).delete()
            
            # Delete user profile
            db.delete(db_user)
            db.commit()
            
            logger.info(f"Deleted user profile: {user_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting user profile: {e}")
            raise
    
    @staticmethod
    def search_users(db: Session, search_params: UserSearchParams) -> UserProfileList:
        """Search users with pagination and filtering"""
        query = db.query(UserProfile).filter(
            UserProfile.system_id == search_params.system_id
        )
        
        # Apply search filters
        if search_params.full_name:
            query = query.filter(
                UserProfile.full_name.ilike(f"%{search_params.full_name}%")
            )
        
        if search_params.email:
            query = query.filter(
                UserProfile.email.ilike(f"%{search_params.email}%")
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        users = query.offset((search_params.page - 1) * search_params.size).limit(search_params.size).all()
        
        return UserProfileList(
            users=users,
            total=total,
            page=search_params.page,
            size=search_params.size
        )
    
    @staticmethod
    def upload_avatar(db: Session, user_id: int, system_id: str, file_path: str, file_extension: str) -> Optional[str]:
        """Upload user avatar to S3 and update profile"""
        try:
            db_user = UserService.get_user_profile(db, user_id, system_id)
            if not db_user:
                return None
            
            # Generate unique filename
            filename = f"avatars/{system_id}/{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Upload to S3
            if s3_service.upload_file(file_path, filename):
                avatar_url = s3_service.get_file_url(filename)
                
                # Update user profile
                db_user.avatar_url = avatar_url
                db_user.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(db_user)
                
                logger.info(f"Uploaded avatar for user: {user_id}")
                return avatar_url
            
            return None
            
        except Exception as e:
            logger.error(f"Error uploading avatar: {e}")
            raise
    
    @staticmethod
    def delete_user_avatar(avatar_url: str) -> bool:
        """Delete user avatar from S3"""
        try:
            # Extract filename from URL
            filename = avatar_url.split('/')[-1]
            return s3_service.delete_file(filename)
        except Exception as e:
            logger.error(f"Error deleting avatar: {e}")
            return False
    
    @staticmethod
    def get_users_with_approval_status(db: Session, system_id: str) -> List[Tuple[UserProfile, Optional[UserApproval]]]:
        """Get users with their approval status"""
        return db.query(UserProfile, UserApproval).outerjoin(
            UserApproval,
            and_(
                UserProfile.user_id == UserApproval.user_id,
                UserProfile.system_id == UserApproval.system_id
            )
        ).filter(UserProfile.system_id == system_id).all()
