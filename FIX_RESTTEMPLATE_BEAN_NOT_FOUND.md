# ✅ FIX: RestTemplate Bean Not Found

## 🔴 Lỗi

```
APPLICATION FAILED TO START

Description:
Parameter 1 of constructor in com.devgo2003.docgo.backend.user_service.controller.DashboardController 
required a bean of type 'org.springframework.web.client.RestTemplate' that could not be found.

Action:
Consider defining a bean of type 'org.springframework.web.client.RestTemplate' in your configuration.
```

---

## 📊 Nguyên nhân

**File:** `DashboardController.java`

```java
@RestController
@RequiredArgsConstructor
public class DashboardController {
    
    private final AuthService authService;
    private final RestTemplate restTemplate; // ❌ Bean not found!
    
    @GetMapping("/stats")
    public ResponseEntity<RestResponse<Map<String, Object>>> getDashboardStats(...) {
        // Use restTemplate to call other services
        var repoResponse = restTemplate.getForEntity(repoUrl, Map.class);
        var filesResponse = restTemplate.getForEntity(filesUrl, Map.class);
        ...
    }
}
```

**Vấn đề:**
- `DashboardController` inject `RestTemplate` qua constructor
- Spring Boot **KHÔNG TỰ ĐỘNG** tạo RestTemplate bean
- Cần định nghĩa bean trong `@Configuration` class

---

## ✅ Giải pháp

**Tạo file:** `RestTemplateConfig.java`

```java
package com.devgo2003.docgo.backend.user_service.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofSeconds(10))
                .build();
    }
}
```

**Features:**
- ✅ Define RestTemplate bean
- ✅ Connection timeout: 5 seconds
- ✅ Read timeout: 10 seconds
- ✅ Sử dụng `RestTemplateBuilder` (best practice)

---

## 🔄 Flow

### Before:
```
Spring Boot starts
  ↓
Scan components
  ↓
Found DashboardController
  ↓
Need RestTemplate bean
  ↓
❌ Bean not found → FAIL
```

### After:
```
Spring Boot starts
  ↓
Scan @Configuration classes
  ↓
Found RestTemplateConfig
  ↓
Create RestTemplate bean
  ↓
Inject into DashboardController
  ↓
✅ SUCCESS
```

---

## 📝 DashboardController sử dụng RestTemplate

**Mục đích:** Call các microservices khác để lấy thống kê

**Services called:**
1. **Repository Service** - Get repositories count
2. **Repository Service** - Get files count
3. **User Service** - Get organizations count
4. **Repository Service** - Get contracts stats

**Endpoint:** `GET /api/v1/user-management-service/dashboard/stats`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "repositories": 5,
    "files": 120,
    "organizations": 3,
    "totalContracts": 45,
    "pendingContracts": 12,
    "approvedContracts": 30
  }
}
```

---

## 🎯 RestTemplate Configuration

### Timeout settings:
| Setting | Value | Reason |
|---------|-------|--------|
| Connect timeout | 5s | Prevent hanging on unreachable services |
| Read timeout | 10s | Allow time for slow responses |

### Deprecated methods fix:
```java
// ❌ OLD (deprecated)
builder
  .setConnectTimeout(Duration.ofSeconds(5))
  .setReadTimeout(Duration.ofSeconds(10))

// ✅ NEW (Spring Boot 3.4+)
builder
  .connectTimeout(Duration.ofSeconds(5))
  .readTimeout(Duration.ofSeconds(10))
```

---

## 📁 File Location

```
backend/user-management-service/
└── src/main/java/.../user_service/
    └── config/
        └── RestTemplateConfig.java ✅ NEW
```

---

## ✅ Testing

### 1. Restart service:
```bash
cd backend/user-management-service
mvn clean install
mvn spring-boot:run
```

### 2. Check logs:
```
[INFO] Started UserManagementServiceApplication in X seconds ✅
```

### 3. Test endpoint:
```bash
curl -X GET "http://localhost:8081/api/v1/user-management-service/dashboard/stats" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {userId}"
```

### 4. Expected response:
```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Dashboard statistics retrieved successfully",
  "data": {
    "repositories": 0,
    "files": 0,
    "organizations": 0,
    "totalContracts": 0,
    "pendingContracts": 0,
    "approvedContracts": 0
  }
}
```

---

## 💡 Best Practices

### ✅ DO:
- Use `RestTemplateBuilder` (provides better defaults)
- Set reasonable timeouts
- Use non-deprecated methods
- Handle exceptions properly (DashboardController does this)

### ❌ DON'T:
- Use `new RestTemplate()` directly
- Forget to set timeouts (can cause hanging)
- Ignore deprecation warnings

---

## 🔍 Related Files

### Files using RestTemplate:
- `DashboardController.java` - Dashboard stats API

### Configuration files:
- `RestTemplateConfig.java` ✅ NEW
- `application.yml` - Service URLs configuration

### Service URLs (from application.yml):
```yaml
services:
  repository-management-service:
    url: http://localhost:8082
  automation-service:
    url: http://localhost:8083
```

---

## ✅ Summary

**Problem:** RestTemplate bean not found

**Solution:** Create `RestTemplateConfig` with `@Bean` method

**Files changed:** 1 file created
- `RestTemplateConfig.java` ✅

**Status:** ✅ FIXED

**Next steps:**
1. Restart User Management Service
2. Test dashboard stats endpoint
3. Verify no more bean errors

🚀 **READY!**
