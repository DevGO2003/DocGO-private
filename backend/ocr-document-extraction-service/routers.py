from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from schemas.response import RestResponse


router = APIRouter(tags=["OCR Document Extraction Service"])


@router.get("/health", response_model=RestResponse[dict], summary="Health check", description="Kiểm tra tình trạng service")
async def health_api():
    try:
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Service is healthy",
            data={"status": "healthy"},
            timestamp=datetime.utcnow(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/ocr-document-extraction-service/health",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


