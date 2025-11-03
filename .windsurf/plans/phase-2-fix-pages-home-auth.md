# Phase 2: Fix Pages - Home, Login, Signup, Dashboard

**Mục tiêu**: Sửa các trang chính để tuân thủ quy tắc UIComponents

**Ưu tiên**: 🔴 **HIGH**

**Thời gian ước tính**: 4-5 giờ

---

## ✅ Tasks

### 2.1. `/home` Page
**URL**: `http://localhost:3000/home`

- [ ] **So sánh với `/src-old/home`**
  - [ ] Đọc code `/src-old` để hiểu layout và components
  - [ ] List tất cả UI elements cần implement

- [ ] **Refactor để giống y chang `/src-old/home`**
  - [ ] Hero section với hand-drawn style
  - [ ] Feature cards với roughjs
  - [ ] CTA buttons với UIComponents/Button
  - [ ] Animations với animejs

- [ ] **Đảm bảo sử dụng UIComponents**
  - [ ] Card → UIComponents/Card
  - [ ] Button → UIComponents/Button
  - [ ] Text → UIComponents/Font
  - [ ] Icons → UIComponents/Icon

- [ ] **Thêm animejs animations**
  - [ ] Fade in hero section
  - [ ] Stagger animation cho feature cards
  - [ ] Hover effects cho buttons
  - [ ] Scroll animations

- [ ] **i18n**
  - [ ] Hero title, subtitle
  - [ ] Feature descriptions
  - [ ] CTA button labels

---

### 2.2. `/login` Page
**URL**: `http://localhost:3000/login`

- [ ] **Sử dụng Card từ UIComponents**
  - [ ] Replace custom card với `<CommonCard>`
  - [ ] Hand-drawn border với roughjs
  - [ ] Shadow effects với roughjs

- [ ] **Form components**
  - [ ] Input → UIComponents/Input (hand-drawn)
  - [ ] Button → UIComponents/Button
  - [ ] Label → UIComponents/Label (với icon)
  - [ ] Checkbox → UIComponents/Checkbox

- [ ] **Animations**
  - [ ] Card entrance animation
  - [ ] Input focus animations
  - [ ] Button hover/tap effects
  - [ ] Error shake animation

- [ ] **Layout với Tailwind (chỉ layout)**
  ```tsx
  <div className="flex min-h-screen items-center justify-center">
    <CommonCard className="w-full max-w-md p-8">
      {/* Form content */}
    </CommonCard>
  </div>
  ```

- [ ] **i18n**
  - [ ] "Đăng nhập"
  - [ ] "Email", "Mật khẩu"
  - [ ] "Quên mật khẩu?"
  - [ ] "Đăng nhập", "Đăng ký"
  - [ ] Error messages

---

### 2.3. `/signup` Page
**URL**: `http://localhost:3000/signup`

- [ ] **Sử dụng Card từ UIComponents** (giống login)
  - [ ] Replace custom card với `<CommonCard>`

- [ ] **Form components**
  - [ ] Input fields → UIComponents/Input
  - [ ] Button → UIComponents/Button
  - [ ] Label → UIComponents/Label
  - [ ] Checkbox (terms) → UIComponents/Checkbox

- [ ] **Animations** (giống login)
  - [ ] Card entrance
  - [ ] Input animations
  - [ ] Button effects
  - [ ] Validation feedback animations

- [ ] **i18n**
  - [ ] "Đăng ký tài khoản"
  - [ ] "Họ", "Tên", "Email", "Mật khẩu"
  - [ ] "Xác nhận mật khẩu"
  - [ ] "Tôi đồng ý với điều khoản"
  - [ ] "Đăng ký"

---

### 2.4. `/dashboard` Page
**URL**: `http://localhost:3000/dashboard`

#### 2.4.1. HeaderControlLayout
- [ ] **Xóa "Bố cục" và "Đặt lại" buttons**
  - [ ] Remove layout controls
  - [ ] Remove reset button

- [ ] **Fix welcome message i18n**
  ```tsx
  // Before: "Welcome back, Truong! 👋Here's what's happening..."
  // After:
  {t('dashboard.welcome', { name: user.firstName })} 👋
  {t('dashboard.subtitle')}
  ```

#### 2.4.2. Statistics Panel
- [ ] **Gộp 4 panels thống kê thành 1 WindowPanel**
  - [ ] Tạo `<StatsWindowPanel>` component
  - [ ] Layout: 2x2 grid inside panel
  - [ ] Mỗi stat card với roughjs style

- [ ] **Stats cards bên trong**
  - [ ] Total Files
  - [ ] Total Contracts
  - [ ] Active Repositories
  - [ ] Storage Upload Used 🔴 (đổi từ "Storage used")

- [ ] **Kết nối API thực**
  - [ ] Fetch user stats từ API
  - [ ] Loading state
  - [ ] Error handling
  - [ ] Real-time updates

#### 2.4.3. Storage Upload Used
- [ ] **Đổi label: "Storage used" → "Storage Upload Used"**

- [ ] **Connect API**
  ```tsx
  // API endpoint
  GET /api/v1/users/me/storage-stats
  
  // Response
  {
    "uploadedBytes": 1234567890,
    "uploadedFilesCount": 42,
    "quota": 10737418240
  }
  ```

- [ ] **Display với progress bar**
  - [ ] UIComponents/ProgressBar (hand-drawn)
  - [ ] Show: "2.5 GB / 10 GB"
  - [ ] Percentage: "25%"

#### 2.4.4. UIComponents Usage
- [ ] **Đảm bảo sử dụng UIComponents**
  - [ ] Panel → UIComponents/Panel
  - [ ] Card → UIComponents/Card
  - [ ] ProgressBar → UIComponents/ProgressBar
  - [ ] Text → UIComponents/Font
  - [ ] Icons → UIComponents/Icon

#### 2.4.5. Animations
- [ ] **Stats cards entrance**
  - [ ] Stagger animation
  - [ ] Count-up animation for numbers

- [ ] **Progress bar animation**
  - [ ] Animate từ 0 → actual value
  - [ ] Smooth easing

- [ ] **Hover effects**
  - [ ] Card lift on hover
  - [ ] Scale animation

---

## 📊 Success Criteria

### /home
- ✅ Giống y chang `/src-old/home`
- ✅ Tất cả UI từ UIComponents
- ✅ Hand-drawn style với roughjs
- ✅ Animations với animejs
- ✅ Hoàn thiện i18n

### /login & /signup
- ✅ Card từ UIComponents/Card
- ✅ Hand-drawn inputs
- ✅ Smooth animations
- ✅ Hoàn thiện i18n

### /dashboard
- ✅ Đã xóa "Bố cục" và "Đặt lại"
- ✅ 4 stats trong 1 WindowPanel
- ✅ "Storage Upload Used" (không phải "Storage used")
- ✅ Kết nối API thực, không mock
- ✅ i18n: "Welcome back, {name}! 👋"
- ✅ All components từ UIComponents

---

## 🚀 Next Phase

➡️ **Phase 3**: Fix profile, settings, sidebar
