# 🎨 Hand-Drawn UI Components

Components với phong cách vẽ tay (hand-drawn/sketch) được xây dựng với **Rough.js**, **Framer Motion**, và **Anime.js**.

## 📦 Components

### Button
Button với border hand-drawn và animations.

```tsx
import { Button } from '@shared/components';

<Button variant="primary" animated>
  Click Me
</Button>

<Button variant="secondary" animated>
  Secondary
</Button>

<Button variant="outline">
  Outline
</Button>

<Button variant="primary" isLoading>
  Loading...
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline'` - Kiểu button
- `animated`: `boolean` - Bật/tắt animations (mặc định: `true`)
- `isLoading`: `boolean` - Hiển thị trạng thái loading
- Kế thừa tất cả props từ `HTMLButtonElement`

---

### Input
Input field với border hand-drawn.

```tsx
import { Input } from '@shared/components';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
/>

<Input
  label="Password"
  type="password"
  error="Password is required"
/>

<Input
  label="Username"
  helperText="Choose a unique username"
/>
```

**Props:**
- `label`: `string` - Label cho input
- `error`: `string` - Thông báo lỗi
- `helperText`: `string` - Text hướng dẫn
- Kế thừa tất cả props từ `HTMLInputElement`

---

### Card
Card component với border hand-drawn.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@shared/components';

<Card animated hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Props:**
- `animated`: `boolean` - Bật/tắt entry animations (mặc định: `true`)
- `hover`: `boolean` - Bật/tắt hover effect (mặc định: `true`)
- Kế thừa tất cả props từ `HTMLDivElement`

---

## 🎬 Animations

Components sử dụng:
- **Framer Motion** - React animations (smooth transitions)
- **Anime.js** - Complex animations (draw effects)
- **Rough.js** - Hand-drawn graphics

### Example với custom animations:

```tsx
import { motion } from 'framer-motion';
import { Button } from '@shared/components';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <Button variant="primary">
    Animated Button
  </Button>
</motion.div>
```

---

## 🎨 Styling

Components sử dụng **Tailwind CSS** cho styling. Bạn có thể customize qua `className`:

```tsx
<Button className="w-full mt-4" variant="primary">
  Full Width Button
</Button>

<Input className="max-w-md" label="Email" />
```

---

## 🔧 Customization

### Thay đổi roughness (độ nhám)

Edit file `utils.ts`:

```tsx
export const drawRoughRect = (...) => {
  return rc.rectangle(x, y, width, height, {
    roughness: 2, // Tăng/giảm số này (1-5)
    // ...
  });
};
```

### Thay đổi màu sắc

Edit các component files để thay đổi màu:

```tsx
const fillColors = {
  primary: '#4A90E2',    // Xanh dương
  secondary: '#7B68EE',  // Tím
  outline: 'transparent',
};
```

---

## 📝 Best Practices

1. **Sử dụng hand-drawn components làm mặc định** cho UI chính
2. **Animated props** để bật entry animations (tự động)
3. **Hover effects** cho interactive elements
4. **Error states** cho form validation

---

## 🌐 Demo

Xem demo tại: `http://localhost:3000/demo`

---

## 📚 Stack

- **Rough.js** ^4.6.6 - Hand-drawn graphics
- **Framer Motion** ^10.18.0 - React animations
- **Anime.js** ^3.2.2 - Complex animations
- **Tailwind CSS** - Styling utilities
- **TypeScript** - Type safety
