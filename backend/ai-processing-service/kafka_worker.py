import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from config import (
    get_kafka_bootstrap_servers,
    get_kafka_file_events_topic,
    get_kafka_ai_events_topic,
    get_kafka_client_id,
)


class AIKafkaWorker:
    def __init__(self):
        self.bootstrap_servers: str = get_kafka_bootstrap_servers()
        self.file_events_topic: str = get_kafka_file_events_topic()
        self.ai_events_topic: str = get_kafka_ai_events_topic()
        self.client_id: str = get_kafka_client_id()
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
                # best-effort; avoid crashing the loop
                continue

    async def _handle_file_uploaded(self, event: dict) -> None:
        if not self.producer:
            return

        data = event.get("data", {})
        filename = data.get("filename", "").lower()
        content_type = data.get("contentType", "").lower()
        folder = data.get("folder", "").lower()

        # Heuristic to decide file type
        is_contract = any([
            "contract" in filename,
            "hopdong" in filename,
            folder.startswith("contracts"),
            content_type in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ])

        file_type = "CONTRACT" if is_contract else "GENERAL"

        # Publish AIProcessingStarted
        started_event = {
            "eventVersion": "v1",
            "eventType": "AIProcessingStarted",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-processing-service",
            "correlationId": event.get("correlationId") or uuid.uuid4().hex,
            "actor": event.get("actor", {}),
            "data": {
                "fileId": data.get("fileId"),
                "filename": data.get("filename"),
                "fileType": file_type,
                "key": data.get("key"),
                "bucket": data.get("bucket"),
                "url": data.get("url"),
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, started_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))

        # Here would be actual AI processing; we simulate immediate completion
        completed_event = {
            "eventVersion": "v1",
            "eventType": "AIProcessingCompleted",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-processing-service",
            "correlationId": started_event["correlationId"],
            "actor": event.get("actor", {}),
            "data": {
                "fileId": data.get("fileId"),
                "filename": data.get("filename"),
                "fileType": file_type,
                "summaryAvailable": False,
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, completed_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))


worker = AIKafkaWorker()


