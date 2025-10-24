"""
Upload Handler - File Upload Processing

Responsibilities:
- Generate UUID v7 for documentId
- Upload file to S3
- Publish FILE_UPLOAD_COMPLETED event
"""

import logging
from typing import Dict, Any, Optional
from utils.uuid_generator import uuid7
from services.kafka_publisher_v3 import KafkaPublisherV3

logger = logging.getLogger(__name__)


class UploadHandler:
    """Handle file upload and publish Event 1"""
    
    def __init__(self, kafka_publisher: KafkaPublisherV3, s3_client=None):
        self.kafka_publisher = kafka_publisher
        self.s3_client = s3_client
        
    def handle_upload(self, file_data: bytes, file_name: str, mime_type: str,
                     owner_user_id: str, correlation_id: str, actor: str) -> Dict[str, Any]:
        """
        Handle file upload
        
        Args:
            file_data: File content bytes
            file_name: Original filename
            mime_type: MIME type
            owner_user_id: Owner user ID
            correlation_id: Request correlation ID
            actor: Actor performing action
            
        Returns:
            Dict with documentId and upload result
        """
        try:
            # Generate UUID v7
            document_id = str(uuid7())
            logger.info(f"\n{'='*80}")
            logger.info(f"📤 UPLOAD HANDLER STARTED")
            logger.info(f"{'='*80}")
            logger.info(f"Generated documentId (UUID v7): {document_id}")
            logger.info(f"File: {file_name} | Size: {len(file_data)} bytes | MIME: {mime_type}")
            logger.info(f"Owner: {owner_user_id} | Actor: {actor} | CorrelationId: {correlation_id}")
            
            # Upload to S3 (mock for now)
            s3_result = self._upload_to_s3(document_id, file_data, file_name, mime_type)
            logger.info(f"Uploaded to S3: {s3_result}")
            
            # Prepare event payload
            event_payload = self._prepare_event_payload(
                document_id, file_name, mime_type, len(file_data),
                owner_user_id, s3_result
            )
            
            # Publish Event 1: FILE_UPLOAD_COMPLETED
            event_id = self.kafka_publisher.publish_event(
                event_type="FILE_UPLOAD_COMPLETED",
                document_id=document_id,
                event_data=event_payload,
                correlation_id=correlation_id,
                actor=actor
            )
            
            logger.info(f"Published FILE_UPLOAD_COMPLETED: eventId={event_id}, documentId={document_id}")
            
            logger.info(f"✅ EVENT 1 PUBLISHED: {event_id}")
            logger.info(f"{'='*80}\n")
            
            return {
                "success": True,
                "documentId": document_id,
                "eventId": event_id,
                "s3_result": s3_result
            }
            
        except Exception as e:
            logger.error(f"❌ Error handling upload: {str(e)}", exc_info=True)
            logger.error(f"{'='*80}\n")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _is_valid_uuid_v7(self, uuid_str: str) -> bool:
        """Validate UUID format (accept both v4 and v7)"""
        try:
            # Accept both UUID v4 and v7 formats
            parts = uuid_str.split('-')
            if len(parts) != 5:
                return False
            
            # Check version (3rd group should start with 4 or 7)
            version = parts[2][0]
            if version not in ['4', '7']:
                logger.warning(f"⚠️ UUID version is {version}, expected 4 or 7")
                return False
            
            return True
        except Exception as e:
            logger.error(f"UUID validation error: {str(e)}")
            return False
    
    def _upload_to_s3(self, document_id: str, file_data: bytes, 
                     file_name: str, mime_type: str) -> Dict[str, Any]:
        """Upload file to S3"""
        # TODO: Implement S3 upload
        # For now, return mock result
        logger.info(f"📤 Uploading to S3: {file_name}")
        
        # Validate documentId is UUID v7
        if not self._is_valid_uuid_v7(document_id):
            logger.error(f"❌ Invalid UUID v7: {document_id}")
            raise ValueError(f"Invalid UUID v7 format: {document_id}")
        
        s3_result = {
            "url": f"https://docgo-storage.s3.amazonaws.com/documents/{document_id}/{file_name}",
            "bucket": "docgo-storage",
            "objectKey": f"documents/{document_id}/{file_name}",
            "region": "us-east-1",
            "contentType": mime_type,
            "size": len(file_data),
            "versionId": "v1.0",
            "checksum": {
                "md5": "abc123...",
                "sha256": "def456..."
            }
        }
        
        logger.info(f"✅ S3 upload mock: {s3_result['objectKey']}")
        return s3_result
    
    def _prepare_event_payload(self, document_id: str, file_name: str, mime_type: str,
                              file_size: int, owner_user_id: str, 
                              s3_result: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare FILE_UPLOAD_COMPLETED event payload"""
        return {
            "documentId": document_id,
            "fileName": file_name,
            "mimeType": mime_type,
            "size": file_size,
            "ownerUserId": owner_user_id,
            "storage": {
                "s3": s3_result
            },
            "metadata": {
                "file": {
                    "name": file_name,
                    "mimeType": mime_type,
                    "size": file_size,
                    "hash": {
                        "md5": "abc123...",
                        "sha256": "def456..."
                    }
                },
                "fileSystem": {
                    "dateAdded": "2025-10-23T10:00:00Z",
                    "dateModified": "2025-10-23T10:00:00Z",
                    "originalFilename": file_name,
                    "originalMD5": "abc123...",
                    "originalFileSize": file_size,
                    "originalMimeType": mime_type
                }
            }
        }
