# 📊 Phase 1 - Báo Cáo Vi Phạm Dependencies

**Ngày tạo**: 2024-11-02  
**Tổng files vi phạm**: 84 files

---

## 🎯 Tổng Quan Vi Phạm

| Vi Phạm | Số Files | Mức Độ | Action |
|---------|----------|--------|--------|
| `lucide-react` | 68 files | 🔴 Critical | Thay bằng UIComponents/Icon |
| `framer-motion` | 16 files | 🔴 Critical | Thay bằng animejs |
| `@mui/material` | 0 files | ✅ OK | Đã clean |

---

## 📂 Phân Loại Theo Thư Mục

### 🏗️ **SHARED - Priority P0 (10 files)**

#### Layouts (6 files) - 🔴 CRITICAL
| File | lucide-react | framer-motion | Action |
|------|-------------|---------------|--------|
| `layouts/MainLayout/Sidebar.tsx` | ✅ Yes | ✅ Yes | Thay icons + animations |
| `layouts/MainLayout/Header.tsx` | ✅ Yes | ✅ Yes | Thay icons + animations |
| `layouts/MainLayout/MainLayout.tsx` | ❌ No | ✅ Yes | Thay animations |
| `layouts/LoadingSpinner/LoadingSpinner.tsx` | ❌ No | ✅ Yes | Thay animations |
| `layouts/NotificationBell/NotificationBell.tsx` | ✅ Yes | ❌ No | Thay icons |

#### UIComponents (5 files) - 🔴 CRITICAL
| File | lucide-react | framer-motion | Action |
|------|-------------|---------------|--------|
| `UIComponents/Button/CommonButton.tsx` | ✅ Yes (Loader2) | ❌ No | Tạo LoadingIcon |
| `UIComponents/Button/ReloadButton.tsx` | ✅ Yes (RotateCw) | ❌ No | Tạo RefreshIcon |
| `UIComponents/Select/CommonSelect.tsx` | ✅ Yes (ChevronDown) | ❌ No | Tạo ChevronIcon |
| `UIComponents/Dialog/CommonDialog.tsx` | ✅ Yes (X) | ✅ Yes | Tạo CloseIcon + animations |
| `UIComponents/ProgressBar/index.tsx` | ❌ No | ✅ Yes | Thay animations |
| `UIComponents/Modal/CommonModal.tsx` | ✅ Yes (X) | ❌ No | Tạo CloseIcon |
| `UIComponents/Modal/NoRecentRepositoryModal.tsx` | ✅ Yes (ArrowRight, X) | ❌ No | Tạo ArrowIcon, CloseIcon |
| `UIComponents/Notification/NotificationBell.tsx` | ✅ Yes (6 icons) | ❌ No | Tạo notification icons |
| `UIComponents/RefreshButton/RefreshButton.tsx` | ✅ Yes (RefreshCw) | ❌ No | Tạo RefreshIcon |

#### Lib (2 files) - 🟡 MEDIUM
| File | lucide-react | framer-motion | Action |
|------|-------------|---------------|--------|
| `lib/animationUtils.ts` | ❌ No | ✅ Yes | Refactor sang animejs |
| `theme/animations.ts` | ❌ No | ✅ Yes | Refactor sang animejs |

---

### 🎨 **FEATURES - Priority P1 (74 files)**

#### Dashboard (3 files)
- `dashboard/views/pages/Dashboard/Dashboard.tsx` - framer-motion
- `dashboard/components/PanelSelector.tsx` - lucide-react
- `dashboard/views/components/LayoutSelector.tsx` - lucide-react

#### Organizations (13 files)
- `organizations/views/components/CreateOrganizationDialog.tsx` - lucide-react
- `organizations/views/components/InviteMemberModal.tsx` - lucide-react
- `organizations/views/components/MemberManagementModal.tsx` - lucide-react
- `organizations/views/components/MemberTable.tsx` - lucide-react
- `organizations/views/components/OrganizationSelector.tsx` - lucide-react + framer-motion
- `organizations/views/components/PermissionBadge.tsx` - lucide-react
- `organizations/views/components/PermissionGuard.tsx` - lucide-react
- `organizations/views/components/RoleBadge.tsx` - lucide-react
- `organizations/views/pages/AcceptInvitation.tsx` - lucide-react
- `organizations/views/pages/OrganizationDetail.tsx` - lucide-react + framer-motion
- `organizations/views/pages/OrganizationList.tsx` - lucide-react + framer-motion
- `organizations/views/pages/OrganizationMembers.tsx` - lucide-react
- `organizations/views/pages/OrganizationWorkspace.tsx` - lucide-react + framer-motion

#### Repositories (45 files)
**Layouts (10 files)**
- `repositories/layouts/FileDetailHeader/components/ContextNavigation.tsx` - lucide-react
- `repositories/layouts/FileDetailHeader/components/EditModeActions.tsx` - lucide-react
- `repositories/layouts/FileDetailHeader/components/MetadataDisplay.tsx` - lucide-react
- `repositories/layouts/FileDetailHeader/components/NormalModeActions.tsx` - lucide-react
- `repositories/layouts/FileDetailHeader/components/PreviewControls.tsx` - lucide-react
- `repositories/layouts/FileListHeader/components/BulkModeActions.tsx` - lucide-react
- `repositories/layouts/FileListHeader/components/FilterDisplay.tsx` - lucide-react
- `repositories/layouts/FileListHeader/components/NormalModeActions.tsx` - lucide-react
- `repositories/layouts/FileListHeader/components/StatsDisplay.tsx` - lucide-react
- `repositories/layouts/FileListHeader/components/ViewControls.tsx` - lucide-react

**Views - Components (20 files)**
- `repositories/views/components/CreateRepositoryModal.tsx` - lucide-react
- `repositories/views/components/FileDetail/FileDetailTabs.tsx` - lucide-react
- `repositories/views/components/FileDetail/contract/ClausesTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/contract/ComplianceTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/contract/ContractOverviewTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/contract/RemindersTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/contract/RiskTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/AuditTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/ContentTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/DetailsTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/HistoryTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/MetadataTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/NotesTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/OCRTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/PermissionsTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/SecurityTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/StorageTab.tsx` - lucide-react
- `repositories/views/components/FileDetail/overview/VersioningTab.tsx` - lucide-react
- `repositories/views/components/InviteRepositoryMemberModal.tsx` - lucide-react
- `repositories/views/components/RepositoryDetailTabs.tsx` - lucide-react
- `repositories/views/components/RepositoryGrid.tsx` - lucide-react + framer-motion
- `repositories/views/components/RepositoryPermissionsManager.tsx` - lucide-react
- `repositories/views/components/RepositoryTabs.tsx` - lucide-react

**Views - Pages (15 files)**
- `repositories/views/pages/RepositoryDetail.tsx` - lucide-react
- `repositories/views/pages/RepositoryFileDetail.tsx` - lucide-react
- `repositories/views/pages/RepositoryFileList.tsx` - lucide-react
- `repositories/views/pages/RepositoryFiles.tsx` - lucide-react
- `repositories/views/pages/RepositoryList.tsx` - lucide-react
- `repositories/views/pages/RepositoryMembers.tsx` - lucide-react
- `repositories/views/pages/RepositoryPermissions.tsx` - lucide-react
- `repositories/views/pages/RepositorySearch.tsx` - lucide-react
- `repositories/views/pages/RepositorySettings.tsx` - lucide-react
- `repositories/views/pages/RepositoryWorkspace.tsx` - lucide-react
- ... (5 more files)

#### Profile (2 files)
- `profile/views/pages/Profile/Profile.tsx` - lucide-react + framer-motion

#### Settings (2 files)
- `settings/views/pages/Settings.tsx` - lucide-react + framer-motion
- ... (1 more file)

---

## 🎯 Action Plan - Refactor Phases

### **Phase 1.4a: Shared UIComponents** (P0 - 2-3h)
**Mục tiêu**: Tạo icons cần thiết, fix UIComponents

**Tasks**:
1. **Tạo CommonIcons mới** (1h)
   - [ ] LoadingIcon (thay Loader2)
   - [ ] RefreshIcon (thay RotateCw, RefreshCw)
   - [ ] ChevronIcon (thay ChevronDown)
   - [ ] CloseIcon (thay X)
   - [ ] ArrowIcon (thay ArrowRight)
   - [ ] BellIcon, CheckIcon (notification)
   - [ ] Building2Icon, ClockIcon

2. **Fix UIComponents** (1h)
   - [ ] CommonButton.tsx
   - [ ] ReloadButton.tsx
   - [ ] CommonSelect.tsx
   - [ ] CommonDialog.tsx
   - [ ] CommonModal.tsx
   - [ ] NoRecentRepositoryModal.tsx
   - [ ] NotificationBell.tsx
   - [ ] RefreshButton.tsx

3. **Fix ProgressBar** (0.5h)
   - [ ] Thay framer-motion bằng animejs

### **Phase 1.4b: Shared Layouts** (P0 - 2-3h)
**Mục tiêu**: Fix MainLayout, Header, Sidebar

**Tasks**:
1. **Fix Sidebar.tsx** (1h)
   - [ ] Thay tất cả lucide-react icons
   - [ ] Thay framer-motion animations

2. **Fix Header.tsx** (0.5h)
   - [ ] Thay lucide-react icons
   - [ ] Thay framer-motion animations

3. **Fix MainLayout.tsx** (0.5h)
   - [ ] Thay framer-motion animations

4. **Fix LoadingSpinner.tsx** (0.5h)
   - [ ] Thay framer-motion animations

5. **Fix NotificationBell** (0.5h)
   - [ ] Thay lucide-react icons

### **Phase 1.4c: Lib & Theme** (P1 - 1h)
**Mục tiêu**: Refactor animation utils

**Tasks**:
- [ ] Refactor `lib/animationUtils.ts` sang animejs
- [ ] Refactor `theme/animations.ts` sang animejs

### **Phase 1.4d: Features - Dashboard** (P1 - 1h)
- [ ] Fix Dashboard.tsx
- [ ] Fix PanelSelector.tsx
- [ ] Fix LayoutSelector.tsx

### **Phase 1.4e: Features - Organizations** (P1 - 3h)
- [ ] Fix 13 files trong organizations

### **Phase 1.4f: Features - Repositories** (P2 - 8h)
- [ ] Fix 45 files trong repositories (chia thành 3 batches)

### **Phase 1.4g: Features - Profile & Settings** (P2 - 1h)
- [ ] Fix Profile.tsx
- [ ] Fix Settings.tsx

---

## 📊 Timeline Ước Tính

| Phase | Thời Gian | Status |
|-------|-----------|--------|
| Phase 1.4a: Shared UIComponents | 2-3h | ⏳ Pending |
| Phase 1.4b: Shared Layouts | 2-3h | ⏳ Pending |
| Phase 1.4c: Lib & Theme | 1h | ⏳ Pending |
| Phase 1.4d: Features - Dashboard | 1h | ⏳ Pending |
| Phase 1.4e: Features - Organizations | 3h | ⏳ Pending |
| Phase 1.4f: Features - Repositories | 8h | ⏳ Pending |
| Phase 1.4g: Features - Profile & Settings | 1h | ⏳ Pending |
| **TOTAL** | **18-21h** | |

---

## ✅ Success Criteria

- ✅ 0 files sử dụng `lucide-react`
- ✅ 0 files sử dụng `framer-motion`
- ✅ Tất cả icons từ UIComponents/Icon
- ✅ Tất cả animations dùng animejs
- ✅ Build thành công
- ✅ No console errors
- ✅ UI/UX không đổi (visual regression testing)

---

## 🚨 Lưu Ý

1. **Không xóa lucide-react/framer-motion từ package.json ngay**
   - Giữ lại cho đến khi refactor xong tất cả
   - Xóa ở Phase 1.5 sau khi test

2. **Test sau mỗi phase**
   - Chạy `npm run dev`
   - Kiểm tra UI không bị vỡ
   - Kiểm tra animations hoạt động

3. **Commit strategy**
   - Commit sau mỗi phase
   - Message: `refactor(phase-1.4x): [description]`

---

**Cập nhật lần cuối**: 2024-11-02  
**Trạng thái**: ⏳ Chờ bắt đầu refactor
