from pydantic import BaseModel
from typing import Optional, Any

class ContractResponse(BaseModel):
    apiVersion: str = "v1"
    statusCode: int
    shortMessage: str
    description: str
    data: Optional[Any] = None
