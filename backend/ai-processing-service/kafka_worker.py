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
from schemas.contract_summary import ContractSummary
from schemas.events import SummaryCreatedEvent, SummaryCreatedEventData, FileInformation, AIProcessingResult
import google.generativeai as genai
from config import get_gemini_api_key


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
        """Publish summary-created event với contract summary từ AI"""
        try:
            # Lấy nội dung file để gửi cho AI
            content = await self._extract_file_content(data)
            
            if not content:
                print(f"⚠️ Không thể trích xuất nội dung từ file: {data.get('filename')}")
                return
            
            # Gọi AI để tóm tắt hợp đồng
            contract_summary = await self._generate_contract_summary(content, data.get('filename'))
            
            if not contract_summary:
                print(f"⚠️ AI không thể tạo contract summary cho file: {data.get('filename')}")
                return
                
        except Exception as e:
            print(f"❌ Lỗi khi tạo contract summary: {e}")
            # Fallback: tạo contract summary cơ bản
            contract_summary = {
                "id": str(uuid.uuid4()),
                "contractNumber": f"CTR-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
                "status": "DRAFT",
                "contractType": "UNKNOWN",
                "title": f"Hợp đồng từ file: {data.get('filename')}",
                "tag": ["contract", "unknown"],
                "parties": [],
                "object": "Không thể xác định đối tượng hợp đồng",
                "effectiveDate": None,
                "term": "Không xác định",
                "paymentDetails": {
                    "totalValue": 0,
                    "schedule": "Không xác định",
                    "currency": "VND",
                    "paymentMethod": "Không xác định"
                },
                "keyClauses": [],
                "favorableClauses": [],
                "unfavorableClauses": [],
                "reminders": [],
                "terminationConditions": "Không xác định",
                "riskAssessment": {
                    "riskLevel": "UNKNOWN",
                    "riskFactors": ["Không thể đánh giá"],
                    "mitigationMeasures": ["Cần xem xét lại"]
                },
                "complianceStatus": {
                    "status": "REVIEW_REQUIRED",
                    "issues": ["Không thể phân tích"],
                    "recommendations": ["Cần kiểm tra lại tài liệu"]
                }
            }

        # Tạo event data theo schema chuẩn
        file_info = FileInformation(
            fileId=data.get("fileId", ""),
            filename=data.get("filename", ""),
            fileType=file_type,
            fileKey=data.get("key", ""),
            bucket=data.get("bucket", ""),
            contentType=data.get("contentType", "application/pdf"),
            fileSize=data.get("fileSize", 1024000),
            uploadedAt=datetime.fromisoformat(data.get("uploadedAt", datetime.now(timezone.utc).isoformat()))
        )
        
        ai_result = AIProcessingResult(
            extractionMethod="AI/OCR",
            confidence=0.95,
            processingTime=15000,
            modelVersion="gemini-2.0-flash",
            processedAt=datetime.now(timezone.utc)
        )
        
        event_data = SummaryCreatedEventData(
            fileInformation=file_info,
            aiProcessingResult=ai_result,
            contractSummary=contract_summary
        )
        
        summary_created_event = SummaryCreatedEvent(
            eventId=uuid.uuid4().hex,
            timestamp=datetime.now(timezone.utc),
            correlationId=event.get("correlationId") or uuid.uuid4().hex,
            actor=event.get("actor", {}),
            data=event_data,
            metadata={
                "serviceVersion": "1.0.0",
                "region": "ap-southeast-1"
            }
        )
        await self.producer.send_and_wait(self.ai_events_topic, summary_created_event.dict(), key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
        print(f"✅ Published SummaryCreated for contract: {data.get('filename')}")

    async def _extract_file_content(self, data: dict) -> str:
        """Trích xuất nội dung từ file"""
        try:
            # Trong thực tế, bạn sẽ cần download file từ S3/MinIO và đọc nội dung
            # Ở đây tôi giả lập việc trích xuất nội dung
            filename = data.get('filename', '').lower()
            content_type = data.get('contentType', '').lower()
            
            # Giả lập nội dung file (trong thực tế sẽ đọc từ file thật)
            if content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                # Giả lập nội dung hợp đồng
                sample_content = f"""
                HỢP ĐỒNG CUNG CẤP DỊCH VỤ PHẦN MỀM

                Điều 1: Nội dung hợp tác
                Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ phát triển phần mềm quản lý nhà thuốc.

                Điều 2: Các bên tham gia
                Bên A: Công ty TNHH Sử dụng Dịch vụ
                - Đại diện: Bà Trần Thị Lan, Tổng Giám đốc
                - Mã số thuế: 0123456789
                - Địa chỉ: 456 Đường XYZ, Quận 3, TP.HCM

                Bên B: Công ty Cổ phần Phát triển Phần mềm
                - Đại diện: Ông Nguyễn Văn Dũng, Giám đốc
                - Mã số thuế: 0109889002
                - Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM

                Điều 3: Đối tượng hợp đồng
                Cung cấp dịch vụ phát triển phần mềm quản lý nhà thuốc.

                Điều 4: Thời hạn hợp đồng
                Hợp đồng có hiệu lực từ ngày 01/01/2024 trong thời hạn 6 năm.

                Điều 5: Giá trị hợp đồng
                Tổng giá trị: 4.500.000 VND
                Phương thức thanh toán: Chuyển khoản ngân hàng
                Lịch trình: Thanh toán 100% sau khi nghiệm thu.

                Điều 6: Quyền và trách nhiệm
                Bên A có quyền yêu cầu bên B cung cấp dịch vụ theo đúng cam kết.
                Bên B có trách nhiệm bảo hành sản phẩm trong 12 tháng.

                Điều 7: Điều khoản chấm dứt
                Hợp đồng có thể bị chấm dứt nếu có vi phạm nghiêm trọng.

                Điều 8: Bảo mật
                Các bên cam kết bảo mật thông tin mật của nhau.
                """
                return sample_content
            else:
                return f"Nội dung file {filename} (định dạng: {content_type})"
                
        except Exception as e:
            print(f"❌ Lỗi khi trích xuất nội dung file: {e}")
            return None

    async def _generate_contract_summary(self, content: str, filename: str) -> dict:
        """Gọi AI để tạo contract summary"""
        try:
            api_key = get_gemini_api_key()
            if not api_key:
                print("⚠️ Không có Gemini API key")
                return None

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            prompt = (
                "Hãy phân tích và tóm tắt hợp đồng dưới đây thành một JSON với cấu trúc như sau: "
                '{\n'
                '  "id": "string",\n'
                '  "contractNumber": "string",\n'
                '  "status": "string",\n'
                '  "contractType": "string",\n'
                '  "title": "string",\n'
                '  "tag": ["string"],\n'
                '  "parties": [\n'
                '    {"role": "string", "name": "string", "representative": "string", "taxCode": "string", "contact": "string", "address": "string", "businessLicense": "string"}, ...\n'
                '  ],\n'
                '  "object": "string",\n'
                '  "effectiveDate": "string (ISO 8601)",\n'
                '  "term": "string",\n'
                '  "paymentDetails": {"totalValue": "number", "schedule": "string", "currency": "string", "paymentMethod": "string},\n'
                '  "keyClauses": [\n'
                '    {"name": "string", "description": "string", "source": "string}, ...\n'
                '  ],\n'
                '  "favorableClauses": [\n'
                '    {"clauseName": "string", "description": "string", "benefitTo": "string}, ...\n'
                '  ],\n'
                '  "unfavorableClauses": [\n'
                '    {"clauseName": "string", "description": "string", "riskTo": "string}, ...\n'
                '  ],\n'
                '  "reminders": [\n'
                '    {"type": "string", "date": "string (ISO 8601)", "content": "string}, ...\n'
                '  ],\n'
                '  "terminationConditions": "string",\n'
                '  "riskAssessment": {\n'
                '    "riskLevel": "LOW|MEDIUM|HIGH",\n'
                '    "riskFactors": ["string"],\n'
                '    "mitigationMeasures": ["string"]\n'
                '  },\n'
                '  "complianceStatus": {\n'
                '    "status": "COMPLIANT|NON_COMPLIANT|REVIEW_REQUIRED",\n'
                '    "issues": ["string"],\n'
                '    "recommendations": ["string"]\n'
                '  }\n'
                '}'
                "\nYêu cầu:\n"
                "1. Chỉ trả về đúng JSON hợp lệ, không giải thích thêm\n"
                "2. Nếu không thể tóm tắt được thông tin hợp lệ, hãy trả về 'KHÔNG_THỂ_TÓM_TẮT'\n"
                "3. Lưu ý: reminders chỉ có ngày nhắc nhở là ngày cụ thể (ISO 8601), nếu không có ngày cụ thể thì để date=null\n"
                "4. Điền thông tin dựa trên nội dung hợp đồng, nếu không có thông tin thì để null hoặc mảng rỗng\n"
                "5. Sử dụng camelCase cho tất cả các key\n"
                "6. totalValue phải là số (number), không phải chuỗi\n"
                "7. effectiveDate và reminders.date phải theo định dạng ISO 8601 (yyyy-MM-ddTHH:mm:ssZ)\n"
                "8. Thứ tự các trường trong parties: role trước, name sau\n"
                "9. Tạo ID và contractNumber ngẫu nhiên\n\n"
                "Dưới đây là nội dung hợp đồng:\n" + content[:8000]
            )

            response = model.generate_content(prompt)
            answer = response.text
            
            # Xử lý response từ AI
            cleaned = answer.strip()
            if cleaned.startswith('```json'):
                cleaned = cleaned[7:]
            if cleaned.startswith('```'):
                cleaned = cleaned[3:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            
            # Parse JSON response
            try:
                summary_json = json.loads(cleaned)
                print(f"✅ AI đã tạo contract summary cho file: {filename}")
                return summary_json
            except json.JSONDecodeError as e:
                print(f"⚠️ Không thể parse JSON từ AI response: {e}")
                print(f"AI response: {answer}")
                return None
                
        except Exception as e:
            print(f"❌ Lỗi khi gọi AI: {e}")
            return None


worker = AIKafkaWorker()


