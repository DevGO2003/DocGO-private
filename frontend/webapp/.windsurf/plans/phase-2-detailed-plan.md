# 📋 Phase 2 - Plan Chi Tiết Fix Feature Files

**Tổng số files**: ~70 files  
**Thời gian ước tính**: 3-4 giờ  
**Trạng thái**: 3 files DONE (Dashboard), còn 67 files

---

## ✅ Phase 2.1: Dashboard (3 files) - DONE

- ✅ `dashboard/views/pages/Dashboard/Dashboard.tsx` - framer-motion → CSS
- ✅ `dashboard/components/PanelSelector.tsx` - ChevronDown → CommonIcon
- ✅ `dashboard/views/components/LayoutSelector.tsx` - 3 icons → CommonIcon

---

## 📊 Phase 2.2: Organizations (13 files)

**Ưu tiên**: P1 - High  
**Thời gian**: ~20-25 phút

### Views - Components (7 files)
1. ⏳ `organizations/views/components/DepartmentList.tsx` - lucide-react
2. ⏳ `organizations/views/components/MemberList.tsx` - lucide-react
3. ⏳ `organizations/views/components/OrganizationCard.tsx` - lucide-react
4. ⏳ `organizations/views/components/OrganizationForm.tsx` - lucide-react
5. ⏳ `organizations/views/components/OrganizationList.tsx` - lucide-react + framer-motion
6. ⏳ `organizations/views/components/OrganizationTabs.tsx` - lucide-react
7. ⏳ `organizations/views/components/TeamList.tsx` - lucide-react

### Views - Pages (6 files)
8. ⏳ `organizations/views/pages/OrganizationDetail.tsx` - lucide-react
9. ⏳ `organizations/views/pages/OrganizationMembers.tsx` - lucide-react
10. ⏳ `organizations/views/pages/OrganizationSettings.tsx` - lucide-react
11. ⏳ `organizations/views/pages/Organizations.tsx` - lucide-react
12. ⏳ `organizations/views/pages/OrganizationsList.tsx` - lucide-react
13. ⏳ `organizations/views/pages/OrganizationDashboard.tsx` - lucide-react

**Icons ước tính cần thêm**:
- Building, Building2, Users, User, UserPlus, Mail, Settings
- Edit, Trash, Plus, Minus, ChevronRight, ChevronLeft
- Calendar, Clock, MapPin, Phone

---

## 📁 Phase 2.3: Repositories (56 files)

**Ưu tiên**: P1 - High  
**Thời gian**: ~90-120 phút

### Phase 2.3a: File Detail - Contract Tabs (7 files)
**Thời gian**: ~15 phút

1. ⏳ `repositories/views/components/FileDetail/contract/ClausesTab.tsx` - lucide-react
2. ⏳ `repositories/views/components/FileDetail/contract/ComplianceTab.tsx` - lucide-react
3. ⏳ `repositories/views/components/FileDetail/contract/ContractOverviewTab.tsx` - lucide-react
4. ⏳ `repositories/views/components/FileDetail/contract/PartiesTab.tsx` - lucide-react
5. ⏳ `repositories/views/components/FileDetail/contract/PaymentTab.tsx` - lucide-react
6. ⏳ `repositories/views/components/FileDetail/contract/RemindersTab.tsx` - lucide-react
7. ⏳ `repositories/views/components/FileDetail/contract/RiskTab.tsx` - lucide-react

**Icons**:
- FileText, AlertTriangle, Shield, Users, DollarSign, Clock, Bell

### Phase 2.3b: File Detail - Overview Tabs (11 files)
**Thời gian**: ~20-25 phút

1. ⏳ `repositories/views/components/FileDetail/overview/AuditTab.tsx` - lucide-react
2. ⏳ `repositories/views/components/FileDetail/overview/ContentTab.tsx` - lucide-react
3. ⏳ `repositories/views/components/FileDetail/overview/DetailsTab.tsx` - lucide-react
4. ⏳ `repositories/views/components/FileDetail/overview/HistoryTab.tsx` - lucide-react
5. ⏳ `repositories/views/components/FileDetail/overview/MetadataTab.tsx` - lucide-react
6. ⏳ `repositories/views/components/FileDetail/overview/NotesTab.tsx` - lucide-react
7. ⏳ `repositories/views/components/FileDetail/overview/OCRTab.tsx` - lucide-react
8. ⏳ `repositories/views/components/FileDetail/overview/PermissionsTab.tsx` - lucide-react
9. ⏳ `repositories/views/components/FileDetail/overview/SecurityTab.tsx` - lucide-react
10. ⏳ `repositories/views/components/FileDetail/overview/StorageTab.tsx` - lucide-react
11. ⏳ `repositories/views/components/FileDetail/overview/VersioningTab.tsx` - lucide-react

**Icons**:
- Eye, File, Info, History, Database, FileText, Scan, Lock, Shield, HardDrive, GitBranch

### Phase 2.3c: Repository Components (23 files)
**Thời gian**: ~40-50 phút

1. ⏳ `repositories/views/components/InviteRepositoryMemberModal.tsx` - lucide-react
2. ⏳ `repositories/views/components/RepositoryDetailTabs.tsx` - lucide-react
3. ⏳ `repositories/views/components/RepositoryGrid.tsx` - lucide-react + framer-motion
4. ⏳ `repositories/views/components/RepositoryPermissionsManager.tsx` - lucide-react
5. ⏳ `repositories/views/components/RepositoryTabs.tsx` - lucide-react
6. ⏳ ... (18 more components)

**Icons**:
- UserPlus, Folder, Grid, List, Settings, Share, Download, Upload

### Phase 2.3d: Repository Pages (15 files)
**Thời gian**: ~25-30 phút

1. ⏳ `repositories/views/pages/RepositoryDetail.tsx` - lucide-react
2. ⏳ `repositories/views/pages/RepositoryFileDetail.tsx` - lucide-react
3. ⏳ `repositories/views/pages/RepositoryFileList.tsx` - lucide-react
4. ⏳ `repositories/views/pages/RepositoryFiles.tsx` - lucide-react
5. ⏳ `repositories/views/pages/RepositoryList.tsx` - lucide-react
6. ⏳ `repositories/views/pages/RepositoryMembers.tsx` - lucide-react
7. ⏳ `repositories/views/pages/RepositoryPermissions.tsx` - lucide-react
8. ⏳ `repositories/views/pages/RepositorySearch.tsx` - lucide-react
9. ⏳ `repositories/views/pages/RepositorySettings.tsx` - lucide-react
10. ⏳ `repositories/views/pages/RepositoryWorkspace.tsx` - lucide-react
11-15. ⏳ ... (5 more pages)

**Icons**:
- Folder, File, Users, Lock, Search, Settings, Layout, Plus

---

## 👤 Phase 2.4: Profile & Settings (4 files)

**Ưu tiên**: P2 - Medium  
**Thời gian**: ~10 phút

### Profile (2 files)
1. ⏳ `profile/views/pages/Profile/Profile.tsx` - lucide-react + framer-motion

**Icons**: User, Mail, Camera, Edit

### Settings (2 files)
2. ⏳ `settings/views/pages/Settings.tsx` - lucide-react + framer-motion

**Icons**: Settings, Bell, Lock, Globe, Moon, Sun

---

## 🎨 Icon Strategy

### Icons cần thêm (ước tính ~30 icons mới)

#### Business & Organization
- `building-2`, `department`, `team`, `organization`

#### User & People
- `user-plus`, `user-minus`, `user-check`, `user-x`

#### File & Document
- `file-plus`, `file-minus`, `file-check`, `file-x`
- `scan`, `eye`, `eye-off`

#### Actions
- `plus`, `minus`, `trash`, `share`, `copy`
- `dollar-sign`, `calendar`, `map-pin`, `phone`

#### Navigation
- `chevron-left`, `chevron-right` (đã có)
- `arrow-up`, `arrow-down` (thêm)

#### Status & Notifications
- `alert-triangle`, `alert-circle`, `info-circle`
- `shield-check`, `shield-alert`

#### System
- `hard-drive`, `database`, `git-branch`
- `moon`, `sun`, `globe`

---

## 📊 Execution Strategy

### Approach: Phân nhóm theo feature

#### Tuần 1: Organizations (13 files)
- Day 1-2: Components (7 files)
- Day 2-3: Pages (6 files)

#### Tuần 2: Repositories - Part 1 (25 files)
- Day 1: Contract tabs (7 files)
- Day 2-3: Overview tabs (11 files)
- Day 3-4: Components start (7 files)

#### Tuần 3: Repositories - Part 2 (31 files)
- Day 1-3: Components finish (16 files)
- Day 3-5: Pages (15 files)

#### Tuần 4: Profile & Settings (4 files)
- Day 1: Profile (2 files)
- Day 1: Settings (2 files)

---

## 🔄 Workflow per File

### Template cho mỗi file:

1. **Identify** (30s)
   - Đọc file, tìm lucide-react imports
   - Tìm framer-motion imports
   - List icons cần thay

2. **Add Icons** (1-2 min)
   - Thêm icon types vào Icon.types.ts
   - Thêm iconMap vào CommonIcon.tsx
   - Test icon hiển thị

3. **Replace** (2-3 min)
   - Thay lucide imports → CommonIcon
   - Thay framer-motion → animejs/CSS
   - Fix animations

4. **Verify** (30s)
   - Check lint errors
   - Test UI (nếu cần)

**Total per file**: ~5 phút  
**Total for 67 files**: ~5.5 giờ

---

## 📝 Tracking

### Files Fixed: 3/70 (4.3%)
- ✅ Dashboard.tsx
- ✅ PanelSelector.tsx
- ✅ LayoutSelector.tsx

### Icons Created: 38/~68 (56%)
- Current: 38 icons
- Estimated needed: ~68 icons
- To add: ~30 icons

### Animation Files: 2/7 (29%)
- ✅ Dashboard.tsx (framer → CSS)
- ⏳ OrganizationList.tsx
- ⏳ RepositoryGrid.tsx
- ⏳ Profile.tsx
- ⏳ Settings.tsx

---

## 🎯 Next Steps

1. **Phase 2.2**: Organizations (13 files) - ~25 phút
2. **Phase 2.3a**: File Detail Contract Tabs (7 files) - ~15 phút
3. **Phase 2.3b**: File Detail Overview Tabs (11 files) - ~25 phút
4. **Phase 2.3c**: Repository Components (23 files) - ~50 phút
5. **Phase 2.3d**: Repository Pages (15 files) - ~30 phút
6. **Phase 2.4**: Profile & Settings (4 files) - ~10 phút

**Total estimated**: ~2.5 giờ

---

## 🚀 Optimization Tips

### Batch Processing
- Fix cùng loại files một lúc (tất cả tabs cùng lúc)
- Copy-paste icon replacements giống nhau
- Sử dụng multi_edit cho multiple icons trong 1 file

### Icon Pre-creation
- Tạo trước tất cả ~30 icons cần thiết (1 lần, 10 phút)
- Sau đó chỉ cần replace imports

### Testing
- Test từng phase (không test từng file)
- Build test sau mỗi 10-15 files

---

**Status**: ✅ Phase 2.1 DONE, ⏳ Phase 2.2 NEXT  
**Progress**: 3/70 files (4.3%)  
**Time spent**: 7 minutes  
**Time remaining**: ~2.5 hours
