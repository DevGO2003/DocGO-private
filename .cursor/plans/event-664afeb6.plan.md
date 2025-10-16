<!-- 664afeb6-f1a9-4682-acd2-f83760ebf565 91b608ce-87a5-49c4-9a27-f73c74e98886 -->
# Event-driven File Analysis Plan (Detailed)

## Scope

- Remove all AI endpoints from Automation Service.
- Keep upload flow: Web App → API Gateway → Automation Service → S3.
- Add Kafka-based JSON analysis APIs under "📁 APIs Quản lý File" with progress tracking and optional WebSocket.
- Automation Service is Kafka owner/producer; publishes completion events for File Service to persist.
- File Service returns the specified document schema for GET one.

## Architecture & Flow

- Upload (unchanged):
  - FE → Gateway `POST /api/v1/automation-service/files` → AS saves to S3 → returns 201/202.
- JSON Analysis (new):
  - FE → Gateway → AS `POST /api/v1/automation-service/files/events/analyze-json` (one) or `.../analyze-batch` (array)
  - AS: create jobId, write initial progress to Redis, enqueue messages to Kafka topic `json.analyze`.
  - Kafka Worker (AS): consume, process items (mock or pluggable), update progress in Redis, publish completion event `json.analysis.completed`.
  - File Service: consume completion, upsert document, so GET one returns requested schema.
  - FE: poll `GET /api/v1/automation-service/files/events/{jobId}/status` (or subscribe WS) to monitor progress.

## Changes by Service

### A) Automation Service (FastAPI) – backend/automation-service

1) Remove AI endpoints

- File: `backend/automation-service/routers.py`
  - Delete entire definitions:
    - `@router.post("/document/extract", ...) def extract_api(...)`
    - `@router.post("/document/classify", ...) def classify_api(...)`
  - Remove any OpenAPI tag references to "🤖 APIs Xử lý AI" if present.
  - Purpose: eliminate AI endpoints per requirement.

2) Keep unified upload endpoint

- File: `backend/automation-service/file_router.py`
  - Ensure only this exists for upload:
    - `@router.post("", summary="Upload document", tags=["📁 APIs Quản lý File"])` mapped to `POST /api/v1/automation-service/files`.
  - Remove any alias or duplicate (already removed): no `/files/upload`, no `/documents/upload`.
  - Validation: ensure RestResponse includes `description` to satisfy pydantic validation (avoid earlier 500 validation error on missing `description`).

3) Add Kafka Event APIs under file management

- File: `backend/automation-service/file_router.py`
  - Add:
    - `POST /api/v1/automation-service/files/events/analyze-json` (one JSON)
      - Request: `application/json` body `{ ... }`
      - Steps:

1) Generate `jobId = uuid4()`; `correlationId = header 'X-Correlation-Id' || uuid4()`.

2) Initialize progress in Redis key `event:{jobId}`

           - `{ "total": 1, "completed": 0, "failed": 0, "percent": 0, "step": "queued", "updatedAt": <ISO> }`.

3) Publish Kafka to topic `json.analyze` with envelope:

           ```json
           {
             "eventVersion": "v1",
             "eventType": "JsonAnalysisRequested",
             "eventId": "<uuid>",
             "timestamp": "<ISO>",
             "source": "automation-service",
             "correlationId": "<correlationId>",
             "actor": { "userId": "system", "userRole": "system", "ip": "<clientIp>" },
             "data": { "jobId": "<jobId>", "index": 0, "payload": { /* raw JSON */ } },
             "metadata": { "serviceVersion": "1.0.0", "topic": "json.analyze" }
           }
           ```

4) Return `RestResponse` 202 with `data: { jobId }`.

    - `POST /api/v1/automation-service/files/events/analyze-batch` (array JSON)
      - Request: `application/json` body `[ {...}, {...} ]`.
      - Steps similar to above, but initialize `total = len(items)`; publish one message per item with `index`.
      - Return 202 with `{ jobId, total }`.
    - `GET /api/v1/automation-service/files/events/{jobId}/status`
      - Read Redis key `event:{jobId}`; if missing return 404.
      - Return 200 with snapshot fields `{ total, completed, failed, percent, step, updatedAt }`.
    - (Optional) `@router.websocket("/api/v1/automation-service/files/events/ws/{jobId}")`
      - Stream progress from Redis via `services.websocket_manager` (re-use existing manager); on updates push JSON.

4) Kafka integration (producer/consumer)

- Producer (EventService)
  - File: `backend/automation-service/services/event_service.py`
    - Add method `async def publish_kafka(self, topic: str, message: dict) -> None` using a shared `AIOKafkaProducer` (acquire from `kafka_worker` or create lazily).
    - Fallback to log if Kafka not configured.
- Consumer (Worker)
  - File: `backend/automation-service/kafka_worker.py`
    - Subscribe to `json.analyze`.
    - For each message:

1) Update Redis progress: set `step: processing`, `percent` increments (10, 30, 60, 90).

2) Perform JSON analysis (placeholder): map fields into normalized analysis, e.g. `overview/contract/content` skeleton.

3) Publish completion event to `json.analysis.completed` with envelope:

         ```json
         {
           "eventVersion": "v1",
           "eventType": "JsonAnalysisCompleted",
           "eventId": "<uuid>",
           "timestamp": "<ISO>",
           "source": "automation-service",
           "correlationId": "<correlationId>",
           "actor": { "userId": "system", "userRole": "system" },
           "data": { "jobId": "<jobId>", "index": <n>, "analysis": { /* normalized */ } },
           "metadata": { "serviceVersion": "1.0.0", "topic": "json.analysis.completed" }
         }
         ```

4) Increment `{completed}`; compute `percent = round(completed * 100 / total)`; when complete, set `step:"completed"`, `percent:100`.

    - Keep existing `AIOKafkaProducer` init and lifecycle.

5) Config updates

- File: `backend/automation-service/config.py`
  - Provide Kafka constants:
    - `KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")`
    - `KAFKA_CLIENT_ID = os.getenv("KAFKA_CLIENT_ID", "automation-service")`
    - `JSON_ANALYZE_TOPIC = os.getenv("JSON_ANALYZE_TOPIC", "json.analyze")`
    - `JSON_ANALYSIS_COMPLETED_TOPIC = os.getenv("JSON_ANALYSIS_COMPLETED_TOPIC", "json.analysis.completed")`
    - `DOCUMENTS_EVENTS_TOPIC = os.getenv("DOCUMENTS_EVENTS_TOPIC", "documents.events")`
  - Ensure Redis getters (host, port, db) already available; expose `get_redis()` where needed.

6) Progress storage

- New (or extend EventService): `services/progress_service.py`
  - `init_job(jobId: str, total: int) -> None`
  - `update_progress(jobId: str, *, completedDelta=0, failedDelta=0, step=None, percent=None) -> dict`
  - `get_status(jobId: str) -> dict | None`
  - Redis key: `event:{jobId}`; value JSON with fields `{ total, completed, failed, percent, step, updatedAt }`.

7) Response envelope consistency

- Ensure all `RestResponse` (including error branches) provide `description` to avoid pydantic validation failures observed earlier.

### B) API Gateway – backend/api-gateway

1) Remove AI routing/controller logic

- File: `backend/api-gateway/src/controllers/AutomationController.ts`
  - Remove conditions and related handlers:
    - Any path checks for `/ai/extract`, `/document/extract`, `/contracts/summarize`.
    - Any direct fetch to `.../automation-service/v1/document/extract`.
  - Purpose: Gateway no longer proxies to AI endpoints.

2) Keep upload proxy

- File: `backend/api-gateway/pages/api/files/upload.ts`
  - Confirmed forward to `POST ${AUTOMATION_SERVICE_URL}/api/v1/automation-service/files` (alias removed).

3) Generic proxy remains

- File: `backend/api-gateway/pages/api/[...path].ts`
  - Already maps `/api/v1/automation-service/...` → automation service, retains original endpoint intact.

### C) File Management Service (Spring Boot)

1) Kafka consumer for completion events

- Add consumer for `json.analysis.completed` (and optionally `documents.events`).
- On event:
  - Validate event envelope (per standard) and `data.analysis` normalized structure.
  - Upsert document record mapping to target schema fields: `overview`, `contract`, `content`, `file`, `storage`, `metadata`, `audit`.

2) Ensure GET one returns expected schema

- Endpoint: `GET /api/v1/file-management-service/v1/files/{id}`
- Return `RestResponse` with `description: "Document retrieved successfully"` and `data` per provided example structure.

## Data Contracts

1) Request bodies

- Analyze one:
```json
{ /* arbitrary JSON to analyze */ }
```

- Analyze batch:
```json
[ { /* json1 */ }, { /* json2 */ } ]
```


2) Progress status (Redis)

```json
{
  "total": 10,
  "completed": 3,
  "failed": 0,
  "percent": 30,
  "step": "processing",
  "updatedAt": "2025-10-16T08:00:00Z"
}
```

3) Kafka events

- Request to analyze (producer): topic `json.analyze`
- Completion (producer → consumer File Service): topic `json.analysis.completed`
- Envelope (common):
```json
{
  "eventVersion": "v1",
  "eventType": "JsonAnalysisRequested | JsonAnalysisCompleted",
  "eventId": "<uuid>",
  "timestamp": "<ISO-8601>",
  "source": "automation-service",
  "correlationId": "<uuid>",
  "actor": { "userId": "system", "userRole": "system", "ip": "<ip>" },
  "data": { /* jobId, index?, payload? or analysis? */ },
  "metadata": { "serviceVersion": "1.0.0" }
}
```


## Validation & Error Handling

- Automation APIs must always include `description` in `RestResponse` (fix earlier validation error).
- `analyze-batch`: reject empty array (400), limit batch size (e.g. ≤100), validate item types.
- Progress status 404 if unknown `jobId`.
- Kafka not available: return 503 with `description: "Kafka unavailable"`.

## Testing Plan

- Upload (existing):
  - `curl -F file=@/path/file.pdf http://localhost:8000/api/v1/automation-service/files`
- Analyze one JSON:
  - `curl -H 'Content-Type: application/json' -d @documents/test-data/ocr-text.json http://localhost:8000/api/v1/automation-service/files/events/analyze-json`
- Analyze batch JSON:
  - `curl -H 'Content-Type: application/json' -d '[{"a":1},{"b":2}]' http://localhost:8000/api/v1/automation-service/files/events/analyze-batch`
- Poll status:
  - `curl http://localhost:8000/api/v1/automation-service/files/events/<jobId>/status`
- Verify File Service consumer persisted; GET one returns desired schema.

## Rollout & Ops

- Configure `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_CLIENT_ID` in env for AS and File Service.
- Ensure Redis is available for progress tracking (`REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`).
- Start AS, Kafka worker, and File Service consumers.
- Observe logs for topics `json.analyze` and `json.analysis.completed`.

## Implementation Todos

- remove-ai-endpoints: Remove extract/classify endpoints in routers.py
- confirm-upload-only: Keep only POST /files upload in file_router.py
- add-event-apis: Add analyze-json, analyze-batch, status, optional WS in file_router.py
- kafka-producer: Add publish_kafka in event_service.py
- kafka-consumer-worker: Subscribe to json.analyze, update progress, publish completed in kafka_worker.py
- kafka-config: Add Kafka topics and client config in config.py
- progress-service: Add Redis-backed progress service for job status
- gateway-cleanup: Remove AI routes in AutomationController.ts
- fileservice-consumer: Implement Kafka consumer in file-management-service to persist results
- fileservice-dto: Ensure GET file returns requested schema
- e2e-tests: Upload, analyze JSON, poll status, verify persistence and GET one

### To-dos

- [ ] Remove extract/classify endpoints in routers.py
- [ ] Keep only POST /files upload in file_router.py
- [ ] Add analyze-json, analyze-batch, status, optional WS in file_router.py
- [ ] Add publish_kafka in event_service.py
- [ ] Subscribe to json.analyze, update progress, publish completed in kafka_worker.py
- [ ] Add Kafka topics and client config in config.py
- [ ] Add Redis-backed progress service for job status
- [ ] Remove AI routes in AutomationController.ts
- [ ] File-service Kafka consumer to persist results
- [ ] Ensure GET file returns requested schema
- [ ] Upload, analyze JSON, poll status, verify persistence and GET one