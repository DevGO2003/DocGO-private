# 🟢 P2 - MEDIUM PRIORITY TASKS

**Cải thiện Code Quality** - Không cấp bách  
**Thời gian ước tính:** 6-8 giờ

---

## 9️⃣ UIComponents Standardization

**Mục tiêu:** Tạo `.styles.ts` và `.types.ts` cho UIComponents

### Checklist (3-4 giờ)

- [ ] **Checkbox** - Tạo `.styles.ts` + `.types.ts`, rename → `CommonCheckbox.tsx` (30 phút)
- [ ] **Label** - Tạo files + thêm prop `icon`, `noBorder` (30 phút)
- [ ] **Input** - Tạo `.styles.ts` + `.types.ts` (20 phút)
- [ ] **Select** - Tạo `.styles.ts` + `.types.ts` (20 phút)
- [ ] **Textarea** - Tạo `.types.ts` (15 phút)
- [ ] **Switch** - Tạo `.styles.ts` + `.types.ts` (15 phút)
- [ ] **Dialog** - Tạo `.styles.ts` + `.types.ts` (15 phút)
- [ ] **Modal** - Tạo `.styles.ts` + `.types.ts` (15 phút)
- [ ] **Icon** - Tạo `.styles.ts` + `.types.ts` (15 phút)
- [ ] **Font** - Tạo `.styles.ts` + `.types.ts` (15 phút)

**Pattern mẫu:**
```typescript
// Component.styles.ts
export const componentStyles = {
  base: 'relative',
  // ... other styles
};

// Component.types.ts
export interface ComponentProps extends HTMLAttributes<...> {
  // ... props
}
```

---

## 🔟 Auth & Error Pages Refactor

**Mục tiêu:** Thay framer-motion → animejs, wrap trong CommonFont

### Auth Pages (2 giờ)
- [ ] Login.tsx - Thay motion → animejs (45 phút)
- [ ] Register.tsx - Tương tự (30 phút)
- [ ] ForgotPassword.tsx - Tương tự (30 phút)

### Error Pages (1 giờ)
- [ ] NotFound.tsx - Thay motion → animejs (45 phút)
- [ ] Unauthorized.tsx - Tương tự (30 phút)

**Animation pattern:**
```tsx
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  anime({
    targets: ref.current,
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 500,
    easing: 'easeOutQuad',
  });
}, []);
```

---

## 1️⃣1️⃣ Settings Preview Check

**File:** `frontend/webapp/src/features/settings/views/pages/Settings.tsx`

- [ ] Kiểm tra có file preview component không (15 phút)
- [ ] Nếu có plaintext preview → thay bằng `PreviewPanel` (30 phút)

**Thời gian:** 30-45 phút

---

## ✅ Tổng Checklist P2

- [ ] Task 9: UIComponents files (3-4h)
- [ ] Task 10: Auth/Error pages (3h)
- [ ] Task 11: Settings check (30-45 phút)

**Tổng:** 6-8 giờ (~1 ngày)
