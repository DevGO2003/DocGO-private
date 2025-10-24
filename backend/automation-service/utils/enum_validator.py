"""
Enum Validator for DocGO Automation Service
Validates AI responses against predefined enum values
"""

import json
import logging
from typing import Dict, Any, List, Optional, Union
from enum import Enum

class DocumentType(Enum):
    CONTRACT = "CONTRACT"
    INVOICE = "INVOICE"
    MEMO = "MEMO"
    REPORT = "REPORT"
    AGREEMENT = "AGREEMENT"
    NOT_DOCUMENT = "NOT_DOCUMENT"

class Language(Enum):
    VI = "vi"
    EN = "en"
    FR = "fr"
    ZH = "zh"

class ContractType(Enum):
    SERVICE_AGREEMENT = "SERVICE_AGREEMENT"
    PURCHASE_AGREEMENT = "PURCHASE_AGREEMENT"
    PARTNERSHIP_AGREEMENT = "PARTNERSHIP_AGREEMENT"
    EMPLOYMENT_CONTRACT = "EMPLOYMENT_CONTRACT"
    SALES_CONTRACT = "SALES_CONTRACT"
    LEASE_AGREEMENT = "LEASE_AGREEMENT"
    LICENSE_AGREEMENT = "LICENSE_AGREEMENT"
    NON_DISCLOSURE_AGREEMENT = "NON_DISCLOSURE_AGREEMENT"
    SOFTWARE_DEVELOPMENT = "SOFTWARE_DEVELOPMENT"
    CONSULTING_AGREEMENT = "CONSULTING_AGREEMENT"
    OTHERS = "OTHERS"

class Currency(Enum):
    USD = "USD"
    VND = "VND"
    EUR = "EUR"
    JPY = "JPY"

class Priority(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Confidentiality(Enum):
    CONFIDENTIAL = "CONFIDENTIAL"
    INTERNAL = "INTERNAL"
    PUBLIC = "PUBLIC"
    RESTRICTED = "RESTRICTED"

class PartyType(Enum):
    CLIENT = "CLIENT"
    VENDOR = "VENDOR"
    PARTNER = "PARTNER"
    GUARANTOR = "GUARANTOR"

class PaymentMethod(Enum):
    BANK_TRANSFER = "BANK_TRANSFER"
    CREDIT_CARD = "CREDIT_CARD"
    WIRE = "WIRE"
    CHECK = "CHECK"
    CASH = "CASH"
    DIGITAL_WALLET = "DIGITAL_WALLET"

class PaymentStatus(Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RiskFactorType(Enum):
    TECHNICAL = "TECHNICAL"
    SCHEDULE = "SCHEDULE"
    FINANCIAL = "FINANCIAL"
    LEGAL = "LEGAL"
    OPERATIONAL = "OPERATIONAL"

class ComplianceStatus(Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    PENDING_REVIEW = "PENDING_REVIEW"
    IN_AUDIT = "IN_AUDIT"

class ReminderType(Enum):
    PAYMENT_DUE = "PAYMENT_DUE"
    MILESTONE_REVIEW = "MILESTONE_REVIEW"
    EXPIRY_WARNING = "EXPIRY_WARNING"
    CONTRACT_RENEWAL = "CONTRACT_RENEWAL"

class ReminderStatus(Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    RESOLVED = "RESOLVED"
    OVERDUE = "OVERDUE"

class OCRStatus(Enum):
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PROCESSING = "PROCESSING"
    SKIPPED = "SKIPPED"

class OCREngine(Enum):
    GEMINI_VISION = "GEMINI_VISION"
    TESSERACT = "TESSERACT"
    TESSERACT_FALLBACK = "TESSERACT_FALLBACK"
    PADDLEOCR = "PADDLEOCR"

class ExtractionStatus(Enum):
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"

class ExtractionMethod(Enum):
    DIRECT = "DIRECT"
    OCR = "OCR"
    HYBRID = "HYBRID"

class SummarizationStatus(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

class ProcessingStatus(Enum):
    COMPLETED = "COMPLETED"
    PROCESSING = "PROCESSING"
    FAILED = "FAILED"

class Encoding(Enum):
    UTF8 = "UTF-8"
    UTF16 = "UTF-16"
    ASCII = "ASCII"

class LineEnding(Enum):
    LF = "LF"
    CRLF = "CRLF"

class Compression(Enum):
    NONE = "NONE"
    GZIP = "GZIP"
    DEFLATE = "DEFLATE"

class DCFormat(Enum):
    APPLICATION_PDF = "application/pdf"
    TEXT_PLAIN = "text/plain"
    APPLICATION_JSON = "application/json"
    UNKNOWN = "unknown"

class PDFAIDPart(Enum):
    PART_1 = 1
    PART_2 = 2
    PART_3 = 3

class PDFAIDConformance(Enum):
    A = "A"
    B = "B"
    U = "U"

class EnumValidator:
    """Validator for AI responses against predefined enum values"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def validate_document_classification(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate document classification response"""
        try:
            # Validate documentType
            if "documentType" in response:
                doc_type = response["documentType"]
                if doc_type not in [e.value for e in DocumentType]:
                    self.logger.warning(f"Invalid documentType: {doc_type}, using fallback: NOT_DOCUMENT")
                    response["documentType"] = DocumentType.NOT_DOCUMENT.value
            
            # Validate language
            if "language" in response:
                lang = response["language"]
                if lang not in [e.value for e in Language]:
                    self.logger.warning(f"Invalid language: {lang}, using fallback: vi")
                    response["language"] = Language.VI.value
            
            # Validate isContract
            if "isContract" in response:
                if not isinstance(response["isContract"], bool):
                    response["isContract"] = response.get("documentType") in ["CONTRACT", "AGREEMENT"]
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.5")
                    response["confidence"] = 0.5
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating document classification: {e}")
            return self._get_fallback_document_classification()
    
    def validate_contract_analysis(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate contract analysis response"""
        try:
            # Validate contract type
            if "type" in response:
                contract_type = response["type"]
                if contract_type not in [e.value for e in ContractType]:
                    self.logger.warning(f"Invalid contract type: {contract_type}, using fallback: OTHERS")
                    response["type"] = ContractType.OTHERS.value
            
            # Validate currency
            if "currency" in response:
                currency = response["currency"]
                if currency not in [e.value for e in Currency]:
                    self.logger.warning(f"Invalid currency: {currency}, using fallback: VND")
                    response["currency"] = Currency.VND.value
            
            # Validate priority
            if "priority" in response:
                priority = response["priority"]
                if priority not in [e.value for e in Priority]:
                    self.logger.warning(f"Invalid priority: {priority}, using fallback: MEDIUM")
                    response["priority"] = Priority.MEDIUM.value
            
            # Validate confidentiality
            if "confidentiality" in response:
                conf = response["confidentiality"]
                if conf not in [e.value for e in Confidentiality]:
                    self.logger.warning(f"Invalid confidentiality: {conf}, using fallback: INTERNAL")
                    response["confidentiality"] = Confidentiality.INTERNAL.value
            
            # Validate parties
            if "parties" in response and isinstance(response["parties"], list):
                for party in response["parties"]:
                    if "type" in party:
                        party_type = party["type"]
                        if party_type not in [e.value for e in PartyType]:
                            self.logger.warning(f"Invalid party type: {party_type}, using fallback: CLIENT")
                            party["type"] = PartyType.CLIENT.value
            
            # Validate payment method
            if "payment" in response and "method" in response["payment"]:
                method = response["payment"]["method"]
                if method not in [e.value for e in PaymentMethod]:
                    self.logger.warning(f"Invalid payment method: {method}, using fallback: BANK_TRANSFER")
                    response["payment"]["method"] = PaymentMethod.BANK_TRANSFER.value
            
            # Validate risk level
            if "risk" in response and "level" in response["risk"]:
                risk_level = response["risk"]["level"]
                if risk_level not in [e.value for e in RiskLevel]:
                    self.logger.warning(f"Invalid risk level: {risk_level}, using fallback: MEDIUM")
                    response["risk"]["level"] = RiskLevel.MEDIUM.value
            
            # Validate compliance status
            if "compliance" in response and "status" in response["compliance"]:
                comp_status = response["compliance"]["status"]
                if comp_status not in [e.value for e in ComplianceStatus]:
                    self.logger.warning(f"Invalid compliance status: {comp_status}, using fallback: PENDING_REVIEW")
                    response["compliance"]["status"] = ComplianceStatus.PENDING_REVIEW.value
            
            return response
                
        except Exception as e:
            self.logger.error(f"Error validating contract analysis: {e}")
            return self._get_fallback_contract_analysis()
    
    def validate_ocr_processing(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate OCR processing response"""
        try:
            # Validate status
            if "status" in response:
                status = response["status"]
                if status not in [e.value for e in OCRStatus]:
                    self.logger.warning(f"Invalid OCR status: {status}, using fallback: COMPLETED")
                    response["status"] = OCRStatus.COMPLETED.value
            
            # Validate engine
            if "engine" in response:
                engine = response["engine"]
                if engine not in [e.value for e in OCREngine]:
                    self.logger.warning(f"Invalid OCR engine: {engine}, using fallback: GEMINI_VISION")
                    response["engine"] = OCREngine.GEMINI_VISION.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating OCR processing: {e}")
            return self._get_fallback_ocr_processing()
    
    def validate_content_extraction(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content extraction response"""
        try:
            # Validate status
            if "status" in response:
                status = response["status"]
                if status not in [e.value for e in ExtractionStatus]:
                    self.logger.warning(f"Invalid extraction status: {status}, using fallback: SUCCESS")
                    response["status"] = ExtractionStatus.SUCCESS.value
            
            # Validate method
            if "method" in response:
                method = response["method"]
                if method not in [e.value for e in ExtractionMethod]:
                    self.logger.warning(f"Invalid extraction method: {method}, using fallback: DIRECT")
                    response["method"] = ExtractionMethod.DIRECT.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating content extraction: {e}")
            return self._get_fallback_content_extraction()
    
    def validate_summarization(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate summarization response"""
        try:
            # Validate status
            if "status" in response:
                status = response["status"]
                if status not in [e.value for e in SummarizationStatus]:
                    self.logger.warning(f"Invalid summarization status: {status}, using fallback: SUCCESS")
                    response["status"] = SummarizationStatus.SUCCESS.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating summarization: {e}")
            return self._get_fallback_summarization()
    
    def validate_processing_status(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate processing status response"""
        try:
            # Validate status
            if "status" in response:
                status = response["status"]
                if status not in [e.value for e in ProcessingStatus]:
                    self.logger.warning(f"Invalid processing status: {status}, using fallback: COMPLETED")
                    response["status"] = ProcessingStatus.COMPLETED.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating processing status: {e}")
            return self._get_fallback_processing_status()
    
    def validate_technical_metadata(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate technical metadata response"""
        try:
            # Validate encoding
            if "encoding" in response:
                encoding = response["encoding"]
                if encoding not in [e.value for e in Encoding]:
                    self.logger.warning(f"Invalid encoding: {encoding}, using fallback: UTF-8")
                    response["encoding"] = Encoding.UTF8.value
            
            # Validate lineEnding
            if "lineEnding" in response:
                line_ending = response["lineEnding"]
                if line_ending not in [e.value for e in LineEnding]:
                    self.logger.warning(f"Invalid lineEnding: {line_ending}, using fallback: LF")
                    response["lineEnding"] = LineEnding.LF.value
            
            # Validate compression
            if "compression" in response:
                compression = response["compression"]
                if compression not in [e.value for e in Compression]:
                    self.logger.warning(f"Invalid compression: {compression}, using fallback: NONE")
                    response["compression"] = Compression.NONE.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating technical metadata: {e}")
            return self._get_fallback_technical_metadata()
    
    def validate_pdf_metadata(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate PDF metadata response"""
        try:
            # Validate dcFormat
            if "dcFormat" in response:
                dc_format = response["dcFormat"]
                if dc_format not in [e.value for e in DCFormat]:
                    self.logger.warning(f"Invalid dcFormat: {dc_format}, using fallback: application/pdf")
                    response["dcFormat"] = DCFormat.APPLICATION_PDF.value
            
            # Validate pdfaidPart
            if "pdfaidPart" in response:
                part = response["pdfaidPart"]
                if part not in [e.value for e in PDFAIDPart]:
                    self.logger.warning(f"Invalid pdfaidPart: {part}, using fallback: 2")
                    response["pdfaidPart"] = PDFAIDPart.PART_2.value
            
            # Validate pdfaidConformance
            if "pdfaidConformance" in response:
                conformance = response["pdfaidConformance"]
                if conformance not in [e.value for e in PDFAIDConformance]:
                    self.logger.warning(f"Invalid pdfaidConformance: {conformance}, using fallback: A")
                    response["pdfaidConformance"] = PDFAIDConformance.A.value
            
            # Validate confidence
            if "confidence" in response:
                conf = response["confidence"]
                if not isinstance(conf, (int, float)) or not (0.0 <= conf <= 1.0):
                    self.logger.warning(f"Invalid confidence: {conf}, using fallback: 0.8")
                    response["confidence"] = 0.8
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error validating PDF metadata: {e}")
            return self._get_fallback_pdf_metadata()
    
    def _get_fallback_document_classification(self) -> Dict[str, Any]:
        """Fallback for document classification"""
        return {
            "documentType": DocumentType.NOT_DOCUMENT.value,
            "language": Language.VI.value,
            "isContract": False,
            "confidence": 0.5
        }
    
    def _get_fallback_contract_analysis(self) -> Dict[str, Any]:
        """Fallback for contract analysis"""
        return {
            "type": ContractType.OTHERS.value,
            "currency": Currency.VND.value,
            "priority": Priority.MEDIUM.value,
            "confidentiality": Confidentiality.INTERNAL.value,
            "parties": [{"type": PartyType.CLIENT.value}],
            "payment": {"method": PaymentMethod.BANK_TRANSFER.value},
            "risk": {"level": RiskLevel.MEDIUM.value},
            "compliance": {"status": ComplianceStatus.PENDING_REVIEW.value}
        }
    
    def _get_fallback_ocr_processing(self) -> Dict[str, Any]:
        """Fallback for OCR processing"""
        return {
            "status": OCRStatus.COMPLETED.value,
            "engine": OCREngine.GEMINI_VISION.value,
            "confidence": 0.8,
            "text": "",
            "processingTime": 0.0,
            "error": None
        }
    
    def _get_fallback_content_extraction(self) -> Dict[str, Any]:
        """Fallback for content extraction"""
        return {
            "status": ExtractionStatus.SUCCESS.value,
            "method": ExtractionMethod.DIRECT.value,
            "confidence": 0.8,
            "extractedText": "",
            "sections": [],
            "keyTerms": [],
            "processingTime": 0.0,
            "error": None
        }
        
    def _get_fallback_summarization(self) -> Dict[str, Any]:
        """Fallback for summarization"""
        return {
            "status": SummarizationStatus.SUCCESS.value,
            "confidence": 0.8,
            "summary": "",
            "keyPoints": [],
            "wordCount": 0,
            "processingTime": 0.0,
            "error": None
        }
    
    def _get_fallback_processing_status(self) -> Dict[str, Any]:
        """Fallback for processing status"""
        return {
            "status": ProcessingStatus.COMPLETED.value,
            "confidence": 0.8,
            "steps": [],
            "totalProcessingTime": 0.0,
            "error": None
        }
    
    def _get_fallback_technical_metadata(self) -> Dict[str, Any]:
        """Fallback for technical metadata"""
        return {
            "encoding": Encoding.UTF8.value,
            "lineEnding": LineEnding.LF.value,
            "compression": Compression.NONE.value,
            "fileSize": 0,
            "characterCount": 0,
            "lineCount": 0,
            "confidence": 0.8
        }
    
    def _get_fallback_pdf_metadata(self) -> Dict[str, Any]:
        """Fallback for PDF metadata"""
        return {
            "dcFormat": DCFormat.APPLICATION_PDF.value,
            "pdfaidPart": PDFAIDPart.PART_2.value,
            "pdfaidConformance": PDFAIDConformance.A.value,
            "pageCount": 0,
            "pdfVersion": "1.7",
            "title": None,
            "author": None,
            "creator": None,
            "producer": None,
            "creationDate": None,
            "modificationDate": None,
            "confidence": 0.8
        }