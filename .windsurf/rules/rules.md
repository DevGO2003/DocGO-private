# 📋 WEBAPP - QUY TẮC BẮT BUỘC

> **Tất cả code PHẢI tuân theo các quy tắc này. Vi phạm = Sửa lại ngay lập tức.**

---

## 🎨 1. UI COMPONENTS - QUY TẮC TUYỆT ĐỐI

### 1.1. Bắt buộc sử dụng `/UIComponents`
- ✅ **PHẢI** sử dụng components từ `src/shared/components/UIComponents/`
- ❌ **KHÔNG ĐƯỢC** tạo components UI tùy ý ngoài thư mục này
- ❌ **KHÔNG ĐƯỢC** sử dụng thư viện UI khác (Material-UI, Ant Design, v.v.)
- ✅ Components áp dụng cho: Sidebar, HeaderPanel, MainLayout, HeaderControlLayout và TẤT CẢ components con

### 1.2. Cấu trúc chuẩn cho mỗi UI Component
```
UIComponents/
├── ComponentName/
│   ├── CommonComponent.tsx       # Component chính với props cơ bản
│   ├── Component.styles.ts       # Styles (roughjs config, anime.js)
│   ├── Component.types.ts        # TypeScript types & interfaces
│   ├── index.ts                  # Export tất cả
│   └── BiếnThể*.tsx             # Các biến thể (nếu có)
```

### 1.3. Quy tắc Hand-drawn UI
- ✅ **PHẢI** sử dụng `roughjs` cho tất cả UI elements
- ✅ **PHẢI** sử dụng `animejs` cho tất cả animations
- ❌ **KHÔNG ĐƯỢC** sử dụng CSS animations, Framer Motion hay bất kỳ animation library nào khác
- ✅ Components như Card, Button, Input phải có hand-drawn style

### 1.4. Font & Icon trong Components
- ✅ Card có chữ → PHẢI sử dụng `UIComponents/Font/`
- ✅ **CommonIcon** PHẢI được nhúng vào trong **CommonLabel**
- ✅ Icon phải là hand-drawn style (roughjs)

### 1.5. Tailwind CSS - Giới hạn sử dụng
- ✅ **CHỈ DÙNG** cho: Kích thước, Bố cục (flex, grid, spacing, positioning)
- ❌ **KHÔNG DÙNG** cho: Màu sắc, border, shadow, background (dùng roughjs thay thế)
- ✅ Ví dụ hợp lệ: `className="flex gap-4 w-full max-w-md"`
- ❌ Ví dụ SAI: `className="bg-white shadow-lg rounded-lg border"`

---

## 📦 2. DEPENDENCIES - GIỚI HẠN NGHIÊM NGẶT

### 2.1. Dependencies được phép
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "@tanstack/react-query": "^5.17.9",
    "axios": "^1.6.0",
    "i18next": "^25.6.0",
    "i18next-browser-languagedetector": "^8.2.0",
    "react-i18next": "^16.2.1",
    "animejs": "^3.2.2",
    "roughjs": "^4.6.6",
    "clsx": "^2.1.0",
    "tailwindcss": "^3.4.0",
    "tailwind-merge": "^2.2.0",
    "@hello-pangea/dnd": "^18.0.1"
  }
}
```

### 2.2. Dependencies KHÔNG được phép
❌ `@mui/material` - XÓA
❌ `@emotion/react`, `@emotion/styled` - XÓA
❌ `framer-motion` - XÓA (dùng animejs)
❌ `lucide-react` - XÓA (dùng custom icons)
❌ `konva`, `react-konva` - XÓA
❌ `class-variance-authority` - XÓA
❌ Bất kỳ UI library nào khác

### 2.3. Hành động khi phát hiện
1. Xóa dependency từ package.json
2. Xóa tất cả imports liên quan
3. Thay thế bằng UIComponents
4. Chạy `npm install` để clean

---

## 🏗️ 3. CẤU TRÚC DỰ ÁN

### 3.1. Layout Components
```
src/
├── layouts/
│   ├── MainLayout/          # Layout chính
│   ├── HeaderLayout/        # Header layout
│   └── (không có layouts khác ở đây)
├── features/
│   ├── upload/
│   │   └── layouts/
│   │       └── UploadHeaderLayout/  # Specific layout
│   ├── repositories/
│   │   └── layouts/
│   │       └── RepositoryHeaderLayout/
│   └── [feature]/
│       └── layouts/
│           └── [Feature]HeaderLayout/
```

### 3.2. Quy tắc Layout
- ✅ **MainLayout** và **HeaderLayout** → `src/layouts/`
- ✅ **Specific layouts** → `src/features/[feature]/layouts/`
- ✅ UploadHeaderLayout, RepositoryHeaderLayout, v.v. → Di chuyển xuống feature folders

---

## 📝 4. HEADER & METADATA

### 4.1. HeaderControlLayout
- ❌ **XÓA** trường `subtitle` (thừa, đã có description)
- ✅ **BẮT BUỘC** có trường `description` (mô tả trang này dùng để làm gì)
- ✅ Nếu thiếu description → BỔ SUNG ngay

### 4.2. Format chuẩn
```tsx
<HeaderControlLayout
  title="Tiêu đề trang"
  description="Mô tả rõ ràng trang này dùng để làm gì"
  // subtitle={...} ← XÓA dòng này
  breadcrumbs={[...]}
  headerRight={...}
/>
```

---

## 🌐 5. INTERNATIONALIZATION (i18n)

### 5.1. Quy tắc i18n
- ✅ **TẤT CẢ** text hiển thị PHẢI dùng `t('key')`
- ✅ Kiểm tra và bổ sung keys thiếu trong translation files
- ✅ Format: `t('feature.component.text')`

### 5.2. Ưu tiên i18n
- ✅ Page titles, descriptions
- ✅ Button labels, form labels
- ✅ Error messages, notifications
- ✅ Menu items, navigation
- ✅ Placeholder text

---

## 📄 6. QUY TẮC THEO TỪNG TRANG

### 6.1. `/home`
- ✅ Phải giống y chang `/src-old/home`
- ✅ PHẢI sử dụng UIComponents

### 6.2. `/login` và `/signup`
- ✅ PHẢI sử dụng Card từ UIComponents/Card

### 6.3. `/dashboard`
- ❌ XÓA "Bố cục" và "Đặt lại"
- ✅ 4 panels thống kê → Gộp thành 1 WindowPanel
- ✅ "Storage used" → Đổi thành "Storage Upload Used"
- ✅ Kết nối API thực, không mock
- ✅ i18n: "Welcome back, {name}! 👋"

### 6.4. `/profile`
- ✅ Fix "Invalid Date" ở "Thành viên từ"
- ✅ "Hồ sơ của tôi" chỉ gồm: Tên, Họ, Email, Số điện thoại
- ❌ XÓA: "Kho mã" và "Tổ chức"

### 6.5. `/settings`
- ✅ Bổ sung i18n cho tất cả text

### 6.6. Sidebar
- ❌ **XÓA** menu "Tệp" (không cần thiết)

### 6.7. `/repositories`
- ✅ Tabs PHẢI dùng UIComponents/Tabs (không dùng custom Tailwind)
- ✅ Không sử dụng components ngoài UIComponents

### 6.8. `/repositories/:id`
- ✅ Tab "Thành viên" → Kết nối API, không mock
- ✅ Tabs PHẢI dùng UIComponents/Tabs
- ✅ Thêm nút "Tải lên tệp" và "Mời thành viên" vào bên trái nút "Làm mới"
- ✅ Admin tổ chức có thể cấp quyền: Upload, Xem, Xóa
- ✅ Mặc định: Người upload có quyền Xem và Xóa

### 6.9. `/repositories/:id/files`
- ✅ Giới hạn kích thước components trong HeaderControlLayout
- ❌ XÓA div bao quanh filter panel
- ✅ Nút "Làm mới" nằm trong Right Section
- ✅ Bổ sung i18n
- ✅ "Show more" chỉ hiện khi có nhiều dữ liệu
- ✅ Thêm nút "Làm mới" như HeaderControlPanel khác

### 6.10. `/organizations`
- ✅ Di chuyển nút "Tìm kiếm" vào Right Section
- ✅ Hiển thị ngày tổ chức (fetch data)
- ✅ Tab "Hợp đồng", "Kho tài liệu": Chỉ hiện 5 gần đây
- ✅ Thêm nút "Mở danh sách kho" bên trái "Làm mới"
- ✅ Di chuyển tab "Thông tin" lên đầu

---

## ✅ 7. CHECKLIST TRƯỚC KHI COMMIT

- [ ] Tất cả UI components đều từ `/UIComponents`?
- [ ] Không có dependencies ngoài danh sách cho phép?
- [ ] Tất cả animations dùng `animejs`?
- [ ] Tất cả UI elements dùng `roughjs`?
- [ ] Tailwind chỉ dùng cho layout, không dùng cho styling?
- [ ] CommonIcon đã nhúng vào CommonLabel?
- [ ] Không có `subtitle` trong HeaderControlLayout?
- [ ] Tất cả text đã i18n?
- [ ] Specific layouts đã di chuyển vào `features/`?
- [ ] Code tuân theo cấu trúc chuẩn?

---

## 🚨 8. XỬ LÝ VI PHẠM

### Khi phát hiện vi phạm:
1. **DỪNG NGAY** công việc hiện tại
2. **SỬA** vi phạm theo quy tắc
3. **KIỂM TRA** lại toàn bộ file liên quan
4. **TEST** lại chức năng
5. **COMMIT** với message: `fix: Tuân thủ quy tắc [tên quy tắc]`

### Mức độ nghiêm trọng:
- 🔴 **Critical**: Sử dụng UI library ngoài, dependencies không cho phép
- 🟠 **High**: Không dùng UIComponents, không dùng roughjs/animejs
- 🟡 **Medium**: Thiếu i18n, sai cấu trúc
- 🟢 **Low**: Format code, naming convention

---

## 📚 9. TÀI LIỆU THAM KHẢO

- RoughJS: https://roughjs.com/
- Anime.js: https://animejs.com/
- React i18next: https://react.i18next.com/
- Redux Toolkit: https://redux-toolkit.js.org/
- TanStack Query: https://tanstack.com/query/latest

---

**Cập nhật lần cuối**: ${new Date().toISOString().split('T')[0]}
**Phiên bản**: 1.0.0
