"""
Event Schemas V3 for DocGO Automation Service
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class FileUploadCompletedEvent(BaseModel):
    """File Upload Completed Event Schema"""
    eventVersion: str = Field(default="v1")
    eventType: str = Field(default="FILE_UPLOAD_COMPLETED")
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(default="automation-service")
    correlationId: str = Field(...)
    actor: Dict[str, Any] = Field(...)
    data: Dict[str, Any] = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class FileContentExtractedEvent(BaseModel):
    """File Content Extracted Event Schema"""
    eventVersion: str = Field(default="v1")
    eventType: str = Field(default="FILE_CONTENT_EXTRACTED")
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(default="automation-service")
    correlationId: str = Field(...)
    actor: Dict[str, Any] = Field(...)
    data: Dict[str, Any] = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ContractSummaryGeneratedEvent(BaseModel):
    """Contract Summary Generated Event Schema"""
    eventVersion: str = Field(default="v1")
    eventType: str = Field(default="CONTRACT_SUMMARY_GENERATED")
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(default="automation-service")
    correlationId: str = Field(...)
    actor: Dict[str, Any] = Field(...)
    data: Dict[str, Any] = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)
