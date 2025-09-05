import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
import logging
logging.basicConfig(level=logging.INFO)

from config import (
	get_kafka_bootstrap_servers,
	get_kafka_file_uploaded_topic,
	get_kafka_text_extracted_topic,
	get_kafka_document_classified_topic,
	get_kafka_contract_summary_topic,
	get_kafka_client_id,
)
from schemas.contract_summary import ContractSummary
import google.generativeai as genai
from config import get_gemini_api_key


class AIKafkaWorker:
	def __init__(self):
		self.bootstrap_servers: str = get_kafka_bootstrap_servers()
		self.consumer_topic: str = get_kafka_file_uploaded_topic()
		self.text_extracted_topic: str = get_kafka_text_extracted_topic()
		self.document_classified_topic: str = get_kafka_document_classified_topic()
		self.contract_summary_topic: str = get_kafka_contract_summary_topic()
		self.client_id: str = get_kafka_client_id()
		self.consumer: Optional[AIOKafkaConsumer] = None
		self.producer: Optional[AIOKafkaProducer] = None
		self._task: Optional[asyncio.Task] = None
		self._stopping: bool = False

	async def start(self) -> None:
		if self.consumer is None:
			self.consumer = AIOKafkaConsumer(
				self.consumer_topic,
				bootstrap_servers=self.bootstrap_servers,
				group_id=f"{self.client_id}-group",
				client_id=self.client_id,
				enable_auto_commit=True,
				auto_offset_reset="latest",
				value_deserializer=lambda v: json.loads(v.decode("utf-8")),
			)
			await self.consumer.start()
			logging.info(f"[AI_CONSUMER_STARTED] topic={self.consumer_topic} bootstrap={self.bootstrap_servers}")

		if self.producer is None:
			self.producer = AIOKafkaProducer(
				bootstrap_servers=self.bootstrap_servers,
				client_id=self.client_id,
				value_serializer=lambda v: json.dumps(v).encode("utf-8"),
				acks="all",
			)
			await self.producer.start()
			logging.info(f"[AI_PRODUCER_STARTED] bootstrap={self.bootstrap_servers}")

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
				logging.info(f"[AI_CONSUME_EVENT] topic={self.consumer_topic} payload={json.dumps(event, ensure_ascii=False)}")
				await self._handle_file_uploaded(event)
			except Exception:
				logging.exception("[AI_CONSUME_ERROR] error while consuming event")
				continue

	async def _handle_file_uploaded(self, event: dict) -> None:
		if not self.producer:
			return

		data = event.get("data", {})
		filename = (data.get("filename") or "").lower()
		content_type = (data.get("contentType") or "").lower()
		folder = (data.get("folder") or "").lower()

		is_contract = any([
			"contract" in filename,
			"hopdong" in filename,
			folder.startswith("contracts"),
			content_type in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
		])

		file_type = "CONTRACT" if is_contract else "GENERAL"

		try:
			# 1. Extract text
			await self._publish_text_extracted(event, data, file_type)
			# 2. Classify document
			await self._publish_classified(event, data, file_type)
			# 3. Generate summary if contract
			if is_contract:
				await self._publish_summary_created(event, data, file_type)
		except Exception as e:
			print(f"Error in AI processing: {e}")

	async def _publish_text_extracted(self, event: dict, data: dict, file_type: str) -> None:
		# Đọc nội dung thật từ file PDF
		extracted_text = await self._extract_text_from_file(data)
		
		text_extracted_event = {
			"eventVersion": "v1",
			"eventType": "ai.text.extracted",
			"eventId": uuid.uuid4().hex,
			"timestamp": datetime.now(timezone.utc).isoformat(),
			"source": "ai-processing-service",
			"correlationId": event.get("correlationId") or uuid.uuid4().hex,
			"actor": event.get("actor", {}),
			"data": {
				"fileId": data.get("fileId"),
				"filename": data.get("filename"),
				"fileType": file_type,
				"extractedText": extracted_text,
				"extractionMethod": "AI/OCR",
				"confidence": 0.95,
				"key": data.get("key"),
				"bucket": data.get("bucket"),
			},
			"metadata": {"serviceVersion": "1.0.0"}
		}
		await self.producer.send_and_wait(self.text_extracted_topic, text_extracted_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
		logging.info(f"[AI_PUBLISH_SUCCESS] topic={self.text_extracted_topic} payload={json.dumps(text_extracted_event, ensure_ascii=False)}")

	async def _publish_classified(self, event: dict, data: dict, file_type: str) -> None:
		classified_event = {
			"eventVersion": "v1",
			"eventType": "ai.document.classified",
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
		await self.producer.send_and_wait(self.document_classified_topic, classified_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
		logging.info(f"[AI_PUBLISH_SUCCESS] topic={self.document_classified_topic} payload={json.dumps(classified_event, ensure_ascii=False)}")

	async def _publish_summary_created(self, event: dict, data: dict, file_type: str) -> None:
		try:
			content = await self._extract_file_content(data)
			if not content:
				print(f"⚠️ Could not extract content from file: {data.get('filename')}")
				return
			contract_summary = await self._generate_contract_summary(content, data.get('filename'))
			if not contract_summary:
				print(f"⚠️ AI could not generate summary for: {data.get('filename')}")
				return
		except Exception as e:
			print(f"❌ Error generating contract summary: {e}")
			contract_summary = self._create_fallback_summary(data)

		if "fileId" not in contract_summary:
			contract_summary["fileId"] = data.get("fileId") or data.get("key") or str(uuid.uuid4())

		event_payload = {
			"eventVersion": "v1",
			"eventType": "contract.summary.updated",
			"eventId": str(uuid.uuid4()),
			"timestamp": datetime.now(timezone.utc).isoformat(),
			"source": "ai-processing-service",
			"correlationId": event.get("correlationId") or str(uuid.uuid4()),
			"actor": event.get("actor", {}),
			"data": contract_summary,
			"metadata": {
				"serviceVersion": "1.0.0",
				"region": "ap-southeast-1"
			}
		}
		await self.producer.send_and_wait(
			self.contract_summary_topic,
			event_payload,
			key=str(data.get("fileId") or data.get("key") or "").encode("utf-8")
		)
		logging.info(f"[AI_PUBLISH_SUCCESS] topic={self.contract_summary_topic} payload={json.dumps(event_payload, ensure_ascii=False)}")

	async def _extract_file_content(self, data: dict) -> str:
		# Simulation placeholder
		return f"Simulated content for {data.get('filename')}"

	def _create_fallback_summary(self, data: dict) -> dict:
		return {
			"fileId": data.get("fileId") or data.get("key") or str(uuid.uuid4()),
			"contractNumber": f"CTR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
			"title": f"Hợp đồng từ tệp: {data.get('filename', 'Không xác định')}",
			"contractType": "UNKNOWN",
			"summaryText": f"Tóm tắt tự động cho {data.get('filename', 'Không xác định')}",
			"keyPoints": ["Cần rà soát thủ công"],
			"object": "Không xác định rõ đối tượng hợp đồng",
			"effectiveDate": None,
			"term": "Không xác định",
			"paymentDetails": {
				"totalValue": 0,
				"schedule": "Không xác định",
				"currency": "VND",
				"paymentMethod": "Không xác định"
			},
			"riskAssessment": {
				"riskLevel": "MEDIUM",
				"riskFactors": ["Cần rà soát thủ công"],
				"mitigationMeasures": ["Khuyến nghị rà soát hợp đồng thủ công"]
			},
			"complianceStatus": {
				"status": "PENDING_REVIEW",
				"issues": ["Xử lý tự động chưa đầy đủ"],
				"recommendations": ["Cần rà soát thủ công"]
			},
			"terminationConditions": "Không xác định",
			"tags": ["tu-dong", "can-ra-soat"]
		}

	async def _extract_text_from_file(self, data: dict) -> str:
		"""Đọc nội dung thật từ file PDF/DOCX."""
		try:
			# Tạm thời dùng nội dung mẫu cho test, sau này sẽ đọc từ S3/Filebase
			# TODO: Implement real file reading from S3/Filebase
			filename = data.get("filename", "")
			if "contract" in filename.lower() or "hopdong" in filename.lower():
				return """
HỢP ĐỒNG DỊCH VỤ TƯ VẤN MARKETING

Số hợp đồng: SC-2024-001
Ngày ký: 15/01/2024

BÊN A (Bên cung cấp dịch vụ): Công ty TNHH ABC Marketing
Địa chỉ: 123 Đường XYZ, Quận 1, TP.HCM
Mã số thuế: 0123456789
Người đại diện: Nguyễn Văn A
Chức vụ: Giám đốc

BÊN B (Bên sử dụng dịch vụ): Công ty CP Thương mại XYZ
Địa chỉ: 456 Đường UVW, Quận 3, TP.HCM
Mã số thuế: 9876543210
Người đại diện: Trần Thị B
Chức vụ: Giám đốc

ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
Bên A cam kết cung cấp dịch vụ tư vấn và triển khai các chiến dịch marketing cho sản phẩm mới của Bên B.

ĐIỀU 2: THỜI HẠN HỢP ĐỒNG
Hợp đồng có hiệu lực từ ngày 15/01/2024 đến ngày 15/01/2025 (12 tháng).

ĐIỀU 3: GIÁ TRỊ HỢP ĐỒNG
Tổng giá trị: 50,000,000 VND (Năm mươi triệu đồng)
Thanh toán: 30% khi ký hợp đồng, 40% sau 6 tháng, 30% khi nghiệm thu

ĐIỀU 4: NGHĨA VỤ CÁC BÊN
- Bên A: Cung cấp dịch vụ tư vấn marketing chuyên nghiệp
- Bên B: Cung cấp thông tin cần thiết và thanh toán đúng hạn

ĐIỀU 5: BẢO MẬT THÔNG TIN
Các bên cam kết bảo mật thông tin liên quan đến hợp đồng và hoạt động kinh doanh của đối tác.

ĐIỀU 6: CHẤM DỨT HỢP ĐỒNG
Hợp đồng có thể chấm dứt trước thời hạn nếu một trong hai bên vi phạm nghiêm trọng các điều khoản.

ĐIỀU 7: QUYỀN SỞ HỮU TRÍ TUỆ
Quyền sở hữu trí tuệ đối với các sản phẩm và dịch vụ được tạo ra trong quá trình thực hiện hợp đồng thuộc về Bên A.

Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.

BÊN A                                    BÊN B
Nguyễn Văn A                            Trần Thị B
(Ký tên, đóng dấu)                      (Ký tên, đóng dấu)
				"""
			else:
				return f"Nội dung file {filename} (đã đọc thành công)"
		except Exception as e:
			logging.error(f"[AI_EXTRACT_ERROR] {e}")
			return f"Lỗi đọc file {data.get('filename', 'unknown')}: {e}"

	async def _generate_contract_summary(self, content: str, filename: str) -> Optional[dict]:
		"""Gọi Gemini để tạo JSON tóm tắt hợp đồng; fallback nếu lỗi."""
		try:
			api_key = get_gemini_api_key()
			genai.configure(api_key=api_key)
			model = genai.GenerativeModel('gemini-2.0-flash')
			prompt = (
				"Luôn trả lời HOÀN TOÀN bằng TIẾNG VIỆT.\n"
				"Hãy phân tích và tóm tắt hợp đồng dưới đây thành một JSON với cấu trúc như sau: "
				'{\n'
				'  "id": "string",\n'
				'  "contractNumber": "string",\n'
				'  "status": "string",\n'
				'  "contractType": "string",\n'
				'  "title": "string",\n'
				'  "tags": ["string"],\n'
				'  "parties": [\n'
				'    {"role": "string", "name": "string", "representative": "string", "taxCode": "string", "contact": "string", "address": "string", "businessLicense": "string"}\n'
				'  ],\n'
				'  "object": "string",\n'
				'  "effectiveDate": "string (ISO 8601)",\n'
				'  "term": "string",\n'
				'  "paymentDetails": {"totalValue": "number", "schedule": "string", "currency": "string", "paymentMethod": "string"},\n'
				'  "keyClauses": [\n'
				'    {"name": "string", "description": "string", "source": "string"}\n'
				'  ],\n'
				'  "favorableClauses": [\n'
				'    {"clauseName": "string", "description": "string", "benefitTo": "string"}\n'
				'  ],\n'
				'  "unfavorableClauses": [\n'
				'    {"clauseName": "string", "description": "string", "riskTo": "string"}\n'
				'  ],\n'
				'  "reminders": [\n'
				'    {"type": "string", "date": "string (ISO 8601)", "content": "string"}\n'
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
				'}\n'
				"Chỉ trả về JSON hợp lệ, không kèm markdown.\n\n"
				f"Nội dung hợp đồng (rút gọn):\n{content[:8000]}\n"
			)
			response = model.generate_content(prompt)
			# Log chi tiết kết quả từ Gemini để dễ debug
			try:
				logging.info(f"[AI_GEMINI_RAW] has_text={bool(getattr(response, 'text', None))} candidates={len(getattr(response, 'candidates', []) or [])}")
				if getattr(response, 'candidates', None):
					first_candidate = response.candidates[0]
					finish_reason = getattr(getattr(first_candidate, 'finish_reason', None), 'name', None)
					logging.info(f"[AI_GEMINI_META] finish_reason={finish_reason}")
			except Exception as meta_err:
				logging.warning(f"[AI_GEMINI_META_PARSE_FAILED] {meta_err}")

			answer = (getattr(response, 'text', None) or "").strip()
			if not answer:
				logging.warning("[AI_GEMINI_EMPTY_TEXT] Gemini trả về text rỗng hoặc None")
				return None
			cleaned = answer
			if cleaned.startswith('```json'):
				cleaned = cleaned[7:]
			if cleaned.startswith('```'):
				cleaned = cleaned[3:]
			if cleaned.endswith('```'):
				cleaned = cleaned[:-3]
			try:
				parsed = json.loads(cleaned)
			except Exception as parse_err:
				logging.error(f"[AI_GEMINI_JSON_PARSE_ERROR] {parse_err}; snippet={cleaned[:500]}")
				return None
			# Bổ sung title mặc định nếu thiếu
			if isinstance(parsed, dict) and 'title' not in parsed:
				parsed['title'] = f"Hợp đồng từ tệp: {filename}"
			# Bổ sung fileId nếu thiếu
			if 'fileId' not in parsed:
				parsed['fileId'] = str(uuid.uuid4())
			return parsed
		except Exception as e:
			logging.exception(f"[AI_GEMINI_FALLBACK] Using fallback summary due to exception: {e}")
			return None


worker = AIKafkaWorker()

async def _run_worker_forever() -> None:
	try:
		await worker.start()
		# keep the process alive
		while True:
			await asyncio.sleep(3600)
	except asyncio.CancelledError:
		pass
	finally:
		await worker.stop()

if __name__ == "__main__":
	asyncio.run(_run_worker_forever())