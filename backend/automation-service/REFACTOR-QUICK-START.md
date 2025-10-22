# 🚀 Quick Start - Refactor Automation Service

## TL;DR - Bắt đầu ngay trong 30 phút!

### 1️⃣ Tạo Branch mới (1 phút)
```bash
cd backend/automation-service
git checkout -b refactor/mvc-structure
```

### 2️⃣ Tạo cấu trúc thư mục (5 phút)

```powershell
# Tạo folders
New-Item -ItemType Directory -Path "app/api/v1/endpoints" -Force
New-Item -ItemType Directory -Path "app/core" -Force
New-Item -ItemType Directory -Path "app/models" -Force
New-Item -ItemType Directory -Path "app/services/ai" -Force
New-Item -ItemType Directory -Path "app/services/file" -Force
New-Item -ItemType Directory -Path "app/services/ocr" -Force
New-Item -ItemType Directory -Path "app/services/batch" -Force
New-Item -ItemType Directory -Path "app/services/event" -Force
New-Item -ItemType Directory -Path "app/services/notification" -Force
New-Item -ItemType Directory -Path "app/services/audit" -Force
New-Item -ItemType Directory -Path "app/repositories" -Force
New-Item -ItemType Directory -Path "app/utils" -Force
New-Item -ItemType Directory -Path "workers" -Force
New-Item -ItemType Directory -Path "tests/api/v1" -Force
New-Item -ItemType Directory -Path "tests/services" -Force
New-Item -ItemType Directory -Path "scripts" -Force

# Tạo __init__.py files
New-Item -ItemType File -Path "app/__init__.py" -Force
New-Item -ItemType File -Path "app/api/__init__.py" -Force
New-Item -ItemType File -Path "app/api/v1/__init__.py" -Force
New-Item -ItemType File -Path "app/api/v1/endpoints/__init__.py" -Force
New-Item -ItemType File -Path "app/core/__init__.py" -Force
New-Item -ItemType File -Path "app/models/__init__.py" -Force
New-Item -ItemType File -Path "app/services/__init__.py" -Force
New-Item -ItemType File -Path "app/utils/__init__.py" -Force
```

### 3️⃣ Move files hiện tại (10 phút)

```powershell
# Move schemas → models
Move-Item -Path "schemas/*" -Destination "app/models/" -Force

# Move utils
Move-Item -Path "utils/*" -Destination "app/utils/" -Force

# Move config
Move-Item -Path "config.py" -Destination "app/core/config.py" -Force

# Move global_instances
Move-Item -Path "global_instances.py" -Destination "app/core/instances.py" -Force
```

### 4️⃣ Tạo file app/main.py (5 phút)

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Config

# Tạm thời import routers cũ
import routers
import config_router
import contract_router
import file_router
import ocr_router

app = FastAPI(
    title=Config.get_app_name(),
    version=Config.get_app_version(),
    description="DocGO Automation Service - AI Processing & OCR"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers cũ (tạm thời)
app.include_router(routers.router)
app.include_router(config_router.router)
app.include_router(contract_router.router)
app.include_router(file_router.router)
app.include_router(ocr_router.router)

@app.get("/")
async def root():
    return {"message": "Automation Service - Refactored Structure"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### 5️⃣ Update main.py (root) (2 phút)

```python
# main.py (root level)
import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )
```

### 6️⃣ Update imports trong routers cũ (5 phút)

```python
# Trong mỗi router file (routers.py, file_router.py, etc.)
# Thay đổi imports:

# Cũ:
from schemas.response import RestResponse
from services.file_service import FileService
from config import Config

# Mới:
from app.models.response import RestResponse
from app.services.file.handler import FileService  # Sẽ tạo sau
from app.core.config import Config
```

### 7️⃣ Test (2 phút)

```powershell
# Start service
python main.py

# Test trong terminal khác
curl http://localhost:8003/
curl http://localhost:8003/health
curl http://localhost:8003/docs
```

---

## ✅ Checklist sau Quick Start

- [ ] Branch mới đã tạo
- [ ] Cấu trúc folders đã có
- [ ] Schemas → app/models/
- [ ] Utils → app/utils/
- [ ] Config → app/core/
- [ ] app/main.py hoạt động
- [ ] Service khởi động OK
- [ ] Swagger docs vẫn hoạt động
- [ ] Health check OK

---

## 🎯 Next Phase: Tách Services lớn

### Priority 1: Split ai_processing_service.py (42KB)

**Step 1:** Tạo base structure
```python
# app/services/ai/__init__.py
from .processor import AIProcessor
from .contract_analyzer import ContractAnalyzer
from .text_extractor import TextExtractor

__all__ = ["AIProcessor", "ContractAnalyzer", "TextExtractor"]
```

**Step 2:** Extract ContractAnalyzer
```python
# app/services/ai/contract_analyzer.py
import google.generativeai as genai
from app.core.config import Config

class ContractAnalyzer:
    def __init__(self):
        self.api_key = Config.get_gemini_api_key()
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def analyze_contract(self, text: str) -> dict:
        """Phân tích hợp đồng từ text"""
        # Logic từ ai_processing_service.py
        pass
    
    async def extract_parties(self, text: str) -> list:
        """Trích xuất các bên tham gia"""
        pass
```

**Step 3:** Extract TextExtractor
```python
# app/services/ai/text_extractor.py
class TextExtractor:
    async def extract_from_file(self, file_path: str) -> str:
        """Trích xuất text từ file"""
        pass
    
    async def extract_sections(self, text: str) -> dict:
        """Phân tích sections trong text"""
        pass
```

**Step 4:** Main Processor
```python
# app/services/ai/processor.py
from .contract_analyzer import ContractAnalyzer
from .text_extractor import TextExtractor

class AIProcessor:
    def __init__(self):
        self.contract_analyzer = ContractAnalyzer()
        self.text_extractor = TextExtractor()
    
    async def process_contract(self, file_path: str) -> dict:
        """Main orchestration"""
        text = await self.text_extractor.extract_from_file(file_path)
        result = await self.contract_analyzer.analyze_contract(text)
        return result
```

---

## 📝 Migration Checklist (Full Refactor)

### Phase 1: Structure ✅ (DONE trong Quick Start)
- [x] Create folder structure
- [x] Move schemas → app/models/
- [x] Move utils → app/utils/
- [x] Move config → app/core/
- [x] Create app/main.py
- [x] Update root main.py

### Phase 2: Split Services (2-3h)
- [ ] Split ai_processing_service.py → app/services/ai/
- [ ] Split file_service.py → app/services/file/
- [ ] Split ocr_service.py → app/services/ocr/
- [ ] Split batch_service.py → app/services/batch/
- [ ] Move event services → app/services/event/
- [ ] Move notification → app/services/notification/
- [ ] Move audit → app/services/audit/

### Phase 3: Split Routers (1-2h)
- [ ] Split file_router.py → app/api/v1/endpoints/files.py
- [ ] Split ocr_router.py → app/api/v1/endpoints/ocr.py
- [ ] Move contract_router → app/api/v1/endpoints/contracts.py
- [ ] Move config_router → app/api/v1/endpoints/config.py
- [ ] Create app/api/v1/router.py (aggregator)
- [ ] Create app/api/deps.py (dependencies)

### Phase 4: Workers & Tests
- [ ] Move kafka_worker → workers/kafka_consumer.py
- [ ] Move tests → tests/
- [ ] Create conftest.py
- [ ] Update all test imports

### Phase 5: Cleanup
- [ ] Delete old files
- [ ] Update README.md
- [ ] Update .gitignore
- [ ] Update Dockerfile paths
- [ ] Test all endpoints

---

## 🔥 Common Issues & Solutions

### Issue 1: Import errors
```python
# Solution: Sử dụng absolute imports
from app.models.file import FileResponse  # ✅ Đúng
from models.file import FileResponse      # ❌ Sai
```

### Issue 2: Circular imports
```python
# Solution: Move imports vào trong function
def process_file():
    from app.services.ai.processor import AIProcessor  # Import local
    processor = AIProcessor()
```

### Issue 3: Config not found
```python
# Solution: Update import paths
from app.core.config import Config  # ✅ Đúng
from config import Config           # ❌ Sai
```

---

## 📞 Need Help?

1. **Review full proposal**: Đọc `REFACTOR-PROPOSAL.md`
2. **Check examples**: Xem cấu trúc của `user-management-service`
3. **Ask team**: Hỏi lead trước khi refactor phần lớn

---

**Estimated Time:** 
- Quick Start: 30 phút
- Full Refactor: 6-9 giờ

**Difficulty:** Medium

**Impact:** HIGH (Cải thiện maintainability đáng kể!)
