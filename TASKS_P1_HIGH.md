# 🟡 P1 - HIGH PRIORITY TASKS

**Quan trọng** - Nên làm sớm để cải thiện UX  
**Nguồn:** refactor-requirements.md, refactor-plan-detailed.md

---

## 5️⃣ Dashboard WindowPanel System

**Nguồn:** refactor-requirements.md (Line 120-565)  
**Mục tiêu:** Tạo hệ thống panel có thể drag, minimize, close

### A. Tạo Components Mới

#### CommonPanel.tsx
**File:** `frontend/webapp/src/shared/components/UIComponents/Panel/CommonPanel.tsx`
- [ ] Tạo base panel component
- [ ] Props: `title`, `children`, `headerActions`, `footer`, `loading`
- [ ] Sử dụng Card, CardHeader, CardTitle, CardContent
- [ ] Thêm LoadingSpinner khi `loading={true}`

#### WindowPanel.tsx
**File:** `frontend/webapp/src/shared/components/UIComponents/Panel/WindowPanel.tsx`
- [ ] Extend CommonPanel
- [ ] Thêm 3 nút header: Drag (☰), Minimize (⊖), Close (✕)
- [ ] Implement drag & drop (useRef, mouse events)
- [ ] Minimize: toggle height 500px → 200px
- [ ] Props: `id`, `defaultWidth`, `defaultHeight`, `minimized`, `visible`, `position`
- [ ] Callbacks: `onMinimize`, `onClose`, `onPositionChange`

#### PanelSelector.tsx
**File:** `frontend/webapp/src/features/dashboard/components/PanelSelector.tsx`
- [ ] Dropdown button "Quản lý Panel"
- [ ] Checkbox list cho mỗi panel
- [ ] Toggle visibility của panels

#### Index.ts
**File:** `frontend/webapp/src/shared/components/UIComponents/Panel/index.ts`
- [ ] Export `CommonPanel`, `WindowPanel`
- [ ] Export types

**Thời gian:** 3-4 giờ

### B. Cập nhật Dashboard.tsx

**File:** `frontend/webapp/src/features/dashboard/views/pages/Dashboard/Dashboard.tsx`

- [ ] Thêm state quản lý panels:
```tsx
const [panels, setPanels] = useState([
  { id: 'stats', label: 'Thống kê', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'repositories', label: 'Repositories', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'files', label: 'Files', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'organizations', label: 'Tổ chức', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'quickActions', label: 'Hành động nhanh', visible: true, minimized: false, position: { x: 0, y: 0 } },
]);
```

- [ ] Thêm handlers:
  - [ ] `togglePanel(id)` - show/hide
  - [ ] `minimizePanel(id)` - minimize/expand
  - [ ] `closePanel(id)` - ẩn panel
  - [ ] `updatePanelPosition(id, x, y)` - cập nhật vị trí

- [ ] Thêm PanelSelector vào `headerRight`
- [ ] Đổi Stats Grid: `motion.div` + `Card` → `WindowPanel`
- [ ] Đổi Recent Repositories: `Card` → `WindowPanel`
- [ ] Đổi Recent Files: `Card` → `WindowPanel`
- [ ] Đổi Organizations: `Card` → `WindowPanel`
- [ ] Đổi Quick Actions: `Card` → `WindowPanel`

**Thời gian:** 2-3 giờ

**Tổng Task 5:** 5-7 giờ

---

## 6️⃣ HeaderPanel Improvements

**File:** `frontend/webapp/src/shared/components/UIComponents/Panel/HeaderPanel.tsx`  
**Nguồn:** refactor-plan-detailed.md (Line 804-978)

### Checklist
- [ ] Refactor hoàn toàn component
- [ ] Đổi `subtitle?: string` → `subtitle: string` (REQUIRED)
- [ ] Thay `motion.div` → sử dụng `useRef` + `anime()`
- [ ] Animation entry:
  ```tsx
  anime({
    targets: containerRef.current,
    opacity: [0, 1],
    translateY: [-10, 0],
    duration: 400,
    easing: 'easeOutQuad',
  });
  ```
- [ ] Thêm decorative blobs (gradient circles):
  ```tsx
  <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
  <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
  ```
- [ ] Breadcrumbs với `CommonIcon` (chevron-right)
- [ ] Wrap text trong `CommonText`
- [ ] Thêm responsive max-height với `<style>` tag

**Thời gian:** 2-3 giờ

---

## 7️⃣ Repository Files List Changes

**Nguồn:** refactor-requirements.md (Line 879-1032)

### A. FilesFilters.tsx
**File:** `frontend/webapp/src/features/repositories/views/components/FilesFilters/FilesFilters.tsx`

- [ ] Line 78: Xóa div wrapper `<div className="bg-white/80...">`
- [ ] Return `<>` (fragment) thay vì wrapper
- [ ] Giữ 3 rows (search, advanced, actions) render trực tiếp

**Code:**
```tsx
// TRƯỚC:
return (
  <div className="bg-white/80 backdrop-blur rounded-lg p-[0px] w-full">
    {/* 3 rows */}
  </div>
);

// SAU:
return (
  <>
    <div className="flex items-center gap-[5px] w-full">
      {/* Row 1 */}
    </div>
    <div className="flex items-center gap-[5px] w-full mt-[5px]">
      {/* Row 2 */}
    </div>
    <div className="mt-[5px] flex items-center gap-[5px] justify-end">
      {/* Row 3 */}
    </div>
  </>
);
```

**Thời gian:** 15 phút

### B. RepositoryFilesList.tsx
**File:** `frontend/webapp/src/features/repositories/views/pages/RepositoryFilesList/RepositoryFilesList.tsx`

- [ ] Line 303-329: Verify không có `max-width` constraints
- [ ] Line 469-480: ShowMore conditional - thêm check `filtered.length > 0`
  ```tsx
  {hasMore && filtered.length > 0 && (
    <Button onClick={loadMore}>Show more</Button>
  )}
  ```
- [ ] Line 364: "Xóa tìm kiếm" → "Xóa và làm mới"
  ```tsx
  <Button onClick={() => { 
    setSearch('');
    refreshFiles();
  }}>
    {t('repositories.files.empty.clearSearchAndRefresh')}
  </Button>
  ```

**Thời gian:** 30 phút

### C. Thêm i18n
- [ ] Tìm hardcoded strings và thay bằng `t(...)`
- [ ] "Loading..." → `t('loading')`
- [ ] "Retry" → `t('common.retry')`
- [ ] "Delete X files?" → `t('repositories.files.confirmDelete', { count })`

**Thời gian:** 30 phút

**Tổng Task 7:** 1-1.5 giờ

---

## 8️⃣ Profile Page Changes

**File:** `frontend/webapp/src/features/profile/views/pages/Profile/Profile.tsx`  
**Nguồn:** refactor-requirements.md (Line 14-118)

### A. Bỏ viền Label
- [ ] Lines 208, 224, 244, 261, 282, 298
- [ ] Thay `<Label>` → `<label>` HTML thông thường
- [ ] Class: `"flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"`

### B. Bỏ Role Badge
- [ ] Lines 139-142: Xóa hoàn toàn
```tsx
{/* XÓA: */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  {user.role}
</span>
```

### C. Bỏ Role trong Account Info
- [ ] Lines 327-331: Xóa section hiển thị role
```tsx
{/* XÓA: */}
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-600">{t('profile.account.role')}</span>
  <span className="text-sm font-medium text-gray-900">{user.role}</span>
</div>
```

### D. Thêm TODO Kho mã và Tổ chức
- [ ] Sau line 313 (trong Details Card)
```tsx
{/* TODO: Kho mã và Tổ chức - Chưa có API */}
<div className="pt-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    {t('profile.repositoriesAndOrganizations')}
  </h3>
  <div className="text-sm text-gray-500 italic">
    {/* API đang được phát triển */}
  </div>
</div>
```

### E. CommonLabel.tsx (Optional)
**File:** `frontend/webapp/src/shared/components/UIComponents/Label/CommonLabel.tsx`
- [ ] Thêm prop `noBorder?: boolean`
- [ ] Skip `drawCanvas()` khi `noBorder = true`

**Thời gian:** 1-1.5 giờ

---

## ✅ Checklist Tổng P1

- [ ] **Task 5:** Dashboard WindowPanel System (5-7h)
- [ ] **Task 6:** HeaderPanel improvements (2-3h)
- [ ] **Task 7:** Repository Files List changes (1-1.5h)
- [ ] **Task 8:** Profile page changes (1-1.5h)

**Tổng thời gian ước tính:** 9-13 giờ (~1.5 ngày)

---

## 🎯 Khuyến nghị thực hiện

**Week 1 (sau P0):**
- Day 3 morning: Task 5 (Dashboard WindowPanel)
- Day 3 afternoon: Task 6 + Task 7
- Day 4 morning: Task 8

**Hoặc chia nhỏ:**
- Session 1 (3h): Tạo CommonPanel, WindowPanel, PanelSelector
- Session 2 (2-3h): Update Dashboard.tsx
- Session 3 (2h): HeaderPanel + FilesFilters + Profile
