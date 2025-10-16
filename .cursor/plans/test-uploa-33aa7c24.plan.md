<!-- 33aa7c24-f656-47f9-a5b2-37df5b9a6db0 12f3397d-dd9f-4c72-ad40-0ff5b018022b -->
# Plan: Full Automation Service Schema Alignment & Audit Logging

## Phase 1: MongoDB Setup & Audit Service

### 1.1 Cập nhật dependencies

**File**: `backend/automation-service/requirements.txt`

- Uncomment MongoDB dependencies:
  ```python
  motor==3.3.2
  pymongo==4.6.0
  ```


### 1.2 Cập nhật Config

**File**: `backend/automation-service/config.py`

- Thêm MongoDB configuration:
  ```python
  # MongoDB Configuration - ENABLED for audit
  MONGODB_ENABLED: bool = os.getenv("MONGODB_ENABLED", "true").lower() == "true"
  MONGODB_ATLAS_URI: str = os.getenv("MONGODB_ATLAS_URI", "mongodb+srv://...")
  MONGODB_AUDIT_DATABASE: str = os.getenv("MONGODB_AUDIT_DATABASE", "docgo_automation_audit")
  
  # Collections
  MONGODB_AUDIT_LOGS_COLLECTION: str = "automation_audit_logs"
  MONGODB_PROCESSING_SESSIONS_COLLECTION: str = "automation_processing_sessions"
  MONGODB_ERROR_LOGS_COLLECTION: str = "automation_error_logs"
  ```


### 1.3 Tạo Audit Service

**File**: `backend/automation-service/services/audit_service.py` (NEW)

- Implement `AuditService` class với methods:
  - `initialize()`: Setup MongoDB connection
  - `log_event(event_data: dict)`: Log event to audit_logs
  - `log_processing_session(session_data: dict)`: Log processing session
  - `log_error(error_data: dict)`: Log error
  - `update_processing_session(correlation_id: str, updates: dict)`: Update session
  - `get_processing_session(correlation_id: str)`: Get session by correlation ID
  - `close()`: Close MongoDB connection

### 1.4 Cập nhật main.py

**File**: `backend/automation-service/main.py`

- Import `AuditService`
- Initialize audit service trong startup event
- Close audit service trong shutdown event

## Phase 2: Update Gemini Prompt & Contract Schema

### 2.1 Cập nhật Gemini Prompt

**File**: `backend/automation-service/services/ai_processing_service.py`

- Method: `get_contract_summary_prompt()`
- Thay đổi prompt để trả về schema khớp với File Management Service:
  ```python
  # Thay đổi từ:
  "contractNumber", "status", "contractType", "title", "tags", "parties", "object", 
  "effectiveDate", "term", "paymentDetails", "keyClauses", "favorableClauses", 
  "unfavorableClauses", "reminders", "terminationConditions", "riskAssessment", 
  "complianceStatus"
  
  # Sang:
  "effectiveDate", "expiryDate", "totalValue" (số), "currency", "summary", 
  "parties", "payment", "clauses" (key, unfavorable), "reminders", "risk", "compliance"
  ```

- Đảm bảo:
  - `totalValue` là số (int/float), không phải string
  - `effectiveDate`, `expiryDate` là ISO 8601 format
  - `clauses.key` có `importance` và `risk` level
  - `reminders` có `date`, `title`, `description`

### 2.2 Cập nhật Contract Summary Processing

**File**: `backend/automation-service/services/ai_processing_service.py`

- Method: `generate_contract_summary()`
- Xử lý response từ Gemini:
  - Parse `totalValue` thành số
  - Validate và format dates thành ISO 8601
  - Map `clauses` structure: `key` array + `unfavorable` array
  - Đổi tên `riskAssessment` → `risk`
  - Đổi tên `complianceStatus` → `compliance`

## Phase 3: Update Event Schema

### 3.1 Cập nhật Event Types

**File**: `backend/automation-service/schemas/event_schemas.py`

- Thêm event types mới:
  ```python
  AUTOMATION_STARTED = "AutomationStarted"
  AUTOMATION_COMPLETED = "AutomationCompleted"
  AUTOMATION_FAILED = "AutomationFailed"
  FILE_UPLOADED = "FileUploaded"
  FILE_PROCESSED = "FileProcessed"
  DOCUMENT_CLASSIFIED = "DocumentClassified"
  CONTRACT_SUMMARY_UPDATED = "ContractSummaryUpdated"
  DOCUMENT_CREATED = "DocumentCreated"
  ```


### 3.2 Tạo Event Payload Models

**File**: `backend/automation-service/schemas/event_schemas.py`

- Tạo Pydantic models cho từng event type:
  - `AutomationStartedEvent`
  - `FileUploadedEvent`
  - `FileProcessedEvent`
  - `DocumentClassifiedEvent`
  - `ContractSummaryUpdatedEvent`
  - `DocumentCreatedEvent`
  - `AutomationCompletedEvent`
  - `AutomationFailedEvent`

## Phase 4: Implement Error Handling & Retry

### 4.1 Tạo Retry Utilities

**File**: `backend/automation-service/utils/retry_helper.py` (NEW)

- Implement retry decorator:
  ```python
  async def retry_async(func, max_retries=3, backoff_factor=2, exceptions=(Exception,))
  ```


### 4.2 Cập nhật File Storage Service

**File**: `backend/automation-service/services/file_service.py`

- Method: `upload_file()`
- Wrap với retry logic (3 retries với exponential backoff)
- Publish `FileUploaded` event on success
- Publish `AutomationFailed` event on final failure
- Log to audit service

### 4.3 Cập nhật OCR Service

**File**: `backend/automation-service/services/ocr_service.py`

- Method: `extract_text_from_file()`
- Add error handling với fallback
- Publish `FileProcessed` event on success
- Publish `AutomationFailed` event on failure
- Log to audit service

### 4.4 Cập nhật AI Processing Service

**File**: `backend/automation-service/services/ai_processing_service.py`

- Method: `classify_document()`
  - Add error handling với fallback classification
  - Publish `DocumentClassified` event on success
  - Log to audit service
- Method: `generate_contract_summary()`
  - Add error handling với fallback summary
  - Publish `ContractSummaryUpdated` event on success
  - Log to audit service

## Phase 5: Update File API Builder

### 5.1 Cập nhật build_file_api_payload

**File**: `backend/automation-service/services/file_api_builder.py`

- Method: `build_file_api_payload()`
- Thay đổi contract mapping:
  ```python
  # Thay vì sử dụng contract_metadata (flat structure)
  # Sử dụng summary_result (nested structure từ Gemini)
  
  contract_data = {
      "effectiveDate": summary_result.get("effectiveDate"),
      "expiryDate": summary_result.get("expiryDate"),
      "totalValue": summary_result.get("totalValue"),  # số
      "currency": summary_result.get("currency"),
      "summary": summary_result.get("summary"),
      "parties": summary_result.get("parties", []),
      "payment": summary_result.get("payment", {}),
      "clauses": summary_result.get("clauses", {"key": [], "unfavorable": []}),
      "reminders": summary_result.get("reminders", []),
      "risk": summary_result.get("risk", {}),
      "compliance": summary_result.get("compliance", {})
  }
  ```


## Phase 6: Update Main Upload Route

### 6.1 Refactor Upload Route

**File**: `backend/automation-service/routers.py`

- Route: `POST /api/v1/automation-service/documents/upload`
- Restructure với:

  1. Get correlation ID từ header hoặc generate mới
  2. Publish `AutomationStarted` event
  3. Log processing session start
  4. S3 Upload với retry + event publishing
  5. OCR Processing với error handling + event publishing
  6. AI Classification với error handling + event publishing
  7. Contract Summary (nếu là contract) với error handling + event publishing
  8. Save to File Management Service với retry + event publishing
  9. Publish `AutomationCompleted` event
  10. Log processing session complete
  11. Return RestResponse với correlation ID

### 6.2 Add Error Handling Wrapper

**File**: `backend/automation-service/routers.py`

- Wrap toàn bộ route trong try-except
- On error:
  - Publish `AutomationFailed` event
  - Log error to audit service
  - Update processing session status
  - Return structured error response với correlation ID

## Phase 7: Update Environment & Documentation

### 7.1 Cập nhật .env.template

**File**: `backend/automation-service/.env.template`

- Thêm MongoDB configuration:
  ```
  MONGODB_ENABLED=true
  MONGODB_ATLAS_URI=mongodb+srv://...
  MONGODB_AUDIT_DATABASE=docgo_automation_audit
  ```


### 7.2 Cập nhật README

**File**: `backend/automation-service/README.md`

- Document MongoDB audit logging
- Document event types và schema
- Document error handling và retry mechanism
- Document correlation ID tracking

## Phase 8: Testing & Validation

### 8.1 Test Upload Flow

- Test với file nhỏ (<2MB) - sync mode
- Test với file lớn (≥2MB) - async mode
- Verify events được publish đúng
- Verify audit logs được lưu vào MongoDB
- Verify contract data khớp với schema File Management Service

### 8.2 Test Error Scenarios

- Test S3 upload failure → verify retry + error event
- Test OCR failure → verify fallback + error event
- Test AI failure → verify fallback + error event
- Test File Management failure → verify retry + error event

### 8.3 Verify Schema Alignment

- Compare contract data với `documents/architecture/api-response-sample.json`
- Verify tất cả fields khớp
- Verify data types đúng (totalValue là số, dates là ISO 8601)

## Implementation Order

1. Phase 1: MongoDB Setup (30 mins)
2. Phase 2: Gemini Prompt Update (45 mins)
3. Phase 3: Event Schema (30 mins)
4. Phase 4: Error Handling (60 mins)
5. Phase 5: File API Builder (30 mins)
6. Phase 6: Upload Route Refactor (60 mins)
7. Phase 7: Documentation (20 mins)
8. Phase 8: Testing (40 mins)

**Total estimated time**: 5-6 hours

### To-dos

- [ ] Setup MongoDB configuration, dependencies, and AuditService implementation
- [ ] Update Gemini prompt and contract summary processing to match File Management schema
- [ ] Update event types and create Pydantic models for all event payloads
- [ ] Implement error handling and retry mechanism for S3, OCR, AI, File Management
- [ ] Update file_api_builder.py to map contract data correctly
- [ ] Refactor main upload route with event publishing, audit logging, and error handling
- [ ] Update .env.template and README with MongoDB and event documentation
- [ ] Test upload flow, error scenarios, and verify schema alignment