# DocGO Web Frontend

Ứng dụng web frontend cho hệ thống quản lý tài liệu và hợp đồng thông minh DocGO, được xây dựng bằng Next.js.

## 🚀 Tính năng

- **Quản lý hợp đồng**: Tạo, chỉnh sửa, xem và quản lý hợp đồng
- **Xử lý AI**: Trích xuất văn bản và tóm tắt tài liệu với AI
- **Quản lý người dùng**: Hệ thống xác thực và phân quyền
- **Giao diện hiện đại**: Thiết kế responsive với Tailwind CSS
- **TypeScript**: Được viết hoàn toàn bằng TypeScript
- **State Management**: Sử dụng Zustand và React hooks

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường cần thiết:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Chạy ứng dụng

#### Development mode

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:8000

#### Production build

```bash
npm run build
npm start
```

### 4. Kiểm tra code

```bash
npm run lint
npm run type-check
```

## 📁 Cấu trúc thư mục

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── contracts/         # Trang quản lý hợp đồng
│   ├── ai-processing/     # Trang xử lý AI
│   ├── globals.css        # CSS toàn cục
│   ├── layout.tsx         # Layout chính
│   └── page.tsx           # Trang chủ
├── components/             # React components
│   └── Sidebar.tsx        # Component sidebar navigation
├── hooks/                  # Custom React hooks
│   └── useAuth.ts         # Hook xác thực
├── lib/                    # Utilities và services
│   └── api.ts             # API client
├── types/                  # TypeScript type definitions
│   └── index.ts           # Types chính
└── utils/                  # Helper functions
```

## 🔧 Cấu hình

### Tailwind CSS

Tailwind CSS được cấu hình với các component classes tùy chỉnh:

- `.btn-primary`: Nút chính
- `.btn-secondary`: Nút phụ
- `.btn-danger`: Nút nguy hiểm
- `.input-field`: Input field
- `.card`: Card container
- `.sidebar-item`: Sidebar navigation item

### API Integration

Ứng dụng tích hợp với các microservices backend:

- **Contract Management Service**: Quản lý hợp đồng
- **User Management Service**: Quản lý người dùng
- **AI Processing Service**: Xử lý AI
- **File Storage Service**: Lưu trữ file

## 🎨 UI Components

### Button Components

```tsx
<button className="btn-primary">Nút chính</button>
<button className="btn-secondary">Nút phụ</button>
<button className="btn-danger">Nút nguy hiểm</button>
```

### Form Components

```tsx
<input className="input-field" placeholder="Nhập dữ liệu..." />
<textarea className="input-field" rows={4} />
```

### Layout Components

```tsx
<div className="card">
  <h3>Tiêu đề</h3>
  <p>Nội dung</p>
</div>
```

## 🔐 Authentication

Hệ thống xác thực sử dụng JWT tokens:

- **Login**: Đăng nhập với username/password
- **Register**: Đăng ký tài khoản mới
- **Token Refresh**: Tự động refresh token
- **Route Protection**: Bảo vệ các route cần xác thực

### Sử dụng Auth Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, login, logout } = useAuth()
  
  if (!user) {
    return <div>Vui lòng đăng nhập</div>
  }
  
  return (
    <div>
      <p>Xin chào, {user.fullName}!</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  )
}
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với các breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Cấu hình environment variables
4. Deploy tự động

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

## 📊 Performance

- **Code Splitting**: Tự động với Next.js
- **Image Optimization**: Sử dụng Next.js Image component
- **Lazy Loading**: Components được load khi cần
- **Bundle Analysis**: Sử dụng `@next/bundle-analyzer`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển bởi DevGO2003 và được cấp phép theo MIT License.

## 🤝 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- Tạo issue trên GitHub
- Liên hệ team phát triển
- Tham khảo tài liệu API

---

**DocGO Web Frontend** - Quản lý tài liệu thông minh với AI 🚀
