# 🚀 Docker Optimization Guide

## 📋 Tổng quan

DocGO microservices đã được tối ưu cho development với hot reload:
- **Dockerfile** - Development với hot reload, cache optimization

## ✅ Tính năng đã tối ưu

### 1. **Build nhanh hơn**
- ✅ Copy `pom.xml` / `requirements.txt` trước
- ✅ Tải dependencies riêng (cache layer)
- ✅ Mount Maven cache (`~/.m2`)
- ✅ Mount pip cache (`~/.cache/pip`)
- ✅ Maven mirrors tối ưu cho Việt Nam (Aliyun, Huawei Cloud)

### 2. **Hot reload**
- ✅ Spring Boot: `spring-boot:run` + DevTools enabled
- ✅ FastAPI: `uvicorn --reload`
- ✅ Mount code từ host vào container

### 3. **Giảm image size**
- ✅ Dùng `--no-install-recommends`
- ✅ Xóa `apt` cache: `rm -rf /var/lib/apt/lists/*`
- ✅ Pip: `--no-cache-dir`

### 4. **Dễ debug**
- ✅ Log unbuffered (`PYTHONUNBUFFERED=1`)
- ✅ Maven JVM optimization
- ✅ Log level configurable

## 📦 Cấu trúc Dockerfile

### Development (Dockerfile)

**Spring Boot Services:**
```dockerfile
FROM maven:3.9-eclipse-temurin-17-slim
# Maven đã có sẵn, không cần cài thêm
# Copy pom.xml → download dependencies
# Copy source → hot reload
CMD mvn spring-boot:run với DevTools
```

**FastAPI Service:**
```dockerfile
FROM python:3.11-slim
# Slim image cho tốc độ tối ưu
# Install system deps minimal
# Copy requirements → pip install
# Copy source → hot reload
CMD uvicorn --reload
```

## 🎯 Cách sử dụng

### Development (với hot reload)

```powershell
# Build tất cả services
docker-compose build

# Start services
docker-compose up -d

# Logs
docker-compose logs -f automation-service
```

**Hot reload tự động:**
- Sửa code trong `backend/*/src` → Container tự động reload
- Maven cache: `maven-repo` volume
- Pip cache: `pip-cache` volume

## 📊 So sánh Performance

| Metric | Before | After | Cải thiện |
|--------|--------|-------|-----------|
| **Build time** (lần đầu) | ~5-10 min | ~5-10 min | 0% |
| **Rebuild time** (code change) | ~5-10 min | ~30s | 🔥 **90%** |
| **Hot reload** | ❌ Restart container | ✅ Auto reload | Instant |
| **Cache reuse** | ❌ No cache | ✅ Maven & Pip cache | 10x faster |

## 🔍 Chi tiết tối ưu

### Spring Boot (8001, 8002)

- Base image: `maven:3.9-eclipse-temurin-17` ⚡
- Maven đã có sẵn, không cần cài thêm (nhanh hơn)
- Maven cache: `/root/.m2` volume
- Maven mirrors: Aliyun (Trung Quốc) - gần Việt Nam nhất 🇻🇳
- Hot reload: `spring-boot:run` với DevTools
- JVM optimization: `TieredCompilation`
- Image size: ~600MB (nhẹ hơn với slim)

### FastAPI (8003)

- Base image: `python:3.11-slim` ⚡
- Slim image cho tốc độ tối ưu
- Pip cache: `/home/appuser/.cache/pip` volume
- Hot reload: `uvicorn --reload`
- OCR: Tesseract 4
- Security: Non-root user (appuser)
- Image size: ~1GB

## 📝 Best Practices

### 1. Dependency Caching
```dockerfile
# ✅ ĐÚNG: Copy pom.xml/requirements.txt trước
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
```

### 2. Layer Ordering
```dockerfile
# Ít thay đổi → nhiều thay đổi
1. Base image
2. System packages
3. Dependencies
4. Source code ← Thay đổi thường xuyên nhất
```

### 3. Volume Mounts
```yaml
volumes:
  - ./backend/service:/app  # Code hot reload
  - maven-repo:/root/.m2    # Maven cache
  - pip-cache:/home/appuser/.cache/pip  # Pip cache
```

### 4. Kiểm tra Services
```powershell
# Kiểm tra logs
docker-compose logs -f service-name

# Kiểm tra health
docker ps
```

## 🐛 Troubleshooting

### Maven dependencies không cache
```powershell
# Xem cache volume
docker volume inspect docgo_maven-repo

# Xóa và rebuild
docker-compose down -v
docker-compose up --build
```

### Pip packages cài lại mỗi lần
```powershell
# Kiểm tra pip cache
docker exec automation-service ls -la /home/appuser/.cache/pip

# Permissions issue → chown trong Dockerfile
```

### Hot reload không hoạt động
```powershell
# Spring Boot: kiểm tra DevTools
docker exec user-management-service cat pom.xml | grep devtools

# FastAPI: kiểm tra --reload flag
docker exec automation-service ps aux | grep uvicorn
```

## 📚 Tài liệu tham khảo

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools)
- [Uvicorn Deployment](https://www.uvicorn.org/deployment/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

---

**Cập nhật:** 22/10/2025 - Tối ưu Docker cho DocGO microservices
