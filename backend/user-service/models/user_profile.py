from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Index
from sqlalchemy.sql import func
from config.database import Base
from sqlalchemy.orm import relationship

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    avatar_url = Column(String(500), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    system_id = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship with approvals
    approvals = relationship("UserApproval", back_populates="user_profile")
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_user_profiles_system_id', 'system_id'),
        Index('idx_user_profiles_email_system', 'email', 'system_id'),
        Index('idx_user_profiles_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<UserProfile(user_id={self.user_id}, full_name='{self.full_name}', system_id='{self.system_id}')>"
