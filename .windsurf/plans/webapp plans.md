# 📋 WEBAPP - PLANS TỔNG QUAN

**Mục tiêu**: Refactor toàn bộ webapp để tuân thủ 100% quy tắc UIComponents, RoughJS, Animejs

**Tổng thời gian ước tính**: 26-35 giờ

---

## 📊 Phases Overview

| Phase | Tên | Ưu tiên | Thời gian | Status |
|-------|-----|---------|-----------|--------|
| 1 | Clean Dependencies & UIComponents Structure | 🔴 Critical | 2-3h | ⏳ Pending |
| 2 | Fix Pages - Home, Login, Signup, Dashboard | 🔴 High | 4-5h | ⏳ Pending |
| 3 | Fix Profile, Settings, Sidebar | 🟠 Medium | 3-4h | ⏳ Pending |
| 4 | Fix Repositories Pages | 🔴 High | 6-8h | ⏳ Pending |
| 5 | Fix Organizations Page | 🟠 Medium | 3-4h | ⏳ Pending |
| 6 | i18n Completion & Layout Refactoring | 🟠 Medium | 4-5h | ⏳ Pending |
| 7 | Testing, Validation & Documentation | 🔴 Critical | 4-6h | ⏳ Pending |

---

## 🎯 Phase Details

### Phase 1: Clean Dependencies & UIComponents Structure
**File**: `phase-1-clean-dependencies.md`

**Mục tiêu**:
- Xóa tất cả dependencies không cho phép
- Chuẩn hóa cấu trúc UIComponents
- Nhúng CommonIcon vào CommonLabel

**Key Tasks**:
- ❌ Xóa @mui, emotion, framer-motion, lucide, konva
- ✅ Verify UIComponents structure
- ✅ Clean build thành công

---

### Phase 2: Fix Pages - Home, Auth, Dashboard
**File**: `phase-2-fix-pages-home-auth.md`

**Mục tiêu**:
- /home giống /src-old
- /login, /signup dùng UIComponents/Card
- /dashboard gộp stats, fix Storage Upload Used

**Key Tasks**:
- ✅ Home hand-drawn với roughjs
- ✅ Login/Signup Card từ UIComponents
- ✅ Dashboard: 4 stats → 1 WindowPanel
- ✅ "Storage Upload Used" + API

---

### Phase 3: Fix Profile, Settings, Sidebar
**File**: `phase-3-fix-profile-settings-sidebar.md`

**Mục tiêu**:
- Fix Invalid Date ở profile
- Simplify profile fields
- Complete i18n cho settings
- Xóa menu "Tệp" sidebar

**Key Tasks**:
- ✅ Profile: 4 fields only
- ✅ Settings: 100% i18n
- ✅ Sidebar: No "Tệp" menu

---

### Phase 4: Fix Repositories Pages
**File**: `phase-4-fix-repositories-pages.md`

**Mục tiêu**:
- Tabs từ UIComponents
- Tab Thành viên connect API
- Permissions management
- File list improvements

**Key Tasks**:
- ✅ Replace custom tabs
- ✅ API for members (not mock)
- ✅ Permissions: Upload, View, Delete
- ✅ Add "Tải lên" & "Mời" buttons
- ✅ Fix file list layout

---

### Phase 5: Fix Organizations Page
**File**: `phase-5-fix-organizations-page.md`

**Mục tiêu**:
- Search vào Right Section
- Tab Thông tin lên đầu
- Recent contracts/repos (5)
- Add "Mở danh sách" button

**Key Tasks**:
- ✅ Move search button
- ✅ Display org creation date
- ✅ Recent data only
- ✅ "Mở danh sách kho" button

---

### Phase 6: i18n Completion & Layout Refactoring
**File**: `phase-6-i18n-layout-refactor.md`

**Mục tiêu**:
- 100% i18n coverage
- Xóa subtitle, bắt buộc description
- Move specific layouts vào features/

**Key Tasks**:
- ✅ Global i18n audit
- ✅ Remove all subtitle
- ✅ Layouts: MainLayout, HeaderLayout in /layouts
- ✅ Specific layouts in features/

---

### Phase 7: Testing, Validation & Documentation
**File**: `phase-7-testing-validation.md`

**Mục tiêu**:
- Validate 100% quy tắc
- Test tất cả pages
- Performance, a11y, responsive
- Documentation

**Key Tasks**:
- ✅ Rules compliance check
- ✅ Page-by-page testing
- ✅ i18n testing
- ✅ Performance (Lighthouse > 80)
- ✅ Update README

---

## 📈 Progress Tracking

### Overall Progress
```
[░░░░░░░░░░░░░░░░░░░░] 0% (0/7 phases)
```

### Phase Status Legend
- ⏳ **Pending**: Chưa bắt đầu
- 🟡 **In Progress**: Đang thực hiện
- ✅ **Completed**: Hoàn thành
- ❌ **Blocked**: Bị chặn

---

## 🎯 Success Criteria (Final)

### Code Quality
- ✅ 100% quy tắc tuân thủ
- ✅ Không có dependencies vi phạm
- ✅ Tất cả UI từ UIComponents
- ✅ RoughJS + Animejs only
- ✅ Tailwind chỉ cho layout

### Functionality
- ✅ Tất cả pages hoạt động
- ✅ Tất cả features functional
- ✅ API integration works
- ✅ No mock data

### i18n
- ✅ 100% coverage
- ✅ vi.json + en.json complete
- ✅ Language switching smooth

### Performance
- ✅ Lighthouse > 80
- ✅ Bundle size < 5MB
- ✅ 60fps animations

### Documentation
- ✅ README updated
- ✅ Components documented
- ✅ Code comments

---

## 📚 References

### Documents
- [Rules](../rules.md) - Quy tắc bắt buộc
- [Package.json](../../package.json) - Dependencies allowed

### Tools
- RoughJS: https://roughjs.com/
- Anime.js: https://animejs.com/
- i18next: https://react.i18next.com/

---

**Cập nhật lần cuối**: ${new Date().toISOString().split('T')[0]}
**Trạng thái tổng quan**: ⏳ **CHƯA BẮT ĐẦU**
