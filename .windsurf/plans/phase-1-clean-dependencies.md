# Phase 1: Clean Dependencies & UIComponents Structure

**Mục tiêu**: Loại bỏ dependencies không được phép, chuẩn hóa cấu trúc UIComponents

**Ưu tiên**: 🔴 **CRITICAL**

**Thời gian ước tính**: 2-3 giờ

---

## ✅ Tasks

### 1.1. Clean Package Dependencies
- [ ] **Xóa dependencies không cho phép từ `package.json`**
  - [ ] Xóa `@mui/material`, `@emotion/react`, `@emotion/styled`
  - [ ] Xóa `framer-motion` 
  - [ ] Xóa `lucide-react`
  - [ ] Xóa `konva`, `react-konva`
  - [ ] Xóa `class-variance-authority`
  - [ ] Xóa `compose`, `docx-preview`, `mammoth`, `pdfjs-dist` (nếu không dùng)
  - [ ] Xóa `ps`, `react-sketch-canvas`
  - [ ] Xóa `webapp` (duplicate package)
  - [ ] Xóa `tailwindcss-animate` (dùng animejs)

- [ ] **Chạy `npm install` để clean**

### 1.2. Kiểm tra UIComponents Structure
- [ ] **Xem xét cấu trúc hiện tại của từng component trong `src/shared/components/UIComponents/`**
  - [ ] Button/
  - [ ] Card/
  - [ ] Checkbox/
  - [ ] Dialog/
  - [ ] Flex/
  - [ ] Font/
  - [ ] Grid/
  - [ ] Icon/
  - [ ] Input/
  - [ ] Label/
  - [ ] Modal/
  - [ ] Notification/
  - [ ] Panel/
  - [ ] PreviewPanel/
  - [ ] ProgressBar/
  - [ ] RefreshButton/
  - [ ] Select/
  - [ ] Sketch/
  - [ ] Stack/
  - [ ] Switch/
  - [ ] Table/
  - [ ] Tabs/
  - [ ] Text/
  - [ ] Textarea/

### 1.3. Chuẩn hóa UIComponents Structure
Mỗi component PHẢI có cấu trúc:
```
ComponentName/
├── CommonComponent.tsx
├── Component.styles.ts
├── Component.types.ts
├── index.ts
└── BiếnThể*.tsx (optional)
```

- [ ] **Button/**
  - [ ] CommonButton.tsx ✅
  - [ ] Button.styles.ts ✅
  - [ ] Button.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Card/**
  - [ ] CommonCard.tsx ✅
  - [ ] Card.styles.ts ✅
  - [ ] Card.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Icon/**
  - [ ] CommonIcon.tsx ✅
  - [ ] Icon.styles.ts ✅
  - [ ] Icon.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Label/**
  - [ ] CommonLabel.tsx ✅
  - [ ] **Nhúng CommonIcon vào trong CommonLabel** 🔴
  - [ ] Label.styles.ts ✅
  - [ ] Label.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Tabs/**
  - [ ] CommonTabs.tsx ✅
  - [ ] Tabs.styles.ts ✅
  - [ ] Tabs.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Input/**
  - [ ] CommonInput.tsx ✅
  - [ ] Input.styles.ts ✅
  - [ ] Input.types.ts ✅
  - [ ] index.ts ✅

- [ ] **Kiểm tra các component còn lại** (Checkbox, Dialog, Flex, Font, Grid, Modal, Notification, Panel, v.v.)

### 1.4. Xóa code không tuân thủ quy tắc
- [ ] **Tìm và xóa tất cả components UI tùy ý ngoài `/UIComponents`**
  - [ ] Search: `import.*from.*@mui`
  - [ ] Search: `import.*from.*lucide-react`
  - [ ] Search: `import.*from.*framer-motion`
  - [ ] Xóa hoặc refactor components vi phạm

- [ ] **Tìm và thay thế Framer Motion animations**
  - [ ] Search: `<motion\.` 
  - [ ] Search: `useAnimation`
  - [ ] Search: `AnimatePresence`
  - [ ] Thay thế bằng animejs

### 1.5. Validation
- [ ] **Kiểm tra không còn dependencies cấm**
  ```bash
  grep -r "@mui/material" src/
  grep -r "framer-motion" src/
  grep -r "lucide-react" src/
  ```

- [ ] **Kiểm tra tất cả UI components đều từ UIComponents**
  ```bash
  grep -r "className=\".*bg-.*rounded.*border" src/
  # Nếu tìm thấy → Vi phạm (phải dùng roughjs)
  ```

- [ ] **Build project thành công**
  ```bash
  npm run build
  ```

---

## 📊 Success Criteria

- ✅ `package.json` chỉ chứa dependencies được phép
- ✅ Tất cả UIComponents có cấu trúc chuẩn
- ✅ CommonIcon đã nhúng vào CommonLabel
- ✅ Không còn imports từ @mui, framer-motion, lucide-react
- ✅ Project build thành công
- ✅ No console errors

---

## 🚀 Next Phase

➡️ **Phase 2**: Fix pages (home, login, signup, dashboard)
