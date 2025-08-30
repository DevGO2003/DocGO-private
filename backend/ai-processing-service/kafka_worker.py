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
        """Publish summary-created event với cấu trúc payload chuẩn hóa"""
        # Tạo contract summary chi tiết với cấu trúc mới
        contract_summary = {
            "title": f"Hợp đồng cung cấp dịch vụ phần mềm từ file: {data.get('filename')}",
            "tag": ["service", "software", "development", "contract"],
            "parties": [
                {
                    "name": "Công ty Cổ phần Phát triển Phần mềm Giải pháp Phân phối Dược và Nhà thuốc",
                    "role": "Bên cung cấp dịch vụ (Bên B)",
                    "representative": "Ông Nguyễn Văn Dũng, Giám đốc",
                    "taxCode": "0109889002",
                    "contact": "0983.456.455",
                    "address": "123 Đường ABC, Quận 1, TP.HCM",
                    "businessLicense": "BL123456789"
                },
                {
                    "name": "Công ty TNHH Sử dụng Dịch vụ",
                    "role": "Bên sử dụng dịch vụ (Bên A)",
                    "representative": "Bà Trần Thị Lan, Tổng Giám đốc",
                    "taxCode": "0123456789",
                    "contact": "0901.234.567",
                    "address": "456 Đường XYZ, Quận 3, TP.HCM",
                    "businessLicense": "BL987654321"
                }
            ],
            "object": f"Cung cấp dịch vụ phát triển phần mềm quản lý nhà thuốc từ file {data.get('filename')}",
            "effectiveDate": "2024-01-01",
            "term": "6 năm, tự động gia hạn các năm tiếp theo",
            "paymentDetails": {
                "totalValue": "4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)",
                "schedule": "Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu",
                "currency": "VND",
                "paymentMethod": "Chuyển khoản ngân hàng"
            },
            "keyClauses": [
                {
                    "name": "Nội dung hợp tác",
                    "description": "Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ phát triển phần mềm quản lý nhà thuốc",
                    "source": "Điều 1"
                },
                {
                    "name": "Quyền và Trách nhiệm",
                    "description": "Quy định về quyền và trách nhiệm của các bên trong hợp đồng",
                    "source": "Điều 5 & 6"
                },
                {
                    "name": "Bảo mật thông tin",
                    "description": "Các bên cam kết bảo mật thông tin mật của nhau",
                    "source": "Điều 8"
                }
            ],
            "favorableClauses": [
                {
                    "clauseName": "Tự động gia hạn không phí",
                    "description": "Hợp đồng có hiệu lực và sẽ tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí gia hạn",
                    "benefitTo": "Bên sử dụng dịch vụ (Bên A)"
                },
                {
                    "clauseName": "Bảo hành dài hạn",
                    "description": "Bên B cam kết bảo hành sản phẩm trong 12 tháng sau khi nghiệm thu",
                    "benefitTo": "Bên sử dụng dịch vụ (Bên A)"
                }
            ],
            "unfavorableClauses": [
                {
                    "clauseName": "Tự động gia hạn",
                    "description": "Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo trước",
                    "riskTo": "Bên sử dụng dịch vụ (Bên A)"
                },
                {
                    "clauseName": "Phạt vi phạm cao",
                    "description": "Mức phạt vi phạm hợp đồng lên đến 50% giá trị hợp đồng",
                    "riskTo": "Cả hai bên"
                }
            ],
            "reminders": [
                {
                    "type": "gia hạn",
                    "date": "2029-12-31",
                    "content": "Hợp đồng sẽ tự động gia hạn vào ngày này"
                },
                {
                    "type": "xem xét",
                    "date": "2024-06-30",
                    "content": "Đánh giá hiệu quả hợp tác sau 6 tháng"
                }
            ],
            "terminationConditions": "Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận hoặc có vi phạm nghiêm trọng",
            "riskAssessment": {
                "riskLevel": "MEDIUM",
                "riskFactors": [
                    "Tự động gia hạn không thông báo",
                    "Phạt vi phạm cao",
                    "Phụ thuộc vào một nhà cung cấp"
                ],
                "mitigationMeasures": [
                    "Theo dõi sát sao thời hạn hợp đồng",
                    "Tuân thủ nghiêm ngặt các điều khoản",
                    "Có kế hoạch dự phòng"
                ]
            },
            "complianceStatus": {
                "status": "COMPLIANT",
                "issues": [],
                "recommendations": [
                    "Rà soát lại điều khoản tự động gia hạn",
                    "Thương lượng giảm mức phạt vi phạm"
                ]
            }
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
                "fileInformation": {
                    "fileId": data.get("fileId"),
                    "filename": data.get("filename"),
                    "fileType": file_type,
                    "fileKey": data.get("key"),
                    "bucket": data.get("bucket"),
                    "contentType": data.get("contentType", "application/pdf"),
                    "fileSize": data.get("fileSize", 1024000),
                    "uploadedAt": data.get("uploadedAt", datetime.now(timezone.utc).isoformat())
                },
                "aiProcessingResult": {
                    "extractionMethod": "AI/OCR",
                    "confidence": 0.95,
                    "processingTime": 15000,
                    "modelVersion": "gemini-2.0-flash",
                    "processedAt": datetime.now(timezone.utc).isoformat()
                },
                "contractSummary": contract_summary
            },
            "metadata": {
                "serviceVersion": "1.0.0",
                "region": "ap-southeast-1"
            }
        }
        await self.producer.send_and_wait(self.ai_events_topic, summary_created_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
        print(f"✅ Published SummaryCreated for contract: {data.get('filename')}")


worker = AIKafkaWorker()


