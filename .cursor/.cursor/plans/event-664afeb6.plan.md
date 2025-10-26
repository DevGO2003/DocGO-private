<!-- 664afeb6-f1a9-4682-acd2-f83760ebf565 e0cb634d-5579-42cc-b607-5851b067de54 -->
# Run Docker Compose and End-to-End Test Plan

## Scope

Add operational steps to run docker compose and execute E2E tests until the pipeline is stable: API Gateway → Automation Service → Kafka/Redis → File Service → MongoDB Atlas.

## Steps

### 1) Pre-flight checks

- Confirm required env vars exist: `KAFKA_BOOTSTRAP_SERVERS`, `AUTOMATION_SERVICE_URL`, Mongo Atlas connection for File Service.
- Ensure ports are free: 8000 (gateway), 8002 (file-service), 8003 (automation), 9092 (kafka), 2181 (zookeeper), 6379 (redis), 8080 (kafka-ui).

### 2) Start infrastructure and services

- From project root, run docker compose to start: `zookeeper`, `kafka`, `kafka-ui`, `redis`, `automation-service`, `file-management-service`, `api-gateway`, `web-app`.
- Wait for healthy readiness (check logs):
- Kafka broker ready; UI accessible at `/8080`.
- Redis accepting connections.
- Gateway listening on `:8000/docs#/`.
- Automation on `:8003/docs#/`.
- File Service on `:8002/docs#/`.

### 3) Verify Kafka topics

- Ensure topics exist (auto-create enabled): `json.analyze`, `json.analysis.completed`.
- If needed, create via Kafka UI (local cluster) with acks=all, partitions=1, rf=1.

### 4) Smoke test upload flow

- Use `test-upload-json.json` at repository root.
- Call Gateway:
- POST `http://localhost:8000/api/files/upload?folder=documents&user_id=user123`
- multipart `file=@test-upload-json.json`
- Expect 201/202 RestResponse with `description` present.

### 5) JSON analysis E2E

- Single:
- POST `http://localhost:8000/api/v1/automation-service/files/events/analyze-json` with JSON body.
- Poll `GET /api/v1/automation-service/files/events/{jobId}/status` until `COMPLETED`.
- Batch:
- POST `.../analyze-batch` with array body; poll status until `COMPLETED`.

### 6) Validate persistence in MongoDB Atlas

- Confirm new documents in `docgo_document_service.documents` with:
- `documentType: "JSON_DATA"`
- `metadata.jobId: <jobId>`
- `processingStatus: "COMPLETED"`
- Validate core fields: `overview`, `content.analysisResult`, `metadata.correlationId`.

### 7) Troubleshooting loop (run until stable)

- If upload fails: verify Gateway forwards to `/api/v1/automation-service/files` and `.json` in `allowedExtensions`.
- If Kafka publish fails: check `KAFKA_BOOTSTRAP_SERVERS`, container logs of Automation Service.
- If consumer no-op: ensure File Service Kafka listener active and `app.kafka.topic.json-analysis-completed` matches.
- If Redis progress missing: check `REDIS_HOST/PORT/DB` and container logs.
- Iterate until all tests pass consistently.

### 8) Success criteria

- Upload returns 201 (small) or 202 (large) with `description`.
- Status endpoint reaches `COMPLETED` (100%).
- New Mongo Atlas documents are created with expected schema.
- No error logs in services during test run.

## References

- docker-compose file: `docker-compose.yml`
- Gateway route: `backend/api-gateway/pages/api/files/upload.ts`
- Automation endpoints: `backend/automation-service/file_router.py`
- Kafka worker: `backend/automation-service/kafka_worker.py`
- File Service listener: `backend/file-management-service/.../JsonAnalysisKafkaListener.java`
- Test artifacts: `test-upload-json.json`, `test-json-analysis-e2e.sh`, `test-json-analysis-e2e.ps1`

### To-dos

- [ ] Start docker compose and wait for healthy services
- [ ] Execute upload and JSON analysis E2E tests (single and batch)
- [ ] Verify new documents persisted in MongoDB Atlas with expected schema