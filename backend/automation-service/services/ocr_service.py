"""
OCR Service for Automation Service
Hỗ trợ OCR từ hình ảnh, tóm tắt hợp đồng và trích xuất metadata
"""

import logging
import os
import tempfile
import json
import uuid
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
from PIL import Image
import cv2
import numpy as np
import io
import base64

# Document processing libraries
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logging.warning("python-docx not available")

# OCR Libraries
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logging.warning("pytesseract not available")

class OCRService:
    """OCR Service với hỗ trợ nhiều engine OCR, tóm tắt hợp đồng và trích xuất metadata"""
    
    def __init__(self):
        self.tesseract_available = TESSERACT_AVAILABLE
        self.ai_service = None  # Lazy load AI service
        
        # Cấu hình Tesseract nếu có
        if self.tesseract_available:
            try:
                # Thử tìm đường dẫn Tesseract
                tesseract_paths = [
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe',  # Windows
                    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',  # Windows 32-bit
                    '/usr/bin/tesseract',  # Linux
                    '/usr/local/bin/tesseract',  # macOS
                    'tesseract'  # PATH
                ]
                
                for path in tesseract_paths:
                    try:
                        pytesseract.pytesseract.tesseract_cmd = path
                        # Test tesseract
                        pytesseract.get_tesseract_version()
                        logging.info(f"Tesseract initialized at: {path}")
                        break
                    except:
                        continue
                else:
                    logging.warning("Tesseract not found in common paths")
                    self.tesseract_available = False
            except Exception as e:
                logging.error(f"Failed to initialize Tesseract: {e}")
                self.tesseract_available = False
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """Tiền xử lý hình ảnh để cải thiện độ chính xác OCR"""
        try:
            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply thresholding
            _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations
            kernel = np.ones((1, 1), np.uint8)
            processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            # Convert back to PIL
            processed_image = Image.fromarray(processed)
            
            return processed_image
            
        except Exception as e:
            logging.error(f"Error preprocessing image: {e}")
            return image
    
    def extract_text_tesseract(self, image: Image.Image, language: str = 'vie+eng') -> Dict[str, Any]:
        """Trích xuất text sử dụng Tesseract OCR"""
        if not self.tesseract_available:
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": "Tesseract not available"
            }
        
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Extract text with confidence
            data = pytesseract.image_to_data(processed_image, lang=language, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, lang=language).strip()
            
            # Get bounding boxes
            boxes = []
            for i in range(len(data['text'])):
                if int(data['conf'][i]) > 30:  # Only include high confidence text
                    boxes.append({
                        'text': data['text'][i],
                        'confidence': int(data['conf'][i]),
                        'bbox': {
                            'x': data['left'][i],
                            'y': data['top'][i],
                            'width': data['width'][i],
                            'height': data['height'][i]
                        }
                    })
            
            return {
                "success": True,
                "text": text,
                "confidence": avg_confidence / 100.0,  # Convert to 0-1 scale
                "boxes": boxes,
                "engine": "tesseract",
                "language": language
            }
            
        except Exception as e:
            logging.error(f"Tesseract OCR error: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": str(e),
                "engine": "tesseract"
            }
    
    
    def extract_text_combined(self, image: Image.Image, language: str = 'vie+eng') -> Dict[str, Any]:
        """Trích xuất text sử dụng Tesseract OCR"""
        if not self.tesseract_available:
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": "Tesseract not available"
            }
        
        # Use Tesseract directly
        return self.extract_text_tesseract(image, language)
    
    async def extract_with_ai_fallback(self, file_content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        """
        Trích xuất text với AI fallback:
        1. Thử AI OCR trước (Gemini Vision)
        2. Nếu thất bại, dùng Tesseract OCR
        """
        result = {
            "success": False,
            "text": "",
            "confidence": 0.0,
            "engine": "none",
            "error": None
        }
        
        # Try AI OCR first (for images)
        if content_type.lower() in ["image/png", "image/jpeg", "image/jpg", "application/pdf"]:
            try:
                ai_service = self._get_ai_service()
                if ai_service:
                    logging.info(f"Trying AI OCR for {filename}")
                    # AI OCR logic here (would need to implement in ai_processing_service)
                    # For now, skip to Tesseract
                    raise Exception("AI OCR not implemented yet")
            except Exception as e:
                logging.warning(f"AI OCR failed: {e}, falling back to Tesseract")
        
        # Fallback to Tesseract OCR
        if self.tesseract_available and content_type.lower() in ["image/png", "image/jpeg", "image/jpg"]:
            try:
                logging.info(f"Using Tesseract OCR for {filename}")
                tesseract_result = self.extract_text_from_file(file_content, filename, engine="tesseract")
                if tesseract_result.get("success"):
                    result = tesseract_result
                    result["engine"] = "tesseract_fallback"
                    logging.info(f"Tesseract OCR success: {len(result.get('text', ''))} chars extracted")
            except Exception as e:
                logging.error(f"Tesseract OCR failed: {e}")
                result["error"] = f"Tesseract failed: {str(e)}"
        
        return result
    
    def extract_text_from_docx(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Trích xuất text từ file DOCX"""
        if not DOCX_AVAILABLE:
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": "python-docx not available"
            }
        
        try:
            # Load DOCX document from bytes
            doc = Document(io.BytesIO(file_content))
            
            # Extract text from all paragraphs
            paragraphs = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    paragraphs.append(paragraph.text.strip())
            
            # Extract text from tables
            tables_text = []
            for table in doc.tables:
                for row in table.rows:
                    row_text = []
                    for cell in row.cells:
                        if cell.text.strip():
                            row_text.append(cell.text.strip())
                    if row_text:
                        tables_text.append(" | ".join(row_text))
            
            # Combine all text
            all_text = []
            if paragraphs:
                all_text.extend(paragraphs)
            if tables_text:
                all_text.extend(tables_text)
            
            extracted_text = "\n".join(all_text)
            
            return {
                "success": True,
                "text": extracted_text,
                "confidence": 1.0,
                "engine": "python-docx",
                "metadata": {
                    "paragraphs": len(paragraphs),
                    "tables": len(doc.tables),
                    "totalTextLength": len(extracted_text)
                }
            }
            
        except Exception as e:
            logging.error(f"Error extracting text from DOCX: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": str(e),
                "engine": "python-docx"
            }

    def extract_text_from_file(self, file_content: bytes, filename: str, engine: str = "auto") -> Dict[str, Any]:
        """Trích xuất text từ file ảnh"""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(file_content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Use Tesseract OCR
            if engine in ["tesseract", "auto"] and self.tesseract_available:
                return self.extract_text_tesseract(image)
            else:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0.0,
                    "error": f"Tesseract OCR not available"
                }
                
        except Exception as e:
            logging.error(f"Error processing image file: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def get_supported_languages(self) -> List[str]:
        """Lấy danh sách ngôn ngữ được hỗ trợ"""
        languages = []
        
        if self.tesseract_available:
            try:
                tesseract_langs = pytesseract.get_languages()
                languages.extend(tesseract_langs)
            except:
                pass
        
        
        return list(set(languages))  # Remove duplicates
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Lấy trạng thái OCR engine"""
        return {
            "tesseract": {
                "available": self.tesseract_available,
                "version": pytesseract.get_tesseract_version() if self.tesseract_available else None
            },
            "supported_languages": self.get_supported_languages()
        }
    
    def _get_ai_service(self):
        """Lazy load AI service"""
        if self.ai_service is None:
            try:
                from services.ai_processing_service import AutomationService
                self.ai_service = AutomationService()
            except Exception as e:
                logging.error(f"Failed to load AI service: {e}")
                return None
        return self.ai_service
    
    def extract_text_and_metadata(self, file_content: bytes, filename: str, content_type: str, engine: str = "auto") -> Dict[str, Any]:
        """
        Trích xuất text và metadata từ file
        Hỗ trợ cả ảnh và tài liệu (PDF, DOCX, TXT)
        """
        try:
            # Xử lý file JSON
            if content_type.lower() == "application/json":
                try:
                    json_data = json.loads(file_content.decode('utf-8', errors='ignore'))
                    plaintext = json.dumps(json_data, ensure_ascii=False, indent=2)
                    return {
                        "success": True,
                        "text": plaintext,
                        "confidence": 1.0,
                        "engine": "json_parser",
                        "metadata": {
                            "fileType": "JSON",
                            "contentType": content_type,
                            "size": len(file_content),
                            "processedAt": datetime.now(timezone.utc).isoformat()
                        }
                    }
                except Exception as e:
                    logging.warning(f"JSON parsing failed: {e}")
            
            # Xử lý file text
            if content_type.lower().startswith('text/'):
                try:
                    text_content = file_content.decode('utf-8', errors='ignore')
                    return {
                        "success": True,
                        "text": text_content,
                        "confidence": 1.0,
                        "engine": "text_reader",
                        "metadata": {
                            "fileType": "TEXT",
                            "contentType": content_type,
                            "size": len(file_content),
                            "processedAt": datetime.now(timezone.utc).isoformat()
                        }
                    }
                except Exception as e:
                    logging.warning(f"Text reading failed: {e}")
            
            # Xử lý file DOCX
            if content_type.lower() in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/docx"]:
                docx_result = self.extract_text_from_docx(file_content, filename)
                if docx_result["success"]:
                    docx_result["metadata"] = {
                        "fileType": "DOCX",
                        "contentType": content_type,
                        "size": len(file_content),
                        "processedAt": datetime.now(timezone.utc).isoformat(),
                        "extractionEngine": docx_result.get("engine", "python-docx"),
                        "confidence": docx_result.get("confidence", 1.0),
                        **docx_result.get("metadata", {})
                    }
                return docx_result
            
            # Xử lý file ảnh với OCR
            if content_type.lower().startswith('image/'):
                ocr_result = self.extract_text_from_file(file_content, filename, engine)
                if ocr_result["success"]:
                    ocr_result["metadata"] = {
                        "fileType": "IMAGE",
                        "contentType": content_type,
                        "size": len(file_content),
                        "processedAt": datetime.now(timezone.utc).isoformat(),
                        "ocrEngine": ocr_result.get("engine", "unknown"),
                        "confidence": ocr_result.get("confidence", 0.0)
                    }
                return ocr_result
            
            # Fallback cho các loại file khác
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": f"Unsupported content type: {content_type}",
                "metadata": {
                    "fileType": "UNKNOWN",
                    "contentType": content_type,
                    "size": len(file_content),
                    "processedAt": datetime.now(timezone.utc).isoformat()
                }
            }
            
        except Exception as e:
            logging.error(f"Error extracting text and metadata: {e}")
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "error": str(e),
                "metadata": {
                    "fileType": "ERROR",
                    "contentType": content_type,
                    "size": len(file_content),
                    "processedAt": datetime.now(timezone.utc).isoformat()
                }
            }
    
    def classify_document(self, text: str, filename: str) -> Dict[str, Any]:
        """
        Phân loại tài liệu dựa trên nội dung text
        """
        try:
            ai_service = self._get_ai_service()
            if not ai_service:
                return {
                    "documentType": "other",
                    "isContract": False,
                    "confidence": 0.5,
                    "reasons": ["AI service not available"],
                    "contractSubtype": None
                }
            
            return ai_service.classify_document(text, filename)
            
        except Exception as e:
            logging.error(f"Error classifying document: {e}")
            return {
                "documentType": "other",
                "isContract": False,
                "confidence": 0.5,
                "reasons": [str(e)],
                "contractSubtype": None
            }
    
    def generate_contract_summary(self, text: str, filename: str) -> Optional[Dict[str, Any]]:
        """
        Tóm tắt hợp đồng từ text đã trích xuất
        """
        try:
            ai_service = self._get_ai_service()
            if not ai_service:
                logging.warning("AI service not available for contract summary")
                return None
            
            return ai_service.generate_contract_summary(text, filename)
            
        except Exception as e:
            logging.error(f"Error generating contract summary: {e}")
            return None
    
    def process_document_complete(self, file_content: bytes, filename: str, content_type: str, engine: str = "auto") -> Dict[str, Any]:
        """
        Xử lý hoàn chỉnh tài liệu: OCR + Classification + Contract Summary
        """
        try:
            # 1. Trích xuất text và metadata
            extraction_result = self.extract_text_and_metadata(file_content, filename, content_type, engine)
            
            if not extraction_result["success"]:
                return {
                    "success": False,
                    "error": "Failed to extract text",
                    "extraction": extraction_result
                }
            
            text = extraction_result["text"]
            metadata = extraction_result.get("metadata", {})
            
            # 2. Phân loại tài liệu
            classification_result = self.classify_document(text, filename)
            
            # 3. Tóm tắt hợp đồng (nếu là hợp đồng)
            summary_result = None
            if classification_result.get("isContract", False):
                summary_result = self.generate_contract_summary(text, filename)
            
            # 4. Tạo kết quả hoàn chỉnh
            result = {
                "success": True,
                "extraction": extraction_result,
                "classification": classification_result,
                "summary": summary_result,
                "metadata": {
                    **metadata,
                    "classification": classification_result,
                    "hasSummary": summary_result is not None,
                    "processedAt": datetime.now(timezone.utc).isoformat()
                }
            }
            
            return result
            
        except Exception as e:
            logging.error(f"Error in complete document processing: {e}")
            return {
                "success": False,
                "error": str(e),
                "extraction": None,
                "classification": None,
                "summary": None,
                "metadata": {
                    "fileType": "ERROR",
                    "contentType": content_type,
                    "size": len(file_content),
                    "processedAt": datetime.now(timezone.utc).isoformat()
                }
            }