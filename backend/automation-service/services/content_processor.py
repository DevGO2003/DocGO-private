"""
Content Processor - Text Extraction & AI Classification

Responsibilities:
- Extract text (OCR/Direct)
- AI classification (documentType, language, category)
- Extract PDF metadata
- Publish FILE_CONTENT_EXTRACTED event
"""

import logging
from typing import Dict, Any, Optional
from services.kafka_publisher_v3 import KafkaPublisherV3

logger = logging.getLogger(__name__)


class ContentProcessor:
    """Process file content and publish Event 2"""
    
    def __init__(self, kafka_publisher: KafkaPublisherV3, gemini_client=None):
        self.kafka_publisher = kafka_publisher
        self.gemini_client = gemini_client
        
    def process_content(self, document_id: str, file_data: bytes, mime_type: str,
                       correlation_id: str, actor: str) -> Dict[str, Any]:
        """
        Process file content
        
        Args:
            document_id: UUID v7 of document
            file_data: File content bytes
            mime_type: MIME type
            correlation_id: Request correlation ID
            actor: Actor performing action
            
        Returns:
            Dict with processing result
        """
        try:
            # Extract text
            extracted_text = self._extract_text(file_data, mime_type)
            logger.info(f"Extracted text length: {len(extracted_text)}")
            
            # AI classification
            classification = self._classify_content(extracted_text)
            logger.info(f"Classification: {classification}")
            
            # Extract PDF metadata if applicable
            pdf_metadata = {}
            if mime_type == "application/pdf":
                pdf_metadata = self._extract_pdf_metadata(file_data)
                logger.info(f"Extracted PDF metadata")
            
            # Prepare event payload
            event_payload = self._prepare_event_payload(
                document_id, extracted_text, classification, pdf_metadata
            )
            
            # Publish Event 2: FILE_CONTENT_EXTRACTED
            event_id = self.kafka_publisher.publish_event(
                event_type="FILE_CONTENT_EXTRACTED",
                document_id=document_id,
                event_data=event_payload,
                correlation_id=correlation_id,
                actor=actor
            )
            
            logger.info(f"Published FILE_CONTENT_EXTRACTED: eventId={event_id}, documentId={document_id}")
            
            return {
                "success": True,
                "documentId": document_id,
                "eventId": event_id,
                "classification": classification,
                "isContract": classification.get("isContract", False)
            }
            
        except Exception as e:
            logger.error(f"Error processing content: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
    
    def _extract_text(self, file_data: bytes, mime_type: str) -> str:
        """Extract text from file"""
        # TODO: Implement OCR/text extraction
        # For now, return mock text
        return "Full extracted text from document..."
    
    def _classify_content(self, text: str) -> Dict[str, Any]:
        """Classify content using AI"""
        # TODO: Implement Gemini AI classification
        # For now, return mock classification
        return {
            "isContract": True,
            "documentType": "CONTRACT",
            "category": "Legal Documents",
            "language": "vi",
            "confidence": 0.85
        }
    
    def _extract_pdf_metadata(self, file_data: bytes) -> Dict[str, Any]:
        """Extract PDF metadata"""
        # TODO: Implement PDF metadata extraction
        # For now, return mock metadata
        return {
            "dcFormat": "application/pdf",
            "dcTitle": "Software Development Contract",
            "dcCreator": "Microsoft Word 2019",
            "dcDescription": "Contract for DocGO system development",
            "dcSubject": "Contract, Software Development, DocGO",
            "xmpCreateDate": "2024-01-15T08:30:00Z",
            "xmpCreatorTool": "Microsoft Word 2019",
            "xmpModifyDate": "2024-01-15T09:00:00Z",
            "xmpMetadataDate": "2024-01-15T09:00:00Z",
            "xmpDocumentID": "doc-2024-004",
            "xmpInstanceID": "doc-2024-004-v1.0",
            "pdfKeywords": "contract, development, software",
            "pdfProducer": "Microsoft Word 2019",
            "pdfaidPart": 3,
            "pdfaidConformance": "B"
        }
    
    def _prepare_event_payload(self, document_id: str, extracted_text: str,
                              classification: Dict[str, Any],
                              pdf_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare FILE_CONTENT_EXTRACTED event payload"""
        return {
            "documentId": document_id,
            "content": {
                "plaintext": extracted_text,
                "extractedText": extracted_text,
                "summary": "AI-generated summary of the document...",
                "keyTerms": ["software", "contract", "payment", "deadline"],
                "sections": [
                    {
                        "title": "Article 1: Contract Subject",
                        "description": "Main scope description",
                        "content": "Party A hires Party B to develop...",
                        "pageNumber": 1
                    }
                ],
                "ocr": {
                    "text": "OCR extracted text...",
                    "status": "COMPLETED",
                    "engine": "TESSERACT",
                    "confidence": 0.92,
                    "processedAt": "2025-10-23T10:00:03Z",
                    "processingTime": 2.5,
                    "metadata": {
                        "language": "vie+eng",
                        "pageCount": 15,
                        "boxCount": 142,
                        "averageConfidence": 0.92
                    }
                },
                "extraction": {
                    "status": "SUCCESS",
                    "method": "DIRECT",
                    "extractedAt": "2025-10-23T10:00:02Z",
                    "characterCount": 15000,
                    "wordCount": 2500
                },
                "summarization": {
                    "status": "SUCCESS",
                    "model": "gemini-1.5-flash",
                    "processedAt": "2025-10-23T10:00:04Z",
                    "processingTime": 1.8,
                    "inputTokens": 3500,
                    "outputTokens": 250
                },
                "classification": classification,
                "processing": {
                    "status": "COMPLETED",
                    "error": None
                }
            },
            "metadata": {
                "technical": {
                    "encoding": "UTF-8",
                    "lineEnding": "LF",
                    "bom": False,
                    "compression": "NONE",
                    "pages": 15,
                    "wordCount": 2500,
                    "characterCount": 15000
                },
                "originalDocument": pdf_metadata
            }
        }
