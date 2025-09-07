from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Generic, TypeVar
from datetime import datetime
import uuid

T = TypeVar('T')


class RestResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})

    apiVersion: str = Field("v1")
    statusCode: int
    shortMessage: str
    description: str
    data: Optional[T] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    path: str


