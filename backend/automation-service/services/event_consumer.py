import asyncio
import json
import logging
from typing import Dict, Any
import redis.asyncio as redis
from services.document_processor import DocumentProcessor
from config import get_settings

logger = logging.getLogger(__name__)

class RedisEventConsumer:
    """
    Redis Event Consumer cho Automation Service
    Lắng nghe events từ Document Management Service và xử lý
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.document_processor = DocumentProcessor()
        self.redis_client = None
        self.is_running = False
        
        logger.info("Redis Event Consumer initialized")
    
    async def start(self):
        """Khởi động Redis consumer"""
        try:
            # Kết nối Redis
            self.redis_client = redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=True
            )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
            
            self.is_running = True
            
            # Subscribe to file uploaded events
            await self._subscribe_to_events()
            
        except Exception as e:
            logger.error(f"Failed to start Redis consumer: {str(e)}")
            raise
    
    async def stop(self):
        """Dừng Redis consumer"""
        self.is_running = False
        if self.redis_client:
            await self.redis_client.close()
        logger.info("Redis consumer stopped")
    
    async def _subscribe_to_events(self):
        """Subscribe to Redis channels"""
        try:
            # Subscribe to file uploaded events
            pubsub = self.redis_client.pubsub()
            await pubsub.subscribe("docgo:events:file-uploaded")
            
            logger.info("Subscribed to file uploaded events")
            
            # Listen for messages
            async for message in pubsub.listen():
                if not self.is_running:
                    break
                
                if message['type'] == 'message':
                    await self._handle_file_uploaded_event(message['data'])
                    
        except Exception as e:
            logger.error(f"Error in event subscription: {str(e)}")
            raise
    
    async def _handle_file_uploaded_event(self, event_data: str):
        """Xử lý FileUploaded event"""
        try:
            logger.info(f"Received file uploaded event: {event_data}")
            
            # Parse event data
            event = json.loads(event_data)
            
            # Extract event data
            document_id = event.get('documentId')
            file_id = event.get('fileId')
            file_type = event.get('fileType')
            s3_key = event.get('s3Key')
            s3_bucket = event.get('s3Bucket')
            
            if not all([document_id, file_id, file_type, s3_key, s3_bucket]):
                logger.error("Missing required fields in file uploaded event")
                return
            
            logger.info(f"Processing file uploaded event: documentId={document_id}, fileId={file_id}")
            
            # Process document
            result = await self.document_processor.process_document(
                file_id=file_id,
                document_id=document_id,
                file_type=file_type,
                s3_key=s3_key,
                s3_bucket=s3_bucket
            )
            
            logger.info(f"Document processing completed: documentId={document_id}, status={result.get('processing_status')}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse event data: {str(e)}")
        except Exception as e:
            logger.error(f"Error handling file uploaded event: {str(e)}")
    
    async def publish_document_processed_event(self, document_id: str, result: Dict[str, Any]):
        """Publish DocumentProcessed event"""
        try:
            event = {
                "eventId": f"doc-processed-{document_id}",
                "eventType": "DocumentProcessed",
                "timestamp": asyncio.get_event_loop().time(),
                "source": "automation-service",
                "correlationId": f"corr-{document_id}",
                "documentId": document_id,
                "ocrText": result.get("ocr_text", ""),
                "ocrStatus": result.get("ocr_status", "FAILED"),
                "classificationResult": result.get("classification_result"),
                "processingStatus": result.get("processing_status", "FAILED"),
                "processingError": result.get("processing_error"),
                "actor": "system",
                "region": "local",
                "serviceVersion": "1.0.0"
            }
            
            event_json = json.dumps(event)
            await self.redis_client.publish("docgo:events:document-processed", event_json)
            
            logger.info(f"Published document processed event: documentId={document_id}")
            
        except Exception as e:
            logger.error(f"Failed to publish document processed event: {str(e)}")

# Global instance
event_consumer = RedisEventConsumer()

async def start_event_consumer():
    """Khởi động event consumer"""
    await event_consumer.start()

async def stop_event_consumer():
    """Dừng event consumer"""
    await event_consumer.stop()


