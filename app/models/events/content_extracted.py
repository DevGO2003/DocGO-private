from pydantic import BaseModel
from typing import Optional, Any

class ContentExtractedEvent(BaseModel):
    fileId: str
    text: str
    fileName: Optional[str] = None
    fileSize: Optional[int] = None
    contentType: Optional[str] = None
    timestamp: str
