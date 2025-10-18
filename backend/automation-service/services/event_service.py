import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Callable
# import motor.motor_asyncio  # MongoDB removed
import redis.asyncio as redis

from config import Config
from schemas.event_schemas import (
    EventPayload, EventType, EventStatus, EventHandlerRequest,
    EventHandlerResponse, EventSubscriptionRequest, EventSubscriptionResponse,
    EventPublishRequest, EventPublishResponse, EventHistoryRequest,
    EventHistoryResponse, WebSocketEvent
)

class EventService:
    def __init__(self):
        # MongoDB removed - Automation Service không cần database
        self.redis_url = Config.get_redis_url()
        self.redis_password = Config.get_redis_password()
        self.redis_db = Config.get_redis_db()
        self.event_config = Config.get_event_config()
        
        # Initialize connections
        # MongoDB client removed
        self.redis_client = None
        self.pubsub = None
        self.kafka_producer = None
        
        # Event handlers
        self.handlers: Dict[str, Callable] = {}
        self.subscriptions: Dict[str, str] = {}  # channel -> subscription_id
        
    async def initialize(self):
        
        try:
            # MongoDB connection removed
            
            # Redis connection
            redis_params = {"url": self.redis_url, "db": self.redis_db}
            if self.redis_password:
                redis_params["password"] = self.redis_password
            self.redis_client = redis.from_url(**redis_params)
            
            # Create pubsub
            self.pubsub = self.redis_client.pubsub()
            
            print("EventService initialized successfully")
        except Exception as e:
            print(f"Error initializing EventService: {e}")
            raise

    async def close(self):
        
        if self.pubsub:
            await self.pubsub.close()
        # MongoDB client removed
        if self.redis_client:
            await self.redis_client.close()
        # Close Kafka producer
        if self.kafka_producer:
            try:
                await self.kafka_producer.stop()
            except Exception:
                pass

    async def publish_event(self, request: EventPublishRequest) -> EventPublishResponse:
        
        try:
            # Publish event
            await self.redis_client.publish(
                request.channel,
                json.dumps(request.event.model_dump(), default=str)
            )
            
            # MongoDB operations removed - Automation Service không cần database
            await self._save_event(request.event)
            
            return EventPublishResponse(
                success=True,
                message=f"Event published to channel {request.channel}",
                published_at=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            print(f"Error publishing event: {e}")
            return EventPublishResponse(
                success=False,
                message=f"Failed to publish event: {str(e)}",
                published_at=datetime.now(timezone.utc)
            )

    async def publish_kafka(self, topic: str, message: Dict[str, Any]) -> None:
        """Publish a message to Kafka using a shared AIOKafkaProducer.
        Fallback to print if Kafka not configured.
        """
        try:
            from aiokafka import AIOKafkaProducer  # local import to avoid hard dep at import time
            if self.kafka_producer is None:
                self.kafka_producer = AIOKafkaProducer(
                    bootstrap_servers=Config.KAFKA_BOOTSTRAP_SERVERS,
                    client_id=getattr(Config, 'KAFKA_CLIENT_ID', 'automation-service'),
                    value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                )
                await self.kafka_producer.start()
            preview = json.dumps(message, default=str)
            print(f"[DEBUG] Kafka publish start topic={topic} bootstrap={Config.KAFKA_BOOTSTRAP_SERVERS} size={len(preview)} preview={preview[:200]}")
            await self.kafka_producer.send_and_wait(topic, message)
            print(f"[DEBUG] Kafka publish done topic={topic}")
        except Exception as e:
            print(f"[WARN] Kafka publish failed ({topic}): {e}. Message: {json.dumps(message)[:500]}")

    async def subscribe_to_events(self, request: EventSubscriptionRequest) -> EventSubscriptionResponse:
        
        try:
            subscription_id = str(uuid.uuid4())
            
            # Subscribe to channels
            for channel in request.channels:
                await self.pubsub.subscribe(channel)
                self.subscriptions[channel] = subscription_id
            
            # Start listening for events
            asyncio.create_task(self._listen_for_events(request.handler_type, request.auto_ack))
            
            return EventSubscriptionResponse(
                subscription_id=subscription_id,
                channels=request.channels,
                status="active",
                created_at=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            print(f"Error subscribing to events: {e}")
            raise

    async def _listen_for_events(self, handler_type: Optional[str] = None, auto_ack: bool = True):
        
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        # Parse event
                        event_data = json.loads(message["data"])
                        event = EventPayload(**event_data)
                        
                        # Determine handler type from event or fallback
                        effective_handler_type = getattr(event, "eventType", None) or handler_type or "default"
                        await self._handle_event(event, effective_handler_type, auto_ack)
                        
                    except Exception as e:
                        print(f"Error processing event: {e}")
                        
        except Exception as e:
            print(f"Error listening for events: {e}")

    async def _handle_event(self, event: EventPayload, handler_type: str, auto_ack: bool = True):
        
        try:
            # Tìm handler phù hợp
            handler = self.handlers.get(handler_type)
            if not handler:
                print(f"No handler found for type: {handler_type}")
                return
            
            # Tạo handler request
            handler_request = EventHandlerRequest(
                event=event,
                handler_type=handler_type,
                retry_count=0,
                max_retries=3
            )
            
            # Gọi handler
            response = await handler(handler_request)
            
            # Log kết quả
            print(f"Event {event.eventId} handled: {response.success}")
            
        except Exception as e:
            print(f"Error handling event {event.eventId}: {e}")

    def register_handler(self, handler_type: str, handler: Callable):
        
        self.handlers[handler_type] = handler
        print(f"Handler registered for type: {handler_type}")

    async def _save_event(self, event: EventPayload):
        # MongoDB persistence disabled in Automation Service
        return

    async def get_event_history(
        self,
        page: int = 1,
        limit: int = 10,
        event_type: Optional[EventType] = None,
        source: Optional[str] = None,
        status: Optional[EventStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> EventHistoryResponse:
        
        # MongoDB removed - return empty history
        return EventHistoryResponse(events=[], total=0, page=page, limit=limit, total_pages=0)

    async def create_event(
        self,
        event_type: EventType,
        source: str,
        data: Dict[str, Any],
        correlation_id: Optional[str] = None,
        actor: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> EventPayload:
        
        try:
            event = EventPayload(
                eventVersion="v1",
                eventType=event_type,
                eventId=str(uuid.uuid4()),
                timestamp=datetime.now(timezone.utc),
                source=source,
                correlationId=correlation_id or str(uuid.uuid4()),
                actor=actor,
                data=data,
                metadata=metadata
            )
            
            return event
            
        except Exception as e:
            print(f"Error creating event: {e}")
            raise

    async def publish_websocket_event(
        self,
        event_type: str,
        data: Dict[str, Any],
        user_id: Optional[str] = None
    ):
        
        try:
            websocket_event = WebSocketEvent(
                event_type=event_type,
                data=data,
                timestamp=datetime.now(timezone.utc),
                user_id=user_id
            )
            
            # Publish to WebSocket channel
            await self.redis_client.publish(
                "websocket_events",
                json.dumps(websocket_event.model_dump(), default=str)
            )
            
        except Exception as e:
            print(f"Error publishing WebSocket event: {e}")

    async def handle_file_metadata_recorded_event(self, request: EventHandlerRequest) -> EventHandlerResponse:
        
        try:
            event = request.event
            
            # Xử lý file metadata recorded
            print(f"Processing file metadata recorded event: {event.eventId}")
            
            return EventHandlerResponse(
                success=True,
                message="File metadata recorded event processed successfully",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )
            
        except Exception as e:
            print(f"Error handling file metadata recorded event: {e}")
            return EventHandlerResponse(
                success=False,
                message=f"Failed to process file metadata recorded event: {str(e)}",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )

    async def handle_file_plaintext_extracted_event(self, request: EventHandlerRequest) -> EventHandlerResponse:
        
        try:
            event = request.event
            
            # Xử lý file plaintext extracted
            print(f"Processing file plaintext extracted event: {event.eventId}")
            
            return EventHandlerResponse(
                success=True,
                message="File plaintext extracted event processed successfully",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )
            
        except Exception as e:
            print(f"Error handling file plaintext extracted event: {e}")
            return EventHandlerResponse(
                success=False,
                message=f"Failed to process file plaintext extracted event: {str(e)}",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )

    async def handle_contract_summary_generated_event(self, request: EventHandlerRequest) -> EventHandlerResponse:
        
        try:
            event = request.event
            
            # Xử lý contract summary generated
            print(f"Processing contract summary generated event: {event.eventId}")
            
            return EventHandlerResponse(
                success=True,
                message="Contract summary generated event processed successfully",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )
            
        except Exception as e:
            print(f"Error handling contract summary generated event: {e}")
            return EventHandlerResponse(
                success=False,
                message=f"Failed to process contract summary generated event: {str(e)}",
                processed_at=datetime.now(timezone.utc),
                retry_count=request.retry_count
            )

    async def start_event_processing(self):
        
        try:
            # Đăng ký các handlers cho 3 event cần thiết
            self.register_handler("file.metadata.recorded", self.handle_file_metadata_recorded_event)
            self.register_handler("file.plaintext.extracted", self.handle_file_plaintext_extracted_event)
            self.register_handler("contract.summary.generated", self.handle_contract_summary_generated_event)
            
            # Subscribe to channels
            subscription_request = EventSubscriptionRequest(
                channels=list(self.event_config.get("channels", {}).values()),
                handler_type="default",
                auto_ack=True
            )
            
            await self.subscribe_to_events(subscription_request)
            
            print("Event processing started with 3 essential events")
            
        except Exception as e:
            print(f"Error starting event processing: {e}")
            raise
