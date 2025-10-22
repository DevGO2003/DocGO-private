# Cấu trúc Web-app Frontend - DocGO

## 📂 Tổng quan cấu trúc

```
frontend/web-app/
├── src/
│   ├── lib/                          # Core libraries (Global Layer)
│   │   ├── api/                      # API client & services
│   │   │   ├── client.ts             # Axios instance với interceptors
│   │   │   ├── types.ts              # API response types
│   │   │   ├── services/             # API service modules
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── document.service.ts
│   │   │   │   ├── automation.service.ts
│   │   │   │   ├── repository.service.ts
│   │   │   │   └── organization.service.ts
│   │   │   └── index.ts
│   │   ├── hooks/                    # Global custom hooks
│   │   └── utils/                    # Global utilities
│   │       ├── cn.ts                 # Tailwind merge
│   │       ├── helpers.ts
│   │       ├── api-retry.ts
│   │       ├── token-manager.ts
│   │       └── token-refresh-helper.ts
│   │
│   ├── config/                       # Configuration
│   │   ├── constants.ts              # App constants (gộp từ lib & utils)
│   │   ├── navigation.ts             # Navigation translations
│   │   ├── i18n.ts                   # i18n config
│   │   ├── contract-types.ts         # Contract type mappings
│   │   └── tags.ts                   # Tag translations
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── index.ts                  # Main types export
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── notification.ts
│   │   └── organization.ts
│   │
│   ├── providers/                    # React Context Providers
│   │   ├── I18nProvider.tsx
│   │   ├── LoadingProvider.tsx
│   │   └── index.ts
│   │
│   ├── components/                   # UI Components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── common/                   # Global shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   ├── MenuItemAnimation.tsx
│   │   │   ├── GlobalErrorSummary.tsx
│   │   │   ├── GlobalDragDrop.tsx
│   │   │   └── StickyFixGlobal.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── NavigationLink.tsx
│   │   ├── shared/                   # Shared feature components
│   │   ├── modals/                   # Modal components
│   │   ├── preview/                  # Preview components
│   │   ├── profile/                  # Profile components
│   │   ├── organization/             # Organization components
│   │   ├── contracts/                # Contract components
│   │   └── DocumentDetail/           # Document detail components
│   │
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public routes
│   │   ├── (auth)/                   # Auth routes
│   │   ├── (dashboard)/              # Dashboard
│   │   ├── (repositories)/           # Repositories feature
│   │   │   ├── _shared/              # Feature-specific shared
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   └── repositories/
│   │   ├── (users)/                  # Users management
│   │   ├── (workflow)/               # Workflow
│   │   └── api/                      # API routes
│   │
│   ├── styles/                       # Global styles
│   │   └── globals.css
│   │
│   ├── constants/                    # Constants (DEPRECATED)
│   ├── examples/                     # Examples
│   └── hooks/                        # Hooks (DEPRECATED - moved to lib/hooks)
│
├── public/                           # Static assets
├── docs/                             # Documentation
│   ├── STRUCTURE.md                  # This file
│   └── OCR_TAB_FEATURE.md
├── .cursorignore
├── .env.example
├── .env.local.example
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 Nguyên tắc MVC Pattern

### Model (Data Layer)
- `types/` - TypeScript interfaces & types
- `lib/api/services/` - API service modules
- `lib/api/types.ts` - API response types

### View (UI Layer)
- `components/` - UI components
- `app/` - Next.js routes/pages

### Controller (Logic Layer)
- `lib/hooks/` - Custom hooks
- `lib/utils/` - Utility functions
- `lib/api/client.ts` - API client logic

---

## 📦 Code Sharing Hierarchy

### 🌍 Global Shared (Dùng chung toàn app)
```
lib/, config/, types/, providers/, components/common/, components/ui/
```

**Quy tắc**: Code được sử dụng bởi **>2 features**

**Ví dụ**:
- `lib/api/client.ts` - API client cho tất cả services
- `config/constants.ts` - Constants cho toàn app
- `components/common/LoadingSpinner.tsx` - Loading indicator dùng nhiều nơi

### 🎯 Feature Shared (Trong route group)
```
app/(group)/_shared/
├── components/
├── hooks/
├── types/
└── utils/
```

**Quy tắc**: Code chỉ được sử dụng trong **1 feature cụ thể**

**Ví dụ**:
- `app/(repositories)/_shared/components/DocumentList.tsx`
- `app/(repositories)/_shared/hooks/useDocuments.ts`

### 🔒 Component Private (Trong page)
```
app/(group)/[feature]/
```

**Quy tắc**: Code **inline trong page**, không tách ra

---

## 🛠️ TypeScript Path Aliases

Sử dụng aliases để import clean và dễ maintain:

```typescript
// ✅ Clean imports
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import { APP_CONFIG } from '@/config/constants'
import { User } from '@/types'
import { cn } from '@/utils/cn'

// ❌ Tránh relative imports
import { Button } from '../../../components/ui/button'
import { apiClient } from '../../../lib/api/client'
```

### Path Mappings
```json
{
  "@/*": ["./src/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/components/*": ["./src/components/*"],
  "@/config/*": ["./src/config/*"],
  "@/types/*": ["./src/types/*"],
  "@/providers/*": ["./src/providers/*"],
  "@/hooks/*": ["./src/lib/hooks/*"],
  "@/api/*": ["./src/lib/api/*"],
  "@/utils/*": ["./src/lib/utils/*"]
}
```

---

## 📝 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DocumentList.tsx` |
| Hooks | camelCase + use | `useDocuments.ts` |
| Services | camelCase + .service | `document.service.ts` |
| Types | PascalCase + .types | `document.types.ts` |
| Utils | camelCase + Helper | `documentHelpers.ts` |
| Folders | kebab-case | `document-detail/` |
| Route Groups | (kebab-case) | `(repositories)/` |
| Shared Folder | _shared/ | `(repositories)/_shared/` |

---

## ✅ Checklist tạo/move file

Trước khi tạo hoặc di chuyển file, hỏi bản thân:

1. ⬜ Code này được dùng ở **>2 features**?
   - ✅ Đúng → Đặt trong `src/` (global)
   - ❌ Sai → Tiếp tục

2. ⬜ Code này chỉ dùng trong **1 feature cụ thể**?
   - ✅ Đúng → Đặt trong `app/(feature)/_shared/`
   - ❌ Sai → Tiếp tục

3. ⬜ Code này chỉ dùng trong **1 page duy nhất**?
   - ✅ Đúng → Inline trong page component

4. ⬜ MVC đã tách biệt rõ ràng?
   - Model (types/api) - View (components) - Controller (hooks/utils)

5. ⬜ Global code có import **feature-specific code**?
   - ⚠️ **SAI** - Vi phạm dependency direction

---

## 🔄 Migration từ cấu trúc cũ

### Files đã di chuyển

| Cũ | Mới | Lý do |
|----|-----|-------|
| `lib/api.ts` | `lib/api/client.ts` | Tách API client riêng |
| `lib/apis/*.ts` | `lib/api/services/*.service.ts` | Chuẩn hóa naming |
| `lib/http/api-client.ts` | `lib/api/client.ts` | Gộp HTTP client |
| `lib/constants.ts` | `config/constants.ts` | Tách config riêng |
| `utils/constants.ts` | `config/constants.ts` | Gộp constants |
| `lib/navigation-translations.ts` | `config/navigation.ts` | Tách config |
| `utils/contractTypeMapping.ts` | `config/contract-types.ts` | Config domain |
| `utils/tagTranslations.ts` | `config/tags.ts` | Config domain |
| `lib/utils.ts` | `lib/utils/cn.ts` | Tổ chức utils |
| `utils/cn.ts` | `lib/utils/cn.ts` | Gộp duplicate |
| `utils/helpers.ts` | `lib/utils/helpers.ts` | Global utils |
| `utils/api-retry.ts` | `lib/utils/api-retry.ts` | API utility |
| `utils/token-*.ts` | `lib/utils/token-*.ts` | Auth utilities |
| `components/*.tsx` | `components/common/*.tsx` | Shared components |
| `components/I18nProvider.tsx` | `providers/I18nProvider.tsx` | Context providers |
| `components/LoadingProvider.tsx` | `providers/LoadingProvider.tsx` | Context providers |

### Files đã xóa
- `middleware.ts.backup`, `middleware.ts.auth-backup` - Backup files
- `next.config.js.backup` - Backup file
- `utils/auth-test.ts` - Test file
- `env/` - Empty directory
- `lib/apis/` - Moved to services
- `lib/http/` - Merged to api

---

## 🚀 Best Practices

### 1. Import Order
```typescript
// 1. External dependencies
import React from 'react'
import { toast } from 'react-hot-toast'

// 2. Internal absolute imports (aliases)
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { APP_CONFIG } from '@/config/constants'

// 3. Relative imports (only for same feature)
import { DocumentCard } from './_shared/components/DocumentCard'
```

### 2. Component Organization
```
components/
├── ui/           # shadcn/ui - No business logic
├── common/       # Shared across app - Generic
└── [feature]/    # Feature-specific - Domain logic
```

### 3. API Service Pattern
```typescript
// lib/api/services/document.service.ts
export const documentService = {
  async getAll() { /* ... */ },
  async getById(id: string) { /* ... */ },
  async create(data: CreateDocumentDto) { /* ... */ },
  async update(id: string, data: UpdateDocumentDto) { /* ... */ },
  async delete(id: string) { /* ... */ },
}
```

### 4. Hook Pattern
```typescript
// lib/hooks/useDocuments.ts (Global)
export function useDocuments() {
  const [documents, setDocuments] = useState([])
  // Global hook logic
  return { documents, /* ... */ }
}

// app/(repositories)/_shared/hooks/useDocumentFilters.ts (Feature)
export function useDocumentFilters() {
  // Feature-specific logic
}
```

---

## 📚 Tài liệu tham khảo

- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [React Hooks](https://react.dev/reference/react)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

---

**Ngày cập nhật**: 21/10/2025  
**Version**: 2.0.0  
**Tác giả**: DevGO2003 Team
