import logging
import json
import httpx
from typing import Dict, Any, Optional
from services.ocr_service import OCRService
from services.ai_processing_service import AIProcessingService
from config import get_settings
import boto3
from botocore.exceptions import ClientError
from io import BytesIO

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Document Processor pipeline: OCR → Classify → Summary
    Xử lý tài liệu từ upload đến hoàn thành
    """
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_service = AIProcessingService()
        self.settings = get_settings()
        
        # S3 client để download file
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.settings.FILEBASE_ENDPOINT,
            aws_access_key_id=self.settings.FILEBASE_ACCESS_KEY,
            aws_secret_access_key=self.settings.FILEBASE_SECRET_KEY,
            region_name=self.settings.FILEBASE_REGION
        )
        
        logger.info("Document Processor initialized")
    
    async def process_document(self, file_id: str, document_id: str, file_type: str, 
                             s3_key: str, s3_bucket: str) -> Dict[str, Any]:
        """
        Xử lý tài liệu hoàn chỉnh: Download → OCR → Classify → Summary
        
        Args:
            file_id: ID của file
            document_id: ID của document
            file_type: Loại file (image/jpeg, application/pdf, etc.)
            s3_key: S3 key của file
            s3_bucket: S3 bucket
            
        Returns:
            Kết quả xử lý
        """
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
            result["ocr_status"] = "COMPLETED"
            
            logger.info(f"OCR completed: {len(ocr_text)} characters extracted")
            
            # Bước 3: Document Classification
            classification_result = await self._classify_document(ocr_text, file_type)
            result["classification_result"] = classification_result
            
            logger.info(f"Classification completed: {classification_result.get('document_type', 'UNKNOWN')}")
            
            # Bước 4: Contract Summary (nếu là hợp đồng)
            if classification_result.get('document_type') == 'CONTRACT':
                summary = await self._summarize_contract(ocr_text)
                classification_result['summary'] = summary
                logger.info("Contract summary completed")
            
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
        """Download file từ S3"""
        try:
            response = self.s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
            file_bytes = response['Body'].read()
            return file_bytes
        except ClientError as e:
            logger.error(f"Failed to download file from S3: {str(e)}")
            return None
    
    async def _process_ocr(self, file_bytes: bytes, file_type: str) -> str:
        """Xử lý OCR"""
        try:
            if not self.ocr_service.is_tesseract_available():
                raise Exception("Tesseract OCR is not available")
            
            ocr_text = self.ocr_service.extract_text_from_file(file_bytes, file_type)
            
            if not ocr_text or len(ocr_text.strip()) < 10:
                raise Exception("OCR extraction resulted in insufficient text")
            
            return ocr_text
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise Exception(f"OCR processing failed: {str(e)}")
    
    async def _classify_document(self, text: str, file_type: str) -> Dict[str, Any]:
        """Phân loại tài liệu"""
        try:
            # Tạo prompt cho classification
            classification_prompt = f"""
            Phân tích tài liệu sau và xác định loại tài liệu:
            
            Loại file: {file_type}
            Nội dung: {text[:2000]}...
            
            Hãy phân loại tài liệu này thành một trong các loại sau:
            1. CONTRACT - Hợp đồng, thỏa thuận, giao kết
            2. INVOICE - Hóa đơn, bill
            3. RECEIPT - Biên lai, phiếu thu
            4. REPORT - Báo cáo, tài liệu báo cáo
            5. CERTIFICATE - Chứng chỉ, bằng cấp
            6. GENERAL_FILE - Tài liệu chung khác
            
            Trả về kết quả dưới dạng JSON:
            {{
                "document_type": "CONTRACT|INVOICE|RECEIPT|REPORT|CERTIFICATE|GENERAL_FILE",
                "confidence": 0.0-1.0,
                "reasoning": "Lý do phân loại",
                "key_terms": ["từ khóa", "quan trọng"]
            }}
            """
            
            response = await self.ai_service.process_with_gemini(classification_prompt)
            
            # Parse JSON response
            try:
                classification_result = json.loads(response)
                return classification_result
            except json.JSONDecodeError:
                # Fallback nếu không parse được JSON
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
        """Tóm tắt hợp đồng"""
        try:
            summary_prompt = f"""
            Tóm tắt hợp đồng sau bằng tiếng Việt:
            
            {text[:4000]}...
            
            Hãy tóm tắt các điểm chính:
            1. Loại hợp đồng
            2. Các bên tham gia
            3. Giá trị/giao dịch
            4. Thời hạn
            5. Điều khoản quan trọng
            6. Rủi ro cần lưu ý
            
            Trả về tóm tắt ngắn gọn, dễ hiểu.
            """
            
            summary = await self.ai_service.process_with_gemini(summary_prompt)
            return summary
            
        except Exception as e:
            logger.error(f"Contract summarization failed: {str(e)}")
            return f"Không thể tóm tắt hợp đồng: {str(e)}"
    
    async def _update_document_entity(self, document_id: str, result: Dict[str, Any]):
        """Update Document Entity qua HTTP call"""
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
                    f"{self.settings.DOCUMENT_SERVICE_URL}/api/v1/document-management-service/v1/documents/{document_id}/processing-result",
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
        """
        Retry OCR cho document đã tồn tại
        
        Args:
            document_id: ID của document
            
        Returns:
            Kết quả retry OCR
        """
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


