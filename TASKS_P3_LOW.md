# 🔵 P3 - LOW PRIORITY TASKS

**Nice to have** - Không ảnh hưởng trực tiếp  
**Thời gian ước tính:** 4-6 giờ

---

## 1️⃣2️⃣ Landing/Home Page Refactor

**File:** `frontend/webapp/src/features/landing/views/pages/Home/Home.tsx`  
**Nguồn:** refactor-plan-detailed.md (Line 768-802)

### Checklist
- [ ] Thay `motion.div` → `CommonFont` với animejs
- [ ] Gradient background inline style:
```tsx
<CommonFont 
  className="min-h-screen"
  style={{ 
    background: 'linear-gradient(to bottom right, #dbeafe, #ffffff, #faf5ff)',
    fontFamily: 'inherit'
  }}
>
```
- [ ] Refactor child components:
  - [ ] LandingHeader
  - [ ] HeroSection
  - [ ] FeaturesSection
  - [ ] Các sections khác

**Thời gian:** 3-4 giờ

---

## 1️⃣3️⃣ Products/Orders Pages

**Nguồn:** refactor-plan-detailed.md (Line 758-766)

Nếu các pages này có code:
- [ ] Thay Tailwind → UIComponents
- [ ] Dùng animejs thay framer-motion
- [ ] Wrap text trong CommonFont
- [ ] Hand-drawn borders

**Thời gian:** 1-2 giờ (nếu có code)

---

## ✅ Tổng Checklist P3

- [ ] Task 12: Landing/Home page (3-4h)
- [ ] Task 13: Products/Orders (1-2h nếu có)

**Tổng:** 4-6 giờ (~0.5 ngày)

---

## 📝 Ghi chú

P3 tasks có thể làm sau hoặc bỏ qua nếu không cần thiết.  
Ưu tiên P0-P1 trước.
