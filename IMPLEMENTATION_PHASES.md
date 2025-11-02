# 🚀 Implementation Phases - Chi tiết từng giai đoạn

**Chiến lược:** Chia nhỏ thành 12 phases, mỗi phase 2-3 giờ  
**Mục tiêu:** Dễ thực hiện, track progress, test từng phase

---

## 📋 Phase Overview

| Phase | Nội dung | Thời gian | Độ khó | Priority |
|-------|----------|-----------|--------|----------|
| **Phase 1** | Settings + Profile tabs → CommonTab | 2-3h | ⭐ Dễ | P0 |
| **Phase 2** | UploadPage + OrganizationDetail tabs | 2-3h | ⭐ Dễ | P0 |
| **Phase 3** | RepositoryTabs + RepositoryDetail tabs | 2-3h | ⭐⭐ TB | P0 |
| **Phase 4** | OrganizationWorkspace tabs | 2h | ⭐⭐ TB | P0 |
| **Phase 5** | Authentication auto-refresh | 2-3h | ⭐⭐⭐ Khó | P0 |
| **Phase 6** | Repository Detail page changes | 3-4h | ⭐⭐⭐ Khó | P0 |
| **Phase 7** | Organizations Workspace - Part 1 | 3h | ⭐⭐⭐ Khó | P0 |
| **Phase 8** | Organizations Workspace - Part 2 | 2-3h | ⭐⭐ TB | P0 |
| **Phase 9** | Profile page cleanup | 1-1.5h | ⭐ Dễ | P1 |
| **Phase 10** | Repository Files List changes | 1-1.5h | ⭐ Dễ | P1 |
| **Phase 11** | HeaderPanel improvements | 2-3h | ⭐⭐ TB | P1 |
| **Phase 12** | Dashboard WindowPanel | 5-7h | ⭐⭐⭐ Khó | P1 |

**Tổng thời gian:** 26-38 giờ

---

## 🎯 PHASE 1 - Settings + Profile Tabs (⭐ Dễ)

**Thời gian:** 2-3 giờ  
**Mục tiêu:** Thay button tabs → CommonTab trong 2 files đơn giản nhất  
**Status:** 🟢 READY TO START

### Files cần sửa (2 files)

#### 1. Settings.tsx
**File:** `frontend/webapp/src/features/settings/views/pages/Settings.tsx`

**Thay đổi:**
- [ ] **Line 166-178:** Tabs
  ```tsx
  // Import
  import { Tabs, TabList, CommonTab } from '@shared/components';
  
  // Thay
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => (
        <button onClick={() => setActiveTab(tab.id)}>...</button>
      ))}
    </nav>
  </div>
  
  // Bằng
  <Tabs>
    <TabList>
      {tabs.map((tab) => (
        <CommonTab 
          key={tab.id}
          value={tab.id} 
          activeValue={activeTab} 
          onSelect={() => setActiveTab(tab.id)}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </CommonTab>
      ))}
    </TabList>
  </Tabs>
  ```

- [ ] **Line 373-383:** Checkbox
  ```tsx
  // Thay
  <input type="checkbox" checked={...} onChange={...} />
  
  // Bằng
  <Checkbox checked={...} onCheckedChange={(checked) => ...} />
  ```

- [ ] **Line 403, 424, 444, 464:** Select
  ```tsx
  // Thay
  <select value={...} onChange={...}>
    <option>...</option>
  </select>
  
  // Bằng
  <Select 
    value={...} 
    onChange={(value) => ...}
    options={[...]}
  />
  ```

- [ ] **Line 301:** Button show/hide password
  ```tsx
  // Thay
  <button onClick={...}>👁️</button>
  
  // Bằng
  <Button variant="ghost" onClick={...}>
    <Eye className="w-4 h-4" />
  </Button>
  ```

**Testing:**
- [ ] Click các tabs hoạt động đúng
- [ ] Checkbox toggle đúng
- [ ] Select dropdown đúng
- [ ] Password toggle đúng

---

#### 2. Profile.tsx
**File:** `frontend/webapp/src/features/profile/views/pages/Profile/Profile.tsx`

**Thay đổi:**
- [ ] **Line 207, 223, 243, 261, 281, 297:** Labels (6 chỗ)
  ```tsx
  // Thay
  <Label className="flex items-center gap-2 mb-2">
    <User className="w-4 h-4" />
    {t('profile.labels.firstName')}
  </Label>
  
  // Bằng
  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
    <User className="w-4 h-4" />
    {t('profile.labels.firstName')}
  </label>
  ```

**Testing:**
- [ ] Labels hiển thị đúng, không có border
- [ ] Icons hiển thị đúng
- [ ] Form vẫn hoạt động

---

### Checklist Phase 1

**Pre-work:**
- [ ] Backup branch: `git checkout -b phase-1-tabs`
- [ ] Check dependencies: `Tabs`, `TabList`, `CommonTab` có trong `@shared/components`
- [ ] Check `Checkbox`, `Select`, `Button` components

**Implementation:**
1. [ ] Settings.tsx - Tabs (30 phút)
2. [ ] Settings.tsx - Checkbox (15 phút)
3. [ ] Settings.tsx - Select (30 phút)
4. [ ] Settings.tsx - Button (15 phút)
5. [ ] Profile.tsx - Labels (30 phút)

**Testing:**
- [ ] Run dev server: `npm run dev`
- [ ] Test Settings page: `/settings`
  - [ ] Switch tabs
  - [ ] Toggle checkboxes
  - [ ] Change selects
  - [ ] Toggle password visibility
- [ ] Test Profile page: `/profile`
  - [ ] Check labels hiển thị đúng
  - [ ] Form submission vẫn hoạt động

**Commit:**
- [ ] `git add .`
- [ ] `git commit -m "Phase 1: Convert Settings + Profile to CommonTab"`
- [ ] `git push origin phase-1-tabs`

---

## 🎯 PHASE 2 - UploadPage + OrganizationDetail (⭐ Dễ)

**Thời gian:** 2-3 giờ  
**Status:** ⏳ PENDING Phase 1

### Files (2 files)

#### 1. UploadPage.tsx
**File:** `frontend/webapp/src/features/upload/views/pages/UploadPage.tsx`
- [ ] Line 207-212: Button đóng modal → `Button` component

#### 2. OrganizationDetail.tsx
**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationDetail/OrganizationDetail.tsx`
- [ ] Line 236-249: Button tabs → `CommonTab`
- [ ] Line 424, 436, 448: Input checkbox → `Checkbox`
- [ ] Line 269, 273, 279, 286: Label → `Label` (hoặc `<label>`)

---

## 🎯 PHASE 3 - RepositoryTabs + RepositoryDetail (⭐⭐ TB)

**Thời gian:** 2-3 giờ  
**Status:** ⏳ PENDING Phase 2

### Files (2 files)

#### 1. RepositoryTabs.tsx
- [ ] Thay button tabs → `CommonTab`
- [ ] Giữ functionality (activeTab, onTabChange, counts)

#### 2. RepositoryDetail.tsx
- [ ] Line 256-295: Button tabs → `CommonTab`
- [ ] Giữ icons và translations

---

## 🎯 PHASE 4 - OrganizationWorkspace Tabs (⭐⭐ TB)

**Thời gian:** 2 giờ  
**Status:** ⏳ PENDING Phase 3

### File (1 file)

#### OrganizationWorkspace.tsx
- [ ] Line 234-252: Button tabs → `CommonTab`
- [ ] Giữ icons và labels

---

## 🎯 PHASE 5 - Authentication Auto-Refresh (⭐⭐⭐ Khó)

**Thời gian:** 2-3 giờ  
**Status:** ⏳ PENDING Phase 4

### Files (2 files)
- [ ] `apiClient.ts` - Response interceptor
- [ ] `enhancedApiClient.ts` - Tương tự

---

## 🎯 PHASE 6 - Repository Detail Changes (⭐⭐⭐ Khó)

**Thời gian:** 3-4 giờ  
**Status:** ⏳ PENDING Phase 5

- [ ] Thêm tab Info
- [ ] Xóa tab Settings
- [ ] Xóa duplicate header
- [ ] Disable Activity tab
- [ ] Invite Member modal

---

## 🎯 PHASE 7 - Organizations Workspace Part 1 (⭐⭐⭐ Khó)

**Thời gian:** 3 giờ  
**Status:** ⏳ PENDING Phase 6

- [ ] Nút "Mở danh sách kho"
- [ ] Gộp tab Hợp đồng + Chờ phê duyệt

---

## 🎯 PHASE 8 - Organizations Workspace Part 2 (⭐⭐ TB)

**Thời gian:** 2-3 giờ  
**Status:** ⏳ PENDING Phase 7

- [ ] Di chuyển Stats vào tab Báo cáo
- [ ] Thêm 2 stats cards mới
- [ ] Giới hạn hiển thị gần đây

---

## 🎯 PHASE 9 - Profile Cleanup (⭐ Dễ)

**Thời gian:** 1-1.5 giờ  
**Status:** ⏳ PENDING Phase 8

- [ ] Bỏ Role Badge
- [ ] Bỏ Role trong Account Info
- [ ] Thêm TODO Kho mã

---

## 🎯 PHASE 10 - Repository Files List (⭐ Dễ)

**Thời gian:** 1-1.5 giờ  
**Status:** ⏳ PENDING Phase 9

- [ ] Bỏ div wrapper FilesFilters
- [ ] ShowMore conditional
- [ ] Button "Xóa và làm mới"

---

## 🎯 PHASE 11 - HeaderPanel (⭐⭐ TB)

**Thời gian:** 2-3 giờ  
**Status:** ⏳ PENDING Phase 10

- [ ] Refactor với animejs
- [ ] Subtitle required
- [ ] Decorative blobs

---

## 🎯 PHASE 12 - Dashboard WindowPanel (⭐⭐⭐ Khó)

**Thời gian:** 5-7 giờ  
**Status:** ⏳ PENDING Phase 11

- [ ] Tạo CommonPanel, WindowPanel, PanelSelector
- [ ] Update Dashboard.tsx

---

## 📊 Progress Tracking

```
Phase 1  [        ] 0%  ⏳ Ready to start
Phase 2  [        ] 0%  ⏸️ Waiting
Phase 3  [        ] 0%  ⏸️ Waiting
Phase 4  [        ] 0%  ⏸️ Waiting
Phase 5  [        ] 0%  ⏸️ Waiting
Phase 6  [        ] 0%  ⏸️ Waiting
Phase 7  [        ] 0%  ⏸️ Waiting
Phase 8  [        ] 0%  ⏸️ Waiting
Phase 9  [        ] 0%  ⏸️ Waiting
Phase 10 [        ] 0%  ⏸️ Waiting
Phase 11 [        ] 0%  ⏸️ Waiting
Phase 12 [        ] 0%  ⏸️ Waiting

Overall: 0/12 phases (0%)
```

---

## 🎯 Bắt đầu Phase 1?

Khi sẵn sàng, chạy:
```bash
git checkout -b phase-1-tabs
npm run dev
```

Sau đó làm theo checklist Phase 1 ở trên!
