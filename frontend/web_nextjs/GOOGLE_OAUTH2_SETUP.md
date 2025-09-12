# Hướng dẫn cấu hình Google OAuth2 cho DocGO

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Đặt tên project (ví dụ: "DocGO Authentication")

## Bước 2: Bật Google+ API

1. Trong Google Cloud Console, vào **APIs & Services** > **Library**
2. Tìm kiếm "Google+ API" hoặc "Google Identity"
3. Bật **Google+ API** hoặc **Google Identity API**

## Bước 3: Tạo OAuth 2.0 Client ID

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Chọn **Web application**
4. Đặt tên (ví dụ: "DocGO Web Client")
5. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:8001/login/oauth2/code/google
   ```
6. Click **CREATE**

## Bước 4: Cấu hình Environment Variables

1. Copy **Client ID** và **Client Secret** từ Google Cloud Console
2. Mở file `backend/authentication-identity-service/env/.env.local`
3. Cập nhật:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

## Bước 5: Cấu hình Frontend URL

1. Mở file `backend/authentication-identity-service/env/.env.local`
2. Thêm:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

## Bước 6: Test OAuth2 Flow

1. Khởi động backend services:
   ```bash
   docker local
   ```

2. Khởi động frontend:
   ```bash
   cd frontend/web_nextjs
   npm run dev
   ```

3. Truy cập `http://localhost:3000/auth/login`
4. Click **"Đăng nhập với Google"**
5. Chọn tài khoản Google và cho phép truy cập
6. Kiểm tra xem có redirect về dashboard không

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Cloud Console phải khớp chính xác
- Đảm bảo không có dấu `/` thừa ở cuối URL

### Lỗi "invalid_client"
- Kiểm tra Client ID và Client Secret đã đúng chưa
- Đảm bảo đã bật Google+ API

### Lỗi "access_denied"
- User đã từ chối quyền truy cập
- Thử lại và chọn "Allow"

### Không redirect về frontend
- Kiểm tra `FRONTEND_URL` trong `.env.local`
- Kiểm tra logs của authentication service

## Cấu trúc OAuth2 Flow

```
1. User click "Đăng nhập với Google" 
   ↓
2. Frontend redirect đến: http://localhost:8001/oauth2/authorize/google
   ↓
3. Spring Boot redirect đến Google OAuth2
   ↓
4. User đăng nhập Google và cho phép truy cập
   ↓
5. Google redirect về: http://localhost:8001/login/oauth2/code/google
   ↓
6. Spring Boot xử lý OAuth2 callback và tạo JWT tokens
   ↓
7. Spring Boot redirect về: http://localhost:3000/auth/oauth/callback?token=...&refreshToken=...
   ↓
8. Frontend lưu tokens và redirect đến dashboard
```

## Security Notes

- **KHÔNG** commit Client Secret vào Git
- Sử dụng environment variables cho production
- Cấu hình HTTPS cho production
- Thêm domain production vào Authorized redirect URIs


