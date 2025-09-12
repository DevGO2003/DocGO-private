# Test Google OAuth2 Flow

## Các bước test

### 1. Cấu hình Google OAuth2
- Làm theo hướng dẫn trong `GOOGLE_OAUTH2_SETUP.md`
- Cập nhật `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env.local`

### 2. Khởi động services
```bash
# Terminal 1: Backend services
docker local

# Terminal 2: Frontend
cd frontend/web_nextjs
npm run dev
```

### 3. Test OAuth2 Flow
1. Truy cập `http://localhost:3000/auth/login`
2. Click **"Đăng nhập với Google"**
3. Kiểm tra xem có redirect đến Google OAuth2 không
4. Đăng nhập Google và cho phép truy cập
5. Kiểm tra xem có redirect về frontend callback không
6. Kiểm tra xem có redirect đến dashboard không

### 4. Kiểm tra logs
```bash
# Backend logs
docker-compose -f autofiles/docker-compose.dev.yml logs -f authentication-identity-service

# Frontend logs (trong browser console)
```

### 5. Kiểm tra database
```sql
-- Kiểm tra user được tạo
SELECT * FROM users WHERE username LIKE '%@gmail.com';
```

## Expected Flow

```
1. http://localhost:3000/auth/login
   ↓ (click "Đăng nhập với Google")
2. http://localhost:8001/oauth2/authorize/google
   ↓ (Spring Boot redirect)
3. https://accounts.google.com/o/oauth2/v2/auth?...
   ↓ (User login & authorize)
4. http://localhost:8001/login/oauth2/code/google?code=...
   ↓ (Spring Boot process OAuth2)
5. http://localhost:3000/auth/oauth/callback?token=...&refreshToken=...&success=true&username=...
   ↓ (Frontend process callback)
6. http://localhost:3000/dashboard
```

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Cloud Console
- Phải chính xác: `http://localhost:8001/login/oauth2/code/google`

### Lỗi "invalid_client"
- Kiểm tra Client ID và Client Secret
- Restart authentication service sau khi cập nhật env

### Không redirect về frontend
- Kiểm tra `FRONTEND_URL=http://localhost:3000` trong `.env.local`
- Kiểm tra logs của OAuth2LoginSuccessHandler

### Frontend không nhận được tokens
- Kiểm tra URL callback có chứa `?token=...&success=true` không
- Kiểm tra browser console có lỗi JavaScript không

## Debug Commands

```bash
# Kiểm tra environment variables
docker-compose -f autofiles/docker-compose.dev.yml exec authentication-identity-service env | grep GOOGLE

# Kiểm tra logs real-time
docker-compose -f autofiles/docker-compose.dev.yml logs -f authentication-identity-service | grep -i oauth

# Test OAuth2 endpoint trực tiếp
curl -I http://localhost:8001/oauth2/authorize/google
```


