import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

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
				"extractedText": f"Extracted text from {data.get('filename')} (simulated)",
				"extractionMethod": "AI/OCR",
				"confidence": 0.95,
				"key": data.get("key"),
				"bucket": data.get("bucket"),
			},
			"metadata": {"serviceVersion": "1.0.0"}
		}
		await self.producer.send_and_wait(self.text_extracted_topic, text_extracted_event, key=str(data.get("fileId") or data.get("key") or "").encode("utf-8"))
		print(f"✅ Published TextExtracted for file: {data.get('filename')}")

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
		print(f"✅ Published Classified for file: {data.get('filename')} as {file_type}")

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
		print(f"✅ Published ContractSummary for contract: {data.get('filename')}")

	async def _extract_file_content(self, data: dict) -> str:
		# Simulation placeholder
		return f"Simulated content for {data.get('filename')}"

	def _create_fallback_summary(self, data: dict) -> dict:
		return {
			"fileId": data.get("fileId") or data.get("key") or str(uuid.uuid4()),
			"contractNumber": f"CTR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
			"title": f"Contract from file: {data.get('filename', 'Unknown')}",
			"contractType": "UNKNOWN",
			"summaryText": f"Auto-generated summary for {data.get('filename', 'Unknown')}",
			"keyPoints": ["Requires manual review"],
			"object": "Unable to determine contract object",
			"effectiveDate": None,
			"term": "Unknown",
			"paymentDetails": {
				"totalValue": 0,
				"schedule": "Unknown",
				"currency": "VND",
				"paymentMethod": "Unknown"
			},
			"riskAssessment": {
				"riskLevel": "MEDIUM",
				"riskFactors": ["Requires manual review"],
				"mitigationMeasures": ["Manual contract review recommended"]
			},
			"complianceStatus": {
				"status": "PENDING_REVIEW",
				"issues": ["Automated processing incomplete"],
				"recommendations": ["Manual review required"]
			},
			"terminationConditions": "Unknown",
			"tags": ["auto-generated", "requires-review"]
		}

	async def _generate_contract_summary(self, content: str, filename: str) -> Optional[dict]:
		return {
			"fileId": str(uuid.uuid4()),
			"contractNumber": f"CTR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
			"title": f"Contract from file: {filename}",
			"contractType": "SERVICE_AGREEMENT",
			"summaryText": f"AI-generated summary for {filename}",
			"keyPoints": ["Service provision", "Payment terms", "Duration"],
			"object": "Service provision agreement",
			"effectiveDate": datetime.now(timezone.utc).isoformat(),
			"term": "12 months",
			"paymentDetails": {
				"totalValue": 100000,
				"schedule": "Monthly",
				"currency": "VND",
				"paymentMethod": "Bank transfer"
			},
			"riskAssessment": {
				"riskLevel": "LOW",
				"riskFactors": ["Standard terms"],
				"mitigationMeasures": ["Regular review"]
			},
			"complianceStatus": {
				"status": "COMPLIANT",
				"issues": [],
				"recommendations": ["Standard contract"]
			},
			"terminationConditions": "30 days notice",
			"tags": ["ai-generated", "service-contract"]
		}


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