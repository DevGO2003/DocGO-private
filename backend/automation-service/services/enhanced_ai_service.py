"""
Enhanced AI Service with Enum Validation

This service provides improved AI processing with strict enum validation
for Gemini AI responses in DocGO Automation Service.

Key Features:
- Enum validation for all AI responses
- Fallback values for invalid responses
- Comprehensive error handling
- Standardized prompt templates
- Response validation and correction
"""

import logging
import json
import time
import random
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from services.prompt_templates import PromptTemplates, PromptValidator
from utils.enum_validator import EnumValidator
from config import Config

logger = logging.getLogger(__name__)


class EnhancedAIService:
    """Enhanced AI service with enum validation"""
    
    def __init__(self):
        self.api_key = Config.get_gemini_api_key()
        genai.configure(api_key=self.api_key)
        
        # Initialize Gemini model
        import os
        env_model = os.getenv('GEMINI_MODEL', '').strip()
        models_to_try = ([env_model] if env_model else []) + [
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro'
        ]
        
        model_initialized = False
        for model_name in models_to_try:
            try:
                self.model = genai.GenerativeModel(model_name)
                logger.info(f"[ENHANCED_AI_SERVICE] Initialized with {model_name}")
                model_initialized = True
                break
            except Exception as e:
                logger.warning(f"[AI_MODEL_FALLBACK] Failed to initialize {model_name}: {e}")
                continue
        
        if not model_initialized:
            raise Exception("Could not initialize any Gemini model")
        
        # Initialize enum validator
        self.enum_validator = EnumValidator()
        logger.info("[ENHANCED_AI_SERVICE] Enum validator initialized")
    
    def classify_document(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Classify document with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with classification result and validation status
        """
        try:
            logger.info(f"[DOCUMENT_CLASSIFICATION] Starting classification for: {filename}")
            
            # Get prompt template with enum validation
            prompt = self._load_prompt_template(
                "document_classification_enum",
                extractedText=extracted_text[:8000] if extracted_text else ""
            )
            
            # Generate response
            response = self._generate_ai_response(prompt, "document_classification")
            
            if not response:
                return self._get_fallback_classification(filename)
            
            # Validate response with enum validator
            validated_response = self.enum_validator.validate_document_classification(response)
            
            logger.info(f"[DOCUMENT_CLASSIFICATION] Completed for: {filename}")
            return {
                "success": True,
                "classification": validated_response,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[DOCUMENT_CLASSIFICATION_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "classification": self._get_fallback_classification(filename),
                "filename": filename
            }
    
    def analyze_contract(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Analyze contract with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with contract analysis result and validation status
        """
        try:
            logger.info(f"[CONTRACT_ANALYSIS] Starting analysis for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_contract_analysis_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "contract_analysis")
            
            if not response:
                return self._get_fallback_contract_analysis(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_contract_analysis(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[CONTRACT_ANALYSIS] Completed for: {filename}")
            return {
                "success": True,
                "analysis": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[CONTRACT_ANALYSIS_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis": self._get_fallback_contract_analysis(filename),
                "filename": filename
            }
    
    def process_ocr_status(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process OCR status with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with OCR processing result and validation status
        """
        try:
            logger.info(f"[OCR_PROCESSING] Starting OCR status for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_ocr_processing_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "ocr_processing")
            
            if not response:
                return self._get_fallback_ocr_status(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_ocr_processing(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[OCR_PROCESSING] Completed for: {filename}")
            return {
                "success": True,
                "ocr": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[OCR_PROCESSING_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "ocr": self._get_fallback_ocr_status(filename),
                "filename": filename
            }
    
    def process_extraction_status(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process extraction status with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with extraction result and validation status
        """
        try:
            logger.info(f"[EXTRACTION_PROCESSING] Starting extraction status for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_content_extraction_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "content_extraction")
            
            if not response:
                return self._get_fallback_extraction_status(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_extraction_status(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[EXTRACTION_PROCESSING] Completed for: {filename}")
            return {
                "success": True,
                "extraction": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[EXTRACTION_PROCESSING_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "extraction": self._get_fallback_extraction_status(filename),
                "filename": filename
            }
    
    def process_summarization_status(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process summarization status with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with summarization result and validation status
        """
        try:
            logger.info(f"[SUMMARIZATION_PROCESSING] Starting summarization status for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_summarization_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "summarization")
            
            if not response:
                return self._get_fallback_summarization_status(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_summarization_status(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[SUMMARIZATION_PROCESSING] Completed for: {filename}")
            return {
                "success": True,
                "summarization": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[SUMMARIZATION_PROCESSING_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "summarization": self._get_fallback_summarization_status(filename),
                "filename": filename
            }
    
    def process_processing_status(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process overall processing status with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with processing result and validation status
        """
        try:
            logger.info(f"[PROCESSING_STATUS] Starting processing status for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_processing_status_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "processing_status")
            
            if not response:
                return self._get_fallback_processing_status(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_processing_status(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[PROCESSING_STATUS] Completed for: {filename}")
            return {
                "success": True,
                "processing": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[PROCESSING_STATUS_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "processing": self._get_fallback_processing_status(filename),
                "filename": filename
            }
    
    def process_technical_metadata(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process technical metadata with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with technical metadata result and validation status
        """
        try:
            logger.info(f"[TECHNICAL_METADATA] Starting technical metadata for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_technical_metadata_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "technical_metadata")
            
            if not response:
                return self._get_fallback_technical_metadata(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_technical_metadata(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[TECHNICAL_METADATA] Completed for: {filename}")
            return {
                "success": True,
                "technical": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[TECHNICAL_METADATA_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "technical": self._get_fallback_technical_metadata(filename),
                "filename": filename
            }
    
    def process_pdf_metadata(self, extracted_text: str, filename: str) -> Dict[str, Any]:
        """
        Process PDF metadata with enum validation
        
        Args:
            extracted_text: Extracted text content
            filename: Original filename
            
        Returns:
            Dict with PDF metadata result and validation status
        """
        try:
            logger.info(f"[PDF_METADATA] Starting PDF metadata for: {filename}")
            
            # Get prompt template
            prompt = PromptTemplates.get_pdf_metadata_prompt(extracted_text, filename)
            
            # Generate response
            response = self._generate_ai_response(prompt, "pdf_metadata")
            
            if not response:
                return self._get_fallback_pdf_metadata(filename)
            
            # Validate response
            validation_result = PromptValidator.validate_pdf_metadata(response)
            
            if not validation_result["valid"]:
                logger.warning(f"[VALIDATION_ERRORS] {validation_result['errors']}")
            
            logger.info(f"[PDF_METADATA] Completed for: {filename}")
            return {
                "success": True,
                "pdf": validation_result["response"],
                "validation": validation_result,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"[PDF_METADATA_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "pdf": self._get_fallback_pdf_metadata(filename),
                "filename": filename
            }
    
    def _generate_ai_response(self, prompt: str, task_type: str) -> Optional[Dict[str, Any]]:
        """
        Generate AI response with retry logic
        
        Args:
            prompt: Prompt string
            task_type: Type of task for logging
            
        Returns:
            Dict with AI response or None if failed
        """
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries):
            try:
                logger.info(f"[AI_GENERATION] Attempt {attempt + 1}/{max_retries} for {task_type}")
                
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    logger.warning(f"[AI_EMPTY_RESPONSE] Empty response for {task_type}")
                    return None
                
                # Parse JSON response
                response_text = response.text.strip()
                
                # Clean up response text
                cleaned = self._clean_response_text(response_text)
                
                # Try to find JSON in the response
                json_start = cleaned.find('{')
                json_end = cleaned.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    cleaned = cleaned[json_start:json_end]
                
                parsed = json.loads(cleaned)
                logger.info(f"[AI_GENERATION_SUCCESS] Successfully generated response for {task_type}")
                return parsed
                
            except Exception as e:
                error_str = str(e)
                
                # Check for rate limit
                if "429" in error_str or "quota" in error_str.lower() or "rate" in error_str.lower():
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                        logger.warning(f"[AI_RATE_LIMIT_RETRY] Rate limit hit, retrying in {delay:.1f}s")
                        time.sleep(delay)
                        continue
                    else:
                        logger.error(f"[AI_RATE_LIMIT_EXHAUSTED] All retry attempts exhausted for {task_type}")
                        return None
                else:
                    logger.error(f"[AI_GENERATION_ERROR] Error generating response for {task_type}: {e}")
                    if attempt < max_retries - 1:
                        time.sleep(base_delay)
                        continue
                    return None
        
        return None
    
    def _clean_response_text(self, response_text: str) -> str:
        """Clean AI response text"""
        cleaned = response_text
        
        # Remove markdown code blocks
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        
        return cleaned.strip()
    
    def _get_fallback_classification(self, filename: str) -> Dict[str, Any]:
        """Get fallback classification when AI fails"""
        return {
            "documentType": "NOT_DOCUMENT",
            "language": "vi",
            "isContract": False,
            "confidence": 0.5
        }
    
    def _get_fallback_contract_analysis(self, filename: str) -> Dict[str, Any]:
        """Get fallback contract analysis when AI fails"""
        return {
            "type": "OTHERS",
            "currency": "VND",
            "priority": "MEDIUM",
            "confidentiality": "INTERNAL",
            "parties": [],
            "payment": {"method": "BANK_TRANSFER"},
            "risk": {"level": "MEDIUM"},
            "compliance": {"status": "PENDING_REVIEW"}
        }
    
    def _get_fallback_ocr_status(self, filename: str) -> Dict[str, Any]:
        """Get fallback OCR status when AI fails"""
        return {
            "status": "FAILED",
            "engine": "TESSERACT",
            "confidence": 0.0,
            "processingTime": 0.0
        }
    
    def _get_fallback_extraction_status(self, filename: str) -> Dict[str, Any]:
        """Get fallback extraction status when AI fails"""
        return {
            "status": "FAILED",
            "method": "DIRECT",
            "characterCount": 0,
            "wordCount": 0
        }
    
    def _get_fallback_summarization_status(self, filename: str) -> Dict[str, Any]:
        """Get fallback summarization status when AI fails"""
        return {
            "status": "FAILED",
            "model": "gemini-1.5-flash",
            "processingTime": 0.0,
            "inputTokens": 0,
            "outputTokens": 0
        }
    
    def _get_fallback_processing_status(self, filename: str) -> Dict[str, Any]:
        """Get fallback processing status when AI fails"""
        return {
            "status": "FAILED",
            "error": "AI processing failed",
            "processingTime": 0.0
        }
    
    def _get_fallback_technical_metadata(self, filename: str) -> Dict[str, Any]:
        """Get fallback technical metadata when AI fails"""
        return {
            "encoding": "UTF-8",
            "lineEnding": "LF",
            "compression": "NONE",
            "pages": 0,
            "wordCount": 0,
            "characterCount": 0
        }
    
    def _get_fallback_pdf_metadata(self, filename: str) -> Dict[str, Any]:
        """Get fallback PDF metadata when AI fails"""
        return {
            "dcFormat": "application/pdf",
            "dcTitle": "Unknown Document",
            "dcCreator": "Unknown",
            "dcDescription": "Document metadata extraction failed",
            "dcSubject": "Unknown",
            "xmpCreateDate": "2024-01-01T00:00:00Z",
            "xmpCreatorTool": "Unknown",
            "xmpModifyDate": "2024-01-01T00:00:00Z",
            "xmpMetadataDate": "2024-01-01T00:00:00Z",
            "xmpDocumentID": "unknown",
            "xmpInstanceID": "unknown",
            "pdfKeywords": "unknown",
            "pdfProducer": "Unknown",
            "pdfaidPart": "3",
            "pdfaidConformance": "B"
        }
    
    def _load_prompt_template(self, template_name: str, **kwargs) -> str:
        """Load prompt template from file and format with variables"""
        import os
        
        try:
            # Get the directory of this service
            service_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            prompts_dir = os.path.join(service_dir, "prompts")
            template_path = os.path.join(prompts_dir, f"{template_name}.txt")
            
            with open(template_path, 'r', encoding='utf-8') as f:
                template = f.read()
                
            # Format template with provided variables
            return template.format(**kwargs)
        except Exception as e:
            logger.error(f"Error loading prompt template {template_name}: {e}")
            # Fallback to basic template
            return f"Process the following content: {kwargs.get('extractedText', '')}"
