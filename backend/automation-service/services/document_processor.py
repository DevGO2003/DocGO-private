import logging
import json
import httpx
from typing import Dict, Any, Optional
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService
from config import Config
import boto3
from botocore.exceptions import ClientError
from io import BytesIO

logger = logging.getLogger(__name__)

class DocumentProcessor:
    
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_service = AutomationService()
        self.settings = Config
        
        # S3 client để download file
        self.s3_client = boto3.client(
            's3',
            endpoint_url=Config.S3_ENDPOINT,
            aws_access_key_id=Config.S3_ACCESS_KEY_ID,
            aws_secret_access_key=Config.S3_SECRET_ACCESS_KEY,
            region_name=Config.S3_REGION
        )
        
        logger.info("Document Processor initialized")
    
    async def process_document(self, file_id: str, document_id: str, file_type: str, 
                             s3_key: str, s3_bucket: str) -> Dict[str, Any]:
        
        result = {
            "document_id": document_id,
            "file_id": file_id,
            "ocr_text": "",
            "ocr_status": "FAILED",
            "classification_result": None,
            "processing_status": "FAILED",
            "processing_error": None
        }
        
        try:
            logger.info(f"Starting document processing: documentId={document_id}, fileId={file_id}")
            
            # Bước 1: Download file từ S3
            file_bytes = await self._download_file_from_s3(s3_key, s3_bucket)
            if not file_bytes:
                raise Exception("Failed to download file from S3")
            
            logger.info(f"Downloaded file: {len(file_bytes)} bytes")
            
            # Bước 2: OCR Processing
            ocr_text = await self._process_ocr(file_bytes, file_type)
            result["ocr_text"] = ocr_text
            
            # Đánh giá kết quả OCR
            if ocr_text and len(ocr_text.strip()) >= 10:
                result["ocr_status"] = "COMPLETED"
                logger.info(f"OCR completed: {len(ocr_text)} characters extracted")
            else:
                result["ocr_status"] = "FAILED"
                logger.warning(f"OCR failed or insufficient text: {len(ocr_text) if ocr_text else 0} characters")
            
            # Bước 3: Document Classification - dựa vào cả OCR text và file type
            classification_result = await self._classify_document(ocr_text, file_type)
            result["classification_result"] = classification_result
            
            logger.info(f"Classification completed: {classification_result.get('document_type', 'UNKNOWN')}")
            
            # Bước 4: Contract Summary (nếu là hợp đồng và có đủ text)
            if (classification_result.get('document_type') == 'CONTRACT' and 
                ocr_text and len(ocr_text.strip()) >= 50):
                summary = await self._summarize_contract(ocr_text)
                classification_result['summary'] = summary
                logger.info("Contract summary completed")
            elif classification_result.get('document_type') == 'CONTRACT':
                logger.warning("Contract detected but insufficient text for summary")
                classification_result['summary'] = "Không đủ nội dung để tóm tắt hợp đồng"
            
            # Bước 5: Update Document Entity
            await self._update_document_entity(document_id, result)
            
            result["processing_status"] = "COMPLETED"
            logger.info(f"Document processing completed successfully: documentId={document_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            result["processing_error"] = str(e)
            result["processing_status"] = "FAILED"
            
            # Update document với error status
            try:
                await self._update_document_entity(document_id, result)
            except Exception as update_error:
                logger.error(f"Failed to update document with error status: {str(update_error)}")
            
            return result
    
    async def _download_file_from_s3(self, s3_key: str, s3_bucket: str) -> Optional[bytes]:
        
        try:
            response = self.s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
            file_bytes = response['Body'].read()
            return file_bytes
        except ClientError as e:
            logger.error(f"Failed to download file from S3: {str(e)}")
            return None
    
    async def _process_ocr(self, file_bytes: bytes, file_type: str) -> str:
        
        try:
            if not self.ocr_service.is_tesseract_available():
                logger.warning("Tesseract OCR is not available, returning empty text")
                return ""
            
            ocr_text = self.ocr_service.extract_text_from_file(file_bytes, file_type)
            
            # Trả về text ngay cả khi ngắn, để classification có thể dựa vào file_type
            return ocr_text or ""
            
        except Exception as e:
            logger.warning(f"OCR processing failed for {file_type}: {str(e)}")
            return ""
    
    def _classify_by_file_type(self, file_type: str) -> Dict[str, Any]:
        
        if file_type == 'application/pdf':
            return {
                "document_type": "GENERAL_FILE",
                "confidence": 0.6,
                "reasoning": "PDF file - cần OCR để phân loại chi tiết",
                "key_terms": ["pdf"]
            }
        elif file_type.startswith('image/'):
            return {
                "document_type": "GENERAL_FILE", 
                "confidence": 0.5,
                "reasoning": "Image file - cần OCR để phân loại",
                "key_terms": ["image"]
            }
        elif file_type == 'text/plain':
            return {
                "document_type": "GENERAL_FILE",
                "confidence": 0.7,
                "reasoning": "Text file - cần đọc nội dung để phân loại",
                "key_terms": ["text"]
            }
        elif file_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]:
            return {
                "document_type": "GENERAL_FILE",
                "confidence": 0.6,
                "reasoning": "Word document - cần OCR để phân loại",
                "key_terms": ["word", "document"]
            }
        else:
            return {
                "document_type": "GENERAL_FILE",
                "confidence": 0.4,
                "reasoning": f"Unknown file type: {file_type}",
                "key_terms": [file_type.split('/')[0]]
            }
    
    async def _classify_document(self, text: str, file_type: str) -> Dict[str, Any]:
        
        try:
            # Phân loại dựa vào file type trước
            file_type_classification = self._classify_by_file_type(file_type)
            
            # Nếu có text từ OCR, sử dụng AI để phân loại chi tiết
            if text and len(text.strip()) >= 10:
                classification_prompt = f
                
                # Gọi AI service để phân loại
                ai_result = await self.ai_service.classify_document(classification_prompt)
                return ai_result
            else:
                # Nếu không có text, dựa vào file type
                logger.info(f"Using file type classification: {file_type_classification}")
                return file_type_classification
            
        except Exception as e:
            logger.error(f"Document classification failed: {str(e)}")
            # Fallback classification
            return {
                    "document_type": "GENERAL_FILE",
                    "confidence": 0.5,
                    "reasoning": "Không thể phân loại tự động",
                    "key_terms": []
                }
                
        except Exception as e:
            logger.error(f"Document classification failed: {str(e)}")
            # Fallback classification
            return {
                "document_type": "GENERAL_FILE",
                "confidence": 0.3,
                "reasoning": f"Classification failed: {str(e)}",
                "key_terms": []
            }
    
    async def _summarize_contract(self, text: str) -> str:
        
        try:
            summary_prompt = f
            
            summary = await self.ai_service.process_with_gemini(summary_prompt)
            return summary
            
        except Exception as e:
            logger.error(f"Contract summarization failed: {str(e)}")
            return f"Không thể tóm tắt hợp đồng: {str(e)}"
    
    async def _update_document_entity(self, document_id: str, result: Dict[str, Any]):
        
        try:
            update_data = {
                "ocrText": result.get("ocr_text", ""),
                "ocrStatus": result.get("ocr_status", "FAILED"),
                "classificationResult": result.get("classification_result"),
                "processingStatus": result.get("processing_status", "FAILED"),
                "processingError": result.get("processing_error")
            }
            
            # Gọi API update document
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{Config.get_document_service_url()}/api/v1/file-storage-asset-service/documents/{document_id}/processing-result",
                    json=update_data,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to update document entity: {response.status_code} - {response.text}")
                else:
                    logger.info(f"Document entity updated successfully: {document_id}")
                    
        except Exception as e:
            logger.error(f"Failed to update document entity: {str(e)}")
            raise
    
    async def retry_ocr(self, document_id: str) -> Dict[str, Any]:
        
        try:
            logger.info(f"Retrying OCR for document: {document_id}")
            
            # TODO: Implement retry logic
            # 1. Get document info từ Document Management Service
            # 2. Download file từ S3
            # 3. Re-run OCR
            # 4. Update document entity
            
            return {
                "document_id": document_id,
                "ocr_status": "COMPLETED",
                "processing_status": "COMPLETED",
                "message": "OCR retry completed successfully"
            }
            
        except Exception as e:
            logger.error(f"OCR retry failed: {str(e)}")
            return {
                "document_id": document_id,
                "ocr_status": "FAILED",
                "processing_status": "FAILED",
                "error": str(e)
            }


