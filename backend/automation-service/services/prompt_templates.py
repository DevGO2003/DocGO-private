"""
Prompt Templates for Gemini AI with Enum Validation

This module provides standardized prompt templates for Gemini AI to ensure
consistent enum values in responses across DocGO Automation Service.

Key Features:
- Enum validation for all response fields
- Vietnamese language support
- JSON-only output format
- Fallback values for uncertain cases
- Comprehensive validation rules
"""

import logging
import os
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class PromptTemplates:
    """Standardized prompt templates for Gemini AI"""
    
    # Enum definitions for validation
    DOCUMENT_TYPES = [
        "CONTRACT", "INVOICE", "MEMO", "REPORT", "AGREEMENT", "NOT_DOCUMENT"
    ]
    
    LANGUAGES = ["vi", "en", "fr", "zh"]
    
    CONTRACT_TYPES = [
        "SERVICE_AGREEMENT", "PURCHASE_AGREEMENT", "PARTNERSHIP_AGREEMENT",
        "EMPLOYMENT_CONTRACT", "SALES_CONTRACT", "LEASE_AGREEMENT",
        "LICENSE_AGREEMENT", "NON_DISCLOSURE_AGREEMENT", "SOFTWARE_DEVELOPMENT",
        "CONSULTING_AGREEMENT", "OTHERS"
    ]
    
    CURRENCIES = ["USD", "VND", "EUR", "JPY"]
    
    PRIORITIES = ["HIGH", "MEDIUM", "LOW"]
    
    RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"]
    
    CONFIDENTIALITY_LEVELS = ["CONFIDENTIAL", "INTERNAL", "PUBLIC", "RESTRICTED"]
    
    PARTY_TYPES = ["CLIENT", "VENDOR", "PARTNER", "GUARANTOR"]
    
    PAYMENT_METHODS = ["BANK_TRANSFER", "CREDIT_CARD", "WIRE", "CHECK", "CASH", "DIGITAL_WALLET"]
    
    PAYMENT_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"]
    
    REMINDER_TYPES = ["PAYMENT_DUE", "MILESTONE_REVIEW", "EXPIRY_WARNING", "CONTRACT_RENEWAL"]
    
    REMINDER_STATUSES = ["PENDING", "SENT", "RESOLVED", "OVERDUE"]
    
    RISK_FACTOR_TYPES = ["TECHNICAL", "SCHEDULE", "FINANCIAL", "LEGAL", "OPERATIONAL"]
    
    COMPLIANCE_STATUSES = ["COMPLIANT", "NON_COMPLIANT", "PENDING_REVIEW", "IN_AUDIT"]
    
    OCR_STATUSES = ["COMPLETED", "FAILED", "PROCESSING", "SKIPPED"]
    
    OCR_ENGINES = ["GEMINI_VISION", "TESSERACT", "TESSERACT_FALLBACK", "PADDLEOCR"]
    
    EXTRACTION_STATUSES = ["SUCCESS", "PARTIAL", "FAILED"]
    
    EXTRACTION_METHODS = ["DIRECT", "OCR", "HYBRID"]
    
    SUMMARIZATION_STATUSES = ["SUCCESS", "FAILED", "SKIPPED"]
    
    PROCESSING_STATUSES = ["COMPLETED", "PROCESSING", "FAILED"]
    
    ENCODINGS = ["UTF-8", "UTF-16", "ASCII"]
    
    LINE_ENDINGS = ["LF", "CRLF"]
    
    COMPRESSIONS = ["NONE", "GZIP", "DEFLATE"]
    
    PDF_FORMATS = ["application/pdf", "text/plain", "application/json", "unknown"]
    
    PDF_PARTS = ["1", "2", "3"]
    
    PDF_CONFORMANCES = ["A", "B", "U"]
    
    @staticmethod
    def _load_prompt_template(template_name: str) -> str:
        """Load prompt template from file"""
        try:
            # Get the directory of this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level to automation-service directory
            service_dir = os.path.dirname(current_dir)
            # Construct path to prompts directory
            prompts_dir = os.path.join(service_dir, "prompts")
            template_path = os.path.join(prompts_dir, f"{template_name}.txt")
            
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load prompt template {template_name}: {e}")
            return f"Error loading template: {template_name}"
    
    @staticmethod
    def get_document_classification_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for document classification (Event 2)
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("document_classification")
        return template.format(
            extracted_text=extracted_text[:4000],
            filename=filename
        )

    @staticmethod
    def get_contract_analysis_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for contract analysis (Event 3)
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("contract_analysis")
        return template.format(
            extracted_text=extracted_text[:6000],
            filename=filename
        )

    @staticmethod
    def get_ocr_processing_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for OCR processing status
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("ocr_processing")
        return template.format(
            extracted_text=extracted_text[:2000],
            filename=filename
        )

    @staticmethod
    def get_content_extraction_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for content extraction status
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("content_extraction")
        return template.format(
            extracted_text=extracted_text[:3000],
            filename=filename
        )

    @staticmethod
    def get_summarization_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for summarization status
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("summarization")
        return template.format(
            extracted_text=extracted_text[:4000],
            filename=filename
        )

    @staticmethod
    def get_processing_status_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for processing status
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("processing_status")
        return template.format(
            content_length=len(extracted_text),
            filename=filename
        )

    @staticmethod
    def get_technical_metadata_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for technical metadata extraction
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("technical_metadata")
        return template.format(
            content_length=len(extracted_text),
            filename=filename
        )

    @staticmethod
    def get_pdf_metadata_prompt(extracted_text: str, filename: str) -> str:
        """
        Template for PDF metadata extraction
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Formatted prompt string
        """
        template = PromptTemplates._load_prompt_template("pdf_metadata")
        return template.format(
            extracted_text=extracted_text[:2000],
            filename=filename
        )


class PromptValidator:
    """Validate AI responses against enum constraints"""
    
    @staticmethod
    def validate_document_classification(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate document classification response"""
        errors = []
        
        # Validate documentType
        if "documentType" in response:
            if response["documentType"] not in PromptTemplates.DOCUMENT_TYPES:
                errors.append(f"Invalid documentType: {response['documentType']}")
                response["documentType"] = "NOT_DOCUMENT"  # Fallback
        
        # Validate language
        if "language" in response:
            if response["language"] not in PromptTemplates.LANGUAGES:
                errors.append(f"Invalid language: {response['language']}")
                response["language"] = "vi"  # Fallback
        
        # Validate isContract
        if "isContract" in response:
            if not isinstance(response["isContract"], bool):
                errors.append(f"Invalid isContract: {response['isContract']}")
                response["isContract"] = False  # Fallback
        
        # Validate confidence
        if "confidence" in response:
            if not isinstance(response["confidence"], (int, float)) or not (0.0 <= response["confidence"] <= 1.0):
                errors.append(f"Invalid confidence: {response['confidence']}")
                response["confidence"] = 0.5  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_contract_analysis(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate contract analysis response"""
        errors = []
        
        # Validate type
        if "type" in response:
            if response["type"] not in PromptTemplates.CONTRACT_TYPES:
                errors.append(f"Invalid contract type: {response['type']}")
                response["type"] = "OTHERS"  # Fallback
        
        # Validate currency
        if "currency" in response:
            if response["currency"] not in PromptTemplates.CURRENCIES:
                errors.append(f"Invalid currency: {response['currency']}")
                response["currency"] = "VND"  # Fallback
        
        # Validate priority
        if "priority" in response:
            if response["priority"] not in PromptTemplates.PRIORITIES:
                errors.append(f"Invalid priority: {response['priority']}")
                response["priority"] = "MEDIUM"  # Fallback
        
        # Validate confidentiality
        if "confidentiality" in response:
            if response["confidentiality"] not in PromptTemplates.CONFIDENTIALITY_LEVELS:
                errors.append(f"Invalid confidentiality: {response['confidentiality']}")
                response["confidentiality"] = "INTERNAL"  # Fallback
        
        # Validate risk level
        if "risk" in response and "level" in response["risk"]:
            if response["risk"]["level"] not in PromptTemplates.RISK_LEVELS:
                errors.append(f"Invalid risk level: {response['risk']['level']}")
                response["risk"]["level"] = "MEDIUM"  # Fallback
        
        # Validate compliance status
        if "compliance" in response and "status" in response["compliance"]:
            if response["compliance"]["status"] not in PromptTemplates.COMPLIANCE_STATUSES:
                errors.append(f"Invalid compliance status: {response['compliance']['status']}")
                response["compliance"]["status"] = "PENDING_REVIEW"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_ocr_processing(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate OCR processing response"""
        errors = []
        
        # Validate status
        if "status" in response:
            if response["status"] not in PromptTemplates.OCR_STATUSES:
                errors.append(f"Invalid OCR status: {response['status']}")
                response["status"] = "FAILED"  # Fallback
        
        # Validate engine
        if "engine" in response:
            if response["engine"] not in PromptTemplates.OCR_ENGINES:
                errors.append(f"Invalid OCR engine: {response['engine']}")
                response["engine"] = "TESSERACT"  # Fallback
        
        # Validate confidence
        if "confidence" in response:
            if not isinstance(response["confidence"], (int, float)) or not (0.0 <= response["confidence"] <= 1.0):
                errors.append(f"Invalid confidence: {response['confidence']}")
                response["confidence"] = 0.5  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_extraction_status(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extraction status response"""
        errors = []
        
        # Validate status
        if "status" in response:
            if response["status"] not in PromptTemplates.EXTRACTION_STATUSES:
                errors.append(f"Invalid extraction status: {response['status']}")
                response["status"] = "FAILED"  # Fallback
        
        # Validate method
        if "method" in response:
            if response["method"] not in PromptTemplates.EXTRACTION_METHODS:
                errors.append(f"Invalid extraction method: {response['method']}")
                response["method"] = "DIRECT"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_summarization_status(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate summarization status response"""
        errors = []
        
        # Validate status
        if "status" in response:
            if response["status"] not in PromptTemplates.SUMMARIZATION_STATUSES:
                errors.append(f"Invalid summarization status: {response['status']}")
                response["status"] = "FAILED"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_processing_status(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate processing status response"""
        errors = []
        
        # Validate status
        if "status" in response:
            if response["status"] not in PromptTemplates.PROCESSING_STATUSES:
                errors.append(f"Invalid processing status: {response['status']}")
                response["status"] = "FAILED"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_technical_metadata(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate technical metadata response"""
        errors = []
        
        # Validate encoding
        if "encoding" in response:
            if response["encoding"] not in PromptTemplates.ENCODINGS:
                errors.append(f"Invalid encoding: {response['encoding']}")
                response["encoding"] = "UTF-8"  # Fallback
        
        # Validate line ending
        if "lineEnding" in response:
            if response["lineEnding"] not in PromptTemplates.LINE_ENDINGS:
                errors.append(f"Invalid line ending: {response['lineEnding']}")
                response["lineEnding"] = "LF"  # Fallback
        
        # Validate compression
        if "compression" in response:
            if response["compression"] not in PromptTemplates.COMPRESSIONS:
                errors.append(f"Invalid compression: {response['compression']}")
                response["compression"] = "NONE"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }
    
    @staticmethod
    def validate_pdf_metadata(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate PDF metadata response"""
        errors = []
        
        # Validate dcFormat
        if "dcFormat" in response:
            if response["dcFormat"] not in PromptTemplates.PDF_FORMATS:
                errors.append(f"Invalid dcFormat: {response['dcFormat']}")
                response["dcFormat"] = "application/pdf"  # Fallback
        
        # Validate pdfaidPart
        if "pdfaidPart" in response:
            if str(response["pdfaidPart"]) not in PromptTemplates.PDF_PARTS:
                errors.append(f"Invalid pdfaidPart: {response['pdfaidPart']}")
                response["pdfaidPart"] = "3"  # Fallback
        
        # Validate pdfaidConformance
        if "pdfaidConformance" in response:
            if response["pdfaidConformance"] not in PromptTemplates.PDF_CONFORMANCES:
                errors.append(f"Invalid pdfaidConformance: {response['pdfaidConformance']}")
                response["pdfaidConformance"] = "B"  # Fallback
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "response": response
        }

