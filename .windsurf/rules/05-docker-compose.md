---
id: "rule-docker-compose"
description: "Chuẩn hóa Docker Compose configuration, cấm tạo file docker-compose mới (.dev, .local), và quản lý environment variables cho DocGO"
alwaysApply: false
globs:
  - "**/docker-compose.yml"
  - "**/docker-compose.yaml"
  - "**/Dockerfile"
  - "**/.dockerignore"
tags:
  - docker
  - compose
  - containerization
  - environment
  - volumes
  - networking
  - health-checks
  - development
---

# Docker Compose Standards cho DocGO

## Mục tiêu
- Chuẩn hóa Docker Compose configuration cho tất cả services
- Cấm tạo file docker-compose mới (.dev, .local, v.v.)
- Đồng nhất volume mounts và environment variables
- Tối ưu hóa development workflow

## 1. Docker Compose Version & Structure

### Version Chuẩn
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Services definition
networks:
  # Network configuration
volumes:
  # Volume configuration
```

### Cấm tạo file Docker Compose mới
- **KHÔNG BAO GIỜ** tạo file docker-compose mới với suffix:
  - `.dev`, `.local`, `.test`, `.staging`, `.production`
  - `.override`, `.backup`, `.old`
- **CHỈ SỬ DỤNG** file `docker-compose.yml` duy nhất
- **SỬ DỤNG** environment variables để phân biệt môi trường

## 2. Service Configuration Standards

### Base Service Template
```yaml
services:
  service-name:
    build:
      context: ./path/to/service
      dockerfile: Dockerfile
    ports:
      - "${SERVICE_PORT:-8000}:8000"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - DATABASE_URL=${DATABASE_URL}
      - KAFKA_BROKER=${KAFKA_BROKER}
    env_file:
      - ./path/to/service/.env
    volumes:
      - ./path/to/service:/app
      - /app/node_modules
    networks:
      - docgo-network
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Port Mapping Chuẩn
```yaml
# Port mapping cho tất cả services
ports:
  - frontend: "3000:3000"
  - api-gateway: "8000:8000"
  - user-management-service: "8001:8001"
  - file-management-service: "8002:8002"
  - automation-service: "8003:8003"
  - mongodb: "27017:27017"
  - redis: "6379:6379"
  - kafka: "9092:9092"
```

## 3. Volume Mounts cho Hot Reload

### Development Volumes
```yaml
volumes:
  # Code mounting cho hot reload
  - ./backend/user-management-service:/app
  - ./backend/file-management-service:/app
  - ./backend/automation-service:/app
  - ./backend/api-gateway:/app
  - ./frontend/web-app:/app
  
  # Exclude node_modules để tránh conflict
  - /app/node_modules
  - /app/target
  - /app/__pycache__
  
  # Logs directory
  - ./logs:/app/logs
```

### Production Volumes
```yaml
volumes:
  # Chỉ mount config files, không mount source code
  - ./config:/app/config
  - ./logs:/app/logs
  - ./uploads:/app/uploads
```

## 4. Environment Variables Management

### .env File Structure
```bash
# .env (root level)
NODE_ENV=development
COMPOSE_PROJECT_NAME=docgo

# Database
MONGODB_URI=mongodb://mongodb:27017/docgo
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC_PREFIX=docgo

# Service URLs
API_GATEWAY_URL=http://api-gateway:8000
USER_SERVICE_URL=http://user-management-service:8001
FILE_SERVICE_URL=http://file-management-service:8002
AUTOMATION_SERVICE_URL=http://automation-service:8003
```

### Service-specific .env Files
```bash
# backend/user-management-service/.env
HOST=0.0.0.0
PORT=8001
DATABASE_URL=${MONGODB_URI}
KAFKA_BROKER=${KAFKA_BROKER}
JWT_SECRET=your-jwt-secret
```

### Environment Variable Priority
1. **Service .env file** (highest priority)
2. **Root .env file**
3. **Docker Compose environment section**
4. **System environment variables**
5. **Default values** (lowest priority)

## 5. Network Configuration

### Custom Network
```yaml
networks:
  docgo-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Service Communication
```yaml
# Services communicate via service names
environment:
  - USER_SERVICE_URL=http://user-management-service:8001
  - FILE_SERVICE_URL=http://file-management-service:8002
  - AUTOMATION_SERVICE_URL=http://automation-service:8003
```

## 6. Health Checks

### Health Check Standards
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:${PORT}/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Health Check Endpoints
```typescript
// Node.js/Next.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  })
})
```

```python
# Python/FastAPI
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "automation-service"
    }
```

```java
// Java/Spring Boot
@GetMapping("/health")
public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> health = new HashMap<>();
    health.put("status", "healthy");
    health.put("timestamp", Instant.now().toString());
    health.put("service", "user-management-service");
    return ResponseEntity.ok(health);
}
```

## 7. Dockerfile Standards

### Node.js/Next.js Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["npm", "start"]
```

### Python/FastAPI Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Java/Spring Boot Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy JAR file
COPY target/*.jar app.jar

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start command
CMD ["java", "-jar", "app.jar"]
```

## 8. Development Commands

### Docker Compose Commands
```bash
# Start all services
docker-compose up -d

# Start with sleep delay (BẮT BUỘC)
docker-compose up -d; Start-Sleep -Seconds 20

# Restart specific service
docker-compose restart service-name

# View logs
docker-compose logs -f service-name

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d; Start-Sleep -Seconds 20
```

### Service Management
```bash
# Check service status
docker-compose ps

# Check service health
docker-compose exec service-name curl -f http://localhost:PORT/health

# Access service shell
docker-compose exec service-name /bin/bash

# View service logs
docker-compose logs -f --tail=100 service-name
```

## 9. Production Considerations

### Production Overrides
```yaml
# docker-compose.prod.yml (KHÔNG TẠO FILE NÀY)
# Thay vào đó, sử dụng environment variables
environment:
  - NODE_ENV=production
  - LOG_LEVEL=warn
  - ENABLE_DEBUG=false
```

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Security
```yaml
# Run as non-root user
user: "1000:1000"

# Read-only root filesystem
read_only: true

# No new privileges
security_opt:
  - no-new-privileges:true
```

## 10. Troubleshooting

### Common Issues
1. **Port conflicts**: Kiểm tra port đã được sử dụng
2. **Volume mount issues**: Đảm bảo path tồn tại
3. **Environment variables**: Kiểm tra .env files
4. **Network connectivity**: Kiểm tra service names
5. **Health check failures**: Kiểm tra health endpoints

### Debug Commands
```bash
# Check container logs
docker-compose logs service-name

# Check container status
docker-compose ps

# Check network connectivity
docker-compose exec service-name ping other-service

# Check environment variables
docker-compose exec service-name env
```

---

**Lưu ý**: Docker Compose standards này đảm bảo tính nhất quán và khả năng mở rộng cho việc containerization của DocGO, đồng thời cấm tạo file docker-compose mới để tránh confusion.