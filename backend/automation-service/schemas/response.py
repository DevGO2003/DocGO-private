from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any, Generic, TypeVar
from datetime import datetime
import uuid

T = TypeVar('T')

class RestResponse(BaseModel, Generic[T]):
    
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    apiVersion: str = Field("v1")
    statusCode: int = Field(...)
    shortMessage: str = Field(...)
    description: str = Field(...)
    data: Optional[T] = Field(None)
    timestamp: datetime = Field(default_factory=datetime.now)
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    path: str = Field(...)

class ErrorResponse(BaseModel):
    
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    apiVersion: str = Field("v1")
    statusCode: int = Field(...)
    shortMessage: str = Field(...)
    description: str = Field(...)
    error: str = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    path: str = Field(...)
