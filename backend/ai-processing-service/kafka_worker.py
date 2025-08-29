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

        # Simulate AI processing steps
        try:
            # 1. Extract text if DOCX/PDF
            if content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                await self._publish_text_extracted(event, data, file_type)
                
                # 2. Classify document
                await self._publish_classified(event, data, file_type)
                
                # 3. Generate summary if contract
                if is_contract:
                    await self._publish_summary_created(event, data, file_type)

        except Exception as e:
            print(f"Error in AI processing: {e}")

        # Publish AIProcessingCompleted
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
                "summaryAvailable": is_contract,
                "textExtracted": content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
                "classified": True,
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, completed_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))

    async def _publish_text_extracted(self, event: dict, data: dict, file_type: str) -> None:
        """Publish text-extracted event"""
        text_extracted_event = {
            "eventVersion": "v1",
            "eventType": "TextExtracted",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-processing-service",
            "correlationId": event.get("correlationId") or uuid.uuid4().hex,
            "actor": event.get("actor", {}),
            "data": {
                "fileId": data.get("fileId"),
                "filename": data.get("filename"),
                "fileType": file_type,
                "extractedText": f"Extracted text from {data.get('filename')} (simulated)",
                "extractionMethod": "AI/OCR",
                "confidence": 0.95,
                "key": data.get("key"),
                "bucket": data.get("bucket"),
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, text_extracted_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
        print(f"✅ Published TextExtracted for file: {data.get('filename')}")

    async def _publish_classified(self, event: dict, data: dict, file_type: str) -> None:
        """Publish classified event"""
        classified_event = {
            "eventVersion": "v1",
            "eventType": "Classified",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-processing-service",
            "correlationId": event.get("correlationId") or uuid.uuid4().hex,
            "actor": event.get("actor", {}),
            "data": {
                "fileId": data.get("fileId"),
                "filename": data.get("filename"),
                "classification": file_type,
                "confidence": 0.92,
                "categories": ["document", file_type.lower()],
                "key": data.get("key"),
                "bucket": data.get("bucket"),
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, classified_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
        print(f"✅ Published Classified for file: {data.get('filename')} as {file_type}")

    async def _publish_summary_created(self, event: dict, data: dict, file_type: str) -> None:
        """Publish summary-created event"""
        # Tạo contract summary chi tiết
        contract_summary = {
            "title": f"Hợp đồng từ file: {data.get('filename')}",
            "parties": [
                {
                    "name": "Công ty Cổ phần Phát triển Phần mềm Giải pháp Phân phối Dược và Nhà thuốc",
                    "role": "Bên cung cấp dịch vụ (Bên B)",
                    "representative": "Ông Nguyễn Văn Dũng, Giám đốc",
                    "tax_code": "0109889002",
                    "contact": "0983.456.455"
                },
                {
                    "name": None,
                    "role": "Bên sử dụng dịch vụ (Bên A)",
                    "representative": None,
                    "tax_code": None,
                    "contact": None
                }
            ],
            "object": f"Tóm tắt nội dung hợp đồng từ file {data.get('filename')}",
            "effective_date": "Ngày ký hợp đồng năm 2024",
            "term": "6 năm, tự động gia hạn các năm tiếp theo",
            "payment_details": {
                "total_value": "4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)",
                "schedule": "Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu.",
                "currency": "VND"
            },
            "key_clauses": [
                {
                    "name": "Nội dung hợp tác",
                    "description": "Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ.",
                    "source": "Điều 1"
                },
                {
                    "name": "Quyền và Trách nhiệm",
                    "description": "Quy định về quyền và trách nhiệm của các bên trong hợp đồng.",
                    "source": "Điều 5 & 6"
                }
            ],
            "favorable_clauses": [
                {
                    "clause_name": "Tự động gia hạn không phí",
                    "description": "Hợp đồng có hiệu lực và sẽ tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí gia hạn.",
                    "benefit_to": "Bên sử dụng dịch vụ (Bên A)"
                }
            ],
            "unfavorable_clauses": [
                {
                    "clause_name": "Tự động gia hạn",
                    "description": "Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo.",
                    "risk_to": "Bên sử dụng dịch vụ (Bên A)"
                }
            ],
            "termination_conditions": "Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận hoặc có vi phạm nghiêm trọng."
        }

        summary_created_event = {
            "eventVersion": "v1",
            "eventType": "SummaryCreated",
            "eventId": uuid.uuid4().hex,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-processing-service",
            "correlationId": event.get("correlationId") or uuid.uuid4().hex,
            "actor": event.get("actor", {}),
            "data": {
                "file_information": {
                    "fileId": data.get("fileId"),
                    "filename": data.get("filename"),
                    "fileType": file_type,
                    "summary": f"AI-generated summary for contract {data.get('filename')} (simulated)",
                    "summaryLength": 150,
                    "keyPoints": ["contract terms", "parties involved", "effective date"],
                    "key": data.get("key"),
                    "bucket": data.get("bucket"),
                },
                "contract_summary": contract_summary
            },
            "metadata": {"serviceVersion": "1.0.0"}
        }
        await self.producer.send_and_wait(self.ai_events_topic, summary_created_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
        print(f"✅ Published SummaryCreated for contract: {data.get('filename')}")


worker = AIKafkaWorker()


