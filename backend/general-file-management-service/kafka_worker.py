import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from config import settings


class GFMSKafkaWorker:
    def __init__(self) -> None:
        self.bootstrap_servers: str = settings.kafka_bootstrap_servers
        self.file_events_topic: str = settings.kafka_file_events_topic
        self.gfms_events_topic: str = settings.kafka_gfms_events_topic
        self.client_id: str = settings.kafka_client_id
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.producer: Optional[AIOKafkaProducer] = None
        self._task: Optional[asyncio.Task] = None
        self._stopping: bool = False

    async def start(self) -> None:
        if self.consumer is None:
            self.consumer = AIOKafkaConsumer(
                self.file_events_topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=f"{self.client_id}-group",
                client_id=self.client_id,
                enable_auto_commit=True,
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

        self._stopping = False
        self._task = asyncio.create_task(self._consume_loop())

    async def stop(self) -> None:
        self._stopping = True
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

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

    async def _consume_loop(self) -> None:
        assert self.consumer is not None
        async for msg in self.consumer:
            try:
                event = msg.value
                if not isinstance(event, dict):
                    continue
                if event.get("eventType") != "FileUploaded":
                    continue

                await self._handle_file_uploaded(event)
            except Exception:
                # best-effort; keep the loop alive
                continue

    async def _handle_file_uploaded(self, event: dict) -> None:
        if not self.producer:
            return

        data = event.get("data", {})

        # Simulate creation of a file record in GFMS (no DB wired here)
        file_record = {
            "fileId": data.get("fileId") or data.get("key") or uuid.uuid4().hex,
            "filename": data.get("filename"),
            "contentType": data.get("contentType"),
            "size": data.get("size"),
            "bucket": data.get("bucket"),
            "key": data.get("key"),
            "url": data.get("url"),
            "folder": data.get("folder"),
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "status": "CREATED",
        }

        file_record_created_event = {
            "eventVersion": "v1",
            "eventType": "FileRecordCreated",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "general-file-management-service",
            "correlationId": event.get("correlationId") or uuid.uuid4().hex,
            "actor": event.get("actor", {}),
            "data": file_record,
            "metadata": {"serviceVersion": "1.0.0"},
        }

        key_bytes = str(file_record.get("fileId") or file_record.get("key") or "").encode("utf-8")
        await self.producer.send_and_wait(self.gfms_events_topic, file_record_created_event, key=key_bytes)
        print(f"✅ GFMS Published FileRecordCreated for file: {file_record.get('filename')}")


worker = GFMSKafkaWorker()

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
