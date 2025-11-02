# Phase 3: Fix Profile, Settings, Sidebar

**Mục tiêu**: Sửa profile, settings pages và sidebar menu

**Ưu tiên**: 🟠 **MEDIUM**

**Thời gian ước tính**: 3-4 giờ

---

## ✅ Tasks

### 3.1. `/profile` Page
**URL**: `http://localhost:3000/profile`

#### 3.1.1. Fix "Thành viên từ" - Invalid Date
- [ ] **Kiểm tra data source**
  - [ ] Check API response format
  - [ ] Validate date parsing

- [ ] **Fix date display**
  ```tsx
  // Before: Invalid Date
  // After:
  {formatDate(user.createdAt, 'dd/MM/yyyy')}
  // Hoặc: "Tháng 10, 2024"
  ```

- [ ] **Handle edge cases**
  - [ ] Missing date → "Chưa cập nhật"
  - [ ] Invalid date → Fallback message

#### 3.1.2. Simplify "Hồ sơ của tôi"
- [ ] **Chỉ giữ 4 fields:**
  - [ ] Tên (First name)
  - [ ] Họ (Last name)
  - [ ] Email
  - [ ] Số điện thoại (Phone)

- [ ] **XÓA các fields thừa:**
  - [ ] ❌ Kho mã
  - [ ] ❌ Tổ chức
  - [ ] ❌ Bio/About
  - [ ] ❌ Website
  - [ ] ❌ Bất kỳ field nào khác

- [ ] **Layout đơn giản**
  ```tsx
  <CommonCard>
    <CommonInput label="Tên" value={user.firstName} />
    <CommonInput label="Họ" value={user.lastName} />
    <CommonInput label="Email" value={user.email} disabled />
    <CommonInput label="Số điện thoại" value={user.phone} />
  </CommonCard>
  ```

#### 3.1.3. UIComponents
- [ ] **Input → UIComponents/Input**
- [ ] **Card → UIComponents/Card**
- [ ] **Button → UIComponents/Button**
- [ ] **Label → UIComponents/Label**

#### 3.1.4. i18n
- [ ] "Hồ sơ của tôi"
- [ ] "Tên", "Họ", "Email", "Số điện thoại"
- [ ] "Lưu thay đổi", "Hủy"
- [ ] "Thành viên từ"

---

### 3.2. `/settings` Page
**URL**: `http://localhost:3000/settings`

#### 3.2.1. Audit i18n
- [ ] **Kiểm tra tất cả text**
  - [ ] Page title
  - [ ] Section headings
  - [ ] Labels
  - [ ] Buttons
  - [ ] Descriptions
  - [ ] Tooltips

- [ ] **Thêm missing keys vào translation files**
  ```json
  // vi.json
  {
    "settings": {
      "title": "Cài đặt",
      "general": "Chung",
      "notifications": "Thông báo",
      "privacy": "Quyền riêng tư",
      "appearance": "Giao diện",
      "language": "Ngôn ngữ",
      "save": "Lưu thay đổi",
      "cancel": "Hủy"
    }
  }
  ```

#### 3.2.2. Settings sections
- [ ] **General Settings**
  - [ ] i18n all labels
  - [ ] UIComponents/Input
  - [ ] UIComponents/Select

- [ ] **Notifications**
  - [ ] i18n all labels
  - [ ] UIComponents/Switch
  - [ ] UIComponents/Checkbox

- [ ] **Privacy**
  - [ ] i18n all labels
  - [ ] UIComponents/Switch

- [ ] **Appearance**
  - [ ] i18n all labels
  - [ ] Theme selector
  - [ ] Language selector

#### 3.2.3. UIComponents
- [ ] **Settings Cards → UIComponents/Card**
- [ ] **Inputs → UIComponents/Input**
- [ ] **Switches → UIComponents/Switch**
- [ ] **Selects → UIComponents/Select**
- [ ] **Buttons → UIComponents/Button**

---

### 3.3. Sidebar Menu
**Location**: `src/layouts/MainLayout/Sidebar` hoặc tương tự

#### 3.3.1. XÓA menu "Tệp"
- [ ] **Tìm menu item "Tệp"**
  ```tsx
  // Search for:
  - "Tệp"
  - "Files" 
  - icon: File, FileText, v.v.
  ```

- [ ] **Xóa menu item và routes liên quan**
  - [ ] Remove from sidebar config
  - [ ] Remove from navigation array
  - [ ] Clean up unused routes

#### 3.3.2. Verify menu structure
- [ ] **Danh sách menu còn lại:**
  - [ ] ✅ Dashboard
  - [ ] ✅ Repositories
  - [ ] ✅ Organizations
  - [ ] ✅ Settings
  - [ ] ✅ Profile

- [ ] **Không còn:**
  - [ ] ❌ Tệp / Files

#### 3.3.3. UIComponents cho Sidebar
- [ ] **Menu items → Hand-drawn style**
  - [ ] Roughjs border on hover
  - [ ] Animejs hover effects

- [ ] **Icons → UIComponents/Icon**

- [ ] **Active state animation**
  - [ ] Smooth transition
  - [ ] Hand-drawn highlight

#### 3.3.4. i18n Sidebar
- [ ] "Trang chủ" / "Dashboard"
- [ ] "Kho tài liệu" / "Repositories"
- [ ] "Tổ chức" / "Organizations"
- [ ] "Cài đặt" / "Settings"
- [ ] "Hồ sơ" / "Profile"

---

## 📊 Success Criteria

### /profile
- ✅ "Thành viên từ" hiển thị đúng (không còn Invalid Date)
- ✅ "Hồ sơ của tôi" chỉ có 4 fields: Tên, Họ, Email, SĐT
- ✅ Đã xóa "Kho mã" và "Tổ chức"
- ✅ Tất cả components từ UIComponents
- ✅ Hoàn thiện i18n

### /settings
- ✅ Tất cả text đã có i18n
- ✅ Không còn hardcoded text
- ✅ Tất cả components từ UIComponents
- ✅ Translation files đầy đủ

### Sidebar
- ✅ Đã xóa menu "Tệp"
- ✅ Menu items sử dụng UIComponents
- ✅ Hand-drawn style với roughjs
- ✅ Smooth animations với animejs
- ✅ Hoàn thiện i18n

---

## 🚀 Next Phase

➡️ **Phase 4**: Fix repositories pages
