# 🔐 Authentication & Authorization Best Practices

## 📋 Tổng Quan Hệ Thống

Hệ thống DocGO sử dụng **JWT-based authentication** với kiến trúc microservices:

```
Frontend → API Gateway → Microservices
```

## 🏗️ Kiến Trúc Authentication

### 1. **API Gateway** (Điểm Kiểm Soát Trung Tâm)
- **Middleware Chain**: CORS → Authentication → Authorization → Service Health
- **Token Validation**: Gọi User Management Service để validate JWT
- **Header Forwarding**: Chuyển tiếp user info qua headers

### 2. **User Management Service** (Quản Lý Người Dùng)
- **JWT Generation**: Tạo access token và refresh token
- **Password Security**: BCrypt hashing
- **OAuth2 Support**: Google OAuth2 integration
- **Token Blacklist**: Quản lý token đã logout

### 3. **Repository Management Service** (Quản Lý Repository)
- **Gateway Authentication**: Nhận user info từ API Gateway
- **Permission System**: Role-based permissions
- **Resource-level Authorization**: Kiểm tra quyền truy cập

## 🔒 Security Best Practices

### 1. **Token Management**

#### ✅ **Nên Làm**
```typescript
// Sử dụng TokenManager để quản lý token
const tokenManager = TokenManager.getInstance();

// Kiểm tra token expiration
if (tokenManager.isTokenExpired()) {
  await tokenManager.refreshToken();
}

// Clear tokens khi logout
tokenManager.clearTokens();
```

#### ❌ **Không Nên Làm**
```typescript
// Không lưu token trực tiếp vào localStorage
localStorage.setItem('token', token);

// Không ignore token expiration
const token = localStorage.getItem('token'); // Không kiểm tra hết hạn
```

### 2. **API Calls**

#### ✅ **Nên Làm**
```typescript
// Sử dụng EnhancedApiClient
import { enhancedApiClient } from '@shared/lib/api/enhancedApiClient';

const response = await enhancedApiClient.get('/api/repositories');
```

#### ❌ **Không Nên Làm**
```typescript
// Không gọi API trực tiếp với fetch
const response = await fetch('/api/repositories', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. **Error Handling**

#### ✅ **Nên Làm**
```typescript
try {
  const response = await apiClient.get('/api/data');
  return response.data;
} catch (error) {
  // Log error for debugging
  console.error('[API] Error:', error);
  
  // Show user-friendly message
  toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
  
  // Handle specific error types
  if (error.statusCode === 403) {
    // Handle permission denied
  }
}
```

#### ❌ **Không Nên Làm**
```typescript
// Không ignore errors
const response = await apiClient.get('/api/data'); // Không có try-catch

// Không clear localStorage một cách aggressive
catch (error) {
  localStorage.clear(); // Quá aggressive
}
```

## 🛡️ Authorization Patterns

### 1. **Role-Based Access Control (RBAC)**

```typescript
// Define roles
enum UserRole {
  ADMIN = 'ADMIN',
  USER_MANAGER = 'USER_MANAGER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

// Check roles
const hasRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};
```

### 2. **Permission-Based Access Control (PBAC)**

```typescript
// Define permissions
enum Permission {
  REPOSITORY_READ = 'REPOSITORY_READ',
  REPOSITORY_WRITE = 'REPOSITORY_WRITE',
  REPOSITORY_DELETE = 'REPOSITORY_DELETE',
  USER_MANAGE = 'USER_MANAGE'
}

// Check permissions
const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};
```

### 3. **Resource-Level Authorization**

```typescript
// Check repository access
const canAccessRepository = (userId: string, repositoryId: string): boolean => {
  const repository = getRepository(repositoryId);
  
  // Owner has full access
  if (repository.ownerUserId === userId) {
    return true;
  }
  
  // Check permissions
  return repository.permissions.some(p => 
    p.userId === userId && p.permissions.includes('READ')
  );
};
```

## 🔧 Implementation Guidelines

### 1. **Frontend Security**

#### Token Storage
```typescript
// ✅ Sử dụng Redux store + localStorage
const authState = useSelector((state: RootState) => state.auth);

// ✅ Kiểm tra token expiration
if (tokenManager.isTokenExpired()) {
  await tokenManager.refreshToken();
}
```

#### API Calls
```typescript
// ✅ Sử dụng interceptors
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. **Backend Security**

#### API Gateway
```typescript
// ✅ Validate token với User Service
const isValid = await authService.validateToken(token);

// ✅ Forward user info qua headers
requestHeaders.set('x-user-id', user.id);
requestHeaders.set('x-user-roles', user.roles.join(','));
```

#### Microservices
```typescript
// ✅ Nhận user info từ headers
const userId = request.getHeader("X-User-Id");
const userRoles = request.getHeader("X-User-Roles")?.split(",");

// ✅ Kiểm tra permissions
if (!hasPermission(userId, resource, action)) {
  throw new ForbiddenException();
}
```

## 🚨 Security Checklist

### Frontend
- [ ] Sử dụng HTTPS trong production
- [ ] Không lưu sensitive data trong localStorage
- [ ] Implement proper error handling
- [ ] Validate user input
- [ ] Use Content Security Policy (CSP)
- [ ] Implement rate limiting

### Backend
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Implement proper logging
- [ ] Use secure headers
- [ ] Implement rate limiting
- [ ] Regular security audits

### Infrastructure
- [ ] Use environment variables for secrets
- [ ] Implement proper monitoring
- [ ] Regular security updates
- [ ] Use secure communication between services
- [ ] Implement proper backup strategies

## 🔍 Monitoring & Logging

### Authentication Events
```typescript
// Log authentication events
logger.info('User login', {
  userId: user.id,
  username: user.username,
  timestamp: new Date().toISOString(),
  ipAddress: request.ip
});

logger.warn('Failed login attempt', {
  username: credentials.username,
  ipAddress: request.ip,
  timestamp: new Date().toISOString()
});
```

### Authorization Events
```typescript
// Log authorization events
logger.info('Permission check', {
  userId: user.id,
  resource: resource,
  action: action,
  result: 'granted' | 'denied',
  timestamp: new Date().toISOString()
});
```

## 📚 Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [React Security Best Practices](https://reactjs.org/docs/security.html)

