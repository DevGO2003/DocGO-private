# Kế hoạch Refactor Chi Tiết - UIComponent Standardization

## 📋 Mục lục

1. [Di chuyển FileDetailHeader và FileListHeader](#1-di-chuyển-filedetailheader-và-filelistheader)
2. [Chuẩn hóa cấu trúc UIComponent](#2-chuẩn-hóa-cấu-trúc-uicomponent)
3. [Thay thế Tailwind bằng UIComponent](#3-thay-thế-tailwind-bằng-uicomponent)
4. [Cải thiện HeaderPanel](#4-cải-thiện-headerpanel)
5. [Thống nhất Tab UI](#5-thống-nhất-tab-ui)

---

## 1. Di chuyển FileDetailHeader và FileListHeader

### Mục tiêu
Di chuyển 2 header components từ `shared/layouts/HeaderLayouts/` sang `features/repositories/layouts/` để gần với feature sử dụng.

### Files cần di chuyển

#### FileDetailHeader
```
FROM: frontend/webapp/src/shared/layouts/HeaderLayouts/FileDetailHeader/
TO:   frontend/webapp/src/features/repositories/layouts/FileDetailHeader/

Files:
- FileDetailHeader.tsx
- FileDetailHeader.types.ts
- index.ts
- components/MetadataDisplay.tsx
- components/NormalModeActions.tsx
- components/EditModeActions.tsx
- components/ContextNavigation.tsx
- components/PreviewControls.tsx
```

#### FileListHeader
```
FROM: frontend/webapp/src/shared/layouts/HeaderLayouts/FileListHeader/
TO:   frontend/webapp/src/features/repositories/layouts/FileListHeader/

Files:
- FileListHeader.tsx
- FileListHeader.types.ts
- index.ts
- components/StatsDisplay.tsx
- components/ViewControls.tsx
- components/FilterDisplay.tsx
- components/BulkModeActions.tsx
- components/NormalModeActions.tsx
```

### Files cần cập nhật import

1. **`shared/layouts/HeaderLayouts/index.ts`**
   ```typescript
   // XÓA các dòng:
   export { FileDetailHeader } from './FileDetailHeader';
   export type { FileDetailHeaderProps, FileData } from './FileDetailHeader';
   
   export { FileListHeader } from './FileListHeader';
   export type { FileListHeaderProps, FilterState, ViewMode } from './FileListHeader';
   ```

2. **Tạo `features/repositories/layouts/index.ts`** (nếu chưa có)
   ```typescript
   export { FileDetailHeader } from './FileDetailHeader';
   export type { FileDetailHeaderProps, FileData } from './FileDetailHeader';
   
   export { FileListHeader } from './FileListHeader';
   export type { FileListHeaderProps, FilterState, ViewMode } from './FileListHeader';
   ```

3. **Tìm và cập nhật tất cả imports:**
   ```typescript
   // Tìm pattern:
   from '@shared/layouts/HeaderLayouts'
   from './FileDetailHeader'
   from './FileListHeader'
   
   // Thay bằng:
   from '@features/repositories/layouts'
   ```

---

## 2. Chuẩn hóa cấu trúc UIComponent

### Cấu trúc chuẩn
Mỗi component phải có:
```
UIComponents/
  ComponentName/
    ├── ComponentName.tsx          (hoặc CommonComponentName.tsx)
    ├── ComponentName.styles.ts   (hoặc Component.styles.ts)
    ├── ComponentName.types.ts     (hoặc Component.types.ts)
    ├── VariantComponent.tsx       (các biến thể)
    └── index.ts                   (export)
```

### 2.1. Checkbox Component

#### Tạo `UIComponents/Checkbox/Checkbox.styles.ts`
```typescript
export const checkboxStyles = {
  base: 'relative cursor-pointer',
  container: 'inline-block',
  checked: {
    stroke: '#4f46e5',
    fill: '#4f46e5',
  },
  unchecked: {
    stroke: '#94a3b8',
    fill: '#ffffff',
  },
  error: {
    stroke: '#ef4444',
    fill: '#ffffff',
  },
};
```

#### Tạo `UIComponents/Checkbox/Checkbox.types.ts`
```typescript
import { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  error?: boolean;
}
```

#### Đổi tên và refactor `UIComponents/Checkbox/Checkbox.tsx` → `CommonCheckbox.tsx`
```typescript
import React, { forwardRef, useRef, useEffect } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CheckboxProps } from './Checkbox.types';
import { checkboxStyles } from './Checkbox.styles';

export const CommonCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, indeterminate = false, error, className, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const drawCanvas = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      
      const style = error 
        ? checkboxStyles.error 
        : checked 
        ? checkboxStyles.checked 
        : checkboxStyles.unchecked;
      
      drawRoughRect(rc, 2, 2, width - 4, height - 4, {
        stroke: style.stroke,
        strokeWidth: 2,
        roughness: 1.5,
        fill: style.fill,
        fillStyle: checked ? 'solid' : 'hachure',
      });

      // Draw checkmark if checked
      if (checked) {
        const centerX = width / 2;
        const centerY = height / 2;
        rc.path(
          `M ${centerX - 4} ${centerY} L ${centerX - 1} ${centerY + 3} L ${centerX + 4} ${centerY - 2}`,
          {
            stroke: '#ffffff',
            strokeWidth: 2.5,
            roughness: 0.8,
          }
        );
      }
    };

    useEffect(() => {
      drawCanvas();
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }, [checked, error, className]);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    useEffect(() => {
      if (containerRef.current) {
        anime({
          targets: containerRef.current,
          scale: checked ? [1, 1.1, 1] : 1,
          duration: 200,
          easing: 'easeOutQuad',
        });
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <CommonFont ref={containerRef as any} className={`relative inline-block ${checkboxStyles.container}`}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as any).current = node;
            }
          }}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className={`relative z-10 w-4 h-4 cursor-pointer opacity-0 ${className || ''}`}
          {...props}
        />
      </CommonFont>
    );
  }
);

CommonCheckbox.displayName = 'CommonCheckbox';
```

#### Cập nhật `UIComponents/Checkbox/index.ts`
```typescript
export { CommonCheckbox as Checkbox } from './CommonCheckbox';
export type { CheckboxProps } from './Checkbox.types';
```

---

### 2.2. CommonLabel - Nhúng CommonIcon

#### Tạo `UIComponents/Label/Label.styles.ts`
```typescript
export const labelStyles = {
  base: 'relative inline-block',
  label: 'block text-sm font-medium',
  error: 'text-red-600',
  normal: 'text-gray-700',
  required: 'text-red-500 ml-1',
};
```

#### Tạo `UIComponents/Label/Label.types.ts`
```typescript
import { LabelHTMLAttributes } from 'react';
import { CommonIconProps } from '../Icon/CommonIcon';

export interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  icon?: CommonIconProps['name'];
}
```

#### Cập nhật `UIComponents/Label/CommonLabel.tsx`
```typescript
import { forwardRef, LabelHTMLAttributes, useRef, useEffect } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonIcon } from '../Icon/CommonIcon';
import { CommonLabelProps } from './Label.types';
import { labelStyles } from './Label.styles';

export const CommonLabel = forwardRef<HTMLLabelElement, CommonLabelProps>(
  ({ className, required, error, icon, children, ...props }, ref) => {
    const labelRef = useRef<HTMLLabelElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const element = labelRef.current || ref;
      if (element && 'current' in element) {
        anime.set(element.current, {
          opacity: 0,
          translateY: -5,
        });
        anime({
          targets: element.current,
          opacity: 1,
          translateY: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    }, [children]);

    const drawCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 2, 2, width - 4, height - 4, {
        stroke: error ? '#ef4444' : '#94a3b8',
        strokeWidth: 2,
        roughness: 1.5,
      });
    };

    useEffect(() => {
      drawCanvas();
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }, [error, className, children]);

    return (
      <CommonFont ref={containerRef as any} className={labelStyles.base}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <label
          ref={labelRef || ref}
          className={`${labelStyles.label} ${error ? labelStyles.error : labelStyles.normal} flex items-center gap-2 ${className || ''}`}
          {...props}
        >
          {icon && <CommonIcon name={icon} size={16} />}
          {children}
          {required && <span className={labelStyles.required}>*</span>}
        </label>
      </CommonFont>
    );
  }
);

CommonLabel.displayName = 'CommonLabel';
```

---

### 2.3. Các Components còn lại - Tạo files thiếu

#### Pattern chung cho tất cả components:

**Input/Input.styles.ts:**
```typescript
export const inputStyles = {
  base: 'relative',
  container: 'w-full',
  input: 'w-full px-4 py-3 bg-transparent focus:outline-none',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  error: 'text-red-500',
  helperText: 'text-sm text-gray-500',
};
```

**Input/Input.types.ts:**
```typescript
import { InputHTMLAttributes } from 'react';

export interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

**Select/Select.styles.ts:**
```typescript
export const selectStyles = {
  base: 'relative',
  container: 'w-full',
  select: 'w-full px-4 py-3 pr-10 bg-transparent focus:outline-none appearance-none cursor-pointer',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  error: 'text-red-500',
  helperText: 'text-sm text-gray-500',
};
```

**Select/Select.types.ts:**
```typescript
import { SelectHTMLAttributes } from 'react';

export interface CommonSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}
```

**Text/Text.styles.ts:**
```typescript
export const textStyles = {
  base: 'relative inline-block',
  p: 'text-base',
  span: 'text-sm',
  small: 'text-xs',
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-semibold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
};
```

**Text/Text.types.ts:**
```typescript
import { HTMLAttributes } from 'react';

export interface CommonTextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  handDrawn?: boolean;
}
```

**Textarea/Textarea.styles.ts:**
```typescript
export const textareaStyles = {
  base: 'relative',
  container: 'w-full',
  textarea: 'w-full px-4 py-3 bg-transparent focus:outline-none resize-none',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  error: 'text-red-500',
  helperText: 'text-sm text-gray-500',
};
```

**Textarea/Textarea.types.ts:**
```typescript
import { TextareaHTMLAttributes } from 'react';

export interface CommonTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

**Switch/Switch.styles.ts:**
```typescript
export const switchStyles = {
  base: 'relative inline-flex items-center',
  track: {
    unchecked: '#cbd5e1',
    checked: '#4f46e5',
  },
  thumb: {
    size: 20,
  },
};
```

**Switch/Switch.types.ts:**
```typescript
import { HTMLAttributes } from 'react';

export interface CommonSwitchProps extends HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}
```

**Dialog/Dialog.styles.ts:**
```typescript
export const dialogStyles = {
  overlay: 'fixed inset-0 bg-black/50 z-50',
  content: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  header: 'p-6 border-b',
  body: 'p-6',
  footer: 'p-6 border-t flex justify-end gap-2',
};
```

**Dialog/Dialog.types.ts:**
```typescript
import { HTMLAttributes, ReactNode } from 'react';

export interface CommonDialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Modal/Modal.styles.ts:**
```typescript
export const modalStyles = {
  overlay: 'fixed inset-0 bg-black/50 z-50',
  content: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl',
  header: 'p-6 border-b',
  body: 'p-6',
  footer: 'p-6 border-t flex justify-end gap-2',
  sizes: {
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
  },
};
```

**Modal/Modal.types.ts:**
```typescript
import { HTMLAttributes, ReactNode } from 'react';

export interface CommonModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Icon/Icon.styles.ts:**
```typescript
export const iconStyles = {
  base: 'inline-block',
  sizes: {
    sm: 16,
    md: 22,
    lg: 32,
    xl: 48,
  },
};
```

**Icon/Icon.types.ts:**
```typescript
export interface CommonIconProps {
  name: 'file' | 'folder' | 'info' | 'warning' | 'user' | 'success' | 'star' | 'smile' | 'chevron-right' | 'home' | 'arrow-left';
  size?: number;
  color?: string;
  className?: string;
  fontFamily?: string;
}
```

**Font/Font.styles.ts:**
```typescript
export const fontStyles = {
  defaultFamily: '"Patrick Hand", "Caveat", "Shadows Into Light", "Comic Sans MS", cursive',
  defaultHref: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
};
```

**Font/Font.types.ts:**
```typescript
import { HTMLAttributes } from 'react';

export interface CommonFontProps extends HTMLAttributes<HTMLDivElement> {
  fontHref?: string;
  fontFamily?: string;
}
```

---

## 3. Thay thế Tailwind bằng UIComponent

### 3.1. Auth Pages

#### Login.tsx

**Thay đổi:**
```typescript
// TRƯỚC:
import { motion } from 'framer-motion';

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-md"
  >
    <Card>...</Card>
  </motion.div>
</div>

// SAU:
import { Card, CardHeader, CardTitle, CardContent, Button, Input, CommonFont, Stack } from '@shared/components';
import anime from 'animejs';
import { useRef, useEffect } from 'react';

export const Login = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <CommonFont 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ 
        background: 'linear-gradient(to bottom right, #dbeafe, #f3e8ff)',
        fontFamily: 'inherit'
      }}
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form content với UIComponents */}
            <Stack gap={4}>
              <Input ... />
              <Input ... />
              <Button ... />
            </Stack>
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};
```

#### Register.tsx - Tương tự Login.tsx

#### ForgotPassword.tsx - Tương tự Login.tsx

---

### 3.2. Error Pages

#### NotFound.tsx

**Thay đổi:**
```typescript
// TRƯỚC:
import { motion } from 'framer-motion';
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
  <motion.div>...</motion.div>
</div>

// SAU:
import { Card, CardContent, Button, CommonFont, CommonText, CommonIcon, Stack } from '@shared/components';
import anime from 'animejs';
import { useRef, useEffect } from 'react';

export const NotFound = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
    if (iconRef.current) {
      anime({
        targets: iconRef.current,
        scale: [0, 1],
        delay: 200,
        duration: 400,
        easing: 'easeOutBack',
      });
    }
  }, []);

  return (
    <CommonFont 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
        fontFamily: 'inherit'
      }}
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div ref={iconRef} className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <CommonIcon name="info" size={48} color="#3b82f6" />
          </div>

          <CommonText as="h1" className="text-6xl font-bold text-gray-900 mb-3">
            404
          </CommonText>

          <CommonText as="h2" className="text-2xl font-semibold text-gray-900 mb-3">
            {t('notFound.title')}
          </CommonText>

          <CommonText as="p" className="text-gray-600 mb-8">
            Trang không tìm thấy hoặc đối tượng không tồn tại hoặc đã xóa.
          </CommonText>

          <Stack gap={2} className="justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <CommonIcon name="arrow-left" size={16} />
              {t('notFound.goBack')}
            </Button>
            <Button variant="outline" onClick={() => navigate(HOME_PATH)}>
              <CommonIcon name="home" size={16} />
              {t('notFound.goHome')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </CommonFont>
  );
};
```

#### Unauthorized.tsx - Tương tự NotFound.tsx

---

### 3.3. Products/Orders Pages

Các files này có thể rỗng, nếu có code thì áp dụng pattern tương tự:
- Thay Tailwind bằng UIComponents
- Dùng animejs thay framer-motion
- Wrap text trong CommonFont
- Dùng hand drawing borders

---

### 3.4. Landing/Home Page

#### Home.tsx và các components liên quan

**Thay đổi tất cả sections:**
```typescript
// TRƯỚC:
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <LandingHeader />
  <HeroSection />
  ...
</div>

// SAU:
import { CommonFont } from '@shared/components';

<CommonFont 
  className="min-h-screen"
  style={{ 
    background: 'linear-gradient(to bottom right, #dbeafe, #ffffff, #faf5ff)',
    fontFamily: 'inherit'
  }}
>
  <LandingHeader />
  <HeroSection />
  ...
</CommonFont>
```

Tất cả components con (LandingHeader, HeroSection, etc.) cũng phải:
- Thay Tailwind bằng UIComponents
- Dùng animejs
- Wrap text trong CommonFont/CommonText

---

## 4. Cải thiện HeaderPanel

### File: `UIComponents/Panel/HeaderPanel.tsx`

**Thay đổi hoàn toàn:**

```typescript
import React, { useEffect, useRef } from 'react';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonText } from '../Text/CommonText';
import { CommonIcon } from '../Icon/CommonIcon';
import anime from 'animejs';

interface HeaderPanelProps {
  title: string;
  subtitle: string; // ✅ REQUIRED - không optional
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  children?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  maxHeightDesktop?: number;
  maxHeightTablet?: number;
  maxHeightMobile?: number;
}

function HeaderPanel({
  title,
  subtitle, // ✅ Required
  breadcrumbs,
  children,
  right,
  className = '',
  maxHeightDesktop = 300,
  maxHeightTablet = 240,
  maxHeightMobile = 200,
}: HeaderPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const el = containerRef.current;
    const canvas = canvasRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 || height === 0) return;
    canvas.width = width;
    canvas.height = height;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 8, 8, width - 16, height - 16, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.5,
    });
  };

  useEffect(() => {
    drawCanvas();
    const t = setTimeout(drawCanvas, 100);
    
    // Animate container entry
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
    
    return () => clearTimeout(t);
  }, [title, subtitle, className]);

  return (
    <CommonFont
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        maxHeight: '300px',
        background: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative z-10 px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            {/* Breadcrumbs với CommonIcon */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <CommonIcon name="chevron-right" size={16} className="mx-1 text-gray-400" />
                      )}
                      <CommonText 
                        as="span" 
                        className={breadcrumb.current ? 'text-gray-500 font-medium' : 'text-indigo-600 hover:text-indigo-700 font-medium'}
                      >
                        {breadcrumb.href ? (
                          <a href={breadcrumb.href}>{breadcrumb.label}</a>
                        ) : (
                          breadcrumb.label
                        )}
                      </CommonText>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title với CommonText */}
            <CommonText as="h1" className="text-2xl md:text-3xl font-extrabold mb-1">
              {title}
            </CommonText>
            
            {/* Subtitle - REQUIRED */}
            <CommonText as="p" className="text-gray-600 text-sm mb-2">
              {subtitle}
            </CommonText>

            {children && <div className="mt-2">{children}</div>}
          </div>

          {right && <div className="flex gap-2">{right}</div>}
        </div>
      </div>

      <style>{`
        @media (min-width: 1280px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightDesktop}px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1279px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightTablet}px !important;
          }
        }
        @media (max-width: 767px) {
          div[class*='rounded-2xl'] {
            max-height: ${maxHeightMobile}px !important;
          }
        }
      `}</style>
    </CommonFont>
  );
}

export default HeaderPanel;
```

### Files sử dụng HeaderPanel cần cập nhật

Tất cả files đang dùng HeaderPanel phải:
1. ✅ Đảm bảo pass `subtitle` prop (không optional)
2. ✅ Thống nhất format subtitle giữa các trang

---

## 5. Thống nhất Tab UI

### Pattern chuẩn (từ FileDetail page)

**File tham khảo:**
- `features/repositories/views/components/FileDetail/MainTabsNav.tsx`
- `features/repositories/views/components/FileDetail/SubTabsNav.tsx`

**Pattern:**
```typescript
import { Tabs, TabList, CommonTab } from '@shared/components';

<Tabs>
  <TabList>
    <CommonTab
      value={tabId}
      activeValue={activeTab}
      onSelect={(v) => setActiveTab(v)}
      disabled={disabled}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </CommonTab>
  </TabList>
</Tabs>
```

### 5.1. RepositoryTabs.tsx

**Thay đổi:**
```typescript
// TRƯỚC:
<div className="border-b border-gray-200">
  <nav className="-mb-px flex space-x-8">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`...`}
      >
        ...
      </button>
    ))}
  </nav>
</div>

// SAU:
import { Tabs, TabList, CommonTab } from '@shared/components';

<Tabs>
  <TabList>
    {tabs.map((tab) => (
      <CommonTab
        key={tab.id}
        value={tab.id}
        activeValue={activeTab}
        onSelect={() => onTabChange(tab.id)}
        className="flex items-center gap-2"
      >
        <span>{tab.label}</span>
        {tab.count > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {tab.count}
          </span>
        )}
        <p className="mt-1 text-xs text-gray-500">{tab.description}</p>
      </CommonTab>
    ))}
  </TabList>
</Tabs>
```

### 5.2. OrganizationWorkspace.tsx (Line 234-252)

**Thay đổi:**
```typescript
// TRƯỚC:
<div className="flex gap-2 border-b border-gray-200 -mb-px">
  {tabs.map((tab) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
          activeTab === tab.id
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-4 h-4" />
        {tab.label}
      </button>
    );
  })}
</div>

// SAU:
import { Tabs, TabList, CommonTab } from '@shared/components';

<Tabs>
  <TabList>
    {tabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <CommonTab
          key={tab.id}
          value={tab.id}
          activeValue={activeTab}
          onSelect={() => setActiveTab(tab.id)}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {tab.label}
        </CommonTab>
      );
    })}
  </TabList>
</Tabs>
```

### 5.3. OrganizationDetail.tsx (Line 236-249)

**Thay đổi tương tự OrganizationWorkspace.tsx**

### 5.4. RepositoryDetail.tsx (Line 256-295)

**Thay đổi:**
```typescript
// TRƯỚC:
<div className="flex gap-4 border-b border-gray-200 mb-6">
  <button
    onClick={() => setActiveTab('files')}
    className={`pb-3 px-4 border-b-2 transition-colors ${
      activeTab === 'files'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      {t('repositories.detail.tabs.files')}
    </div>
  </button>
  ...
</div>

// SAU:
import { Tabs, TabList, CommonTab } from '@shared/components';

<Tabs>
  <TabList>
    <CommonTab
      value="files"
      activeValue={activeTab}
      onSelect={() => setActiveTab('files')}
    >
      <FileText className="w-4 h-4" />
      {t('repositories.detail.tabs.files')}
    </CommonTab>
    <CommonTab
      value="members"
      activeValue={activeTab}
      onSelect={() => setActiveTab('members')}
    >
      <Users className="w-4 h-4" />
      {t('repositories.detail.tabs.members')}
    </CommonTab>
    {/* ... other tabs */}
  </TabList>
</Tabs>
```

### 5.5. Settings.tsx (Line 166-178)

**Thay đổi:**
```typescript
// TRƯỚC:
<nav className="space-y-1">
  {tabs.map((tab) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
          activeTab === tab.id
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5" />
        {tab.label}
      </button>
    );
  })}
</nav>

// SAU:
import { Tabs, TabList, CommonTab } from '@shared/components';

<Tabs>
  <TabList className="flex flex-col space-y-1">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <CommonTab
          key={tab.id}
          value={tab.id}
          activeValue={activeTab}
          onSelect={() => setActiveTab(tab.id)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
        >
          <Icon className="w-5 h-5" />
          {tab.label}
        </CommonTab>
      );
    })}
  </TabList>
</Tabs>
```

---

## 📝 Checklist Implementation

### Phase 1: Di chuyển files
- [ ] Di chuyển FileDetailHeader sang repositories/layouts
- [ ] Di chuyển FileListHeader sang repositories/layouts
- [ ] Cập nhật imports trong shared/layouts/HeaderLayouts/index.ts
- [ ] Tạo/cập nhật repositories/layouts/index.ts
- [ ] Tìm và cập nhật tất cả imports trong codebase

### Phase 2: Chuẩn hóa UIComponent
- [ ] Tạo Checkbox.styles.ts và Checkbox.types.ts
- [ ] Rename và refactor Checkbox.tsx → CommonCheckbox.tsx
- [ ] Cập nhật CommonLabel để nhúng CommonIcon
- [ ] Tạo Label.styles.ts và Label.types.ts
- [ ] Tạo styles.ts và types.ts cho: Input, Select, Text, Textarea, Switch, Dialog, Modal, Icon, Font
- [ ] Cập nhật tất cả components để sử dụng styles và types mới

### Phase 3: Thay thế Tailwind
- [ ] Refactor Login.tsx
- [ ] Refactor Register.tsx
- [ ] Refactor ForgotPassword.tsx
- [ ] Refactor NotFound.tsx
- [ ] Refactor Unauthorized.tsx
- [ ] Refactor Products pages (nếu có code)
- [ ] Refactor Orders pages (nếu có code)
- [ ] Refactor Home.tsx và tất cả landing components

### Phase 4: Cải thiện HeaderPanel
- [ ] Subtitle thành required
- [ ] Thay Tailwind bằng UIComponent
- [ ] Dùng animejs thay framer-motion
- [ ] Thêm hand drawing border
- [ ] Cập nhật tất cả files sử dụng HeaderPanel

### Phase 5: Thống nhất Tabs
- [ ] Refactor RepositoryTabs.tsx
- [ ] Refactor OrganizationWorkspace.tsx tabs
- [ ] Refactor OrganizationDetail.tsx tabs
- [ ] Refactor RepositoryDetail.tsx tabs
- [ ] Refactor Settings.tsx tabs

---

## ⚠️ Lưu ý quan trọng

1. **Hand Drawing UI:**
   - Tất cả borders phải dùng `createRoughCanvas` và `drawRoughRect`
   - Không dùng Tailwind `border-*` classes

2. **Animations:**
   - Thay `framer-motion` bằng `animejs`
   - Tất cả animations phải dùng animejs

3. **Text:**
   - Tất cả text phải wrap trong `CommonFont` hoặc `CommonText`
   - Không dùng Tailwind `text-*` classes trực tiếp

4. **Testing:**
   - Sau mỗi thay đổi, test để đảm bảo UI không bị vỡ
   - Kiểm tra responsive trên mobile/tablet/desktop
   - Kiểm tra animations hoạt động đúng

5. **Consistency:**
   - Tất cả components phải follow cùng pattern
   - Card có text → wrap trong CommonFont
   - Label có icon → dùng CommonIcon
   - Tabs → luôn dùng Tabs/TabList/CommonTab

---

## 📊 Tổng kết

- **Files di chuyển:** ~15 files
- **Files tạo mới:** ~20 files (UIComponent structure)
- **Files refactor:** ~45 files
- **Tổng cộng:** ~80 files bị ảnh hưởng


