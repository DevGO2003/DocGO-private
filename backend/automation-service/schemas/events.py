from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class FileInformation(BaseModel):
    fileId: str = Field(...)
    filename: str = Field(...)
    fileType: str = Field(..., GENERAL)")
    fileKey: str = Field(...)
    bucket: str = Field(...)
    contentType: str = Field(...)
    fileSize: int = Field(...)")
    uploadedAt: datetime = Field(...)

class AIProcessingResult(BaseModel):
    extractionMethod: str = Field(...)
    confidence: float = Field(...)")
    processingTime: int = Field(...)")
    modelVersion: str = Field(...)
    processedAt: datetime = Field(...)

class ContractSummaryEvent(BaseModel):
    eventVersion: str = Field(...)
    eventType: str = Field(...)
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(...)
    correlationId: str = Field(...)
    actor: Dict[str, Any] = Field(...)
    data: Dict[str, Any] = Field(...)
    metadata: Dict[str, Any] = Field(...)

class SummaryCreatedEventData(BaseModel):
    fileInformation: FileInformation = Field(...)
    aiProcessingResult: AIProcessingResult = Field(...)
    contractSummary: Dict[str, Any] = Field(...)

class SummaryCreatedEvent(BaseModel):
    eventVersion: str = Field(default="v1")
    eventType: str = Field(default="SummaryCreated")
    eventId: str = Field(...)
    timestamp: datetime = Field(...)
    source: str = Field(default="automation-service")
    correlationId: str = Field(...)
    actor: Dict[str, Any] = Field(...)
    data: SummaryCreatedEventData = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)




