# 🚀 Automation Service - Refactor Guide v2

## 📦 Tổng quan

Hướng dẫn refactor Automation Service sang **Clean Architecture** với:
- ✅ Tuân thủ features trong README.md
- ✅ Áp dụng Database Standards (UUID v7, naming conventions)
- ✅ Clean folder structure (app/api/, app/services/, app/models/)
- ✅ Giảm file size (file_router.py 61KB → 4 files ~15KB)
- ✅ Tách services theo domain (ai/, ocr/, document/, event/, storage/)

**Timeline:** 5-7 days  
**Risk:** Low (backward compatible)

---

## 🎯 Mục tiêu

### **Vấn đề hiện tại**
```
automation-service/
├── 📁 ROOT (12 Python files) ❌
│   ├── file_router.py (61KB) 🔥
│   ├── ocr_router.py (23KB) 🔥
│   ├── contract_router.py (6KB)
│   ├── config_router.py (5KB)
│   └── routers.py (11.8KB)
│
├── 📁 services/ (17 files) ⚠️
│   ├── ai_processing_service.py (42KB) 🔥
│   └── ... (16 files khác)
```

### **Cấu trúc mới**
```
automation-service/
├── app/
│   ├── api/v1/endpoints/          # Controllers
│   ├── core/                      # Config, middleware
│   ├── models/                    # Pydantic schemas
│   ├── services/                  # Business logic (domain-based)
│   └── utils/                     # Utilities
├── workers/                       # Background workers
└── tests/                         # Tests
```

---

## 📊 Cấu trúc chi tiết

### **1. API Layer** (Controllers)

```
app/api/
├── __init__.py
├── deps.py                        # Dependencies
└── v1/
    ├── __init__.py
    ├── router.py                  # Main router aggregator
    └── endpoints/
        ├── __init__.py
        ├── documents.py           # Document upload/processing
        ├── contracts.py           # Contract summary
        ├── ocr.py                # OCR endpoints
        ├── events.py             # Event publishing
        ├── health.py             # Health check
        └── config.py             # Config endpoints
```

**Example: app/api/v1/endpoints/documents.py**
```python
from fastapi import APIRouter, UploadFile, File, Depends
from app.models.response.base import RestResponse
from app.models.response.document import DocumentProcessResponse
from app.services.document.processor import DocumentProcessor
from app.api.deps import get_actor, get_correlation_id

router = APIRouter(
    prefix="/documents",
    tags=["📄 Documents"]
)

@router.post("/upload", response_model=RestResponse[DocumentProcessResponse])
async def upload_document(
    file: UploadFile = File(...),
    actor: str = Depends(get_actor),
    correlation_id: str = Depends(get_correlation_id)
):
    """
    Upload and process document
    - Sync processing for files < 2MB
    - Async processing for files >= 2MB
    """
    processor = DocumentProcessor()
    result = await processor.process(file, actor, correlation_id)
    
    return RestResponse(
        statusCode=201,
        shortMessage="SUCCESS",
        description="Document uploaded and processed successfully",
        data=result,
        timestamp=datetime.utcnow().isoformat(),
        requestId=correlation_id
    )
```

---

### **2. Core Layer** (Config & Middleware)

```
app/core/
├── __init__.py
├── config.py                      # Settings from .env
├── dependencies.py                # Global dependencies
├── middleware.py                  # Actor/Correlation middleware
└── events.py                      # Startup/shutdown events
```

**Example: app/core/dependencies.py**
```python
from fastapi import Request, Depends
from app.utils.uuid_generator import UUIDv7Generator

async def get_actor(request: Request) -> str:
    """Get actor from request headers or default to 'system'"""
    return request.headers.get("X-Actor", "system")

async def get_correlation_id(request: Request) -> str:
    """Get or generate correlation ID"""
    correlation_id = request.headers.get("X-Correlation-Id")
    if not correlation_id:
        correlation_id = UUIDv7Generator.generate()
    return correlation_id
```

**Example: app/core/middleware.py**
```python
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.uuid_generator import UUIDv7Generator

class ActorCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Get or generate correlation ID
        correlation_id = request.headers.get("X-Correlation-Id") or UUIDv7Generator.generate()
        
        # Get actor (default: system)
        actor = request.headers.get("X-Actor") or "system"
        
        # Attach to request state
        request.state.correlation_id = correlation_id
        request.state.actor = actor
        
        # Process request
        response = await call_next(request)
        
        # Add headers to response
        response.headers["X-Correlation-Id"] = correlation_id
        response.headers["X-Actor"] = actor
        
        return response
```

---

### **3. Models Layer** (Pydantic Schemas)

```
app/models/
├── __init__.py
├── request/
│   ├── __init__.py
│   ├── document.py                # DocumentUploadRequest
│   ├── contract.py                # ContractSummaryRequest
│   └── ocr.py                    # OCRRequest
├── response/
│   ├── __init__.py
│   ├── base.py                    # RestResponse wrapper
│   ├── document.py                # DocumentProcessResponse
│   ├── contract.py                # ContractSummaryResponse
│   └── ocr.py                    # OCRResponse
└── events/
    ├── __init__.py
    ├── file_metadata.py           # FILE_METADATA_RECORDED
    ├── content_extracted.py       # FILE_CONTENT_EXTRACTED
    └── contract_summary.py        # CONTRACT_SUMMARY_GENERATED
```

**Example: app/models/response/base.py**
```python
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional
from datetime import datetime

T = TypeVar('T')

class RestResponse(BaseModel, Generic[T]):
    """Standard REST response wrapper"""
    statusCode: int = Field(..., description="HTTP status code")
    shortMessage: str = Field(..., description="SHORT_MESSAGE enum")
    description: str = Field(..., description="Human-readable description")
    data: Optional[T] = Field(None, description="Response data")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    requestId: str = Field(..., description="Request correlation ID")
    path: Optional[str] = Field(None, description="Request path")
```

**Example: app/models/events/file_metadata.py**
```python
from pydantic import BaseModel, Field
from datetime import datetime
from app.utils.uuid_generator import UUIDv7Generator

class FileMetadataRecordedEvent(BaseModel):
    """FILE_METADATA_RECORDED event payload"""
    eventId: str = Field(default_factory=UUIDv7Generator.generate)
    eventType: str = Field(default="FILE_METADATA_RECORDED")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    actor: str = Field(default="system")
    correlationId: str
    
    data: dict = Field(..., description="File metadata with UUID v7 documentId")
```

---

### **4. Services Layer** (Business Logic)

```
app/services/
├── __init__.py
├── ai/
│   ├── __init__.py
│   ├── gemini_service.py          # Gemini AI integration
│   ├── contract_analyzer.py       # Contract analysis
│   └── text_processor.py          # Text processing
├── ocr/
│   ├── __init__.py
│   ├── tesseract_service.py       # Tesseract OCR
│   ├── easyocr_service.py        # EasyOCR
│   └── ocr_orchestrator.py        # OCR engine selection
├── document/
│   ├── __init__.py
│   ├── processor.py               # Document processor
│   ├── extractor.py               # Extract text from files
│   ├── validator.py               # Validate documents
│   └── classifier.py              # Classify document types
├── event/
│   ├── __init__.py
│   ├── publisher.py               # Kafka event publisher
│   ├── consumer.py                # Kafka event consumer
│   └── event_builder.py           # Build event payloads
├── storage/
│   ├── __init__.py
│   ├── s3_client.py               # Download from S3
│   └── temp_manager.py            # Manage temp files
└── notification/
    ├── __init__.py
    ├── websocket_manager.py       # WebSocket connections
    └── progress_tracker.py        # Track processing progress
```

**Example: app/services/document/processor.py**
```python
from app.services.ai.gemini_service import GeminiService
from app.services.ocr.ocr_orchestrator import OCROrchestrator
from app.services.event.publisher import EventPublisher
from app.models.events.content_extracted import ContentExtractedEvent

class DocumentProcessor:
    def __init__(self):
        self.gemini = GeminiService()
        self.ocr = OCROrchestrator()
        self.event_publisher = EventPublisher()
    
    async def process(self, file, actor: str, correlation_id: str):
        # 1. Extract text
        text = await self._extract_text(file)
        
        # 2. AI processing
        analysis = await self.gemini.analyze(text)
        
        # 3. Publish event
        event = ContentExtractedEvent(
            correlationId=correlation_id,
            actor=actor,
            data={
                "plaintext": text,
                "extractedText": analysis.get("extracted_text"),
                "summary": analysis.get("summary"),
                "keyTerms": analysis.get("key_terms", [])
            }
        )
        await self.event_publisher.publish(event)
        
        return {"status": "success", "correlationId": correlation_id}
```

---

### **5. Utils Layer**

```
app/utils/
├── __init__.py
├── logger.py                      # Logging setup
├── retry.py                       # Retry logic
├── uuid_generator.py              # UUID v7 generator
└── helpers.py                     # Helper functions
```

**Example: app/utils/uuid_generator.py**
```python
import time
import secrets
from uuid import UUID

class UUIDv7Generator:
    """Generate UUID v7 (time-sortable)"""
    
    @staticmethod
    def generate() -> str:
        # Unix timestamp in milliseconds (48 bits)
        timestamp_ms = int(time.time() * 1000)
        
        # UUID v7 format
        uuid_int = (timestamp_ms & 0xFFFFFFFFFFFF) << 80
        uuid_int |= (0x7 << 76)  # Version 7
        uuid_int |= (secrets.randbits(12) << 64)
        uuid_int |= (0x2 << 62)  # Variant 10
        uuid_int |= secrets.randbits(62)
        
        return str(UUID(int=uuid_int))
```

---

## 🔄 Migration Plan

### **Phase 1: Setup Structure (Day 1)**

#### Step 1.1: Create folder structure
```powershell
# Create folders
New-Item -ItemType Directory -Path "app/api/v1/endpoints" -Force
New-Item -ItemType Directory -Path "app/core" -Force
New-Item -ItemType Directory -Path "app/models/request" -Force
New-Item -ItemType Directory -Path "app/models/response" -Force
New-Item -ItemType Directory -Path "app/models/events" -Force
New-Item -ItemType Directory -Path "app/services/ai" -Force
New-Item -ItemType Directory -Path "app/services/ocr" -Force
New-Item -ItemType Directory -Path "app/services/document" -Force
New-Item -ItemType Directory -Path "app/services/event" -Force
New-Item -ItemType Directory -Path "app/services/storage" -Force
New-Item -ItemType Directory -Path "app/services/notification" -Force
New-Item -ItemType Directory -Path "app/utils" -Force
New-Item -ItemType Directory -Path "workers" -Force
New-Item -ItemType Directory -Path "tests/api/v1" -Force
New-Item -ItemType Directory -Path "tests/services" -Force
```

#### Step 1.2: Create __init__.py files
```powershell
# Create all __init__.py files
$folders = @(
    "app",
    "app/api",
    "app/api/v1",
    "app/api/v1/endpoints",
    "app/core",
    "app/models",
    "app/models/request",
    "app/models/response",
    "app/models/events",
    "app/services",
    "app/services/ai",
    "app/services/ocr",
    "app/services/document",
    "app/services/event",
    "app/services/storage",
    "app/services/notification",
    "app/utils",
    "workers",
    "tests",
    "tests/api",
    "tests/api/v1",
    "tests/services"
)

foreach ($folder in $folders) {
    New-Item -ItemType File -Path "$folder/__init__.py" -Force
}
```

---

### **Phase 2: Move existing code (Day 1-2)**

#### Step 2.1: Move schemas → models
```powershell
Move-Item -Path "schemas/contract_summary.py" -Destination "app/models/response/contract.py"
Move-Item -Path "schemas/event_schemas.py" -Destination "app/models/events/"
Move-Item -Path "schemas/file_schemas.py" -Destination "app/models/request/document.py"
Move-Item -Path "schemas/response.py" -Destination "app/models/response/base.py"
```

#### Step 2.2: Move utils
```powershell
Move-Item -Path "utils/logger.py" -Destination "app/utils/logger.py"
Move-Item -Path "utils/retry_helper.py" -Destination "app/utils/retry.py"
```

---

### **Phase 3: Refactor Services (Day 2-4)**

#### Step 3.1: Split ai_processing_service.py (42KB → 3 files)

**Before:**
```
services/ai_processing_service.py (42KB)
```

**After:**
```
app/services/ai/
├── gemini_service.py (15KB)
├── contract_analyzer.py (15KB)
└── text_processor.py (12KB)
```

#### Step 3.2: Refactor OCR services
```
services/ocr_service.py → app/services/ocr/
├── tesseract_service.py
├── easyocr_service.py
└── ocr_orchestrator.py
```

#### Step 3.3: Create new service layers
```python
# app/services/event/publisher.py
class EventPublisher:
    async def publish_file_metadata(self, data, actor):
        event = FileMetadataRecordedEvent(...)
        await kafka_producer.send("file-events", event.dict())
```

---

### **Phase 4: Refactor Routers (Day 4-5)**

#### Step 4.1: Split file_router.py (61KB → endpoints/documents.py)

**Before:**
```python
# file_router.py (61KB)
@router.post("/upload")
@router.post("/process")
@router.get("/status/{task_id}")
# ... 50+ endpoints
```

**After:**
```python
# app/api/v1/endpoints/documents.py (~15KB)
@router.post("/upload")
@router.get("/status/{task_id}")

# app/api/v1/endpoints/events.py (~10KB)
@router.post("/publish")

# app/api/v1/endpoints/health.py (~5KB)
@router.get("/health")
```

---

### **Phase 5: Update main.py (Day 5)**

**New main.py:**
```python
from fastapi import FastAPI
from app.core.config import settings
from app.core.middleware import ActorCorrelationMiddleware
from app.api.v1.router import api_router

app = FastAPI(
    title="Automation Service API",
    version="2.0.0",
    docs_url="/docs"
)

# Add middleware
app.add_middleware(ActorCorrelationMiddleware)

# Include routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Automation Service v2.0"}
```

---

### **Phase 6: Testing (Day 6-7)**

#### Step 6.1: Update tests
```python
# tests/api/v1/test_documents.py
async def test_upload_document():
    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.pdf", b"content")},
        headers={"X-Actor": "test-user"}
    )
    assert response.status_code == 201
```

#### Step 6.2: Integration tests
```python
# tests/services/test_document_processor.py
async def test_document_processor():
    processor = DocumentProcessor()
    result = await processor.process(file, "system", "corr-123")
    assert result["status"] == "success"
```

---

## ✅ Checklist

### **Phase 1: Setup**
- [ ] Create folder structure
- [ ] Create __init__.py files
- [ ] Add UUID v7 generator

### **Phase 2: Move files**
- [ ] Move schemas → models
- [ ] Move utils → app/utils
- [ ] Backup old structure

### **Phase 3: Refactor services**
- [ ] Split ai_processing_service.py
- [ ] Organize OCR services
- [ ] Create event services
- [ ] Create storage services

### **Phase 4: Refactor routers**
- [ ] Split file_router.py
- [ ] Create documents.py endpoint
- [ ] Create ocr.py endpoint
- [ ] Create contracts.py endpoint

### **Phase 5: Update main.py**
- [ ] Update imports
- [ ] Add new middleware
- [ ] Include new routers

### **Phase 6: Testing**
- [ ] Update all tests
- [ ] Run integration tests
- [ ] Verify Kafka events

---

## 📊 Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Largest file** | 61KB | 15KB | ⚡ 4x smaller |
| **Services organization** | 17 files flat | 6 domain folders | 📁 Structured |
| **Routers** | 5 files at root | 1 aggregator + endpoints | 🎯 Organized |
| **ID format** | No standard | UUID v7 | 🆔 Time-sortable |
| **Correlation** | Manual | Middleware | 🔍 Automatic |

---

## 🎯 Kết luận

✅ **Clean Architecture achieved:**
- API Layer (Controllers)
- Business Logic (Services by domain)
- Data Models (Pydantic schemas)
- Infrastructure (Utils, Workers)

✅ **Database Standards integrated:**
- UUID v7 for all IDs
- Consistent naming conventions
- Event-driven architecture

✅ **Maintainable codebase:**
- Small, focused files
- Clear separation of concerns
- Easy to test and extend

**Status:** 🟢 Ready for Implementation  
**Version:** v2  
**Created:** 2025-10-23
