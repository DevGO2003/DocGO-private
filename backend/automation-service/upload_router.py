"""
Upload Router - File Upload Endpoints

Endpoints:
- POST /api/v1/automation-service/files/upload - Upload file
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import uuid
from services.upload_handler import UploadHandler
from services.content_processor import ContentProcessor
from services.contract_analyzer import ContractAnalyzer
from services.kafka_publisher_v3 import KafkaPublisherV3
from schemas.event_schemas_v3 import FileUploadCompletedEvent

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/automation-service/files",
    tags=["File Upload"]
)

# Initialize services (should be injected from main.py)
kafka_publisher = KafkaPublisherV3()
upload_handler = UploadHandler(kafka_publisher)
content_processor = ContentProcessor(kafka_publisher)
contract_analyzer = ContractAnalyzer(kafka_publisher)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    owner_user_id: str = Form(...),
    correlation_id: Optional[str] = Form(None)
):
    """
    Upload file and trigger Event Architecture v3
    
    Flow:
    1. Generate UUID v7 for documentId
    2. Upload to S3
    3. Publish Event 1: FILE_UPLOAD_COMPLETED
    4. Extract content (async)
    5. Publish Event 2: FILE_CONTENT_EXTRACTED
    6. Analyze contract if applicable (async)
    7. Publish Event 3: CONTRACT_SUMMARY_GENERATED (conditional)
    """
    try:
        # Generate correlation ID if not provided
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
        
        actor = f"user:{owner_user_id}"
        
        logger.info(f"📤 File upload started: {file.filename}, correlationId={correlation_id}")
        
        # Read file content
        file_content = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        
        # Step 1: Handle upload (Event 1)
        upload_result = upload_handler.handle_upload(
            file_data=file_content,
            file_name=file.filename,
            mime_type=mime_type,
            owner_user_id=owner_user_id,
            correlation_id=correlation_id,
            actor=actor
        )
        
        if not upload_result["success"]:
            raise HTTPException(status_code=500, detail=upload_result.get("error"))
        
        document_id = upload_result["documentId"]
        logger.info(f"✅ Event 1 published: documentId={document_id}")
        
        # Step 2: Process content (Event 2) - async
        content_result = content_processor.process_content(
            document_id=document_id,
            file_data=file_content,
            mime_type=mime_type,
            correlation_id=correlation_id,
            actor="system"
        )
        
        if not content_result["success"]:
            logger.error(f"❌ Content processing failed: {content_result.get('error')}")
        else:
            logger.info(f"✅ Event 2 published: documentId={document_id}")
            
            # Step 3: Analyze contract if applicable (Event 3) - async
            is_contract = content_result.get("isContract", False)
            if is_contract:
                contract_result = contract_analyzer.analyze_contract(
                    document_id=document_id,
                    text="extracted_text_placeholder",  # Would use actual extracted text
                    is_contract=is_contract,
                    correlation_id=correlation_id,
                    actor="system"
                )
                
                if contract_result["success"] and contract_result.get("eventPublished"):
                    logger.info(f"✅ Event 3 published: documentId={document_id}")
                else:
                    logger.info(f"ℹ️ Event 3 not published (not a contract)")
        
        return {
            "success": True,
            "documentId": document_id,
            "correlationId": correlation_id,
            "message": "File uploaded successfully and events published"
        }
        
    except Exception as e:
        logger.error(f"❌ Upload error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{document_id}")
async def get_upload_status(document_id: str):
    """Get upload status for a document"""
    # TODO: Query Repository Service for document status
    return {
        "documentId": document_id,
        "status": "PROCESSING"
    }
