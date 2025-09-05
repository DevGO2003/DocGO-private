import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from config import settings
import logging


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
                auto_offset_reset="earliest",
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            )
            await self.consumer.start()
            logging.info(f"[GFMS_CONSUMER_STARTED] topic={self.file_events_topic} bootstrap={self.bootstrap_servers}")

        if self.producer is None:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                client_id=self.client_id,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks="all",
            )
            await self.producer.start()
            logging.info(f"[GFMS_PRODUCER_STARTED] topic={self.gfms_events_topic} bootstrap={self.bootstrap_servers}")

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
                logging.info(f"[GFMS_CONSUME_EVENT] topic={self.file_events_topic} payload={json.dumps(event, ensure_ascii=False)}")
                await self._handle_file_uploaded(event)
            except Exception as err:
                logging.error(f"[GFMS_CONSUME_ERROR] {err}")
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
        logging.info(f"[GFMS_PUBLISH_SUCCESS] topic={self.gfms_events_topic} payload={json.dumps(file_record_created_event, ensure_ascii=False)}")


# Singleton instance
worker = GFMSKafkaWorker()

async def _run_worker_forever() -> None:
    try:
        await worker.start()
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        pass
    finally:
        await worker.stop()

if __name__ == "__main__":
    asyncio.run(_run_worker_forever())