---
id: "rule-service-structure"
trigger: always_on
description: Quy tắc định nghĩa standard microservice architecture patterns cho DocGO bao gồm project structure, naming conventions, và module organization cho Spring Boot, FastAPI, và Next.js services. Đảm bảo consistent package structure, port assignments, dependency management, và documentation standards across all microservices. Quy tắc bao gồm service layering, controller patterns, health checks, Swagger documentation, và deployment configurations để duy trì scalable và maintainable service architecture.
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
  - structure
  - services
  - architecture
  - layering
  - backend
  - spring-boot
  - fastapi
  - nextjs
  - naming
  - package-structure
  - controller
  - service-layer
  - repository
  - entity
  - config
  - swagger-ui
  - docs
  - ports
  - conventions
  - semantic-versioning
  - artifact-id
  - group-id
  - module
  - router
  - tags-routing
  - health-check
---
# Cấu trúc Microservices DocGO

## 🏗️ Danh sách Services và Cấu hình

| Service | Type | Group ID | Artifact ID | Package Structure | Port | Docs |
|---|---|----|----|----|---|---|
| **Frontend** | Next.js | N/A | `web-app` | N/A (Node.js) | 3000 | N/A |
| **API Gateway** | Next.js | N/A | `api-gateway` | N/A (Node.js) | 8000 | `/docs` |
| **User Management** | Spring Boot | `com.devgo2003.docgo` | `user-service` | `com.devgo2003.docgo.user_service` | 8001 | `/docs` |
| **Repository Management** | Spring Boot | `com.devgo2003.docgo` | `repository-service` | `com.devgo2003.docgo.repository_service` | 8002 | `/docs` |
| **Automation Service** | FastAPI | N/A | N/A | Python modules | 8003 | `/docs` |

## Quy tắc đặt tên

### Java (Spring Boot)
- **Group ID**: `com.devgo2003.docgo` (dùng kebab-case)
- **Artifact ID**: Viết tắt từ tên microservice (dùng kebab-case)
- **Package Structure**: Đổi dấu `-` thành `_` trong package structure
- **Version**: `1.0.0` (khởi đầu), tăng theo semantic versioning

### Node.js (Next.js)
- **Package Name**: Tên service (kebab-case)
- **Version**: `1.0.0` (khởi đầu)

### Python (FastAPI)
- **Module Structure**: Tên service (snake_case)
- **Version**: Trong `requirements.txt` hoặc `pyproject.toml`

# Quy tắc cấu trúc dịch vụ (structure)

## Python (FastAPI)
- Cấu trúc: `main.py`, `routers.py`, `config.py`, `requirements.txt`, `schemas/`, `services/`
- `main.py`: FastAPI app, include routers, route root `/`
- `routers.py`: APIRouter với tags, summary, description, trả RestResponse
- `config.py`: load .env, cấu hình SDK/clients
- Error handling: HTTPException hoặc RestResponse 500 với requestId, timestamp, path

## Java (Spring Boot)
- Cấu trúc: `controller/`, `service/`, `repository/`, `entity/`, `common/exception`, `common/handler`, `common/response`, `config/`
- GlobalExceptionHandler → RestResponse với HTTP status
- Controller: @RequestMapping("/api/v1/..."), @Tag, @Operation, ResponseEntity<RestResponse<...>>
- Validation: jakarta.validation, cấu hình application.properties

## Dependencies
- Python: requirements.txt với version cố định, cập nhật README.md
- Java: pom.xml với version rõ ràng, cập nhật README.md

## Group ID & Artifact ID
- Group ID: `com.devgo2003.docgo`
- Artifact ID: viết tắt từ tên service (kebab-case)
- Package: đổi `-` thành `_` trong package structure
- Version: 1.0.0, tăng theo semantic versioning

## Port & Docs
- Docs: `http://localhost:<PORT>/docs#/` cho tất cả services
- Spring Boot: `springdoc.swagger-ui.path=/docs` trong application.properties
- Tên folder phải trùng với tên nhánh remote

## Port mapping
- frontend: 3000
- api-gateway: 8000
- user-management-service: 8001
- file-management-service: 8002
- automation-service: 8003

---

# Docker Local
- Luôn dùng volume mount: `volumes: - ./:/app`
- Hot reload: code thay đổi trên host sync ngay vào container
- Commands: `docker local`, `docker local --new`, `docker local --down`
- Restart: `docker-compose restart` (nhanh), `docker-compose up --build` (khi thay đổi Dockerfile/dependencies)

## Build với Sleep Delay
- Luôn thêm sleep delay để tránh agent timeout
- PowerShell: `Start-Sleep -Seconds 30`
- Bash: `sleep 30`
- Build time > 60s: dùng background process + sleep

## Dockerfile
- Python: FROM python:3.11-slim, COPY requirements.txt, RUN pip install, CMD uvicorn
- Java: FROM openjdk:17-jdk-slim, COPY target/*.jar, CMD java -jar
- Health check: curl -f http://localhost:8000/health

## Docker Compose
- version: '3.8', services với build, ports, volumes, environment, networks
- volumes: mount code từ host vào container
- networks: bridge network cho development

## Environment Variables
- Development: .env file, không commit vào Git, dùng .env.example
- Production: Docker secrets, không hardcode sensitive info