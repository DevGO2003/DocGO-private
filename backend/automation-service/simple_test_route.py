#!/usr/bin/env python3
"""
Simple test route without File Management Service dependency
"""
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from datetime import datetime, timezone
import uuid
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService

router = APIRouter(tags=["🧪 Test APIs"])

# Initialize services
ocr_service = OCRService()
ai_service = AutomationService()

@router.post("/api/v1/automation-service/test-simple", summary="Simple test without File Management")
async def test_simple(
    request: Request,
    file: UploadFile = File(...),
    metadata: str | None = Form(None),
):
    """
    Simple test without File Management Service dependency.
    """
    try:
        # Get file size
        size = int(request.headers.get("content-length") or 0)
        
        # Read file content
        file_content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        # Run OCR
        try:
            ocr_text = ocr_service.extract_text_from_file(file_content, file.content_type)
            ocr_success = True
        except Exception as e:
            ocr_text = f"OCR failed: {str(e)}"
            ocr_success = False
        
        # Run AI classification
        try:
            classification_result = ai_service.classify_document(ocr_text, file.filename)
            ai_success = True
        except Exception as e:
            classification_result = {
                "isContract": file.filename.lower().endswith(('.pdf', '.docx', '.txt')),
                "confidence": 0.5,
                "error": str(e)
            }
            ai_success = False
        
        is_contract = bool(classification_result.get("isContract", False))
        
        # Run contract processing if needed
        summary_result = None
        contract_metadata = None
        if is_contract:
            try:
                summary_result = ai_service.generate_contract_summary(ocr_text, file.filename)
                if summary_result:
                    contract_metadata = {
                        "effectiveDate": summary_result.get("effectiveDate"),
                        "expiryDate": summary_result.get("expiryDate"),
                        "totalValue": summary_result.get("totalValue"),
                        "currency": summary_result.get("currency", "VND")
                    }
            except Exception as e:
                summary_result = {"error": str(e)}
        
        # Return test results
        return {
            "apiVersion": "v1",
            "statusCode": 200,
            "shortMessage": "Success",
            "description": "Simple test completed successfully",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "requestId": request.headers.get("X-Correlation-Id") or str(uuid.uuid4()),
            "path": str(request.url),
            "data": {
                "fileInfo": {
                    "filename": file.filename,
                    "contentType": file.content_type,
                    "size": size
                },
                "ocrResult": {
                    "success": ocr_success,
                    "text": ocr_text[:100] + "..." if len(ocr_text) > 100 else ocr_text,
                    "textLength": len(ocr_text)
                },
                "aiResult": {
                    "success": ai_success,
                    "classification": classification_result,
                    "isContract": is_contract
                },
                "contractResult": {
                    "summary": summary_result,
                    "metadata": contract_metadata
                }
            }
        }
        
    except Exception as e:
        return {
            "apiVersion": "v1",
            "statusCode": 500,
            "shortMessage": "Internal Server Error",
            "description": f"Simple test failed: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "requestId": request.headers.get("X-Correlation-Id") or str(uuid.uuid4()),
            "path": str(request.url),
        }
