from fastapi import APIRouter, HTTPException
from app.models.response.ocr import OCRResponse
from app.services.ocr.ocr_orchestrator import OCROrchestrator
import logging

router = APIRouter(prefix="/ocr", tags=["OCR"])

@router.post("/extract", response_model=OCRResponse)
async def extract_text(file: UploadFile):
    """
    Extract text from document using OCR
    
    🔹 Input
    📄 file
    Type: UploadFile
    Description: Document file for OCR processing
    
    🔹 Output
    📝 data
    Type: OCRResponse
    Description: Extracted text and metadata
    """
    try:
        orchestrator = OCROrchestrator()
        result = await orchestrator.extract_text(file)
        
        return OCRResponse(
            statusCode=200,
            shortMessage="Success",
            description="Text extracted successfully",
            data=result
        )
        
    except Exception as e:
        logging.error(f"Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail="Error extracting text")
