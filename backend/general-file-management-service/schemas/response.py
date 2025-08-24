from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from datetime import datetime

T = TypeVar('T')

class RestResponse(BaseModel, Generic[T]):
    """
    Chuẩn hóa Response Envelope cho tất cả services
    Tuân thủ quy tắc trong .cursorrules
    """
    apiVersion: str = "v1"
    statusCode: int
    shortMessage: str
    description: str
    data: Optional[T] = None
    timestamp: str
    requestId: str
    path: str
