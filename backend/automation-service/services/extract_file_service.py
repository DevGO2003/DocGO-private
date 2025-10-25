"""
Extract File Service
Xử lý 2 events: FILE_METADATA_RECORDED và FILE_CONTENT_EXTRACTED
Không có null - chỉ có fail status nếu extraction thất bại
"""

import logging
import hashlib
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone

# Import services
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService


class ExtractFileService:
    """Service xử lý file extraction"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_service = AutomationService()
    
    def extract_file_metadata(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        s3_url: str,
        bucket_name: str,
        object_key: str,
        region: str
    ) -> Dict[str, Any]:
        """
        Extract metadata cho FILE_METADATA_RECORDED event
        Luôn success với data đầy đủ
        """
        try:
            # Calculate hashes
            md5_hash = hashlib.md5(file_content).hexdigest()
            sha256_hash = hashlib.sha256(file_content).hexdigest()
            size = len(file_content)
            
            now_iso = datetime.now(timezone.utc).isoformat()
            
            return {
                "success": True,
                "metadata": {
                    "fileId": None,  # Will be set by caller
                    "name": filename,
                    "contentType": content_type,
                    "size": size,
                    "storage": {
                        "type": "s3",
                        "s3": {
                            "url": s3_url,
                            "bucket": bucket_name,
                            "objectKey": object_key,
                            "region": region,
                            "contentType": content_type,
                            "size": size,
                            "versionId": None,
                            "checksum": {
                                "originalMD5": md5_hash,
                                "archiveMD5": None
                            }
                        },
                        "local": None
                    },
                    "file": {
                        "hash": {
                            "md5": md5_hash,
                            "sha256": sha256_hash
                        },
                        "permissions": {
                            "read": ["system", "admin"],
                            "write": ["system"],
                            "delete": ["system"],
                            "share": ["system"]
                        },
                        "security": {
                            "encryption": "AES-256",
                            "watermark": False,
                            "digitalSignature": False,
                            "accessLogging": True
                        },
                        "version": 1
                    },
                    "metadata": {
                        "fileSystem": {
                            "dateModified": now_iso,
                            "dateAdded": now_iso,
                            "mediaFilename": filename,
                            "originalFilename": filename,
                            "originalMD5": md5_hash,
                            "originalFileSize": size,
                            "originalMimeType": content_type,
                            "archiveMD5": None,
                            "archiveFileSize": None
                        },
                        "technical": {
                            "encoding": "UTF-8",
                            "lineEnding": "LF",
                            "bom": False,
                            "compression": "NONE",
                            "pages": None,
                            "wordCount": None,  # Will be calculated in content extraction
                            "characterCount": None  # Will be calculated in content extraction
                        }
                    },
                    "version": 1
                },
                "error": None
            }
        except Exception as e:
            logging.error(f"[EXTRACT_METADATA_ERROR] {e}")
            return {
                "success": False,
                "metadata": None,
                "error": str(e)
            }
    
    def extract_file_content(
        self,
        file_content: bytes,
        filename: str,
        content_type: str
    ) -> Dict[str, Any]:
        """
        Extract content cho FILE_CONTENT_EXTRACTED event
        
        Returns:
        - plaintext: Raw text từ file (không qua AI)
        - extractedText: Text đã xử lý/cleaned (qua AI nếu cần)
        - summary: AI-generated summary
        - keyTerms: AI-extracted keywords
        - sections: AI-extracted sections
        - ocr: OCR processing details
        - extraction: Extraction processing details
        - summarization: AI summarization details
        - classification: Document classification
        """
        try:
            logging.info(f"[EXTRACT_CONTENT] Starting extraction for: {filename}")
            logging.debug(f"[EXTRACT_CONTENT_DEBUG] content_type={content_type}, file_size={len(file_content)} bytes")
            
            # Step 1: Extract plaintext (raw, không AI)
            logging.debug(f"[EXTRACT_CONTENT_STEP1] Extracting plaintext...")
            plaintext_result = self._extract_plaintext(file_content, filename, content_type)
            plaintext = plaintext_result["text"]
            logging.debug(f"[EXTRACT_CONTENT_STEP1_RESULT] method={plaintext_result.get('method')}, extracted_length={len(plaintext)} chars")
            
            # Step 2: OCR nếu cần (fallback)
            logging.debug(f"[EXTRACT_CONTENT_STEP2] Performing OCR if needed...")
            ocr_result = self._perform_ocr(file_content, filename, content_type, plaintext)
            logging.debug(f"[EXTRACT_CONTENT_STEP2_RESULT] ocr_status={ocr_result.get('status')}")
            
            # Step 3: Classification (AI)
            logging.debug(f"[EXTRACT_CONTENT_STEP3] Classifying document...")
            classification_result = self._classify_document(plaintext, filename)
            logging.debug(f"[EXTRACT_CONTENT_STEP3_RESULT] documentType={classification_result.get('documentType')}, isContract={classification_result.get('isContract')}")
            
            # Step 4: Extract extractedText (cleaned/processed)
            extracted_text = self._clean_text(plaintext)
            
            # Step 5: Summarization (AI)
            summarization_result = self._generate_summary(extracted_text, filename)
            
            # Step 6: Extract key terms (AI)
            key_terms = self._extract_key_terms(extracted_text)
            
            # Step 7: Extract sections (AI)
            sections = self._extract_sections(extracted_text)
            
            # Calculate stats
            char_count = len(plaintext) if plaintext else 0
            word_count = len(plaintext.split()) if plaintext else 0
            
            return {
                "success": True,
                "content": {
                    "plaintext": plaintext,  # Raw text
                    "extractedText": extracted_text,  # Cleaned text
                    "summary": summarization_result.get("summary"),
                    "keyTerms": key_terms,
                    "sections": sections,
                    "ocr": ocr_result,
                    "extraction": {
                        "status": "SUCCESS",
                        "method": plaintext_result.get("method", "direct"),
                        "extractedAt": datetime.now(timezone.utc).isoformat(),
                        "characterCount": char_count,
                        "wordCount": word_count,
                        "error": None
                    },
                    "summarization": summarization_result.get("details"),
                    "classification": classification_result,
                    "processing": {
                        "status": "COMPLETED",
                        "error": None
                    }
                },
                "error": None
            }
            
        except Exception as e:
            logging.error(f"[EXTRACT_CONTENT_ERROR] {e}")
            return {
                "success": False,
                "content": None,
                "error": str(e)
            }
    
    def _extract_plaintext(
        self,
        file_content: bytes,
        filename: str,
        content_type: str
    ) -> Dict[str, Any]:
        """Extract plaintext từ file - không qua AI"""
        try:
            logging.debug(f"[PLAINTEXT_EXTRACT_START] filename={filename}, content_type={content_type}, size={len(file_content)} bytes")
            
            if content_type.lower() == "application/json":
                logging.debug(f"[PLAINTEXT_EXTRACT] Processing JSON file")
                text = file_content.decode('utf-8', errors='ignore')
                logging.debug(f"[PLAINTEXT_EXTRACT_SUCCESS] Extracted {len(text)} characters from JSON")
                return {"text": text, "method": "direct"}
            
            elif content_type.lower() in ["text/plain", "text/csv", "text/html"]:
                logging.debug(f"[PLAINTEXT_EXTRACT] Processing text file: {content_type}")
                text = file_content.decode('utf-8', errors='ignore')
                logging.debug(f"[PLAINTEXT_EXTRACT_SUCCESS] Extracted {len(text)} characters from text")
                return {"text": text, "method": "direct"}
            
            elif content_type.lower() == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or filename.lower().endswith('.docx'):
                logging.debug(f"[PLAINTEXT_EXTRACT] Processing DOCX file: {filename}")
                try:
                    from docx import Document
                    from io import BytesIO
                    
                    doc = Document(BytesIO(file_content))
                    paragraphs = []
                    for para in doc.paragraphs:
                        if para.text.strip():
                            paragraphs.append(para.text)
                    
                    text = '\n'.join(paragraphs)
                    logging.debug(f"[PLAINTEXT_EXTRACT_SUCCESS] Extracted {len(text)} characters from DOCX ({len(paragraphs)} paragraphs)")
                    logging.debug(f"[PLAINTEXT_EXTRACT_PREVIEW] First 200 chars: {text[:200]}")
                    return {"text": text, "method": "docx_direct"}
                except Exception as docx_error:
                    logging.warning(f"[PLAINTEXT_EXTRACT_DOCX_FAILED] {docx_error}, trying zipfile fallback...")
                    try:
                        # Fallback: Try to extract text using zipfile directly
                        import zipfile
                        from io import BytesIO
                        import xml.etree.ElementTree as ET
                        
                        with zipfile.ZipFile(BytesIO(file_content)) as zip_ref:
                            # Read document.xml from the DOCX
                            xml_content = zip_ref.read('word/document.xml')
                            root = ET.fromstring(xml_content)
                            
                            # Extract text from all text elements
                            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                            texts = []
                            for t in root.findall('.//w:t', namespace):
                                if t.text:
                                    texts.append(t.text)
                            
                            text = ''.join(texts)
                            logging.debug(f"[PLAINTEXT_EXTRACT_ZIPFILE_SUCCESS] Extracted {len(text)} characters from DOCX via zipfile")
                            logging.debug(f"[PLAINTEXT_EXTRACT_PREVIEW] First 200 chars: {text[:200]}")
                            return {"text": text, "method": "docx_zipfile"}
                    except Exception as zip_error:
                        logging.error(f"[PLAINTEXT_EXTRACT_DOCX_ZIPFILE_FAILED] {zip_error}, falling back to OCR")
                        return {"text": "", "method": "ocr_required"}
            
            elif content_type.lower() == "application/pdf" or filename.lower().endswith('.pdf'):
                logging.debug(f"[PLAINTEXT_EXTRACT] Processing PDF file: {filename}")
                return {"text": "", "method": "ocr_required"}
            
            else:
                logging.debug(f"[PLAINTEXT_EXTRACT] Unknown content type: {content_type}, will use OCR")
                return {"text": "", "method": "ocr_required"}
        
        except Exception as e:
            logging.error(f"[PLAINTEXT_EXTRACT_ERROR] {e}", exc_info=True)
            return {"text": "", "method": "failed"}
    
    def _perform_ocr(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        existing_plaintext: str
    ) -> Dict[str, Any]:
        """Perform OCR với fallback"""
        try:
            # Nếu đã có plaintext, skip OCR
            if existing_plaintext:
                return {
                    "text": existing_plaintext,
                    "status": "SKIPPED",
                    "engine": None,
                    "confidence": None,
                    "processedAt": datetime.now(timezone.utc).isoformat(),
                    "processingTime": 0,
                    "error": None,
                    "metadata": None
                }
            
            # Perform OCR
            start_time = datetime.now(timezone.utc)
            ocr_result = self.ocr_service.extract_text_from_file(file_content, filename, engine="auto")
            end_time = datetime.now(timezone.utc)
            
            processing_time = (end_time - start_time).total_seconds()
            
            if ocr_result.get("success"):
                return {
                    "text": ocr_result.get("text", ""),
                    "status": "COMPLETED",
                    "engine": ocr_result.get("engine", "tesseract"),
                    "confidence": ocr_result.get("confidence", 0.0),
                    "processedAt": end_time.isoformat(),
                    "processingTime": processing_time,
                    "error": None,
                    "metadata": {
                        "language": "vie+eng",
                        "pageCount": 1,
                        "boxCount": len(ocr_result.get("boxes", [])),
                        "averageConfidence": ocr_result.get("confidence", 0.0)
                    }
                }
            else:
                return {
                    "text": "",
                    "status": "FAILED",
                    "engine": "tesseract",
                    "confidence": 0.0,
                    "processedAt": end_time.isoformat(),
                    "processingTime": processing_time,
                    "error": ocr_result.get("error", "Unknown error"),
                    "metadata": None
                }
        except Exception as e:
            logging.error(f"[OCR_ERROR] {e}")
            return {
                "text": "",
                "status": "FAILED",
                "engine": None,
                "confidence": 0.0,
                "processedAt": datetime.now(timezone.utc).isoformat(),
                "processingTime": 0,
                "error": str(e),
                "metadata": None
            }
    
    def _clean_text(self, plaintext: str) -> str:
        """Clean và normalize text"""
        if not plaintext:
            return ""
        
        # Basic cleaning
        text = plaintext.strip()
        # Remove excessive whitespace
        text = " ".join(text.split())
        
        return text
    
    def _generate_summary(self, text: str, filename: str) -> Dict[str, Any]:
        """Generate AI summary"""
        try:
            if not text:
                return {
                    "summary": None,
                    "details": {
                        "status": "SKIPPED",
                        "model": None,
                        "processedAt": datetime.now(timezone.utc).isoformat(),
                        "processingTime": 0,
                        "inputTokens": 0,
                        "outputTokens": 0,
                        "error": "No text to summarize"
                    }
                }
            
            start_time = datetime.now(timezone.utc)
            
            # Simple summary - first 200 chars
            summary = text[:200] if len(text) > 200 else text
            
            end_time = datetime.now(timezone.utc)
            processing_time = (end_time - start_time).total_seconds()
            
            return {
                "summary": summary,
                "details": {
                    "status": "SUCCESS",
                    "model": "simple_extraction",
                    "processedAt": end_time.isoformat(),
                    "processingTime": processing_time,
                    "inputTokens": len(text.split()),
                    "outputTokens": len(summary.split()),
                    "error": None
                }
            }
        except Exception as e:
            logging.error(f"[SUMMARY_ERROR] {e}")
            return {
                "summary": None,
                "details": {
                    "status": "FAILED",
                    "model": None,
                    "processedAt": datetime.now(timezone.utc).isoformat(),
                    "processingTime": 0,
                    "inputTokens": 0,
                    "outputTokens": 0,
                    "error": str(e)
                }
            }
    
    def _extract_key_terms(self, text: str) -> list:
        """Extract key terms - simple extraction"""
        if not text:
            return []
        
        try:
            # Simple extraction - first 50 words, filter by length
            words = text.split()[:50]
            key_terms = [w for w in words if len(w) > 3][:10]
            return key_terms
        except Exception as e:
            logging.error(f"[KEY_TERMS_ERROR] {e}")
            return []
    
    def _extract_sections(self, text: str) -> list:
        """Extract sections - will use AI in future"""
        # For now return empty - will implement with AI
        return []
    
    def _classify_document(self, text: str, filename: str) -> Dict[str, Any]:
        """Classify document với AI"""
        try:
            logging.debug(f"[CLASSIFICATION_START] filename={filename}, text_length={len(text)} chars")
            logging.debug(f"[CLASSIFICATION_PREVIEW] First 300 chars: {text[:300]}")
            
            # Log character analysis
            if text:
                lines = text.split('\n')
                logging.debug(f"[CLASSIFICATION_ANALYSIS] Total lines: {len(lines)}")
                logging.debug(f"[CLASSIFICATION_ANALYSIS] First 5 lines:")
                for i, line in enumerate(lines[:5]):
                    logging.debug(f"  Line {i+1}: {line[:100]}")
            
            result = self.ai_service.classify_document(text, filename)
            
            logging.debug(f"[CLASSIFICATION_RESULT] documentType={result.get('documentType')}, isContract={result.get('isContract')}, confidence={result.get('confidence')}")
            logging.debug(f"[CLASSIFICATION_REASONS] {result.get('reasons', [])}")
            
            return {
                "documentType": result.get("documentType", "OTHER"),
                "isContract": result.get("isContract", False),
                "confidence": result.get("confidence", 0.5),
                "reasons": result.get("reasons", []),
                "contractSubtype": result.get("contractSubtype"),
                "category": "Tài liệu",  # Default
                "language": "vi"  # Default
            }
        except Exception as e:
            logging.error(f"[CLASSIFICATION_ERROR] {e}", exc_info=True)
            return {
                "documentType": "OTHER",
                "isContract": False,
                "confidence": 0.5,
                "reasons": [str(e)],
                "contractSubtype": None,
                "category": "Tài liệu",
                "language": "vi"
            }
