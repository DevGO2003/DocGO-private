# Phase 4: Fix Repositories Pages

**Mục tiêu**: Sửa tất cả repositories pages để tuân thủ quy tắc

**Ưu tiên**: 🔴 **HIGH**

**Thời gian ước tính**: 6-8 giờ

---

## ✅ Tasks

### 4.1. `/repositories` - Repository List
**URL**: `http://localhost:3000/repositories`

#### 4.1.1. Replace Custom Tabs
- [ ] **Tìm custom Tailwind tabs**
  ```tsx
  // Search for:
  - className=".*border-b.*"
  - className=".*tab.*"
  - Custom tab components
  ```

- [ ] **Replace với UIComponents/Tabs**
  ```tsx
  // Before: Custom tabs
  <div className="border-b">
    <button className={isActive ? "border-blue" : ""}>Tab 1</button>
  </div>

  // After: UIComponents
  <CommonTabs
    tabs={[
      { id: 'all', label: t('repositories.tabs.all') },
      { id: 'recent', label: t('repositories.tabs.recent') }
    ]}
    activeTab={activeTab}
    onChange={setActiveTab}
  />
  ```

#### 4.1.2. UIComponents Audit
- [ ] **Kiểm tra và thay thế:**
  - [ ] Cards → UIComponents/Card
  - [ ] Buttons → UIComponents/Button
  - [ ] Input (search) → UIComponents/Input
  - [ ] Icons → UIComponents/Icon
  - [ ] Tabs → UIComponents/Tabs ✅

- [ ] **Remove components ngoài UIComponents**
  - [ ] Custom cards
  - [ ] Custom buttons
  - [ ] Custom inputs

#### 4.1.3. i18n
- [ ] Page title, description
- [ ] Tab labels
- [ ] Search placeholder
- [ ] Button labels
- [ ] Empty state messages

---

### 4.2. `/repositories/:id` - Repository Detail
**URL**: `http://localhost:3000/repositories/439614c5-0d72-4be5-81e9-d191734a441c`

#### 4.2.1. Replace Custom Tabs
- [ ] **Replace tabs với UIComponents/Tabs** (giống 4.1.1)
  - [ ] Overview tab
  - [ ] Files tab
  - [ ] Members tab (Thành viên)
  - [ ] Settings tab

#### 4.2.2. Tab "Thành viên" - Connect API
- [ ] **Loại bỏ mock data**
  - [ ] Remove hardcoded members array

- [ ] **Connect API**
  ```tsx
  // API endpoint
  GET /api/v1/repositories/:id/members
  
  // Response
  {
    "members": [
      {
        "id": "uuid",
        "user": { "id": "uuid", "name": "..." },
        "role": "ADMIN" | "MEMBER",
        "permissions": {
          "canUpload": true,
          "canView": true,
          "canDelete": false
        }
      }
    ]
  }
  ```

- [ ] **Fetch & display members**
  - [ ] Loading state
  - [ ] Error handling
  - [ ] Empty state

#### 4.2.3. Permissions Management (Tab Thành viên)
- [ ] **Admin có thể cấp quyền:**
  - [ ] Upload permission
  - [ ] View permission
  - [ ] Delete permission

- [ ] **UI for permissions**
  ```tsx
  <CommonSwitch 
    label="Upload"
    checked={member.permissions.canUpload}
    onChange={(val) => updatePermission(member.id, 'canUpload', val)}
    disabled={!isAdmin}
  />
  ```

- [ ] **Default permissions:**
  - [ ] Người upload → canView = true, canDelete = true
  - [ ] Others → canView = false, canDelete = false

- [ ] **API endpoints:**
  ```tsx
  // Update member permissions
  PATCH /api/v1/repositories/:repoId/members/:memberId/permissions
  Body: { canUpload: true, canView: true, canDelete: false }
  ```

#### 4.2.4. HeaderPanel - Add Buttons
- [ ] **Thêm nút "Tải lên tệp"**
  - [ ] Position: Bên trái nút "Làm mới"
  - [ ] UIComponents/Button
  - [ ] Icon: Upload
  - [ ] OnClick: Open upload modal

- [ ] **Thêm nút "Mời thành viên"**
  - [ ] Position: Bên trái nút "Làm mới"
  - [ ] UIComponents/Button
  - [ ] Icon: UserPlus
  - [ ] OnClick: Open invite modal

- [ ] **Layout:**
  ```tsx
  <HeaderControlLayout
    headerRight={
      <>
        <CommonButton icon="upload">Tải lên tệp</CommonButton>
        <CommonButton icon="user-plus">Mời thành viên</CommonButton>
        <RefreshButton />
      </>
    }
  />
  ```

#### 4.2.5. UIComponents Audit
- [ ] **Replace tất cả components:**
  - [ ] Tabs → UIComponents/Tabs ✅
  - [ ] Cards → UIComponents/Card
  - [ ] Buttons → UIComponents/Button
  - [ ] Switches → UIComponents/Switch
  - [ ] Table → UIComponents/Table
  - [ ] Icons → UIComponents/Icon

#### 4.2.6. i18n
- [ ] Tab labels
- [ ] "Tải lên tệp", "Mời thành viên"
- [ ] Permissions labels
- [ ] Member roles
- [ ] Empty states

---

### 4.3. `/repositories/:id/files` - File List
**URL**: `http://localhost:3000/repositories/:id/files`

#### 4.3.1. HeaderControlLayout Fixes
- [ ] **Loại bỏ giới hạn kích thước components**
  - [ ] Remove max-width constraints
  - [ ] Match button sizes với nút "Làm mới"

- [ ] **XÓA div bao quanh filter panel**
  ```tsx
  // Before:
  <div className="...">
    <FilterPanel />
  </div>
  <RefreshButton />

  // After:
  <HeaderControlLayout
    headerRight={
      <>
        <FilterPanel />
        <RefreshButton />
      </>
    }
  />
  ```

- [ ] **Nút "Làm mới" trong Right Section**
  - [ ] Not outside
  - [ ] Consistent positioning

#### 4.3.2. Show More Logic
- [ ] **Chỉ hiện "Show more" khi có nhiều dữ liệu**
  ```tsx
  {files.length > pageSize && (
    <CommonButton onClick={loadMore}>
      {t('common.showMore')}
    </CommonButton>
  )}
  ```

- [ ] **Hide khi:**
  - [ ] files.length <= pageSize
  - [ ] All loaded
  - [ ] No more data

#### 4.3.3. Add "Làm mới" Button
- [ ] **Thêm RefreshButton như các HeaderControlPanel khác**
  - [ ] UIComponents/RefreshButton
  - [ ] Position: Right section
  - [ ] OnClick: Refetch file list

#### 4.3.4. i18n Audit
- [ ] **Tìm hardcoded text**
  - [ ] Search: `"..."` (double quotes)
  - [ ] Search: `'...'` (single quotes, non-JSX)

- [ ] **Thêm missing keys:**
  - [ ] Filter labels
  - [ ] Column headers
  - [ ] Sort options
  - [ ] Empty states
  - [ ] Pagination

#### 4.3.5. UIComponents Audit
- [ ] Table → UIComponents/Table
- [ ] Filter components → UIComponents
- [ ] Buttons → UIComponents/Button
- [ ] Input (search/filter) → UIComponents/Input
- [ ] Select (filter dropdowns) → UIComponents/Select

---

## 📊 Success Criteria

### /repositories
- ✅ Tabs từ UIComponents/Tabs (không dùng custom Tailwind)
- ✅ Tất cả components từ UIComponents
- ✅ Hoàn thiện i18n

### /repositories/:id
- ✅ Tabs từ UIComponents/Tabs
- ✅ Tab "Thành viên" kết nối API (không mock)
- ✅ Admin có thể cấp quyền (Upload, View, Delete)
- ✅ Mặc định: Người upload có View + Delete
- ✅ Nút "Tải lên tệp" và "Mời thành viên" ở bên trái "Làm mới"
- ✅ Tất cả components từ UIComponents

### /repositories/:id/files
- ✅ Không giới hạn kích thước components
- ✅ Đã xóa div bao quanh filter panel
- ✅ Nút "Làm mới" trong Right Section
- ✅ "Show more" chỉ hiện khi có nhiều dữ liệu
- ✅ Đã thêm nút "Làm mới"
- ✅ Hoàn thiện i18n
- ✅ Tất cả components từ UIComponents

---

## 🚀 Next Phase

➡️ **Phase 5**: Fix organizations page
