#!/usr/bin/env python3
"""
Background task for async document processing
"""
import asyncio
import logging
from typing import Dict, Any
from services.ocr_service import OCRService
from services.ai_processing_service import AutomationService
from services.file_service import FileStorageService
from services.websocket_manager import WebSocketManager
# from services.event_service import EventService  # DISABLED - Requires Redis
from services.file_api_builder import build_file_api_payload
from datetime import datetime, timezone
import httpx
import json
from aiokafka import AIOKafkaConsumer
from config import Config
import uuid
from services.progress_manager import progress_manager
from services.websocket_manager import websocket_manager
from services.ai_processing_service import AIProcessingService
from services.audit_service import AuditService
from services.kafka_publisher_v3 import KafkaPublisherV3

logger = logging.getLogger(__name__)

class AsyncUploadProcessor:
    def __init__(self):
        self.ocr_service = OCRService()
        self.ai_service = AIProcessingService()
        self.audit_service = AuditService()
        self.publisher = KafkaPublisherV3()
        self.consumer = AIOKafkaConsumer(
            'upload-processing-queue',
            bootstrap_servers=Config.KAFKA_BOOTSTRAP_SERVERS,
            group_id='automation-upload-processors',
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='earliest'
        )
    
    async def start_consumer(self):
        await self.consumer.start()
    
    async def stop_consumer(self):
        await self.consumer.stop()
    
    async def process_upload_event(self, event):
        correlation_id = event.get('correlationId', str(uuid.uuid4()))
        file_id = event['fileId']
        repo_id = event.get('repository_id')
        user_id = event.get('user_id')
        
        try:
            # Init progress
            await progress_manager.set_progress(correlation_id, 0, "Starting processing")
            await websocket_manager.broadcast_progress(correlation_id, 0, "Starting processing", "Bắt đầu xử lý file")
            
            # Step 1: OCR/Extract (25%)
            logger.info(f"OCR for {file_id}")
            ocr_result = await self.ocr_service.extract(file_id)
            await progress_manager.set_progress(correlation_id, 25, "OCR completed")
            await websocket_manager.broadcast_progress(correlation_id, 25, "OCR completed", "Trích xuất văn bản hoàn tất")
            
            # Step 2: AI Analysis (50%)
            analysis = await self.ai_service.analyze(ocr_result, repo_id)
            await progress_manager.set_progress(correlation_id, 50, "AI analysis done")
            await websocket_manager.broadcast_progress(correlation_id, 50, "AI analysis done", "Phân tích AI hoàn tất")
            
            # Step 3: Contract Summary if needed (75%)
            if analysis.get('isContract'):
                summary = await self.ai_service.generate_summary(ocr_result)
                await progress_manager.set_progress(correlation_id, 75, "Summary generated")
                await websocket_manager.broadcast_progress(correlation_id, 75, "Summary generated", "Tạo tóm tắt hợp đồng")
            
            # Step 4: Audit & Complete (100%)
            await self.audit_service.log_upload(file_id, user_id, repo_id)
            await progress_manager.set_progress(correlation_id, 100, "Completed")
            await websocket_manager.broadcast_progress(correlation_id, 100, "Completed", "Xử lý hoàn tất thành công")
            
            # Publish done event
            await self.publisher.publish('file-processed', {
                'fileId': file_id,
                'status': 'completed',
                'analysis': analysis,
                'correlationId': correlation_id
            })
            
        except Exception as e:
            error_msg = f"Error processing {file_id}: {str(e)}"
            logger.error(error_msg)
            await progress_manager.set_progress(correlation_id, -1, "Error")
            await websocket_manager.broadcast_progress(correlation_id, -1, "Error", error_msg)
            # Publish error event
            await self.publisher.publish('processing-failed', {'fileId': file_id, 'error': str(e), 'correlationId': correlation_id})
    
    async def run(self):
        await self.start_consumer()
        try:
            async for msg in self.consumer:
                await self.process_upload_event(msg.value)
        finally:
            await self.stop_consumer()

# Global instance
upload_processor = AsyncUploadProcessor()
