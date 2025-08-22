from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from models.user_approval import UserApproval, ApprovalStatus
from models.user_profile import UserProfile
from schemas.approval import UserApprovalCreate, UserApprovalUpdate, ApprovalSearchParams, UserApprovalList, BulkApprovalRequest
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ApprovalService:
    
    @staticmethod
    def create_approval(db: Session, approval_data: UserApprovalCreate) -> UserApproval:
        """Create a new approval record"""
        try:
            # Check if user exists
            user = db.query(UserProfile).filter(
                and_(
                    UserProfile.user_id == approval_data.user_id,
                    UserProfile.system_id == approval_data.system_id
                )
            ).first()
            
            if not user:
                raise ValueError(f"User {approval_data.user_id} not found in system {approval_data.system_id}")
            
            # Check if approval already exists
            existing_approval = db.query(UserApproval).filter(
                and_(
                    UserApproval.user_id == approval_data.user_id,
                    UserApproval.system_id == approval_data.system_id
                )
            ).first()
            
            if existing_approval:
                raise ValueError(f"Approval already exists for user {approval_data.user_id} in system {approval_data.system_id}")
            
            # Create new approval
            db_approval = UserApproval(**approval_data.dict())
            db.add(db_approval)
            db.commit()
            db.refresh(db_approval)
            
            logger.info(f"Created approval for user: {approval_data.user_id}")
            return db_approval
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating approval: {e}")
            raise
    
    @staticmethod
    def get_approval(db: Session, approval_id: int, system_id: str) -> Optional[UserApproval]:
        """Get approval by ID and system_id"""
        return db.query(UserApproval).filter(
            and_(
                UserApproval.id == approval_id,
                UserApproval.system_id == system_id
            )
        ).first()
    
    @staticmethod
    def get_approval_by_user(db: Session, user_id: int, system_id: str) -> Optional[UserApproval]:
        """Get approval by user ID and system_id"""
        return db.query(UserApproval).filter(
            and_(
                UserApproval.user_id == user_id,
                UserApproval.system_id == system_id
            )
        ).first()
    
    @staticmethod
    def update_approval(
        db: Session, 
        approval_id: int, 
        system_id: str, 
        approval_data: UserApprovalUpdate
    ) -> Optional[UserApproval]:
        """Update approval status"""
        try:
            db_approval = ApprovalService.get_approval(db, approval_id, system_id)
            if not db_approval:
                return None
            
            # Update approval fields
            db_approval.status = approval_data.status
            db_approval.approver_id = approval_data.approver_id
            db_approval.notes = approval_data.notes
            db_approval.updated_at = datetime.utcnow()
            
            # Set approved_at if status is approved
            if approval_data.status == ApprovalStatus.APPROVED:
                db_approval.approved_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_approval)
            
            logger.info(f"Updated approval {approval_id} to status: {approval_data.status}")
            return db_approval
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating approval: {e}")
            raise
    
    @staticmethod
    def delete_approval(db: Session, approval_id: int, system_id: str) -> bool:
        """Delete approval record"""
        try:
            db_approval = ApprovalService.get_approval(db, approval_id, system_id)
            if not db_approval:
                return False
            
            db.delete(db_approval)
            db.commit()
            
            logger.info(f"Deleted approval: {approval_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting approval: {e}")
            raise
    
    @staticmethod
    def search_approvals(db: Session, search_params: ApprovalSearchParams) -> UserApprovalList:
        """Search approvals with pagination and filtering"""
        query = db.query(UserApproval).filter(
            UserApproval.system_id == search_params.system_id
        )
        
        # Apply search filters
        if search_params.status:
            query = query.filter(UserApproval.status == search_params.status)
        
        if search_params.user_id:
            query = query.filter(UserApproval.user_id == search_params.user_id)
        
        if search_params.approver_id:
            query = query.filter(UserApproval.approver_id == search_params.approver_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        approvals = query.offset((search_params.page - 1) * search_params.size).limit(search_params.size).all()
        
        return UserApprovalList(
            approvals=approvals,
            total=total,
            page=search_params.page,
            size=search_params.size
        )
    
    @staticmethod
    def bulk_update_approvals(
        db: Session, 
        bulk_request: BulkApprovalRequest
    ) -> List[UserApproval]:
        """Bulk update approval status for multiple users"""
        try:
            updated_approvals = []
            
            for user_id in bulk_request.user_ids:
                # Get or create approval record
                approval = db.query(UserApproval).filter(
                    and_(
                        UserApproval.user_id == user_id,
                        UserApproval.system_id == bulk_request.system_id
                    )
                ).first()
                
                if not approval:
                    # Create new approval if doesn't exist
                    approval = UserApproval(
                        user_id=user_id,
                        system_id=bulk_request.system_id,
                        status=bulk_request.status,
                        approver_id=bulk_request.approver_id,
                        notes=bulk_request.notes
                    )
                    db.add(approval)
                else:
                    # Update existing approval
                    approval.status = bulk_request.status
                    approval.approver_id = bulk_request.approver_id
                    approval.notes = bulk_request.notes
                    approval.updated_at = datetime.utcnow()
                
                if bulk_request.status == ApprovalStatus.APPROVED:
                    approval.approved_at = datetime.utcnow()
                
                updated_approvals.append(approval)
            
            db.commit()
            
            # Refresh all approvals
            for approval in updated_approvals:
                db.refresh(approval)
            
            logger.info(f"Bulk updated {len(updated_approvals)} approvals to status: {bulk_request.status}")
            return updated_approvals
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error bulk updating approvals: {e}")
            raise
    
    @staticmethod
    def get_approval_statistics(db: Session, system_id: str) -> dict:
        """Get approval statistics for a system"""
        try:
            stats = db.query(
                UserApproval.status,
                func.count(UserApproval.id).label('count')
            ).filter(
                UserApproval.system_id == system_id
            ).group_by(UserApproval.status).all()
            
            result = {
                'total': 0,
                'pending': 0,
                'approved': 0,
                'rejected': 0
            }
            
            for status, count in stats:
                result[status.value] = count
                result['total'] += count
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting approval statistics: {e}")
            raise
