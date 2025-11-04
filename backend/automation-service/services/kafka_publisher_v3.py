"""
Kafka Publisher v3 - Event Architecture v3
Publishes events to unified topic: docgo-file-events

Event Types:
- FILE_UPLOAD_COMPLETED: Create skeleton with defaults
- FILE_CONTENT_EXTRACTED: Deep merge content section
- CONTRACT_SUMMARY_GENERATED: Deep merge contract section
"""

import json
from datetime import datetime
from typing import Dict, Any
from aiokafka import AIOKafkaProducer

from config import Config
from utils.uuid_generator import generate_uuid_v7


class KafkaPublisherV3:
    """Kafka Publisher for Event Architecture v3"""
    
    def __init__(self):
        self.producer: AIOKafkaProducer = None
        self.topic = "docgo-file-events"
        self.bootstrap_servers = Config.KAFKA_BOOTSTRAP_SERVERS
        self.client_id = "automation-service"
    
    async def start(self):
        """Initialize Kafka producer"""
        if self.producer is None:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                client_id=self.client_id,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                # Performance optimizations for DocGO workflow
                acks=1,  # Wait for leader only (faster than 'all')
                compression_type='lz4',  # Lower latency than gzip
                linger_ms=5,  # Reduced for faster delivery (AI workflow needs quick response)
                batch_size=65536,  # 64KB batch size (larger for file metadata)
                max_request_size=10485760,  # 10MB max request (AI results can be large)
                request_timeout_ms=30000,  # 30s timeout for large AI analysis results
                retry_backoff_ms=100,  # Quick retry for transient errors
            )
            await self.producer.start()
            print(f"✅ Kafka Publisher V3 started: {self.bootstrap_servers} (optimized for DocGO)")
    
    async def stop(self):
        """Stop Kafka producer"""
        if self.producer:
            await self.producer.stop()
            print("🛑 Kafka Publisher V3 stopped")
    
    async def publish_event(
        self,
        event_type: str,
        document_id: str,
        data: Dict[str, Any],
        actor: str = "system",
        correlation_id: str = None
    ) -> Dict[str, Any]:
        """
        Publish event to Kafka
        
        Args:
            event_type: FILE_UPLOAD_COMPLETED, FILE_CONTENT_EXTRACTED, CONTRACT_SUMMARY_GENERATED
            document_id: UUID v7 of the document
            data: Event data payload
            actor: Actor performing action (default: "system")
            correlation_id: Request correlation ID (generated if not provided)
        
        Returns:
            Published event payload
        """
        try:
            # Generate IDs if not provided
            event_id = generate_uuid_v7()
            if not correlation_id:
                correlation_id = generate_uuid_v7()
            
            # Build event payload
            event = {
                "eventVersion": "1.0",
                "eventType": event_type,
                "eventId": event_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "source": "automation-service",
                "correlationId": correlation_id,
                "actor": actor,
                "data": data
            }
            
            # Publish to Kafka
            await self.producer.send_and_wait(self.topic, event)
            
            print(f"✅ Published {event_type} for document {document_id} (eventId: {event_id})")
            return event
            
        except Exception as e:
            print(f"❌ Failed to publish {event_type}: {e}")
            raise
    
    async def publish_file_upload_completed(
        self,
        document_id: str,
        file_name: str,
        mime_type: str,
        size: int,
        owner_user_id: str,
        storage: Dict[str, Any],
        metadata: Dict[str, Any],
        actor: str = "system",
        correlation_id: str = None
    ) -> Dict[str, Any]:
        """
        EVENT 1: FILE_UPLOAD_COMPLETED
        Create document skeleton with basic metadata
        Timing: 0-2s after S3 upload
        """
        data = {
            "documentId": document_id,
            "fileName": file_name,
            "mimeType": mime_type,
            "size": size,
            "ownerUserId": owner_user_id,
            "storage": storage,
            "metadata": metadata
        }
        
        return await self.publish_event(
            event_type="FILE_UPLOAD_COMPLETED",
            document_id=document_id,
            data=data,
            actor=actor,
            correlation_id=correlation_id
        )
    
    async def publish_file_content_extracted(
        self,
        document_id: str,
        content: Dict[str, Any],
        metadata: Dict[str, Any] = None,
        actor: str = "system",
        correlation_id: str = None
    ) -> Dict[str, Any]:
        """
        EVENT 2: FILE_CONTENT_EXTRACTED
        Add content + AI classification
        Timing: 1-10s after Event 1
        """
        data = {
            "documentId": document_id,
            "content": content
        }
        
        if metadata:
            data["metadata"] = metadata
        
        return await self.publish_event(
            event_type="FILE_CONTENT_EXTRACTED",
            document_id=document_id,
            data=data,
            actor=actor,
            correlation_id=correlation_id
        )
    
    async def publish_contract_summary_generated(
        self,
        document_id: str,
        contract: Dict[str, Any],
        actor: str = "system",
        correlation_id: str = None
    ) -> Dict[str, Any]:
        """
        EVENT 3: CONTRACT_SUMMARY_GENERATED
        Add contract analysis (conditional: only if isContract=true)
        Timing: 10-30s after Event 1
        """
        data = {
            "documentId": document_id,
            "contract": contract
        }
        
        return await self.publish_event(
            event_type="CONTRACT_SUMMARY_GENERATED",
            document_id=document_id,
            data=data,
            actor=actor,
            correlation_id=correlation_id
        )


# Global instance
kafka_publisher_v3 = KafkaPublisherV3()
