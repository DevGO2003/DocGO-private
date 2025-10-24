from fastapi import UploadFile
from app.services.ai.contract_analyzer import ContractAnalyzer
from app.services.ocr.ocr_orchestrator import OCROrchestrator
from app.services.event.publisher import EventPublisher
from app.utils.uuid_generator import UUIDv7Generator
import logging

class DocumentProcessor:
    def __init__(self):
        self.contract_analyzer = ContractAnalyzer()
        self.ocr_orchestrator = OCROrchestrator()
        self.event_publisher = EventPublisher()
        self.uuid_generator = UUIDv7Generator()

    async def process_file(self, file: UploadFile) -> dict:
        """Process uploaded file"""
        try:
            # Generate file ID
            file_id = self.uuid_generator.generate()
            
            # Extract text using OCR
            ocr_result = await self.ocr_orchestrator.extract_text(file)
            
            # Analyze contract if it's a contract document
            analysis_result = None
            if self._is_contract_document(file):
                analysis_result = await self.contract_analyzer.analyze_contract(ocr_result.get('text', ''))
            
            # Publish events
            await self.event_publisher.publish_file_metadata_recorded(file_id, file)
            await self.event_publisher.publish_file_plaintext_extracted(file_id, ocr_result)
            
            if analysis_result:
                await self.event_publisher.publish_contract_summary_generated(file_id, analysis_result)
            
            return {
                "fileId": file_id,
                "fileName": file.filename,
                "ocrResult": ocr_result,
                "analysisResult": analysis_result
            }
            
        except Exception as e:
            logging.error(f"Error processing file: {e}")
            raise

    async def process_text(self, text: str) -> dict:
        """Process text data"""
        try:
            file_id = self.uuid_generator.generate()
            
            # Analyze contract
            analysis_result = await self.contract_analyzer.analyze_contract(text)
            
            # Publish events
            await self.event_publisher.publish_file_plaintext_extracted(file_id, {"text": text})
            
            if analysis_result:
                await self.event_publisher.publish_contract_summary_generated(file_id, analysis_result)
            
            return {
                "fileId": file_id,
                "text": text,
                "analysisResult": analysis_result
            }
            
        except Exception as e:
            logging.error(f"Error processing text: {e}")
            raise

    def _is_contract_document(self, file: UploadFile) -> bool:
        """Check if file is a contract document"""
        contract_keywords = ['contract', 'agreement', 'hop dong', 'thoa thuan']
        filename = file.filename.lower() if file.filename else ""
        return any(keyword in filename for keyword in contract_keywords)
