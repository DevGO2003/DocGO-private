"""
Enum Validator Utilities

This module provides utility functions for validating enum values
in AI responses across DocGO Automation Service.

Key Features:
- Comprehensive enum validation
- Fallback value assignment
- Error reporting and logging
- Type checking and conversion
"""

import logging
from typing import Dict, Any, List, Optional, Union
from services.prompt_templates import PromptTemplates

logger = logging.getLogger(__name__)


class EnumValidator:
    """Utility class for validating enum values"""
    
    @staticmethod
    def validate_enum_value(value: Any, valid_values: List[str], field_name: str, 
                          fallback_value: str = None) -> Dict[str, Any]:
        """
        Validate a single enum value
        
        Args:
            value: Value to validate
            valid_values: List of valid enum values
            field_name: Name of the field for error reporting
            fallback_value: Fallback value if validation fails
            
        Returns:
            Dict with validation result
        """
        result = {
            "valid": False,
            "value": value,
            "corrected_value": fallback_value,
            "error": None
        }
        
        try:
            # Convert to string if needed
            if isinstance(value, (int, float)):
                value = str(value)
            
            # Check if value is in valid list
            if value in valid_values:
                result["valid"] = True
                result["value"] = value
                result["corrected_value"] = value
            else:
                result["error"] = f"Invalid {field_name}: '{value}'. Must be one of: {', '.join(valid_values)}"
                if fallback_value and fallback_value in valid_values:
                    result["corrected_value"] = fallback_value
                    logger.warning(f"[ENUM_VALIDATION] {result['error']}. Using fallback: {fallback_value}")
                else:
                    logger.error(f"[ENUM_VALIDATION] {result['error']}. No valid fallback available.")
                    
        except Exception as e:
            result["error"] = f"Error validating {field_name}: {str(e)}"
            logger.error(f"[ENUM_VALIDATION_ERROR] {result['error']}")
            
        return result
    
    @staticmethod
    def validate_document_type(value: Any) -> Dict[str, Any]:
        """Validate document type enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.DOCUMENT_TYPES, 
            "documentType", 
            "NOT_DOCUMENT"
        )
    
    @staticmethod
    def validate_language(value: Any) -> Dict[str, Any]:
        """Validate language enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.LANGUAGES, 
            "language", 
            "vi"
        )
    
    @staticmethod
    def validate_contract_type(value: Any) -> Dict[str, Any]:
        """Validate contract type enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.CONTRACT_TYPES, 
            "contractType", 
            "OTHERS"
        )
    
    @staticmethod
    def validate_currency(value: Any) -> Dict[str, Any]:
        """Validate currency enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.CURRENCIES, 
            "currency", 
            "VND"
        )
    
    @staticmethod
    def validate_priority(value: Any) -> Dict[str, Any]:
        """Validate priority enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PRIORITIES, 
            "priority", 
            "MEDIUM"
        )
    
    @staticmethod
    def validate_risk_level(value: Any) -> Dict[str, Any]:
        """Validate risk level enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.RISK_LEVELS, 
            "riskLevel", 
            "MEDIUM"
        )
    
    @staticmethod
    def validate_confidentiality(value: Any) -> Dict[str, Any]:
        """Validate confidentiality enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.CONFIDENTIALITY_LEVELS, 
            "confidentiality", 
            "INTERNAL"
        )
    
    @staticmethod
    def validate_party_type(value: Any) -> Dict[str, Any]:
        """Validate party type enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PARTY_TYPES, 
            "partyType", 
            "CLIENT"
        )
    
    @staticmethod
    def validate_payment_method(value: Any) -> Dict[str, Any]:
        """Validate payment method enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PAYMENT_METHODS, 
            "paymentMethod", 
            "BANK_TRANSFER"
        )
    
    @staticmethod
    def validate_payment_status(value: Any) -> Dict[str, Any]:
        """Validate payment status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PAYMENT_STATUSES, 
            "paymentStatus", 
            "PENDING"
        )
    
    @staticmethod
    def validate_reminder_type(value: Any) -> Dict[str, Any]:
        """Validate reminder type enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.REMINDER_TYPES, 
            "reminderType", 
            "MILESTONE_REVIEW"
        )
    
    @staticmethod
    def validate_reminder_status(value: Any) -> Dict[str, Any]:
        """Validate reminder status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.REMINDER_STATUSES, 
            "reminderStatus", 
            "PENDING"
        )
    
    @staticmethod
    def validate_risk_factor_type(value: Any) -> Dict[str, Any]:
        """Validate risk factor type enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.RISK_FACTOR_TYPES, 
            "riskFactorType", 
            "TECHNICAL"
        )
    
    @staticmethod
    def validate_compliance_status(value: Any) -> Dict[str, Any]:
        """Validate compliance status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.COMPLIANCE_STATUSES, 
            "complianceStatus", 
            "PENDING_REVIEW"
        )
    
    @staticmethod
    def validate_ocr_status(value: Any) -> Dict[str, Any]:
        """Validate OCR status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.OCR_STATUSES, 
            "ocrStatus", 
            "FAILED"
        )
    
    @staticmethod
    def validate_ocr_engine(value: Any) -> Dict[str, Any]:
        """Validate OCR engine enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.OCR_ENGINES, 
            "ocrEngine", 
            "TESSERACT"
        )
    
    @staticmethod
    def validate_extraction_status(value: Any) -> Dict[str, Any]:
        """Validate extraction status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.EXTRACTION_STATUSES, 
            "extractionStatus", 
            "FAILED"
        )
    
    @staticmethod
    def validate_extraction_method(value: Any) -> Dict[str, Any]:
        """Validate extraction method enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.EXTRACTION_METHODS, 
            "extractionMethod", 
            "DIRECT"
        )
    
    @staticmethod
    def validate_summarization_status(value: Any) -> Dict[str, Any]:
        """Validate summarization status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.SUMMARIZATION_STATUSES, 
            "summarizationStatus", 
            "FAILED"
        )
    
    @staticmethod
    def validate_processing_status(value: Any) -> Dict[str, Any]:
        """Validate processing status enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PROCESSING_STATUSES, 
            "processingStatus", 
            "FAILED"
        )
    
    @staticmethod
    def validate_encoding(value: Any) -> Dict[str, Any]:
        """Validate encoding enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.ENCODINGS, 
            "encoding", 
            "UTF-8"
        )
    
    @staticmethod
    def validate_line_ending(value: Any) -> Dict[str, Any]:
        """Validate line ending enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.LINE_ENDINGS, 
            "lineEnding", 
            "LF"
        )
    
    @staticmethod
    def validate_compression(value: Any) -> Dict[str, Any]:
        """Validate compression enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.COMPRESSIONS, 
            "compression", 
            "NONE"
        )
    
    @staticmethod
    def validate_pdf_format(value: Any) -> Dict[str, Any]:
        """Validate PDF format enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PDF_FORMATS, 
            "pdfFormat", 
            "application/pdf"
        )
    
    @staticmethod
    def validate_pdf_part(value: Any) -> Dict[str, Any]:
        """Validate PDF part enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PDF_PARTS, 
            "pdfPart", 
            "3"
        )
    
    @staticmethod
    def validate_pdf_conformance(value: Any) -> Dict[str, Any]:
        """Validate PDF conformance enum"""
        return EnumValidator.validate_enum_value(
            value, 
            PromptTemplates.PDF_CONFORMANCES, 
            "pdfConformance", 
            "B"
        )
    
    @staticmethod
    def validate_boolean(value: Any, field_name: str) -> Dict[str, Any]:
        """
        Validate boolean value
        
        Args:
            value: Value to validate
            field_name: Name of the field for error reporting
            
        Returns:
            Dict with validation result
        """
        result = {
            "valid": False,
            "value": value,
            "corrected_value": False,
            "error": None
        }
        
        try:
            if isinstance(value, bool):
                result["valid"] = True
                result["value"] = value
                result["corrected_value"] = value
            elif isinstance(value, str):
                if value.lower() in ['true', '1', 'yes', 'on']:
                    result["valid"] = True
                    result["value"] = True
                    result["corrected_value"] = True
                elif value.lower() in ['false', '0', 'no', 'off']:
                    result["valid"] = True
                    result["value"] = False
                    result["corrected_value"] = False
                else:
                    result["error"] = f"Invalid boolean {field_name}: '{value}'. Must be true/false"
                    result["corrected_value"] = False
                    logger.warning(f"[BOOLEAN_VALIDATION] {result['error']}. Using fallback: False")
            else:
                result["error"] = f"Invalid boolean {field_name}: '{value}'. Must be boolean"
                result["corrected_value"] = False
                logger.warning(f"[BOOLEAN_VALIDATION] {result['error']}. Using fallback: False")
                
        except Exception as e:
            result["error"] = f"Error validating boolean {field_name}: {str(e)}"
            result["corrected_value"] = False
            logger.error(f"[BOOLEAN_VALIDATION_ERROR] {result['error']}")
            
        return result
    
    @staticmethod
    def validate_number(value: Any, field_name: str, min_value: float = None, 
                      max_value: float = None) -> Dict[str, Any]:
        """
        Validate number value
        
        Args:
            value: Value to validate
            field_name: Name of the field for error reporting
            min_value: Minimum allowed value
            max_value: Maximum allowed value
            
        Returns:
            Dict with validation result
        """
        result = {
            "valid": False,
            "value": value,
            "corrected_value": 0.0,
            "error": None
        }
        
        try:
            # Convert to float
            if isinstance(value, (int, float)):
                num_value = float(value)
            elif isinstance(value, str):
                num_value = float(value)
            else:
                result["error"] = f"Invalid number {field_name}: '{value}'. Must be numeric"
                result["corrected_value"] = 0.0
                logger.warning(f"[NUMBER_VALIDATION] {result['error']}. Using fallback: 0.0")
                return result
            
            # Check range
            if min_value is not None and num_value < min_value:
                result["error"] = f"Number {field_name}: {num_value} is below minimum {min_value}"
                result["corrected_value"] = min_value
                logger.warning(f"[NUMBER_VALIDATION] {result['error']}. Using fallback: {min_value}")
                return result
            
            if max_value is not None and num_value > max_value:
                result["error"] = f"Number {field_name}: {num_value} is above maximum {max_value}"
                result["corrected_value"] = max_value
                logger.warning(f"[NUMBER_VALIDATION] {result['error']}. Using fallback: {max_value}")
                return result
            
            result["valid"] = True
            result["value"] = num_value
            result["corrected_value"] = num_value
            
        except Exception as e:
            result["error"] = f"Error validating number {field_name}: {str(e)}"
            result["corrected_value"] = 0.0
            logger.error(f"[NUMBER_VALIDATION_ERROR] {result['error']}")
            
        return result
    
    @staticmethod
    def validate_string(value: Any, field_name: str, max_length: int = None, 
                      allow_empty: bool = True) -> Dict[str, Any]:
        """
        Validate string value
        
        Args:
            value: Value to validate
            field_name: Name of the field for error reporting
            max_length: Maximum allowed length
            allow_empty: Whether empty strings are allowed
            
        Returns:
            Dict with validation result
        """
        result = {
            "valid": False,
            "value": value,
            "corrected_value": "",
            "error": None
        }
        
        try:
            # Convert to string
            str_value = str(value) if value is not None else ""
            
            # Check empty
            if not allow_empty and not str_value.strip():
                result["error"] = f"String {field_name} cannot be empty"
                result["corrected_value"] = "Unknown"
                logger.warning(f"[STRING_VALIDATION] {result['error']}. Using fallback: 'Unknown'")
                return result
            
            # Check length
            if max_length is not None and len(str_value) > max_length:
                result["error"] = f"String {field_name}: length {len(str_value)} exceeds maximum {max_length}"
                result["corrected_value"] = str_value[:max_length]
                logger.warning(f"[STRING_VALIDATION] {result['error']}. Truncating to: {result['corrected_value']}")
                return result
            
            result["valid"] = True
            result["value"] = str_value
            result["corrected_value"] = str_value
            
        except Exception as e:
            result["error"] = f"Error validating string {field_name}: {str(e)}"
            result["corrected_value"] = "Unknown"
            logger.error(f"[STRING_VALIDATION_ERROR] {result['error']}")
            
        return result
    
    @staticmethod
    def validate_iso_date(value: Any, field_name: str) -> Dict[str, Any]:
        """
        Validate ISO 8601 date string
        
        Args:
            value: Value to validate
            field_name: Name of the field for error reporting
            
        Returns:
            Dict with validation result
        """
        result = {
            "valid": False,
            "value": value,
            "corrected_value": "2024-01-01T00:00:00Z",
            "error": None
        }
        
        try:
            from datetime import datetime
            
            if isinstance(value, str):
                # Try to parse ISO 8601 format
                try:
                    datetime.fromisoformat(value.replace('Z', '+00:00'))
                    result["valid"] = True
                    result["value"] = value
                    result["corrected_value"] = value
                except ValueError:
                    result["error"] = f"Invalid ISO date {field_name}: '{value}'. Must be ISO 8601 format"
                    result["corrected_value"] = "2024-01-01T00:00:00Z"
                    logger.warning(f"[DATE_VALIDATION] {result['error']}. Using fallback: {result['corrected_value']}")
            else:
                result["error"] = f"Invalid date {field_name}: '{value}'. Must be string"
                result["corrected_value"] = "2024-01-01T00:00:00Z"
                logger.warning(f"[DATE_VALIDATION] {result['error']}. Using fallback: {result['corrected_value']}")
                
        except Exception as e:
            result["error"] = f"Error validating date {field_name}: {str(e)}"
            result["corrected_value"] = "2024-01-01T00:00:00Z"
            logger.error(f"[DATE_VALIDATION_ERROR] {result['error']}")
            
        return result