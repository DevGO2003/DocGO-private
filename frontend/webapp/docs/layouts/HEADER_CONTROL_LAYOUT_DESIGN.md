# 🎨 Thiết kế Layout Header Control - Trang Tệp

## 📐 1. Layout Chung (Base Layout)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER WRAPPER                                                              │
├─────────────────────────────┬──────────────────────────────────────────────┤
│ LEFT SECTION                │ RIGHT SECTION                                │
│                             │                                              │
│ ┌─────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ Breadcrumbs             │ │ │ Action Buttons Group                     │ │
│ │ Home > Repo > Files     │ │ │ [Edit] [Save] [Delete] [More▼]          │ │
│ └─────────────────────────┘ │ └──────────────────────────────────────────┘ │
│                             │                                              │
│ ┌─────────────────────────┐ │                                              │
│ │ Title                   │ │                                              │
│ │ "File Name.pdf"         │ │                                              │
│ └─────────────────────────┘ │                                              │
│                             │                                              │
│ ┌─────────────────────────┐ │                                              │
│ │ Subtitle/Meta           │ │                                              │
│ │ "Mã: F-12345"           │ │                                              │
│ └─────────────────────────┘ │                                              │
│                             │                                              │
│ ┌─────────────────────────┐ │                                              │
│ │ Context Controls (opt)  │ │                                              │
│ │ [← Prev] [Next →]       │ │                                              │
│ └─────────────────────────┘ │                                              │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 📄 2. Layout Chi Tiết Tệp (File Detail Page)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER - FILE DETAIL                                                        │
├─────────────────────────────┬──────────────────────────────────────────────┤
│ LEFT SECTION                │ RIGHT SECTION                                │
│                             │                                              │
│ ┌─────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ 📂 Breadcrumbs          │ │ │ NORMAL MODE                              │ │
│ │ Home > Kho tài liệu >   │ │ │ ┌────┬────┬────┬────┬────┬────┬────┐    │ │
│ │ HĐ Công ty > File       │ │ │ │✏️  │📤  │📋  │✍️  │⬇️  │💬  │🗑️  │    │ │
│ └─────────────────────────┘ │ │ └────┴────┴────┴────┴────┴────┴────┘    │ │
│                             │ │ Edit Submit Ver  Sign  Down Comm Del     │ │
│ ┌─────────────────────────┐ │ │                                          │ │
│ │ 📄 Title (Large)        │ │ │ EDIT MODE (khi đang edit)                │ │
│ │ "Hợp đồng thuê văn      │ │ │ ┌────┬────────────┬────┐                 │ │
│ │  phòng 2024.pdf"        │ │ │ │❌  │💾          │💾  │                 │ │
│ └─────────────────────────┘ │ │ └────┴────────────┴────┘                 │ │
│                             │ │ Cancel Save&Close  Save                   │ │
│ ┌─────────────────────────┐ │ └──────────────────────────────────────────┘ │
│ │ 🔖 Metadata             │ │                                              │
│ │ Mã: F-2024-0123         │ │ ┌──────────────────────────────────────────┐ │
│ │ Loại: Hợp đồng          │ │ │ PREVIEW CONTROLS (khi có preview)        │ │
│ │ Chủ sở hữu: Nguyễn VN   │ │ │ ┌──────┬────┬────┬────┬────┐            │ │
│ └─────────────────────────┘ │ │ │Page  │ ← │ → │100%│ ▼  │            │ │
│                             │ │ │1/10  │   │   │    │    │            │ │
│ ┌─────────────────────────┐ │ │ └──────┴────┴────┴────┴────┘            │ │
│ │ 🔄 Context Nav          │ │ └──────────────────────────────────────────┘ │
│ │ [← File trước]          │ │                                              │
│ │ [File kế tiếp →]        │ │ ┌──────────────────────────────────────────┐ │
│ │ Tệp 5/24                │ │ │ MORE ACTIONS (▼ dropdown)                │ │
│ └─────────────────────────┘ │ │ • Convert to PDF                         │ │
│                             │ │ • Replace file                           │ │
│                             │ │ • Custom fields                          │ │
│                             │ │ • Send via email                         │ │
│                             │ │ • Export                                 │ │
│                             │ │ • Share link                             │ │
│                             │ └──────────────────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### Buttons Chi Tiết:

**Normal Mode (7 buttons):**
- `✏️ Chỉnh sửa` - Outline, Blue
- `📤 Gửi duyệt` - Outline, Green
- `📋 Tạo phiên bản` - Outline, Gray
- `✍️ Gửi ký` - Outline, Purple
- `⬇️ Tải xuống` - Outline, Blue
- `💬 Bình luận` - Outline, Gray
- `🗑️ Xóa` - Destructive, Red

**Edit Mode (3 buttons):**
- `❌ Hủy` - Ghost, Gray
- `💾 Lưu & Đóng` - Outline, Blue
- `💾 Lưu` - Primary, Green

---

## 📋 3. Layout Danh Sách Tệp (File List Page)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER - FILE LIST                                                          │
├─────────────────────────────┬──────────────────────────────────────────────┤
│ LEFT SECTION                │ RIGHT SECTION                                │
│                             │                                              │
│ ┌─────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ 📂 Breadcrumbs          │ │ │ TOOLBAR ACTIONS                          │ │
│ │ Home > Kho tài liệu >   │ │ │ ┌────┬────┬────┬────┬────┬────┐         │ │
│ │ HĐ Công ty              │ │ │ │➕  │📤  │⬇️  │🗑️  │🔍  │⚙️  │         │ │
│ └─────────────────────────┘ │ │ └────┴────┴────┴────┴────┴────┘         │ │
│                             │ │ New Upload Down Del Search Set            │ │
│ ┌─────────────────────────┐ │ └──────────────────────────────────────────┘ │
│ │ 📚 Title + Count        │ │                                              │
│ │ "Danh sách tệp"         │ │ ┌──────────────────────────────────────────┐ │
│ │ (124 tệp)               │ │ │ BULK ACTIONS (khi chọn nhiều)            │ │
│ └─────────────────────────┘ │ │ ┌────┬────┬────┬────┬────┐              │ │
│                             │ │ │⬇️  │🗑️  │🏷️  │📁  │❌  │              │ │
│ ┌─────────────────────────┐ │ │ └────┴────┴────┴────┴────┘              │ │
│ │ 🏷️ Active Filters       │ │ │ Down Del  Tag  Move Cancel              │ │
│ │ [Hợp đồng ×]            │ │ │                                          │ │
│ │ [2024 ×]                │ │ │ "Đã chọn 5 tệp"                          │ │
│ │ [Xóa tất cả]            │ │ └──────────────────────────────────────────┘ │
│ └─────────────────────────┘ │                                              │
│                             │ ┌──────────────────────────────────────────┐ │
│ ┌─────────────────────────┐ │ │ VIEW CONTROLS                            │ │
│ │ 📊 Stats Summary        │ │ │ ┌────┬────┬────┬────┐                   │ │
│ │ Tổng: 124 | Mới: 12     │ │ │ │⊞  │☰  │⊟  │▼  │                   │ │
│ │ Đang xử lý: 3           │ │ │ └────┴────┴────┴────┘                   │ │
│ └─────────────────────────┘ │ │ Grid List Compact Sort                   │ │
│                             │ └──────────────────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### Buttons Chi Tiết:

**Normal Mode (6 buttons):**
- `➕ Tệp mới` - Primary, Green
- `📤 Tải lên` - Primary, Blue
- `⬇️ Tải xuống` - Outline, Blue
- `🗑️ Xóa` - Destructive, Red (disabled nếu không chọn)
- `🔍 Tìm kiếm` - Outline, Gray
- `⚙️ Cài đặt` - Ghost, Gray

**Bulk Mode (5 buttons - hiện khi chọn nhiều):**
- `⬇️ Tải xuống` - Primary, Blue
- `🗑️ Xóa` - Destructive, Red
- `🏷️ Gắn thẻ` - Outline, Gray
- `📁 Di chuyển` - Outline, Gray
- `❌ Hủy chọn` - Ghost, Gray

**View Controls (4 buttons):**
- `⊞ Grid` - Toggle
- `☰ List` - Toggle
- `⊟ Compact` - Toggle
- `▼ Sort` - Dropdown

---

## 🏗️ 4. Component Structure (Kế thừa)

```
BaseHeaderLayout (Base Component)
├── Props:
│   ├── breadcrumbs: BreadcrumbItem[]
│   ├── title: string
│   ├── subtitle?: string
│   ├── metadata?: React.ReactNode
│   ├── contextNav?: React.ReactNode
│   ├── stats?: React.ReactNode
│   ├── filters?: React.ReactNode
│   ├── actions: React.ReactNode (required)
│   ├── secondaryActions?: React.ReactNode
│   └── mode?: 'normal' | 'edit' | 'bulk' | 'preview'
│
├── Layout:
│   ├── Left Section (40%)
│   │   ├── Breadcrumbs (always)
│   │   ├── Title (always)
│   │   ├── Subtitle (optional)
│   │   ├── Metadata (optional)
│   │   ├── Stats (optional)
│   │   ├── Filters (optional)
│   │   └── Context Nav (optional)
│   │
│   └── Right Section (60%)
│       ├── Actions (always)
│       └── Secondary Actions (optional)

FileDetailHeader extends BaseHeaderLayout
├── Props:
│   ├── file: FileData
│   ├── isEditing: boolean
│   ├── hasPreview: boolean
│   ├── onEdit: () => void
│   ├── onSave: () => void
│   ├── onDelete: () => void
│   └── ...actions
│
└── Renders:
    ├── breadcrumbs = file breadcrumb path
    ├── title = file.name
    ├── subtitle = file.code
    ├── metadata = file metadata display
    ├── contextNav = prev/next file navigation
    ├── actions = based on isEditing/hasPreview
    └── secondaryActions = more menu

FileListHeader extends BaseHeaderLayout
├── Props:
│   ├── totalFiles: number
│   ├── selectedFiles: string[]
│   ├── filters: FilterState
│   ├── viewMode: 'grid' | 'list' | 'compact'
│   ├── onUpload: () => void
│   ├── onBulkAction: (action) => void
│   └── ...actions
│
└── Renders:
    ├── breadcrumbs = list page breadcrumb
    ├── title = "Danh sách tệp" + count
    ├── stats = file statistics
    ├── filters = active filters display
    ├── actions = based on selectedFiles.length
    └── secondaryActions = view controls
```

---

## 📦 5. Props Interface

```typescript
// Base Layout Props
interface BaseHeaderLayoutProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  subtitle?: string
  metadata?: React.ReactNode
  contextNav?: React.ReactNode
  stats?: React.ReactNode
  filters?: React.ReactNode
  actions: React.ReactNode
  secondaryActions?: React.ReactNode
  mode?: 'normal' | 'edit' | 'bulk' | 'preview'
  className?: string
}

// File Detail Header Props
interface FileDetailHeaderProps {
  file: FileData
  isEditing: boolean
  hasPreview: boolean
  
  // Actions
  onEdit: () => void
  onSave: () => void
  onSaveAndClose: () => void
  onCancel: () => void
  onDelete: () => void
  onSubmit: () => void
  onCreateVersion: () => void
  onSendForSignature: () => void
  onDownload: () => void
  onComment: () => void
  onMore: (action: string) => void
  
  // Navigation
  onPrevFile?: () => void
  onNextFile?: () => void
  currentIndex?: number
  totalFiles?: number
  
  // Preview
  currentPage?: number
  totalPages?: number
  zoom?: number
  onPageChange?: (page: number) => void
  onZoomChange?: (zoom: number) => void
}

// File List Header Props
interface FileListHeaderProps {
  totalFiles: number
  newFiles: number
  processingFiles: number
  selectedFiles: string[]
  filters: FilterState
  viewMode: 'grid' | 'list' | 'compact'
  sortBy: string
  
  // Actions
  onNew: () => void
  onUpload: () => void
  onDownload: () => void
  onDelete: () => void
  onSearch: (query: string) => void
  onSettings: () => void
  
  // Bulk actions
  onBulkDownload: () => void
  onBulkDelete: () => void
  onBulkTag: () => void
  onBulkMove: () => void
  onClearSelection: () => void
  
  // View controls
  onViewModeChange: (mode: string) => void
  onSortChange: (sort: string) => void
  
  // Filters
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
}

// Breadcrumb Item
interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

// File Data
interface FileData {
  id: string
  name: string
  code: string
  type: string
  owner: string
  createdAt: string
  updatedAt: string
  size: number
  status: string
}

// Filter State
interface FilterState {
  search?: string
  type?: string[]
  status?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  tags?: string[]
}
```

---

## 🎯 6. Responsive Behavior

```
Desktop (>1024px):
├── Left: 40% | Right: 60%
├── All buttons with labels
└── Side-by-side layout

Tablet (768px - 1024px):
├── Left: 35% | Right: 65%
├── Icon + shortened label
└── Some buttons collapsed to "More"

Mobile (<768px):
├── Stack vertically
├── Left section full width
├── Right section full width
├── Icon only buttons
└── Most actions in "More" menu
```

---

## 💡 7. Key Features

### Base Layout:
- ✅ Flexible slot-based architecture
- ✅ Support multiple modes (normal/edit/bulk/preview)
- ✅ Responsive design
- ✅ Customizable sections

### File Detail:
- ✅ Edit mode toggle
- ✅ Preview controls
- ✅ File navigation (prev/next)
- ✅ Rich metadata display
- ✅ Action grouping

### File List:
- ✅ Bulk selection actions
- ✅ View mode toggle
- ✅ Filter display & management
- ✅ Stats summary
- ✅ Search integration

---

## 📁 8. File Structure

```
src/shared/layouts/
├── HeaderLayouts/
│   ├── BaseHeaderLayout/
│   │   ├── BaseHeaderLayout.tsx
│   │   ├── BaseHeaderLayout.types.ts
│   │   ├── BaseHeaderLayout.module.css
│   │   └── index.ts
│   │
│   ├── FileDetailHeader/
│   │   ├── FileDetailHeader.tsx
│   │   ├── FileDetailHeader.types.ts
│   │   ├── FileDetailHeader.module.css
│   │   ├── components/
│   │   │   ├── NormalModeActions.tsx
│   │   │   ├── EditModeActions.tsx
│   │   │   ├── PreviewControls.tsx
│   │   │   ├── ContextNavigation.tsx
│   │   │   └── MetadataDisplay.tsx
│   │   └── index.ts
│   │
│   ├── FileListHeader/
│   │   ├── FileListHeader.tsx
│   │   ├── FileListHeader.types.ts
│   │   ├── FileListHeader.module.css
│   │   ├── components/
│   │   │   ├── NormalModeActions.tsx
│   │   │   ├── BulkModeActions.tsx
│   │   │   ├── ViewControls.tsx
│   │   │   ├── FilterDisplay.tsx
│   │   │   └── StatsDisplay.tsx
│   │   └── index.ts
│   │
│   └── index.ts
```

---

## 🎨 9. Styling Guidelines

### Colors:
- **Primary** (Green): `bg-green-600 hover:bg-green-700 text-white`
- **Secondary** (Blue): `bg-blue-600 hover:bg-blue-700 text-white`
- **Outline**: `border border-gray-300 bg-white hover:bg-gray-50 text-gray-700`
- **Destructive** (Red): `bg-red-600 hover:bg-red-700 text-white`
- **Ghost**: `bg-transparent hover:bg-gray-100 text-gray-700`

### Spacing:
- **Button gap**: `gap-2` (8px)
- **Section padding**: `p-4` (16px)
- **Section gap**: `gap-4` (16px)

### Typography:
- **Title**: `text-2xl font-bold text-gray-900`
- **Subtitle**: `text-sm text-gray-500`
- **Button label**: `text-sm font-medium`

---

## 🔄 10. State Management

```typescript
// File Detail State
interface FileDetailState {
  file: FileData | null
  isEditing: boolean
  hasPreview: boolean
  currentPage: number
  totalPages: number
  zoom: number
  currentIndex: number
  totalFiles: number
  isDirty: boolean
}

// File List State
interface FileListState {
  files: FileData[]
  selectedFiles: string[]
  filters: FilterState
  viewMode: 'grid' | 'list' | 'compact'
  sortBy: string
  totalFiles: number
  newFiles: number
  processingFiles: number
}
```

---

## 📝 11. Usage Examples

### Example 1: File Detail Header

```tsx
import { FileDetailHeader } from '@/shared/layouts/HeaderLayouts'

function FileDetailPage() {
  const [isEditing, setIsEditing] = useState(false)
  const file = useFileData()

  return (
    <div>
      <FileDetailHeader
        file={file}
        isEditing={isEditing}
        hasPreview={true}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onSaveAndClose={handleSaveAndClose}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        onCreateVersion={handleCreateVersion}
        onSendForSignature={handleSendForSignature}
        onDownload={handleDownload}
        onComment={handleComment}
        onMore={handleMore}
        onPrevFile={handlePrevFile}
        onNextFile={handleNextFile}
        currentIndex={currentIndex}
        totalFiles={totalFiles}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={handlePageChange}
        onZoomChange={handleZoomChange}
      />
      
      <div className="content">
        {/* Page content */}
      </div>
    </div>
  )
}
```

### Example 2: File List Header

```tsx
import { FileListHeader } from '@/shared/layouts/HeaderLayouts'

function FileListPage() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const { files, totalFiles, newFiles, processingFiles } = useFileList()

  return (
    <div>
      <FileListHeader
        totalFiles={totalFiles}
        newFiles={newFiles}
        processingFiles={processingFiles}
        selectedFiles={selectedFiles}
        filters={filters}
        viewMode={viewMode}
        sortBy={sortBy}
        onNew={handleNew}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onSettings={handleSettings}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={handleBulkDelete}
        onBulkTag={handleBulkTag}
        onBulkMove={handleBulkMove}
        onClearSelection={() => setSelectedFiles([])}
        onViewModeChange={setViewMode}
        onSortChange={setSortBy}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      
      <div className="file-list">
        {/* File list content */}
      </div>
    </div>
  )
}
```

---

## ✅ 12. Implementation Checklist

### Phase 1: Base Layout ✅
- [ ] Create BaseHeaderLayout component
- [ ] Define BaseHeaderLayout types
- [ ] Implement responsive layout
- [ ] Add mode switching logic
- [ ] Write unit tests

### Phase 2: File Detail Header ✅
- [ ] Create FileDetailHeader component
- [ ] Implement NormalModeActions
- [ ] Implement EditModeActions
- [ ] Implement PreviewControls
- [ ] Implement ContextNavigation
- [ ] Implement MetadataDisplay
- [ ] Write integration tests

### Phase 3: File List Header ✅
- [ ] Create FileListHeader component
- [ ] Implement NormalModeActions
- [ ] Implement BulkModeActions
- [ ] Implement ViewControls
- [ ] Implement FilterDisplay
- [ ] Implement StatsDisplay
- [ ] Write integration tests

### Phase 4: Documentation ✅
- [ ] Write component documentation
- [ ] Create usage examples
- [ ] Add Storybook stories
- [ ] Document best practices

---

## 🚀 13. Future Enhancements

1. **Keyboard Shortcuts**
   - `Ctrl+S` - Save
   - `Ctrl+Shift+S` - Save & Close
   - `Esc` - Cancel/Close
   - `Ctrl+F` - Search
   - `Ctrl+A` - Select all

2. **Animation**
   - Smooth transitions between modes
   - Button hover effects
   - Loading states

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

4. **Customization**
   - Theme support
   - Custom button sets
   - Layout variants
   - User preferences

---

## 📚 14. References

- [Material Design - App bars](https://material.io/components/app-bars-top)
- [Ant Design - Layout](https://ant.design/components/layout)
- [Tailwind CSS - Flexbox](https://tailwindcss.com/docs/flexbox)
- [React - Composition vs Inheritance](https://react.dev/learn/composition-vs-inheritance)
