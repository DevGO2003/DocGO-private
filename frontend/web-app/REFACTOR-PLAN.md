# Frontend Refactor Plan - Pattern Chuẩn hóa

## 🎯 Mục tiêu
1. Loại bỏ duplicate API services (lib vs _services)
2. Rename Contract → File toàn bộ codebase
3. Chuẩn hóa structure cho tất cả pages với _folders + gitkeep

---

## 📋 Phase 1: Cleanup Duplicate Services (Priority: HIGH)

### Step 1.1: Xóa duplicate API calls trong _services
```bash
# Xóa các file duplicate
rm -rf src/app/(repositories)/repositories/_services/file-api.ts
rm -rf src/app/(repositories)/repositories/_services/file-list-api.ts
rm -rf src/app/(repositories)/repositories/_services/documentsApi.ts
```

### Step 1.2: Consolidate vào src/lib/api/services/
```typescript
// src/lib/api/services/file.service.ts (rename từ document.service.ts)
export class FileAPI {
  private basePath = '/api/v1/repository-management-service'

  // Files (rename từ Documents)
  async getAllFiles(repositoryId: string, params?: PaginationParams) {
    return apiClient.get(`${this.basePath}/repositories/${repositoryId}/files`, { params })
  }

  async getFileById(repositoryId: string, fileId: string) {
    return apiClient.get(`${this.basePath}/repositories/${repositoryId}/files/${fileId}`)
  }

  async uploadFile(repositoryId: string, file: File, metadata?: any) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) formData.append('metadata', JSON.stringify(metadata))
    return apiClient.post(`${this.basePath}/repositories/${repositoryId}/files`, formData)
  }

  async deleteFile(repositoryId: string, fileId: string) {
    return apiClient.delete(`${this.basePath}/repositories/${repositoryId}/files/${fileId}`)
  }
}

export const fileAPI = new FileAPI()
```

### Step 1.3: Giữ lại mappers nhưng move lên src/lib/
```bash
# Move mappers
mv src/app/(repositories)/repositories/_services/file-mapper.ts → src/lib/mappers/file-mapper.ts
mv src/app/(repositories)/repositories/_services/file-list-mapper.ts → src/lib/mappers/file-list-mapper.ts
mv src/app/(repositories)/repositories/_services/mappers.ts → src/lib/mappers/document-mapper.ts
```

### Step 1.4: Update imports trong pages
```typescript
// ❌ Before
import { fetchFileById } from '../../../_services/file-api'

// ✅ After
import { fileAPI } from '@/lib/api/services/file.service'
const response = await fileAPI.getFileById(repositoryId, fileId)
```

---

## 📋 Phase 2: Rename Contract → File (Priority: MEDIUM)

### Step 2.1: Rename files
```bash
# Components
mv ContractCard.tsx → FileCard.tsx

# Config
mv contract-types.ts → file-types.ts
mv contract-tags.ts → file-tags.ts

# Services  
mv document.service.ts → file.service.ts
```

### Step 2.2: Rename types & interfaces
```typescript
// ❌ Before
export interface Contract { ... }
export interface ContractCreateData { ... }

// ✅ After
export interface File { ... }
export interface FileCreateData { ... }
```

### Step 2.3: Rename functions
```typescript
// ❌ Before
translateContractStatus()
translateContractType()
getContractTypes()

// ✅ After
translateFileStatus()
translateFileType()
getFileTypes()
```

### Step 2.4: Global search & replace
```bash
# PowerShell script
$files = Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $content = $content -replace 'Contract([A-Z])', 'File$1'
  $content = $content -replace 'contract([A-Z])', 'file$1'
  $content = $content -replace 'baseContractId', 'baseFileId'
  $content = $content -replace 'contractSummary', 'fileSummary'
  Set-Content $file.FullName -Value $content
}
```

---

## 📋 Phase 3: Chuẩn hóa Structure (Priority: LOW)

### Step 3.1: Tạo template structure script
```powershell
# scripts/create-page-structure.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$GroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$PageName
)

$basePath = "src/app/($GroupName)/$PageName"

# Tạo thư mục page với _folders chuẩn
$folders = @(
    "_components",
    "_hooks", 
    "_types",
    "_constants",
    "_utils"
)

foreach ($folder in $folders) {
    $folderPath = Join-Path $basePath $folder
    New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    
    # Tạo .gitkeep
    $gitkeepPath = Join-Path $folderPath ".gitkeep"
    "# Keep this folder in git`nPage: $PageName`nGroup: $GroupName" | Out-File $gitkeepPath -Encoding UTF8
}

Write-Host "✅ Created structure for ($GroupName)/$PageName"
```

### Step 3.2: Áp dụng cho tất cả pages hiện tại
```bash
# Dashboard
./scripts/create-page-structure.ps1 -GroupName "dashboard" -PageName "dashboard"

# Repositories
./scripts/create-page-structure.ps1 -GroupName "repositories" -PageName "repositories"

# Auth
./scripts/create-page-structure.ps1 -GroupName "auth" -PageName "auth"

# Settings
./scripts/create-page-structure.ps1 -GroupName "settings" -PageName "settings"
```

### Step 3.3: Tạo _shared cho mỗi group
```powershell
# scripts/create-group-shared.ps1

param([string]$GroupName)

$sharedPath = "src/app/($GroupName)/_shared"

$folders = @("components", "hooks", "types", "utils")

foreach ($folder in $folders) {
    $folderPath = Join-Path $sharedPath $folder
    New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    
    $gitkeepPath = Join-Path $folderPath ".gitkeep"
    "# Shared $folder for ($GroupName) group`nUsage: Components/hooks used by ≥2 pages in this group" | Out-File $gitkeepPath
}
```

---

## 📋 Phase 4: Quy tắc sử dụng (Documentation)

### File: `src/README.md`
```markdown
# Frontend Structure Guidelines

## 🗂️ Cấu trúc thư mục

### Global (src/)
- `lib/` - Core libraries (API, utils, mappers)
- `hooks/` - React hooks dùng chung
- `types/` - TypeScript types dùng chung
- `config/` - Configuration files
- `components/` - UI components dùng chung

### Group-level (app/(group)/_shared/)
- Chỉ dùng khi ≥2 pages trong group cần share code
- Ưu tiên move lên `src/` nếu ≥2 groups dùng chung

### Page-level (app/(group)/page/_*)
- `_components/` - UI components chỉ page này dùng
- `_hooks/` - UI state management hooks
- `_types/` - UI state types (form, modal, etc.)
- `_constants/` - Page-specific constants
- `_utils/` - Page-specific utilities

## ❌ KHÔNG được làm

1. ❌ Tạo API calls trong `_services/` - Phải dùng `src/lib/api/services/`
2. ❌ Duplicate code giữa pages - Move lên `_shared/` hoặc `src/`
3. ❌ Hardcode API URLs - Dùng services từ `lib/api`
4. ❌ Raw fetch() calls - Dùng `apiClient` từ `lib/api/client`

## ✅ Best Practices

1. ✅ API calls → `src/lib/api/services/`
2. ✅ Data mapping → `src/lib/mappers/`
3. ✅ React Query hooks → `src/hooks/`
4. ✅ UI components (reusable) → `src/components/`
5. ✅ UI components (page-specific) → `app/(group)/page/_components/`
```

---

## 📊 Checklist

### Phase 1: Cleanup Services
- [ ] Xóa `_services/file-api.ts`
- [ ] Xóa `_services/file-list-api.ts`
- [ ] Xóa `_services/documentsApi.ts`
- [ ] Move mappers lên `src/lib/mappers/`
- [ ] Consolidate API vào `src/lib/api/services/file.service.ts`
- [ ] Update tất cả imports

### Phase 2: Rename Contract → File
- [ ] Rename files (components, config, services)
- [ ] Rename types & interfaces
- [ ] Rename functions
- [ ] Global search & replace trong codebase
- [ ] Test tất cả pages

### Phase 3: Structure
- [ ] Tạo scripts (create-page-structure, create-group-shared)
- [ ] Áp dụng cho tất cả pages hiện tại
- [ ] Tạo .gitkeep cho tất cả _folders
- [ ] Tạo _shared cho tất cả groups

### Phase 4: Documentation
- [ ] Tạo `src/README.md` với guidelines
- [ ] Update team docs
- [ ] Code review checklist

---

## 🚀 Timeline

- **Phase 1**: 2-3 giờ (High priority)
- **Phase 2**: 1-2 giờ (Medium priority)
- **Phase 3**: 1 giờ (Low priority)
- **Phase 4**: 30 phút (Documentation)

**Tổng**: ~5-7 giờ

---

## ⚠️ Breaking Changes

### Phase 1: API Services
- ⚠️ Tất cả imports từ `_services/` sẽ break
- ⚠️ Phải update tất cả pages sử dụng old API

### Phase 2: Contract → File
- ⚠️ Component names changed
- ⚠️ Function names changed
- ⚠️ Type names changed
- ⚠️ Variable names changed

**Khuyến nghị**: Làm từng phase một, test kỹ trước khi merge
