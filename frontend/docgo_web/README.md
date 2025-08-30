# DocGO Web Frontend

Nền tảng quản lý tài liệu và hợp đồng thông minh, được xây dựng với Next.js 14 và TypeScript.

## 🚀 Tính năng chính

- **Quản lý hợp đồng**: Tạo, chỉnh sửa và theo dõi vòng đời hợp đồng
- **Xử lý AI**: Trích xuất và tóm tắt tài liệu tự động
- **Quản lý người dùng**: Hệ thống phân quyền và quản lý tài khoản
- **Lưu trữ tài liệu**: Hệ thống lưu trữ đám mây an toàn
- **Báo cáo & Phân tích**: Theo dõi hiệu suất và tạo báo cáo chi tiết
- **Giao diện responsive**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Data Fetching**: SWR

## 📁 Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout với AuthProvider
│   ├── page.tsx           # Trang chủ
│   ├── contracts/         # Trang quản lý hợp đồng
│   ├── ai-processing/     # Trang xử lý AI
│   └── globals.css        # CSS toàn cục
├── components/            # React components
│   ├── ui/               # UI components cơ bản
│   │   ├── Button.tsx    # Component Button
│   │   ├── Input.tsx     # Component Input
│   │   ├── Card.tsx      # Component Card
│   │   └── index.ts      # Export tất cả UI components
│   ├── layout/           # Layout components
│   │   ├── Header.tsx    # Header component
│   │   ├── Footer.tsx    # Footer component
│   │   ├── MainLayout.tsx # Layout chính
│   │   └── index.ts      # Export layout components
│   └── Sidebar.tsx       # Sidebar navigation
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── lib/                   # Thư viện và utilities
│   ├── api.ts            # API client và services
│   └── constants.ts      # Constants và configuration
├── types/                 # TypeScript type definitions
│   └── index.ts          # Common types và interfaces
└── utils/                 # Utility functions
    ├── cn.ts             # Class name utility
    └── helpers.ts        # Helper functions
```

## 🎨 UI Components

### Button Component
```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="lg" loading={isLoading}>
  Click me
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes**: `default`, `sm`, `lg`, `icon`

### Input Component
```tsx
import { Input } from '@/components/ui/Input'

<Input
  label="Email"
  type="email"
  error="Email không hợp lệ"
  leftIcon={<MailIcon />}
/>
```

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Tiêu đề</CardTitle>
  </CardHeader>
  <CardContent>
    Nội dung card
  </CardContent>
</Card>
```

## 🏗️ Layout System

### MainLayout
Layout chính với sidebar, header và footer tùy chỉnh được.

### Layout Variants
- **DashboardLayout**: Layout cho dashboard (có sidebar, header, không có footer)
- **AuthLayout**: Layout cho trang đăng nhập/đăng ký (không có sidebar, header)
- **PublicLayout**: Layout cho trang công khai (có header, footer, không có sidebar)

```tsx
import { DashboardLayout } from '@/components/layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Dashboard Content</h1>
    </DashboardLayout>
  )
}
```

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` từ `.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_ENABLED=true

# Service URLs
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8017
NEXT_PUBLIC_FILE_STORAGE_URL=http://localhost:8012
NEXT_PUBLIC_CONTRACT_SERVICE_URL=http://localhost:8003
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8002
```

### Tailwind CSS
Cấu hình Tailwind với custom colors, animations và utilities:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* custom primary colors */ }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out'
      }
    }
  }
}
```

## 🚀 Chạy dự án

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Dự án sẽ chạy tại `http://localhost:3000`

### Build production
```bash
npm run build
npm start
```

### Kiểm tra TypeScript
```bash
npm run type-check
```

### Lint code
```bash
npm run lint
```

## 📱 Responsive Design

Dự án sử dụng mobile-first approach với các breakpoints:

- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

## 🎯 Best Practices

### Code Organization
- Sử dụng TypeScript strict mode
- Tách biệt logic business và UI components
- Sử dụng custom hooks cho state management
- Tổ chức components theo atomic design

### Performance
- Lazy loading cho components
- Image optimization với Next.js Image
- Code splitting tự động
- Bundle analysis và optimization

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## 🔒 Bảo mật

- JWT authentication
- Role-based access control
- Input validation
- XSS protection
- CSRF protection

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t docgo-web .
docker run -p 3000:3000 docgo-web
```

### Manual Deployment
```bash
npm run build
# Copy .next folder to server
npm start
```

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Hỗ trợ

- **Email**: support@docgo.com
- **Documentation**: [docs.docgo.com](https://docs.docgo.com)
- **Issues**: [GitHub Issues](https://github.com/DevGO2003/DocGO/issues)

## 🙏 Acknowledgments

- Next.js team cho framework tuyệt vời
- Tailwind CSS team cho utility-first CSS
- Heroicons team cho icon library
- Cộng đồng open source

---

**Phát triển bởi DevGO2003** 🚀
