import asyncio
import json
from typing import Optional
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from datetime import datetime
import uuid

from config import settings
from services.file_service import FileManagementService


class GFMSKafkaWorker:
    def __init__(self):
        self.bootstrap_servers: str = settings.kafka_bootstrap_servers
        self.file_events_topic: str = settings.kafka_file_events_topic
        self.gfms_events_topic: str = settings.kafka_gfms_events_topic
        self.client_id: str = settings.kafka_client_id
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.producer: Optional[AIOKafkaProducer] = None
        self.file_service = FileManagementService()

    async def start(self):
        """Khởi động Kafka consumer và producer"""
        if self.consumer is None:
            self.consumer = AIOKafkaConsumer(
                self.file_events_topic,
                bootstrap_servers=self.bootstrap_servers,
                client_id=self.client_id,
                group_id=f"{self.client_id}-group",
                enable_auto_commit=True,
                auto_offset_reset="latest",
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            )
            await self.consumer.start()

        if self.producer is None:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                client_id=self.client_id,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks="all",
            )
            await self.producer.start()

    async def stop(self):
        """Dừng Kafka consumer và producer"""
        if self.consumer:
            try:
                await self.consumer.stop()
            finally:
                self.consumer = None
        if self.producer:
            try:
                await self.producer.stop()
            finally:
                self.producer = None

    async def run(self):
        """Chạy vòng lặp tiêu thụ messages"""
        assert self.consumer is not None
        async for msg in self.consumer:
            try:
                await self._handle_message(msg.value)
            except Exception as e:
                # best-effort, avoid crashing worker
                print(f"Error handling message: {e}")
                continue

    async def _handle_message(self, message: dict):
        """Xử lý message từ Kafka"""
        event_type = message.get("eventType")
        if event_type != "FileUploaded":
            return

        data = message.get("data", {})
        actor = message.get("actor", {})
        
        # Tạo fileRecord (ghi nhận user tạo)
        file_id = str(data.get("fileId") or data.get("key") or uuid.uuid4())
        filename = str(data.get("filename") or "unknown")
        
        # TODO: Lưu vào database thực tế
        # Hiện tại chỉ tạo event để publish
        
        if not self.producer:
            return

        # Publish file-record-created event
        record_created_event = {
            "eventVersion": "v1",
            "eventType": "FileRecordCreated",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": settings.service_name,
            "correlationId": message.get("correlationId") or uuid.uuid4().hex,
            "actor": actor,  # Giữ nguyên user info để audit
            "data": {
                "fileId": file_id,
                "filename": filename,
                "bucket": data.get("bucket"),
                "key": data.get("key"),
                "url": data.get("url"),
                "folder": data.get("folder"),
                "contentType": data.get("contentType"),
                "size": data.get("size"),
                "createdBy": actor.get("userId", "unknown"),
                "createdAt": datetime.utcnow().isoformat() + "Z"
            },
            "metadata": {
                "serviceVersion": "1.0.0",
                "processingTime": datetime.utcnow().isoformat() + "Z"
            }
        }

        try:
            await self.producer.send_and_wait(
                self.gfms_events_topic,
                record_created_event,
                key=str(file_id).encode("utf-8"),
            )
            print(f"✅ Published FileRecordCreated for file: {filename}")
        except Exception as e:
            print(f"❌ Failed to publish FileRecordCreated: {e}")


# Singleton instance
worker = GFMSKafkaWorker()
