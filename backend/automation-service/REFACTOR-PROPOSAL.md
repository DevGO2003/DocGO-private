# 🔧 Automation Service - Đề xuất Refactor theo MVC Pattern

## 📊 Phân tích vấn đề hiện tại

### ❌ Cấu trúc hiện tại (RỐI)
```
automation-service/
├── main.py                         # Entry point
├── config.py                       # Config ở root (13KB)
├── global_instances.py             # Singletons ở root
├── kafka_worker.py                 # Worker ở root
├── routers.py                      # Router tổng (11KB)
├── config_router.py                # Router riêng lẻ
├── contract_router.py              # Router riêng lẻ
├── file_router.py                  # 🔥 QUỐC LỘ 61KB!
├── ocr_router.py                   # Router riêng lẻ (23KB)
├── services/                       # 17 files
│   ├── ai_processing_service.py    # 🔥 KHỦNG 42KB!
│   ├── file_service.py             # 19KB
│   ├── batch_service.py            # 16KB
│   └── ...                         # 14 files khác
├── schemas/                        # 8 files - OK
├── utils/                          # 2 files - OK
└── test_*.py                       # Test files ở root
```

### ⚠️ Vấn đề nghiêm trọng

1. **Routers tản mát** (6 files router ở root!)
2. **File quá lớn**:
   - `file_router.py`: 61KB (quốc lộ!)
   - `ai_processing_service.py`: 42KB 
   - `ocr_router.py`: 23KB
3. **Không có structure rõ ràng**:
   - Config, workers, routers lẫn lộn ở root
   - Thiếu tầng controllers
   - Services không được tách nhỏ
4. **Khó maintain**:
   - Tìm code khó
   - Merge conflict nhiều
   - Test khó khăn

---

## ✅ Cấu trúc đề xuất (MVC Pattern)

### 📂 Structure mới (SẠCH SẼ)

```
automation-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app instance
│   │
│   ├── api/                        # API Layer (Controllers/Routers)
│   │   ├── __init__.py
│   │   ├── deps.py                 # Dependencies injection
│   │   ├── v1/                     # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── router.py           # Main router aggregator
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── files.py        # File endpoints (split từ file_router.py)
│   │   │   │   ├── ocr.py          # OCR endpoints
│   │   │   │   ├── contracts.py    # Contract endpoints
│   │   │   │   ├── batch.py        # Batch processing endpoints
│   │   │   │   ├── config.py       # Config endpoints
│   │   │   │   ├── health.py       # Health check
│   │   │   │   └── websocket.py    # WebSocket endpoints
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── core/                       # Core settings & config
│   │   ├── __init__.py
│   │   ├── config.py               # Settings (from root config.py)
│   │   ├── constants.py            # Constants
│   │   ├── exceptions.py           # Custom exceptions
│   │   └── security.py             # Security utilities
│   │
│   ├── models/                     # Data Models (Schemas)
│   │   ├── __init__.py
│   │   ├── base.py                 # Base models
│   │   ├── file.py                 # File models
│   │   ├── contract.py             # Contract models
│   │   ├── batch.py                # Batch models
│   │   ├── event.py                # Event models
│   │   ├── notification.py         # Notification models
│   │   └── response.py             # Response models
│   │
│   ├── services/                   # Business Logic
│   │   ├── __init__.py
│   │   ├── ai/                     # AI Processing
│   │   │   ├── __init__.py
│   │   │   ├── processor.py        # Main AI processor (split từ ai_processing_service.py)
│   │   │   ├── contract_analyzer.py
│   │   │   ├── text_extractor.py
│   │   │   └── summarizer.py
│   │   ├── file/                   # File Processing
│   │   │   ├── __init__.py
│   │   │   ├── handler.py          # File handler (split từ file_service.py)
│   │   │   ├── extractor.py        # Extract service
│   │   │   ├── validator.py
│   │   │   └── builder.py
│   │   ├── ocr/                    # OCR Processing
│   │   │   ├── __init__.py
│   │   │   ├── engine.py           # OCR engine
│   │   │   └── processor.py
│   │   ├── batch/                  # Batch Processing
│   │   │   ├── __init__.py
│   │   │   ├── manager.py
│   │   │   └── processor.py
│   │   ├── event/                  # Event Handling
│   │   │   ├── __init__.py
│   │   │   ├── consumer.py
│   │   │   ├── publisher.py
│   │   │   └── handler.py
│   │   ├── notification/           # Notifications
│   │   │   ├── __init__.py
│   │   │   └── manager.py
│   │   └── audit/                  # Audit Logging
│   │       ├── __init__.py
│   │       └── logger.py
│   │
│   ├── repositories/               # Data Access Layer (nếu cần)
│   │   ├── __init__.py
│   │   ├── mongo.py                # MongoDB repository
│   │   └── kafka.py                # Kafka repository
│   │
│   └── utils/                      # Utilities
│       ├── __init__.py
│       ├── logger.py
│       ├── retry.py
│       ├── validators.py
│       └── helpers.py
│
├── tests/                          # Tests (tách ra khỏi root)
│   ├── __init__.py
│   ├── conftest.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── test_files.py
│   │   │   ├── test_ocr.py
│   │   │   └── ...
│   ├── services/
│   │   ├── test_ai_processor.py
│   │   └── ...
│   └── ...
│
├── workers/                        # Background workers
│   ├── __init__.py
│   ├── kafka_consumer.py           # Kafka worker
│   └── batch_processor.py
│
├── migrations/                     # DB migrations (nếu cần)
├── scripts/                        # Utility scripts
│   └── setup_ocr.sh
│
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── requirements.txt
├── README.md
└── main.py                         # Entry point (import from app/main.py)
```

---

## 🎯 Chiến lược Refactor

### Phase 1: Chuẩn bị (1-2 giờ)
1. ✅ Tạo cấu trúc thư mục mới
2. ✅ Move schemas → app/models/
3. ✅ Move utils → app/utils/
4. ✅ Move config.py → app/core/config.py

### Phase 2: Tách Services (2-3 giờ)
1. 🔥 **ai_processing_service.py (42KB)**:
   ```
   Split thành:
   - app/services/ai/processor.py (core logic)
   - app/services/ai/contract_analyzer.py
   - app/services/ai/text_extractor.py
   - app/services/ai/summarizer.py
   ```

2. 🔥 **file_service.py (19KB)**:
   ```
   Split thành:
   - app/services/file/handler.py
   - app/services/file/extractor.py
   - app/services/file/validator.py
   ```

3. **Các services khác**: Move vào app/services/ với grouping logic

### Phase 3: Tách Routers (1-2 giờ)
1. 🔥 **file_router.py (61KB)**:
   ```
   Split thành:
   - app/api/v1/endpoints/files.py (CRUD operations)
   - app/api/v1/endpoints/upload.py (Upload logic)
   - app/api/v1/endpoints/download.py (Download logic)
   - app/api/v1/endpoints/metadata.py (Metadata operations)
   ```

2. 🔥 **ocr_router.py (23KB)**:
   ```
   Split thành:
   - app/api/v1/endpoints/ocr.py
   ```

3. **Merge small routers**:
   ```
   - config_router.py → app/api/v1/endpoints/config.py
   - contract_router.py → app/api/v1/endpoints/contracts.py
   ```

### Phase 4: Workers & Main (30 phút)
1. Move kafka_worker.py → workers/kafka_consumer.py
2. Update main.py để import từ app/main.py
3. Update dependencies injection

### Phase 5: Tests (1 giờ)
1. Move test files → tests/
2. Update import paths
3. Add conftest.py với fixtures

---

## 📋 Migration Plan Chi Tiết

### Step 1: Tạo structure (10 phút)
```bash
# Tạo folders
mkdir -p app/api/v1/endpoints
mkdir -p app/core
mkdir -p app/models
mkdir -p app/services/{ai,file,ocr,batch,event,notification,audit}
mkdir -p app/repositories
mkdir -p app/utils
mkdir -p workers
mkdir -p tests/{api/v1,services}
mkdir -p scripts
```

### Step 2: Move files hiện tại (20 phút)
```bash
# Schemas → Models
mv schemas/* app/models/

# Utils
mv utils/* app/utils/

# Config
mv config.py app/core/config.py
mv global_instances.py app/core/instances.py
```

### Step 3: Split AI Service (30 phút)
```python
# app/services/ai/processor.py
from .contract_analyzer import ContractAnalyzer
from .text_extractor import TextExtractor
from .summarizer import Summarizer

class AIProcessor:
    def __init__(self):
        self.contract_analyzer = ContractAnalyzer()
        self.text_extractor = TextExtractor()
        self.summarizer = Summarizer()
    
    async def process_contract(self, file):
        # Main orchestration logic
        pass
```

### Step 4: Split File Router (1 giờ)
```python
# app/api/v1/endpoints/files.py
from fastapi import APIRouter, Depends
from app.services.file.handler import FileHandler
from app.models.file import FileResponse

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/", response_model=List[FileResponse])
async def list_files(handler: FileHandler = Depends()):
    return await handler.list_files()

@router.post("/", response_model=FileResponse)
async def upload_file(file: UploadFile, handler: FileHandler = Depends()):
    return await handler.upload(file)
```

### Step 5: Update Main (15 phút)
```python
# app/main.py
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    # Initialize services
    pass
```

```python
# main.py (root)
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
```

---

## ✅ So sánh Before/After

| Aspect | Before | After |
|--------|--------|-------|
| **Routers** | 6 files rời rạc ở root | Tập trung trong app/api/v1/endpoints/ |
| **File lớn nhất** | 61KB (file_router.py) | ~15KB (mỗi endpoint file) |
| **Services** | 17 files không group | Group theo domain (ai/, file/, ocr/) |
| **Config** | Lẫn lộn ở root | Tập trung trong app/core/ |
| **Tests** | Ở root | Tách riêng trong tests/ |
| **Import depth** | Flat, dễ conflict | Nested, rõ ràng |

---

## 🎯 Lợi ích

### 1. **Dễ bảo trì**
- File nhỏ hơn (~200-300 lines/file)
- Logic rõ ràng, dễ tìm
- Tách biệt concerns

### 2. **Dễ test**
- Mỗi module nhỏ, dễ mock
- Tests có structure riêng
- Integration tests dễ viết

### 3. **Dễ mở rộng**
- Thêm endpoint mới: tạo file trong endpoints/
- Thêm service mới: tạo folder trong services/
- Versioning API dễ dàng (v2, v3...)

### 4. **Team collaboration tốt hơn**
- Ít conflict khi merge
- Code review dễ hơn
- Onboarding nhanh hơn

### 5. **Performance**
- Import chỉ cần thiết
- Lazy loading services
- Better code splitting

---

## ⚠️ Rủi ro & Giải pháp

### Rủi ro 1: Breaking changes
**Giải pháp:** 
- Refactor từng phần nhỏ
- Giữ backward compatibility
- Test kỹ sau mỗi bước

### Rủi ro 2: Import paths thay đổi
**Giải pháp:**
- Update tất cả imports cùng lúc
- Dùng absolute imports: `from app.services...`
- Add __init__.py đầy đủ

### Rủi ro 3: Circular imports
**Giải pháp:**
- Dùng dependency injection
- Forward references khi cần
- Tách interface/implementation

---

## 📅 Timeline

| Phase | Thời gian | Priority |
|-------|----------|----------|
| Phase 1: Chuẩn bị | 1-2 giờ | HIGH |
| Phase 2: Tách Services | 2-3 giờ | HIGH |
| Phase 3: Tách Routers | 1-2 giờ | HIGH |
| Phase 4: Workers & Main | 30 phút | MEDIUM |
| Phase 5: Tests | 1 giờ | MEDIUM |
| **TOTAL** | **6-9 giờ** | - |

---

## 🚀 Next Steps

1. **Review proposal này** với team
2. **Backup code hiện tại**: Create branch `refactor/mvc-structure`
3. **Start Phase 1**: Tạo structure, move schemas/utils
4. **Test thoroughly** sau mỗi phase
5. **Document changes** trong README.md

---

## 📚 References

- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [FastAPI Project Structure](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Clean Architecture in Python](https://www.thedigitalcatonline.com/blog/2016/11/14/clean-architectures-in-python-a-step-by-step-example/)

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-22  
**Author:** AI Assistant
