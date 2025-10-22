# 📐 Frontend Pattern Guide - Đề xuất chuẩn hóa

## 🎯 TL;DR - Quy tắc vàng

### ✅ **ĐẶT Ở ĐÂU?**

```
API calls, mappers          → src/lib/api/
Global hooks                → src/hooks/
Global types                → src/types/
Global components           → src/components/
Config, constants           → src/config/

Share trong GROUP (≥2 pages) → app/(group)/_shared/
Private cho PAGE            → app/(group)/page/_folders/
```

### ❌ **KHÔNG BAO GIỜ**
- ❌ Tạo API calls trong `_services/` - Dùng `src/lib/api/services/`
- ❌ Raw `fetch()` - Dùng `apiClient` từ `lib/api/client`
- ❌ Duplicate code - Move lên `_shared/` hoặc `src/`

---

## 🏗️ Cấu trúc chuẩn

### **Level 1: Global (src/)**
```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts              ✅ Axios instance (interceptors, retry)
│   │   └── services/              ✅ TẤT CẢ API calls
│   │       ├── file.service.ts
│   │       ├── repository.service.ts
│   │       ├── automation.service.ts
│   │       └── user.service.ts
│   │
│   ├── mappers/                   ✅ NEW: Data transformation
│   │   ├── file-mapper.ts         # API response → UI models
│   │   └── repository-mapper.ts
│   │
│   └── utils/                     ✅ Utilities
│       ├── formatters.ts          # Date, size formatters
│       ├── validators.ts          # Validation helpers
│       └── token-manager.ts
│
├── hooks/                         ✅ Global React hooks
│   ├── useAuth.tsx
│   ├── useTranslation.ts
│   ├── useFileQuery.ts            # NEW: React Query hooks
│   └── useRepositories.ts
│
├── types/                         ✅ Global TypeScript types
│   ├── api.ts                     # API response types
│   ├── file.ts                    # File domain types
│   └── repository.ts              # Repository domain types
│
├── config/                        ✅ Configuration
│   ├── constants.ts
│   ├── file-types.ts              # Rename từ contract-types
│   ├── file-tags.ts               # Rename từ contract-tags
│   └── navigation.ts
│
└── components/                    ✅ Global components
    ├── ui/                        # shadcn/ui base components
    ├── layout/                    # Layout components
    └── common/                    # Reusable business components
        ├── FileCard.tsx
        └── FileTable.tsx
```

### **Level 2: Group Shared (app/(group)/_shared/)**
```
app/(repositories)/_shared/
├── components/
│   ├── RepositoryCard.tsx         ✅ Dùng bởi ≥2 pages trong group
│   └── RepositoryHeader.tsx
├── hooks/
│   └── useRepositoryContext.ts    ✅ Shared hooks
├── types/
│   └── repository-ui.ts           ✅ Shared UI types
└── utils/
    └── repository-helpers.ts      ✅ Shared utilities

Khi nào dùng _shared/?
- ✅ Code dùng bởi ≥2 pages trong group
- ✅ Code specific cho group này
- ❌ KHÔNG dùng cho code share giữa nhiều groups (move lên src/)
```

### **Level 3: Page Private (app/(group)/page/_*/)**
```
app/(repositories)/repositories/
├── _components/                   🔒 CHỈ page này dùng
│   ├── FilesTable.tsx
│   ├── FilesFilters.tsx
│   └── FileDetailsModal.tsx
│
├── _hooks/                        🔒 UI state, selection logic
│   ├── useFileSelection.ts
│   └── useFiltersState.ts
│
├── _types/                        🔒 UI state types
│   ├── ui-state.ts
│   └── form-types.ts
│
├── _constants/                    🔒 Page-specific constants
│   ├── table-columns.ts
│   └── filter-options.ts
│
├── _utils/                        🔒 Page-specific utilities
│   └── table-helpers.ts
│
├── [repositoryId]/                🔒 Sub-routes
│   └── files/
│       └── [fileId]/
│           └── page.tsx
│
└── page.tsx                       🔒 Main page component

Khi nào dùng _folders?
- ✅ UI components chỉ page này render
- ✅ UI state management (selection, modals, filters)
- ✅ Page-specific constants (columns, options)
- ❌ KHÔNG dùng cho API calls (dùng src/lib/api)
- ❌ KHÔNG dùng cho data fetching (dùng src/hooks)
```

---

## 🔄 So sánh: Trước vs Sau

### ❌ **TRƯỚC (Có duplicate)**
```
src/lib/api/services/
└── document.service.ts            # Axios-based

src/app/(repositories)/repositories/
└── _services/                     # ❌ DUPLICATE
    ├── file-api.ts                # Fetch-based
    ├── file-list-api.ts
    └── documentsApi.ts
```

### ✅ **SAU (Single source of truth)**
```
src/lib/api/services/
├── file.service.ts                # ✅ ONLY HERE - Axios với error handling

src/lib/mappers/
├── file-mapper.ts                 # API → UI transformation
└── file-list-mapper.ts

src/app/(repositories)/repositories/
├── _components/                   # ✅ UI components
└── _hooks/                        # ✅ UI state logic
```

---

## 📋 Decision Tree

### **Tôi cần đặt code ở đâu?**

```
START
  │
  ├─ API call?
  │   └─ YES → src/lib/api/services/
  │
  ├─ Data mapper (API → UI)?
  │   └─ YES → src/lib/mappers/
  │
  ├─ React Query hook?
  │   └─ YES → src/hooks/
  │
  ├─ TypeScript type?
  │   ├─ API response? → src/types/api.ts
  │   ├─ Domain model? → src/types/{domain}.ts
  │   └─ UI state? → app/(group)/page/_types/
  │
  ├─ Component reusable?
  │   ├─ Dùng bởi nhiều groups? → src/components/
  │   ├─ Dùng bởi ≥2 pages trong group? → app/(group)/_shared/components/
  │   └─ Chỉ 1 page? → app/(group)/page/_components/
  │
  ├─ Hook?
  │   ├─ Data fetching? → src/hooks/
  │   ├─ Dùng bởi ≥2 pages trong group? → app/(group)/_shared/hooks/
  │   └─ UI state chỉ 1 page? → app/(group)/page/_hooks/
  │
  └─ Utility function?
      ├─ Global (formatters, validators)? → src/lib/utils/
      ├─ Dùng bởi ≥2 pages trong group? → app/(group)/_shared/utils/
      └─ Chỉ 1 page? → app/(group)/page/_utils/
```

---

## 🚀 Quick Start

### **1. Tạo page mới**
```bash
# Tạo structure cho page mới
.\scripts\create-page-structure.ps1 -GroupName "repositories" -PageName "settings"

# Output:
# repositories/settings/
#   ├── _components/.gitkeep
#   ├── _hooks/.gitkeep
#   ├── _types/.gitkeep
#   ├── _constants/.gitkeep
#   └── _utils/.gitkeep
```

### **2. Tạo _shared cho group**
```bash
# Tạo _shared nếu chưa có
.\scripts\create-group-shared.ps1 -GroupName "repositories"

# Output:
# (repositories)/_shared/
#   ├── components/.gitkeep
#   ├── hooks/.gitkeep
#   ├── types/.gitkeep
#   └── utils/.gitkeep
```

### **3. Áp dụng cho tất cả pages**
```bash
# Áp dụng structure cho TẤT CẢ pages hiện có
.\scripts\apply-structure-all.ps1

# Hoặc dry-run để xem trước
.\scripts\apply-structure-all.ps1 -DryRun
```

---

## 📝 Code Examples

### **Example 1: API Call**

❌ **WRONG - Fetch trong page**
```typescript
// app/(repositories)/repositories/page.tsx
const response = await fetch('/api/v1/files')
const data = await response.json()
```

✅ **CORRECT - Sử dụng service**
```typescript
// src/lib/api/services/file.service.ts
export class FileAPI {
  async getAllFiles(repositoryId: string) {
    return apiClient.get(`/repositories/${repositoryId}/files`)
  }
}

// app/(repositories)/repositories/page.tsx
import { fileAPI } from '@/lib/api'
const response = await fileAPI.getAllFiles(repositoryId)
```

### **Example 2: Data Mapping**

❌ **WRONG - Transform trong component**
```typescript
// page.tsx
const files = response.data.map(item => ({
  id: item.id,
  title: item.title || item.fileName,
  size: formatBytes(item.fileSize)
}))
```

✅ **CORRECT - Mapper function**
```typescript
// src/lib/mappers/file-mapper.ts
export function mapApiFileToUI(apiFile: ApiFile): UIFile {
  return {
    id: apiFile.id,
    title: apiFile.title || apiFile.fileName,
    size: formatBytes(apiFile.fileSize)
  }
}

// page.tsx
import { mapApiFileToUI } from '@/lib/mappers/file-mapper'
const files = response.data.map(mapApiFileToUI)
```

### **Example 3: Component Placement**

❌ **WRONG - Global component cho page-specific**
```typescript
// src/components/FilesTableForRepositoriesPage.tsx  ❌ BAD NAME
export function FilesTableForRepositoriesPage() { ... }
```

✅ **CORRECT - Private component**
```typescript
// app/(repositories)/repositories/_components/FilesTable.tsx
export function FilesTable() { ... }  // ✅ Chỉ page này dùng
```

---

## 🎯 Refactor Priorities

### **Phase 1: HIGH - Loại bỏ duplicate API** 🔥
```bash
Thời gian: 2-3 giờ
Impact: HIGH - Giảm duplicate, cải thiện error handling

1. Xóa _services/ trong pages
2. Consolidate vào src/lib/api/services/
3. Move mappers lên src/lib/mappers/
4. Update imports
```

### **Phase 2: MEDIUM - Rename Contract → File** 📝
```bash
Thời gian: 1-2 giờ
Impact: MEDIUM - Terminology chuẩn hóa

1. Rename files
2. Rename types & functions
3. Global search & replace
4. Test tất cả pages
```

### **Phase 3: LOW - Structure chuẩn hóa** 📁
```bash
Thời gian: 1 giờ
Impact: LOW - Tổ chức tốt hơn, dễ maintain

1. Run scripts tạo structure
2. Move code vào đúng folders
3. Update documentation
```

---

## ✅ Checklist Migration

- [ ] **Phase 1**: Cleanup API services
  - [ ] Xóa `_services/file-api.ts`
  - [ ] Xóa `_services/documentsApi.ts`
  - [ ] Move mappers → `src/lib/mappers/`
  - [ ] Consolidate API → `src/lib/api/services/file.service.ts`
  - [ ] Update imports trong tất cả pages

- [ ] **Phase 2**: Rename Contract → File
  - [ ] Rename components (ContractCard → FileCard)
  - [ ] Rename types (Contract → File)
  - [ ] Rename functions (translateContract* → translateFile*)
  - [ ] Global search & replace
  - [ ] Test & verify

- [ ] **Phase 3**: Structure
  - [ ] Run `apply-structure-all.ps1`
  - [ ] Review .gitkeep files
  - [ ] Move code to appropriate folders
  - [ ] Update documentation

---

## 📚 References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Private Folders](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders)
- [Project Organization](https://nextjs.org/docs/app/building-your-application/routing/colocation)

---

**Tạo bởi**: DevGO2003 Team
**Ngày**: 2025-01-22
**Version**: 1.0.0
