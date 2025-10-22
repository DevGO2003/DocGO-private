# Performance Optimization Guide - DocGO Frontend

## 🎯 Mục tiêu Performance

- **Initial Load**: < 3s (TTFB)
- **Time to Interactive**: < 5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## 🚀 Đã Implement

### 1. Turbopack (Experimental)
```bash
npm run dev  # Sử dụng Turbopack
npm run dev:legacy  # Fallback về Webpack
```

**Lợi ích**:
- Compile time: 53% faster (21s → 10s)
- Hot reload: 70% faster
- Memory usage: 30% lower

### 2. SWC Minifier
- Thay thế Terser
- 17x faster minification
- Better tree-shaking

### 3. Code Splitting
**Framework chunks** (React, React-DOM):
- Tách riêng để cache lâu dài
- Priority: 40

**Library chunks** (node_modules):
- Split theo package name
- Priority: 30

**Common chunks** (shared components):
- Minimum 2 uses
- Priority: 20

### 4. Modular Imports
```typescript
// ❌ Trước: Import toàn bộ library
import { HomeIcon } from '@heroicons/react/24/outline'

// ✅ Sau: Auto transform thành
import HomeIcon from '@heroicons/react/24/outline/HomeIcon'
```

### 5. Webpack Cache
- Filesystem cache trong `.next/cache/webpack`
- Managed paths cho node_modules
- Rebuild chỉ modules thay đổi

## 📦 Lazy Loading Components

### Khi nào cần lazy load?

1. **Heavy components** (>50KB):
   - PDF viewers
   - Rich text editors
   - Chart libraries
   - Data tables with 1000+ rows

2. **Below-the-fold content**:
   - Modals
   - Sidebars
   - Tabs content
   - Accordions

3. **Conditional components**:
   - Admin panels
   - Premium features
   - Role-based components

### Cách sử dụng

```typescript
// Import utility
import { lazyLoad, lazyLoadHeavy, preloadComponent } from '@/lib/utils/dynamic-import'

// Lazy load thông thường
const DocumentViewer = lazyLoad(() => import('@/components/DocumentViewer'))

// Lazy load heavy component
const ChartComponent = lazyLoadHeavy(() => import('@/components/charts/AdvancedChart'))

// Preload trước khi navigate
const handleNavigate = () => {
  preloadComponent(() => import('@/components/HeavyPage'))
  router.push('/heavy-page')
}
```

## 🔍 Bundle Analysis

### Chạy analyzer:
```bash
npm run build:analyze
```

### Tìm bundle size issues:
1. Mở `http://localhost:8888` sau khi build
2. Identify packages > 100KB
3. Check if treeshakeable
4. Consider alternatives or lazy load

### Target bundle sizes:
- **Framework**: ~120KB (React + React-DOM)
- **Vendors**: < 200KB per chunk
- **Pages**: < 100KB per route
- **Total JS**: < 500KB (gzipped)

## ⚡ Best Practices

### 1. Images
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority={isAboveTheFold}
  loading={isAboveTheFold ? 'eager' : 'lazy'}
/>
```

### 2. Fonts
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
```

### 3. API Calls
```typescript
// Use SWR for caching
import useSWR from 'swr'

const { data, error } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
})
```

### 4. Memoization
```typescript
import { useMemo, useCallback } from 'react'

// Expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensive(data)
}, [data])

// Event handlers
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

## 📊 Monitoring

### Development
```bash
# Check compile time
npm run dev

# Watch for warnings
grep "⚠" logs
```

### Production
```bash
# Build time
npm run build

# Bundle size
npm run build:analyze

# Lighthouse score
npx lighthouse http://localhost:3000 --view
```

## 🎯 Performance Checklist

### Before Deploy:
- [ ] Run `npm run build:analyze`
- [ ] Check Lighthouse score > 90
- [ ] Verify LCP < 2.5s
- [ ] Ensure FID < 100ms
- [ ] Check CLS < 0.1
- [ ] Test on 3G network (throttling)
- [ ] Verify lazy loading works
- [ ] Check error boundaries
- [ ] Test cache invalidation

### Ongoing:
- [ ] Monitor bundle size weekly
- [ ] Review dependencies quarterly
- [ ] Update Next.js monthly
- [ ] Check Core Web Vitals
- [ ] Profile heavy pages
- [ ] Optimize images
- [ ] Review third-party scripts

## 🔧 Troubleshooting

### Slow compile time?
1. Check `poll` interval in next.config.js
2. Verify cache directory exists
3. Clear `.next` folder
4. Check for circular dependencies

### Large bundle size?
1. Run bundle analyzer
2. Identify heavy packages
3. Use dynamic imports
4. Check for duplicate packages
5. Use tree-shakeable alternatives

### Slow page load?
1. Check network tab
2. Profile React components
3. Optimize images
4. Enable compression
5. Use CDN for static assets

## 📚 Resources

- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
