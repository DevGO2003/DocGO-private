# Phase 6: i18n Completion & Layout Refactoring

**Mục tiêu**: Hoàn thiện i18n toàn app và refactor layouts

**Ưu tiên**: 🟠 **MEDIUM**

**Thời gian ước tính**: 4-5 giờ

---

## ✅ Tasks

### 6.1. Global i18n Audit
#### 6.1.1. Find Missing i18n
- [ ] **Tìm tất cả hardcoded text**
  ```bash
  # Search patterns:
  grep -r "\"[A-Z].*\"" src/ --include="*.tsx" --include="*.ts"
  grep -r "\'[A-Z].*\'" src/ --include="*.tsx" --include="*.ts"
  grep -r ">{[A-Z].*}<" src/ --include="*.tsx"
  ```

- [ ] **Exclude valid cases:**
  - [ ] Constants (CONST_NAME)
  - [ ] API endpoints
  - [ ] CSS classes
  - [ ] Keys/IDs

- [ ] **Create checklist của missing text**

#### 6.1.2. Add Missing Translation Keys
- [ ] **Update vi.json**
  ```json
  {
    "common": {
      "save": "Lưu",
      "cancel": "Hủy",
      "delete": "Xóa",
      "edit": "Chỉnh sửa",
      "search": "Tìm kiếm",
      "filter": "Lọc",
      "refresh": "Làm mới",
      "showMore": "Xem thêm",
      "loading": "Đang tải...",
      "noData": "Không có dữ liệu",
      "error": "Đã có lỗi xảy ra"
    }
  }
  ```

- [ ] **Update en.json** (tương tự)

#### 6.1.3. Replace Hardcoded Text
- [ ] **Example replacements:**
  ```tsx
  // Before:
  <button>Save</button>

  // After:
  <button>{t('common.save')}</button>
  ```

- [ ] **Apply to all files**

#### 6.1.4. Verify Translation Coverage
- [ ] **Run i18n coverage check**
  ```bash
  # Custom script or manual verification
  npm run i18n:check
  ```

- [ ] **Target: 100% coverage**

---

### 6.2. HeaderControlLayout - Remove Subtitle
#### 6.2.1. Find All HeaderControlLayout Usage
- [ ] **Search:**
  ```bash
  grep -r "HeaderControlLayout" src/ --include="*.tsx"
  grep -r "subtitle=" src/ --include="*.tsx"
  ```

- [ ] **List all files:**
  - [ ] Dashboard page
  - [ ] Repositories pages
  - [ ] Organizations page
  - [ ] Settings page
  - [ ] Profile page
  - [ ] File detail page
  - [ ] v.v.

#### 6.2.2. Remove Subtitle Props
- [ ] **For each usage:**
  ```tsx
  // Before:
  <HeaderControlLayout
    title="Page Title"
    subtitle="This is subtitle"  // ← XÓA
    description="This is description"
  />

  // After:
  <HeaderControlLayout
    title="Page Title"
    description="This is description"
  />
  ```

#### 6.2.3. Add Description If Missing
- [ ] **Nếu thiếu description → Bổ sung**
  ```tsx
  <HeaderControlLayout
    title={t('page.title')}
    description={t('page.description')}  // ← BẮT BUỘC
    breadcrumbs={[...]}
    headerRight={...}
  />
  ```

- [ ] **Description phải mô tả rõ trang làm gì**
  - [ ] Dashboard: "Xem tổng quan hoạt động và thống kê"
  - [ ] Repositories: "Quản lý kho tài liệu và files"
  - [ ] Organizations: "Quản lý tổ chức và thành viên"
  - [ ] v.v.

#### 6.2.4. Update Translation Files
- [ ] **Add description keys:**
  ```json
  {
    "dashboard": {
      "title": "Bảng điều khiển",
      "description": "Xem tổng quan hoạt động và thống kê của bạn"
    },
    "repositories": {
      "title": "Kho tài liệu",
      "description": "Quản lý kho tài liệu, files và permissions"
    }
  }
  ```

---

### 6.3. Layout Refactoring - Move Specific Layouts
#### 6.3.1. Identify Specific Layouts
- [ ] **Find layouts in `src/layouts/`:**
  ```
  src/layouts/
  ├── MainLayout/          ✅ Keep here
  ├── HeaderLayout/        ✅ Keep here
  ├── UploadHeaderLayout/  ❌ Move to features
  ├── RepositoryHeaderLayout/  ❌ Move
  ├── OrganizationHeaderLayout/  ❌ Move
  └── ...
  ```

#### 6.3.2. Create Feature Layout Folders
- [ ] **Create structure:**
  ```
  src/features/
  ├── upload/
  │   └── layouts/
  │       └── UploadHeaderLayout/
  ├── repositories/
  │   └── layouts/
  │       └── RepositoryHeaderLayout/
  ├── organizations/
  │   └── layouts/
  │       └── OrganizationHeaderLayout/
  └── ...
  ```

#### 6.3.3. Move Layout Files
- [ ] **Move UploadHeaderLayout:**
  ```bash
  mv src/layouts/UploadHeaderLayout src/features/upload/layouts/
  ```

- [ ] **Move RepositoryHeaderLayout:**
  ```bash
  mv src/layouts/RepositoryHeaderLayout src/features/repositories/layouts/
  ```

- [ ] **Move other specific layouts**

#### 6.3.4. Update Imports
- [ ] **Update all imports:**
  ```tsx
  // Before:
  import UploadHeaderLayout from '@/layouts/UploadHeaderLayout';

  // After:
  import UploadHeaderLayout from '@/features/upload/layouts/UploadHeaderLayout';
  ```

- [ ] **Use find & replace:**
  ```bash
  # VSCode regex find & replace
  Find: import (.*) from '@/layouts/(Upload|Repository|Organization)(.*)';
  Replace: import $1 from '@/features/$2/layouts/$2$3';
  ```

#### 6.3.5. Update Path Aliases (if needed)
- [ ] **Check `tsconfig.json` paths:**
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/features/*": ["src/features/*"],
        "@/layouts/*": ["src/layouts/*"]
      }
    }
  }
  ```

---

### 6.4. Verify Clean Structure
#### 6.4.1. Final Structure Check
- [ ] **src/layouts/ should only have:**
  ```
  src/layouts/
  ├── MainLayout/
  └── HeaderLayout/
  ```

- [ ] **All specific layouts moved to features/**

#### 6.4.2. Build Test
- [ ] **Run build:**
  ```bash
  npm run build
  ```

- [ ] **Fix any import errors**

- [ ] **Verify no broken links**

---

## 📊 Success Criteria

### i18n
- ✅ Tất cả text đã có translation keys
- ✅ vi.json và en.json đầy đủ
- ✅ Không còn hardcoded text
- ✅ 100% coverage

### HeaderControlLayout
- ✅ Đã xóa tất cả `subtitle` props
- ✅ Tất cả pages có `description`
- ✅ Descriptions mô tả rõ ràng chức năng trang

### Layout Structure
- ✅ `src/layouts/` chỉ còn MainLayout và HeaderLayout
- ✅ Specific layouts đã di chuyển vào `src/features/[feature]/layouts/`
- ✅ Imports đã update
- ✅ Build thành công
- ✅ No errors

---

## 🚀 Next Phase

➡️ **Phase 7**: Testing, Validation & Documentation
