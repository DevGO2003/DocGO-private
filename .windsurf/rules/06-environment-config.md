---
id: "rule-environment-config"
trigger: model_decision
description: Quy tắc chuẩn hóa environment configuration management cho DocGO bao gồm .env file organization, .env.example templates, Docker Compose environment mapping, và comprehensive .gitignore patterns. Đảm bảo secure handling của sensitive configuration data, consistent environment setup across all microservices, và proper separation của development và production configurations. Quy tắc bao gồm environment variable naming conventions, validation procedures, security best practices, và automated configuration management để duy trì reliable deployment environments.
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
  - environment
  - env
  - config
  - docker
  - gitignore
  - secrets
  - development
  - production
---

# Environment Configuration Standards cho DocGO

## Mục tiêu
- Chuẩn hóa .env files theo từng microservice
- Đồng nhất .env.example templates cho team
- Quản lý environment variables trong Docker Compose
- Bảo mật secrets và sensitive information

## 1. Environment File Management

### Mỗi microservice có file .env riêng
```
backend/
├── user-management-service/
│   ├── .env.example
│   └── .env (không commit)
├── repository-management-service/
│   ├── .env.example
│   └── .env (không commit)
├── automation-service/
│   ├── .env.example
│   └── .env (không commit)
└── api-gateway/
    ├── .env.example
    └── .env (không commit)

frontend/
└── web-app/
    ├── .env.example
    └── .env.local (không commit)
```

### Service-specific Environment Variables

#### User Management Service
```bash
# .env.example
HOST=0.0.0.0
PORT=8001
DATABASE_URL=mongodb://localhost:27017/docgo_users
KAFKA_BROKER=localhost:9092
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRATION=3600
BCRYPT_ROUNDS=12
```

#### File Management Service
```bash
# .env.example
HOST=0.0.0.0
PORT=8002
DATABASE_URL=mongodb://localhost:27017/docgo_files
KAFKA_BROKER=localhost:9092
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,doc,docx,txt
```

#### Automation Service
```bash
# .env.example
HOST=0.0.0.0
PORT=8003
GEMINI_API_KEY=your-gemini-api-key
KAFKA_BROKER=localhost:9092
OCR_ENABLED=true
AI_PROCESSING_ENABLED=true
```

#### API Gateway
```bash
# .env.example
HOST=0.0.0.0
PORT=8000
USER_MANAGEMENT_SERVICE_URL=http://localhost:8001
FILE_MANAGEMENT_SERVICE_URL=http://localhost:8002
AUTOMATION_SERVICE_URL=http://localhost:8003
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (Next.js)
```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DocGO
```

## 2. Docker Compose với .env

### Environment Mapping
```yaml
# docker-compose.yml
services:
  user-management-service:
    build: ./backend/user-management-service
    environment:
      - HOST=${USER_SERVICE_HOST:-0.0.0.0}
      - PORT=${USER_SERVICE_PORT:-8001}
      - DATABASE_URL=${MONGODB_URI}
      - KAFKA_BROKER=${KAFKA_BROKER}
    env_file:
      - ./backend/user-management-service/.env
    ports:
      - "${USER_SERVICE_PORT:-8001}:8001"
```

### Root .env File
```bash
# .env (root level)
NODE_ENV=development
COMPOSE_PROJECT_NAME=docgo

# Database
MONGODB_URI=mongodb://mongodb:27017/docgo
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKER=kafka:9092

# Service Ports
USER_SERVICE_PORT=8001
FILE_SERVICE_PORT=8002
AUTOMATION_SERVICE_PORT=8003
API_GATEWAY_PORT=8000
FRONTEND_PORT=3000
```

## 3. Quy tắc đặt tên

### File Naming Convention
- **`.env.example`**: Template cho team (commit vào git)
- **`.env`**: Development environment (không commit)
- **`.env.local`**: Local overrides (không commit)
- **`.env.production`**: Production config (không commit)

### Variable Naming Convention
- **UPPER_CASE**: Tất cả environment variables
- **SERVICE_PREFIX**: Cho service-specific variables
- **PUBLIC_PREFIX**: Cho frontend public variables (NEXT_PUBLIC_)

## 4. Workflow

### Development Setup
1. **Clone repository**
2. **Copy .env.example to .env**: `Copy-Item .env.example .env -Force`
3. **Update values**: Chỉnh sửa .env với values thực tế
4. **Start services**: `docker-compose up -d`

### Team Collaboration
1. **Update .env.example**: Khi thêm biến mới
2. **Commit .env.example**: Template được version control
3. **Notify team**: Thông báo về biến mới
4. **Team updates .env**: Mỗi developer cập nhật local .env

## 5. .gitignore Standards

### Bắt buộc ignore
```gitignore
# Environment files
.env
.env.local
.env.production
.env.*.local

# Build artifacts
**/node_modules/
**/target/
**/__pycache__/
**/.pytest_cache/
**/dist/
**/build/

# Logs
**/*.log
**/logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
**/tmp/
**/temp/
**/uploads/
```

### Python-specific
```gitignore
# Python
**/venv/
**/.venv/
**/__pycache__/
**/*.pyc
**/*.pyo
**/.pytest_cache/
**/coverage/
```

### Java-specific
```gitignore
# Java
**/target/
**/.mvn/
**/.gradle/
**/*.class
**/*.jar
**/*.war
```

### Node.js-specific
```gitignore
# Node.js
**/node_modules/
**/.next/
**/.nuxt/
**/out/
**/.env.local
**/.env.development.local
**/.env.test.local
**/.env.production.local
```

## 6. Security Best Practices

### Secrets Management
- **Không hardcode secrets** trong code
- **Sử dụng environment variables** cho tất cả sensitive data
- **Rotate secrets** định kỳ
- **Sử dụng different secrets** cho mỗi environment

### Production Considerations
- **Docker secrets** cho production
- **External secret management** (AWS Secrets Manager, Azure Key Vault)
- **Environment-specific configs**
- **Audit logging** cho secret access

## 7. Validation & Testing

### Environment Validation
```python
# Python - validate required env vars
import os
from typing import List

def validate_environment(required_vars: List[str]) -> bool:
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {missing_vars}")
    return True

# Usage
required_vars = ["DATABASE_URL", "KAFKA_BROKER", "JWT_SECRET"]
validate_environment(required_vars)
```

```java
// Java - validate required env vars
@Component
public class EnvironmentValidator {
    
    @PostConstruct
    public void validateEnvironment() {
        String[] requiredVars = {"DATABASE_URL", "KAFKA_BROKER", "JWT_SECRET"};
        
        for (String var : requiredVars) {
            if (System.getenv(var) == null) {
                throw new IllegalStateException("Missing required environment variable: " + var);
            }
        }
    }
}
```

### Environment Testing
```bash
# Test environment setup
docker-compose config
docker-compose up --dry-run

# Validate all services can start
docker-compose up -d
docker-compose ps
docker-compose logs
```

## 8. Troubleshooting

### Common Issues
1. **Missing .env file**: Copy từ .env.example
2. **Wrong environment values**: Check .env file content
3. **Docker env mapping**: Verify docker-compose.yml
4. **Port conflicts**: Check port assignments
5. **Secret not loaded**: Verify .env file location

### Debug Commands
```bash
# Check environment variables
docker-compose exec service-name env

# Check .env file
Get-Content .env

# Validate docker-compose
docker-compose config

# Check service logs
docker-compose logs service-name
```

---

**Lưu ý**: Environment configuration standards này đảm bảo tính nhất quán và bảo mật cho việc quản lý configuration trong DocGO ecosystem.