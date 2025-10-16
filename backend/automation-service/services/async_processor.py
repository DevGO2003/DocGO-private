#!/usr/bin/env python3
"""
Background task for async document processing
"""
import asyncio
import logging
from typing import Dict, Any
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService
from services.file_service import FileStorageService
from services.websocket_manager import WebSocketManager
from services.event_service import EventService
from services.file_api_builder import build_file_api_payload
from datetime import datetime, timezone
import httpx

logger = logging.getLogger(__name__)

class AsyncDocumentProcessor:
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_service = AutomationService()
        self.file_service = FileStorageService()
        self.websocket_manager = WebSocketManager()
        self.event_service = EventService()
    
    async def process_document_async(self, document_data: Dict[str, Any]):
        """Process document asynchronously"""
        document_id = document_data.get("documentId")
        file_url = document_data.get("fileUrl")
        filename = document_data.get("filename")
        content_type = document_data.get("contentType")
        file_size = document_data.get("fileSize", 0)
        
        try:
            # Notify start
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "PROCESSING",
                "message": "Starting OCR processing...",
                "progress": 20
            })
            
            # 1) Download file for OCR
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.get(file_url)
                file_content = response.content
            
            # 2) Run OCR
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "PROCESSING", 
                "message": "Running OCR...",
                "progress": 40
            })
            
            ocr_text = self.ocr_service.extract_text_from_file(file_content, content_type)
            
            # 3) Run AI classification
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "PROCESSING",
                "message": "Running AI classification...", 
                "progress": 60
            })
            
            classification_result = self.ai_service.classify_document(ocr_text, filename)
            is_contract = bool(classification_result.get("isContract", False))
            
            # 4) Run contract processing if needed
            summary_result = None
            contract_metadata = None
            if is_contract:
                await self.websocket_manager.broadcast_progress(document_id, {
                    "status": "PROCESSING",
                    "message": "Processing contract details...",
                    "progress": 80
                })
                
                summary_result = self.ai_service.generate_contract_summary(ocr_text, filename)
                if summary_result:
                    contract_metadata = {
                        "effectiveDate": summary_result.get("effectiveDate"),
                        "expiryDate": summary_result.get("expiryDate"),
                        "totalValue": summary_result.get("totalValue"),
                        "currency": summary_result.get("currency", "VND")
                    }
            
            # 5) Build final payload
            overview_document_type = "CONTRACT" if is_contract else "GENERAL"
            now_iso = datetime.now(timezone.utc).isoformat()
            
            api_doc_payload = build_file_api_payload(
                file_id=document_id,
                file_url=file_url,
                filename=filename,
                content_type=content_type,
                size=file_size,
                ocr_text=ocr_text,
                classification_result=classification_result,
                overview_document_type=overview_document_type,
                contract_metadata=contract_metadata,
                summary_result=summary_result,
                now_iso=now_iso,
            )
            
            # 6) Update File Management Service
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "PROCESSING",
                "message": "Saving to database...",
                "progress": 90
            })
            
            try:
                file_mgmt_url = "http://localhost:8002"
                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.put(
                        f"{file_mgmt_url}/api/v1/file-management-service/v1/files/{document_id}",
                        json=api_doc_payload
                    )
                    if resp.status_code >= 400:
                        raise Exception(f"File Management update failed: {resp.text}")
            except Exception as e:
                logger.warning(f"File Management Service not available: {e}")
            
            # 7) Notify completion
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "COMPLETED",
                "message": "Document processing completed successfully!",
                "progress": 100,
                "result": {
                    "classificationResult": classification_result,
                    "summaryResult": summary_result,
                    "isContract": is_contract,
                    "contractMetadata": contract_metadata
                }
            })
            
            # 8) Publish completion event
            await self.event_service.publish_event({
                "eventType": "DocumentProcessed",
                "documentId": document_id,
                "status": "COMPLETED",
                "isContract": is_contract,
                "classificationResult": classification_result
            })
            
        except Exception as e:
            logger.error(f"Async processing failed for {document_id}: {e}")
            
            # Notify error
            await self.websocket_manager.broadcast_progress(document_id, {
                "status": "ERROR",
                "message": f"Processing failed: {str(e)}",
                "progress": 0,
                "error": str(e)
            })
            
            # Publish error event
            await self.event_service.publish_event({
                "eventType": "DocumentProcessingFailed",
                "documentId": document_id,
                "error": str(e)
            })

# Global processor instance
async_processor = AsyncDocumentProcessor()
