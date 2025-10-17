from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import uuid
from config import Config


class AuditService:
    """
    MongoDB Audit Service for Automation Service
    Logs events, processing sessions, and errors to MongoDB Atlas
    """
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.audit_logs = None
        self.processing_sessions = None
        self.error_logs = None
        self.enabled = Config.MONGODB_ENABLED
        
    async def initialize(self):
        """Initialize MongoDB connection"""
        if not self.enabled:
            print("MongoDB audit logging is disabled")
            return
            
        try:
            mongodb_uri = Config.get_mongodb_uri()
            self.client = AsyncIOMotorClient(mongodb_uri)
            self.db = self.client[Config.MONGODB_AUDIT_DATABASE]
            
            # Collections
            self.audit_logs = self.db[Config.MONGODB_AUDIT_LOGS_COLLECTION]
            self.processing_sessions = self.db[Config.MONGODB_PROCESSING_SESSIONS_COLLECTION]
            self.error_logs = self.db[Config.MONGODB_ERROR_LOGS_COLLECTION]
            
            # Create indexes
            await self.audit_logs.create_index("timestamp")
            await self.audit_logs.create_index("correlationId")
            await self.audit_logs.create_index("eventType")
            
            await self.processing_sessions.create_index("correlationId", unique=True)
            await self.processing_sessions.create_index("startedAt")
            await self.processing_sessions.create_index("status")
            
            await self.error_logs.create_index("timestamp")
            await self.error_logs.create_index("correlationId")
            await self.error_logs.create_index("errorType")
            
            print(f"AuditService initialized with database: {Config.MONGODB_AUDIT_DATABASE}")
            
        except Exception as e:
            print(f"Failed to initialize AuditService: {e}")
            raise
    
    async def log_event(self, event_data: Dict[str, Any]) -> str:
        """
        Log event to audit_logs collection and publish to Kafka
        
        Args:
            event_data: Event data containing eventType, correlationId, actor, data, etc.
            
        Returns:
            Event ID
        """
        event_id = str(uuid.uuid4())
        
        # Save to MongoDB if enabled
        if self.enabled and self.audit_logs:
            try:
                document = {
                    "_id": event_id,
                    "eventId": event_id,
                    "eventVersion": event_data.get("eventVersion", "v1"),
                    "eventType": event_data.get("eventType"),
                    "timestamp": datetime.now(timezone.utc),
                    "source": "automation-service",
                    "correlationId": event_data.get("correlationId"),
                    "actor": event_data.get("actor", {"userId": "system", "userRole": "system", "ip": None}),
                    "data": event_data.get("data", {}),
                    "metadata": event_data.get("metadata", {})
                }
                
                await self.audit_logs.insert_one(document)
                
            except Exception as e:
                print(f"Failed to log event to MongoDB: {e}")
        
        # Publish to Kafka (best-effort) using EventService when enabled
        try:
            if Config.KAFKA_ENABLED:
                from global_instances import event_service
                # Map event type to topic - CHỈ FILE EVENTS
                evt_type = (event_data.get("eventType") or "").lower()
                if "uploaded" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_UPLOADED_TOPIC", "file.uploaded")
                elif "processed" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_PROCESSED_TOPIC", "file.processed")
                elif "updated" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_UPDATED_TOPIC", "file.updated")
                elif "classified" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_CLASSIFIED_TOPIC", "file.classified")
                elif "analyzed" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_ANALYZED_TOPIC", "file.analyzed")
                elif "deleted" in evt_type:
                    topic = getattr(Config, "KAFKA_FILE_DELETED_TOPIC", "file.deleted")
                else:
                    topic = getattr(Config, "KAFKA_FILE_UPLOADED_TOPIC", "file.uploaded")  # default

                payload = {
                    "eventVersion": "v1",
                    "eventType": event_data.get("eventType"),
                    "eventId": event_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "source": "automation-service",
                    "correlationId": event_data.get("correlationId"),
                    "actor": event_data.get("actor", {"userId": "system", "userRole": "system", "ip": None}),
                    "data": event_data.get("data", {}),
                    "metadata": event_data.get("metadata", {"region": "local", "serviceVersion": "1.0.0"})
                }

                await event_service.publish_kafka(topic, payload)
        except Exception as e:
            print(f"Failed to publish Kafka event: {e}")
        
        return event_id
    
    async def log_processing_session(self, session_data: Dict[str, Any]) -> str:
        """
        Log processing session to processing_sessions collection
        
        Args:
            session_data: Session data containing correlationId, documentId, fileName, etc.
            
        Returns:
            Session ID (correlationId)
        """
        if not self.enabled or not self.processing_sessions:
            return session_data.get("correlationId", str(uuid.uuid4()))
            
        try:
            correlation_id = session_data.get("correlationId")
            document = {
                "_id": correlation_id,
                "correlationId": correlation_id,
                "documentId": session_data.get("documentId"),
                "fileName": session_data.get("fileName"),
                "fileSize": session_data.get("fileSize"),
                "contentType": session_data.get("contentType"),
                "startedAt": datetime.now(timezone.utc),
                "completedAt": None,
                "duration": None,
                "status": "PROCESSING",
                "steps": [],
                "errors": [],
                "metadata": session_data.get("metadata", {})
            }
            
            await self.processing_sessions.insert_one(document)
            return correlation_id
            
        except Exception as e:
            print(f"Failed to log processing session: {e}")
            return session_data.get("correlationId", str(uuid.uuid4()))
    
    async def update_processing_session(self, correlation_id: str, updates: Dict[str, Any]):
        """
        Update processing session
        
        Args:
            correlation_id: Correlation ID
            updates: Update data (status, completedAt, steps, errors, etc.)
        """
        if not self.enabled or not self.processing_sessions:
            return
            
        try:
            # Calculate duration if completedAt is provided
            if "completedAt" in updates and "startedAt" not in updates:
                session = await self.processing_sessions.find_one({"_id": correlation_id})
                if session and session.get("startedAt"):
                    duration = (updates["completedAt"] - session["startedAt"]).total_seconds()
                    updates["duration"] = duration
            
            await self.processing_sessions.update_one(
                {"_id": correlation_id},
                {"$set": updates}
            )
            
        except Exception as e:
            print(f"Failed to update processing session: {e}")
    
    async def add_session_step(self, correlation_id: str, step: Dict[str, Any]):
        """
        Add step to processing session
        
        Args:
            correlation_id: Correlation ID
            step: Step data (stepName, status, startedAt, completedAt, error)
        """
        if not self.enabled or not self.processing_sessions:
            return
            
        try:
            step_with_timestamp = {
                **step,
                "timestamp": datetime.now(timezone.utc)
            }
            
            await self.processing_sessions.update_one(
                {"_id": correlation_id},
                {"$push": {"steps": step_with_timestamp}}
            )
            
        except Exception as e:
            print(f"Failed to add session step: {e}")
    
    async def log_error(self, error_data: Dict[str, Any]) -> str:
        """
        Log error to error_logs collection
        
        Args:
            error_data: Error data containing correlationId, errorType, errorMessage, etc.
            
        Returns:
            Error ID
        """
        if not self.enabled or not self.error_logs:
            return str(uuid.uuid4())
            
        try:
            error_id = str(uuid.uuid4())
            document = {
                "_id": error_id,
                "errorId": error_id,
                "timestamp": datetime.now(timezone.utc),
                "correlationId": error_data.get("correlationId"),
                "errorType": error_data.get("errorType"),
                "errorMessage": error_data.get("errorMessage"),
                "errorStack": error_data.get("errorStack"),
                "step": error_data.get("step"),
                "retryable": error_data.get("retryable", False),
                "retryCount": error_data.get("retryCount", 0),
                "metadata": error_data.get("metadata", {})
            }
            
            await self.error_logs.insert_one(document)
            
            # Also add error to processing session
            if error_data.get("correlationId"):
                await self.processing_sessions.update_one(
                    {"_id": error_data["correlationId"]},
                    {"$push": {"errors": document}}
                )
            
            return error_id
            
        except Exception as e:
            print(f"Failed to log error: {e}")
            return str(uuid.uuid4())
    
    async def get_processing_session(self, correlation_id: str) -> Optional[Dict[str, Any]]:
        """Get processing session by correlation ID"""
        if not self.enabled or not self.processing_sessions:
            return None
            
        try:
            return await self.processing_sessions.find_one({"_id": correlation_id})
        except Exception as e:
            print(f"Failed to get processing session: {e}")
            return None
    
    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("AuditService closed")


# Singleton instance
audit_service = AuditService()
