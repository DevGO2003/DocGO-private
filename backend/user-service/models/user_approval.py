from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base
import enum

class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class UserApproval(Base):
    __tablename__ = "user_approvals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    status = Column(Enum(ApprovalStatus), nullable=False, default=ApprovalStatus.PENDING)
    approver_id = Column(Integer, nullable=True, index=True)
    system_id = Column(String(100), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship with user profile
    user_profile = relationship("UserProfile", back_populates="approvals")
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_user_approvals_system_id', 'system_id'),
        Index('idx_user_approvals_status', 'status'),
        Index('idx_user_approvals_user_system', 'user_id', 'system_id'),
        Index('idx_user_approvals_approver', 'approver_id'),
        Index('idx_user_approvals_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<UserApproval(id={self.id}, user_id={self.user_id}, status='{self.status}', system_id='{self.system_id}')>"
