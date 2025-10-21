---
id: "rule-service-structure"
trigger: model_decision
description: Quy tắc định nghĩa comprehensive microservice structure standards cho DocGO bao gồm naming conventions, package organization, port assignments, và dependency management across Java, Node.js, và Python services. Đảm bảo consistent project structure, artifact naming, versioning strategies, và documentation standards để duy trì scalable và maintainable microservice architecture. Quy tắc bao gồm service layering, health checks, configuration management, và deployment patterns để hỗ trợ efficient development và operations workflows.
globs:
  - "**/*.java"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.xml"
  - "**/*.md"
  - "**/*.txt"
  - "**/*.html"
  - "**/src/**/*.*"
  - "**/config/**/*.*"
  - "**/scripts/**/*.*"
tags:
  - service
  - structure
  - microservice
  - naming
  - package
  - port
  - dependencies
  - java
  - python
  - nodejs
---

# Service Structure Standards cho DocGO

## Mục tiêu
- Chuẩn hóa cấu trúc microservices trong DocGO
- Đồng nhất naming conventions cho Java/Node.js/Python
- Quản lý package structure và dependencies
- Đảm bảo consistency across services

## 1. Danh sách Services và Cấu hình

| Service | Type | Group ID | Artifact ID | Package Structure | Port | Docs |
|---------|------|----------|-------------|-------------------|------|------|
| **Frontend** | Next.js | N/A | `web-app` | N/A (Node.js) | 3000 | N/A |
| **API Gateway** | Next.js | N/A | `api-gateway` | N/A (Node.js) | 8000 | `/docs` |
| **User Management** | Spring Boot | `com.devgo2003.docgo` | `user-service` | `com.devgo2003.docgo.user_service` | 8001 | `/docs` |
| **File Management** | Spring Boot | `com.devgo2003.docgo` | `file-service` | `com.devgo2003.docgo.file_service` | 8002 | `/docs` |
| **Automation Service** | FastAPI | N/A | N/A | Python modules | 8003 | `/docs` |

## 2. Naming Conventions

### Java (Spring Boot)
- **Group ID**: `com.devgo2003.docgo` (dùng kebab-case)
- **Artifact ID**: Viết tắt từ tên microservice (dùng kebab-case)
- **Package Structure**: Đổi dấu `-` thành `7` trong package structure
- **Version**: `1.0.0` (khởi đầu), tăng theo semantic versioning

### Node.js (Next.js)
- **Package Name**: Tên service (kebab-case)
- **Version**: `1.0.0` (khởi đầu)

### Python (FastAPI)
- **Module Structure**: Tên service (snake_case)
- **Version**: Trong `requirements.txt` hoặc `pyproject.toml`

## 3. Package Structure

### Java (Spring Boot)
```
src/main/java/com/devgo2003/docgo/user_service/
├── controller/
│   └── UserController.java
├── service/
│   └── UserService.java
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java
├── common/
│   ├── exception/
│   ├── handler/
│   ├── response/
│   └── config/
└── Application.java
```

### Python (FastAPI)
```
automation-service/
├── main.py
├── routers.py
├── config.py
├── requirements.txt
├── schemas/
│   └── __init__.py
└── services/
    └── __init__.py
```

### Node.js (Next.js)
```
web-app/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── public/
├── package.json
└── next.config.js
```

## 4. Port Mapping

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | Next.js development server |
| API Gateway | 8000 | Main API gateway |
| User Management | 8001 | User authentication & management |
| File Management | 8002 | File upload & storage |
| Automation | 8003 | AI processing & automation |

## 5. Dependencies Management

### Java (Maven)
```xml
<!-- pom.xml -->
<groupId>com.devgo2003.docgo</groupId>
<artifactId>user-service</artifactId>
<version>1.0.0</version>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>
    <!-- Other dependencies with fixed versions -->
</dependencies>
```

### Python (requirements.txt)
```txt
# requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
# Other dependencies with fixed versions
```

### Node.js (package.json)
```json
{
  "name": "web-app",
  "version": "1.0.0",
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

## 6. Configuration Standards

### Java (application.properties)
```properties
# application.properties
server.port=8001
spring.application.name=user-management-service

# Database
spring.data.mongodb.uri=mongodb://localhost:27017/docgo_users

# Swagger
springdoc.swagger-ui.path=/docs

# Logging
logging.level.com.devgo2003.docgo=DEBUG
```

### Python (config.py)
```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8003))
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
```

### Node.js (next.config.js)
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```

## 7. Documentation Standards

### API Documentation
- **Swagger UI**: `http://localhost:<PORT>/docs` cho tất cả services
- **Spring Boot**: `springdoc.swagger-ui.path=/docs` trong application.properties
- **FastAPI**: Automatic Swagger UI tại `/docs`
- **Next.js**: API routes documentation trong JSDoc

### README Standards
```markdown
# Service Name

## Description
Brief description of service functionality

## How to Run
```bash
# Development
npm install
npm run dev

# Production
npm run build
npm start
```

## API Endpoints
- `GET /api/v1/service/health` - Health check
- `POST /api/v1/service/endpoint` - Main endpoint

## Environment Variables
- `PORT` - Service port
- `DATABASE_URL` - Database connection string

## Dependencies
- Node.js 18+
- MongoDB
- Redis
```

## 8. Health Check Endpoints

### Java (Spring Boot)
```java
@RestController
@RequestMapping("/api/v1/user-management")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<RestResponse<String>> health() {
        return ResponseEntity.ok(RestResponse.success("User Management Service is healthy"));
    }
}
```

### Python (FastAPI)
```python
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "automation-service"}
```

### Node.js (Next.js)
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "healthy", service: "web-app" })
}
```

## 9. Error Handling Standards

### Java (GlobalExceptionHandler)
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<RestResponse<String>> handleValidation(ValidationException e) {
        return ResponseEntity.badRequest()
            .body(RestResponse.error(400, "Validation Error", e.getMessage()));
    }
}
```

### Python (FastAPI)
```python
from fastapi import HTTPException

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "statusCode": 422,
            "shortMessage": "Validation Error",
            "description": str(exc),
            "timestamp": datetime.now().isoformat(),
            "requestId": request.headers.get("X-Request-ID"),
            "path": str(request.url)
        }
    )
```

## 10. Testing Standards

### Java (JUnit)
```java
@SpringBootTest
class UserServiceTest {
    
    @Test
    void shouldCreateUser() {
        // Test implementation
    }
}
```

### Python (pytest)
```python
import pytest
from fastapi.testclient import TestClient

def test_create_user():
    # Test implementation
    pass
```

### Node.js (Jest)
```typescript
describe('User API', () => {
  test('should create user', async () => {
    // Test implementation
  })
})
```

## 11. Best Practices

### Service Design
- **Single Responsibility**: Mỗi service có một responsibility rõ ràng
- **Loose Coupling**: Services giao tiếp qua APIs, không direct database access
- **High Cohesion**: Related functionality được group trong cùng service
- **Stateless**: Services không lưu state, dùng external storage

### Naming Conventions
- **Consistent naming**: Tất cả services follow cùng pattern
- **Clear purpose**: Tên service thể hiện rõ chức năng
- **Version compatibility**: Maintain backward compatibility khi có thể

### Documentation
- **Complete API docs**: Tất cả endpoints phải có documentation
- **Examples**: Request/response examples cho mỗi endpoint
- **Error responses**: Document tất cả possible error responses
- **Authentication**: Rõ ràng về auth requirements

---

**Lưu ý**: Service structure standards này đảm bảo tính nhất quán và khả năng mở rộng cho tất cả microservices trong DocGO ecosystem.