import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional
import aiohttp
import io

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
		file_url = data.get("fileUrl")

		# Check if this is a contract based on filename, folder, or content type
		is_contract = any([
			"contract" in filename,
			"hopdong" in filename,
			folder.startswith("contracts"),
			content_type in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
		])

		file_type = "CONTRACT" if is_contract else "GENERAL"

		try:
			# 1. Download file from URL if available
			file_content = None
			if file_url:
				file_content = await self._download_file_from_url(file_url)
				if not file_content:
					logging.warning(f"[AI_DOWNLOAD_FAILED] Could not download file from URL: {file_url}")
					return
			else:
				logging.warning(f"[AI_MISSING_URL] No fileUrl in event data: {data}")
				return

			# 2. Extract text from downloaded content
			extracted_text = await self._extract_text_from_content(file_content, filename, content_type)
			if not extracted_text:
				logging.warning(f"[AI_EXTRACT_FAILED] Could not extract text from file: {filename}")
				return

			# 3. Classify document using AI
			classification_result = await self._classify_document_with_gemini(extracted_text, filename, content_type)
			file_type = classification_result.get("classification", file_type)
			confidence = classification_result.get("confidence", 0.8)

			# 4. Publish events
			await self._publish_text_extracted(event, data, file_type, extracted_text, confidence)
			await self._publish_classified(event, data, file_type, confidence)
			
			# 5. Generate summary if contract
			if file_type == "CONTRACT":
				await self._publish_summary_created(event, data, file_type, extracted_text)

		except Exception as e:
			logging.error(f"[AI_PROCESSING_ERROR] Error in AI processing: {e}", exc_info=True)
			await self._publish_error_event(event, data, str(e))

	async def _download_file_from_url(self, file_url: str) -> Optional[bytes]:
		"""
		Download file content from URL
		"""
		try:
			async with aiohttp.ClientSession() as session:
				async with session.get(file_url) as response:
					if response.status == 200:
						content = await response.read()
						logging.info(f"[AI_DOWNLOAD_SUCCESS] Downloaded {len(content)} bytes from {file_url}")
						return content
					else:
						logging.error(f"[AI_DOWNLOAD_FAILED] HTTP {response.status} from {file_url}")
						return None
		except Exception as e:
			logging.error(f"[AI_DOWNLOAD_ERROR] Error downloading from {file_url}: {e}")
			return None

	async def _extract_text_from_content(self, content: bytes, filename: str, content_type: str) -> str:
		"""
		Extract text from file content based on content type
		"""
		try:
			if content_type == "application/pdf":
				# TODO: Implement PDF text extraction
				# For now, return a placeholder
				return f"[PDF_CONTENT_PLACEHOLDER] Content from {filename} (PDF text extraction not implemented yet)"
			elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				# TODO: Implement DOCX text extraction
				# For now, return a placeholder
				return f"[DOCX_CONTENT_PLACEHOLDER] Content from {filename} (DOCX text extraction not implemented yet)"
			elif content_type.startswith("text/"):
				# Plain text files
				return content.decode('utf-8', errors='ignore')
			else:
				# Try to decode as text for other types
				return content.decode('utf-8', errors='ignore')
		except Exception as e:
			logging.error(f"[AI_EXTRACT_ERROR] Error extracting text from {filename}: {e}")
			return ""

	async def _classify_document_with_gemini(self, content: str, filename: str, content_type: str) -> dict:
		"""
		Use Gemini AI to classify document
		"""
		try:
			# Configure Gemini
			genai.configure(api_key=get_gemini_api_key())
			model = genai.GenerativeModel('gemini-1.5-flash')
			
			# Create classification prompt
			prompt = f"""
			Phân loại tài liệu sau đây:
			
			Tên file: {filename}
			Loại file: {content_type}
			Nội dung: {content[:2000]}...
			
			Hãy phân loại tài liệu này thành một trong hai loại:
			- CONTRACT: Nếu đây là hợp đồng, thỏa thuận, hoặc tài liệu pháp lý
			- GENERAL: Nếu đây là tài liệu thông thường khác
			
			Trả về kết quả dưới dạng JSON:
			{{
				"classification": "CONTRACT" hoặc "GENERAL",
				"confidence": 0.0-1.0,
				"reasoning": "Lý do phân loại"
			}}
			"""
			
			response = model.generate_content(prompt)
			result_text = response.text.strip()
			
			# Try to parse JSON response
			try:
				import re
				json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
				if json_match:
					result = json.loads(json_match.group())
					return result
			except:
				pass
			
			# Fallback parsing
			if "CONTRACT" in result_text.upper():
				return {"classification": "CONTRACT", "confidence": 0.8, "reasoning": "Detected contract keywords"}
			else:
				return {"classification": "GENERAL", "confidence": 0.7, "reasoning": "General document"}
				
		except Exception as e:
			logging.error(f"[AI_CLASSIFY_ERROR] Error classifying document {filename}: {e}")
			return {"classification": "GENERAL", "confidence": 0.5, "reasoning": f"Error: {str(e)}"}

	async def _publish_error_event(self, event: dict, data: dict, error_message: str) -> None:
		"""
		Publish error event when processing fails
		"""
		if not self.producer:
			return
			
		error_event = {
			"eventVersion": "v1",
			"eventType": "ai.processing.failed",
			"eventId": uuid.uuid4().hex,
			"timestamp": datetime.now(timezone.utc).isoformat(),
			"source": "ai-processing-service",
			"correlationId": event.get("correlationId") or uuid.uuid4().hex,
			"actor": event.get("actor", {}),
			"data": {
				"fileId": data.get("fileId"),
				"filename": data.get("filename"),
				"error": error_message,
				"key": data.get("key"),
				"bucket": data.get("bucket"),
			},
			"metadata": {"serviceVersion": "1.0.0"}
		}
		
		await self.producer.send_and_wait(
			self.text_extracted_topic, 
			error_event, 
			key=str(data.get("fileId") or data.get("key") or "").encode("utf-8")
		)
		logging.error(f"[AI_ERROR_PUBLISHED] {error_message}")

	async def _publish_text_extracted(self, event: dict, data: dict, file_type: str, extracted_text: str = None, confidence: float = 0.95) -> None:
		# Use provided extracted text or fallback to old method
		if not extracted_text:
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
				"confidence": confidence,
				"key": data.get("key"),
				"bucket": data.get("bucket"),
			},
			"metadata": {"serviceVersion": "1.0.0"}
		}
		await self.producer.send_and_wait(self.text_extracted_topic, text_extracted_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
		logging.info(f"[AI_PUBLISH_SUCCESS] topic={self.text_extracted_topic} payload={json.dumps(text_extracted_event, ensure_ascii=False)}")

	async def _publish_classified(self, event: dict, data: dict, file_type: str, confidence: float = 0.92) -> None:
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
				"confidence": confidence,
				"categories": ["document", file_type.lower()],
				"key": data.get("key"),
				"bucket": data.get("bucket"),
			},
			"metadata": {"serviceVersion": "1.0.0"}
		}
		await self.producer.send_and_wait(self.document_classified_topic, classified_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
		logging.info(f"[AI_PUBLISH_SUCCESS] topic={self.document_classified_topic} payload={json.dumps(classified_event, ensure_ascii=False)}")

	async def _publish_summary_created(self, event: dict, data: dict, file_type: str, extracted_text: str = None) -> None:
		try:
			# Use provided extracted text or fallback to old method
			content = extracted_text or await self._extract_text_from_file(data)
			if not content:
				logging.warning(f"[AI_SUMMARY_FAILED] Could not extract content from file: {data.get('filename')}")
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