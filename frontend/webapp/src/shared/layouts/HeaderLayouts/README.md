# Header Layouts - Design System

Hệ thống layout header chuẩn hóa cho DocGO webapp, được thiết kế theo tài liệu `HEADER_CONTROL_LAYOUT_DESIGN.md`.

## 📦 Components

### 1. BaseHeaderLayout

Component cơ sở với layout 40/60 (Left/Right sections).

**Props:**
- `breadcrumbs` - Breadcrumb navigation
- `title` - Page title
- `subtitle?` - Optional subtitle
- `metadata?` - Optional metadata display
- `stats?` - Optional statistics
- `filters?` - Optional active filters
- `contextNav?` - Optional context navigation (prev/next)
- `actions` - Primary action buttons (required)
- `secondaryActions?` - Secondary action buttons
- `mode?` - 'normal' | 'edit' | 'bulk' | 'preview'
- `onRefresh?` - Refresh handler

**Usage:**
```tsx
import { BaseHeaderLayout } from '@shared/layouts/HeaderLayouts';

<BaseHeaderLayout
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Files', current: true }
  ]}
  title="My Files"
  subtitle="Manage your documents"
  actions={<Button>Action</Button>}
/>
```

---

### 2. FileDetailHeader

Specialized header for file detail pages.

**Features:**
- ✅ Edit mode toggle (Normal/Edit actions)
- ✅ File metadata display
- ✅ File navigation (prev/next)
- ✅ Preview controls (page, zoom)
- ✅ Rich action buttons

**Props:**
- `file` - File data object
- `isEditing` - Edit mode flag
- `hasPreview?` - Show preview controls
- `onEdit`, `onSave`, `onSaveAndClose`, `onCancel`, `onDelete` - Action handlers
- `onSubmit?`, `onCreateVersion?`, `onSendForSignature?`, `onDownload?`, `onComment?`, `onMore?` - Optional actions
- `onPrevFile?`, `onNextFile?`, `currentIndex?`, `totalFiles?` - Navigation
- `currentPage?`, `totalPages?`, `zoom?`, `onPageChange?`, `onZoomChange?` - Preview controls

**Usage:**
```tsx
import { FileDetailHeader } from '@shared/layouts/HeaderLayouts';

const [isEditing, setIsEditing] = useState(false);

<FileDetailHeader
  file={{
    id: '123',
    name: 'Contract.pdf',
    code: 'F-2024-001',
    type: 'Contract',
    owner: 'John Doe',
    size: 2048576,
    status: 'active'
  }}
  isEditing={isEditing}
  hasPreview={true}
  onEdit={() => setIsEditing(true)}
  onSave={handleSave}
  onSaveAndClose={handleSaveAndClose}
  onCancel={() => setIsEditing(false)}
  onDelete={handleDelete}
  currentPage={1}
  totalPages={10}
  zoom={100}
  onPageChange={setCurrentPage}
  onZoomChange={setZoom}
/>
```

---

### 3. FileListHeader

Specialized header for file list pages.

**Features:**
- ✅ Normal/Bulk mode actions
- ✅ File statistics display
- ✅ Active filters display
- ✅ View mode controls (grid/list/compact)
- ✅ Sort controls

**Props:**
- `totalFiles`, `newFiles?`, `processingFiles?` - Statistics
- `selectedFiles` - Array of selected file IDs
- `filters?` - Active filters
- `viewMode` - 'grid' | 'list' | 'compact'
- `sortBy?` - Current sort field
- `onNew?`, `onUpload?`, `onDownload?`, `onDelete?`, `onSearch?`, `onSettings?`, `onRefresh?` - Normal mode actions
- `onBulkDownload?`, `onBulkDelete?`, `onBulkTag?`, `onBulkMove?`, `onClearSelection?` - Bulk actions
- `onViewModeChange?`, `onSortChange?` - View controls
- `onFilterChange?`, `onClearFilters?` - Filter controls

**Usage:**
```tsx
import { FileListHeader } from '@shared/layouts/HeaderLayouts';

const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');

<FileListHeader
  totalFiles={124}
  newFiles={12}
  processingFiles={3}
  selectedFiles={selectedFiles}
  viewMode={viewMode}
  onNew={handleNew}
  onUpload={handleUpload}
  onRefresh={handleRefresh}
  onBulkDelete={handleBulkDelete}
  onClearSelection={() => setSelectedFiles([])}
  onViewModeChange={setViewMode}
/>
```

---

## 🎨 Design Principles

### Layout Structure
```
┌─────────────────────────────┬──────────────────────────────────────────────┐
│ LEFT SECTION (40%)          │ RIGHT SECTION (60%)                          │
│ - Breadcrumbs               │ - Actions (always)                           │
│ - Title                     │ - Secondary Actions (optional)               │
│ - Subtitle (optional)       │                                              │
│ - Metadata (optional)       │                                              │
│ - Stats (optional)          │                                              │
│ - Filters (optional)        │                                              │
│ - Context Nav (optional)    │                                              │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (>1024px)**: 40/60 split, side-by-side, all buttons with labels
- **Tablet (768-1024px)**: 35/65 split, icon + shortened label
- **Mobile (<768px)**: Stack vertically, icon only buttons

### Button Variants
- **Primary** (Green): `bg-green-600 hover:bg-green-700 text-white`
- **Secondary** (Blue): `bg-blue-600 hover:bg-blue-700 text-white`
- **Outline**: `border border-gray-300 bg-white hover:bg-gray-50`
- **Destructive** (Red): `bg-red-600 hover:bg-red-700 text-white`
- **Ghost**: `bg-transparent hover:bg-gray-100`

---

## 📁 File Structure

```
HeaderLayouts/
├── BaseHeaderLayout/
│   ├── BaseHeaderLayout.tsx
│   ├── BaseHeaderLayout.types.ts
│   └── index.ts
├── FileDetailHeader/
│   ├── FileDetailHeader.tsx
│   ├── FileDetailHeader.types.ts
│   ├── components/
│   │   ├── NormalModeActions.tsx
│   │   ├── EditModeActions.tsx
│   │   ├── MetadataDisplay.tsx
│   │   ├── ContextNavigation.tsx
│   │   └── PreviewControls.tsx
│   └── index.ts
├── FileListHeader/
│   ├── FileListHeader.tsx
│   ├── FileListHeader.types.ts
│   ├── components/
│   │   ├── NormalModeActions.tsx
│   │   ├── BulkModeActions.tsx
│   │   ├── ViewControls.tsx
│   │   ├── StatsDisplay.tsx
│   │   └── FilterDisplay.tsx
│   └── index.ts
├── index.ts
└── README.md
```

---

## 🚀 Demo Pages

Demo pages are available at:
- `features/repositories/views/pages/RepositoryFileDetail/RepositoryFileDetailDemo.tsx`
- `features/repositories/views/pages/RepositoryFilesList/RepositoryFilesListDemo.tsx`

---

## 📚 References

- Design Document: `frontend/webapp/docs/layouts/HEADER_CONTROL_LAYOUT_DESIGN.md`
- Material Design - App bars: https://material.io/components/app-bars-top
- Ant Design - Layout: https://ant.design/components/layout

