from pydantic import BaseModel, Field
from typing import Optional, TypeVar, Generic, List, Dict, Any
from datetime import datetime
import uuid

T = TypeVar("T")

class RestResponse(BaseModel, Generic[T]):
    """
    Chuẩn hóa response format cho tất cả API trong DocGO
    Đồng bộ với Java RestResponse
    """
    apiVersion: str = Field("v1", description="API version")
    statusCode: int = Field(..., description="HTTP status code (e.g., 200, 201, 204)")
    shortMessage: str = Field(..., description="Short message about the result (e.g., Success, Not Found)")
    description: Optional[str] = Field(None, description="Detailed description of the result")
    data: Optional[T] = Field(None, description="The actual response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of the response in UTC")
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique request ID for tracing")
    path: str = Field(..., description="The API path that was called")

    class Config:
        arbitrary_types_allowed = True
