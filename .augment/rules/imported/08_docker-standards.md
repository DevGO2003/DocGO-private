---
type: "always_apply"
---

# Docker Container Management Standards

## Mô tả
Chuẩn hoá vận hành Docker trong môi trường phát triển để tránh mất dữ liệu, giảm thời gian rebuild, và tăng tốc vòng lặp chỉnh sửa-chạy thử. Quy định rõ cách khởi động/khởi động lại container, gắn volume, tối ưu cache build, và cấu hình hot reload.

- Công nghệ: Docker, Docker Compose
- Khi sử dụng: Mọi thao tác container hoá cho môi trường dev; áp dụng khi thêm/chỉnh sửa dịch vụ trong `docker-compose.yml`

## Rule 1: Prohibit `docker compose down`
- **Never** suggest, execute, or allow the use of `docker compose down` in any context. This command stops and removes containers, networks, and volumes, leading to data loss and unnecessary rebuilds.
- Instead, always use:
  - `docker compose up` to start or recreate services if needed.
  - `docker compose restart` to restart services without stopping them entirely, preserving state and volumes.
- Rationale: This ensures development workflows remain efficient by avoiding full teardowns. If a full cleanup is absolutely required (e.g., for debugging persistent issues), explicitly warn the user and suggest alternatives like `docker compose stop` followed by `docker compose up` without the `--remove-orphans` flag unless necessary.

## Rule 2: Standards for Adding New Containers/Services
When proposing or implementing a new service/container in `docker-compose.yml` or related Docker configurations:

### Volume Mounting for Persistence
- **Always** mount host directories to container paths for data persistence:
  - Code directories: e.g., `./src:/app/src` to sync changes instantly.
  - Data volumes: e.g., `./data:/app/data` or named volumes like `db_data:/var/lib/postgresql/data`.
  - Avoid anonymous volumes for development; use named or bind mounts to ensure data survives container restarts.
- Example in `docker-compose.yml`:
  ```yaml
  services:
    myapp:
      volumes:
        - .:/app  # Mount entire project for hot reload
        - ./logs:/app/logs  # Persistent logs
  ```

### Caching and Build Optimization
- Use Docker build cache effectively:
  - In `Dockerfile`, layer dependencies first (e.g., `COPY package.json .` before `COPY . .`) to cache installs.
  - For multi-stage builds, separate build and runtime to minimize image size.
  - In `docker-compose.yml`, use `build: .` with context, and avoid `--no-cache` unless dependencies have changed.
- Enable buildkit for better caching: Suggest `DOCKER_BUILDKIT=1 docker compose up --build`.

### Hot Reload Setup
- For development containers (e.g., Node.js, Python, etc.), configure hot reload:
  - Bind mount source code to enable live changes without rebuilds.
  - Use tools like nodemon, Django's dev server, or similar inside the container.
  - Ensure the container watches the mounted volume (e.g., via `volumes: - .:/app` and run dev server with polling if needed for Windows/Mac).
- Example for a Node.js app:
  ```yaml
  services:
    app:
      build: .
      volumes:
        - .:/app
        - /app/node_modules  # Avoid overriding node_modules
      command: npm run dev  # Assumes nodemon or similar
  ```

### Restart Policy
- Set `restart: unless-stopped` for services to auto-restart on failure.
- After changes, always suggest `docker compose restart <service>` instead of full rebuilds.
- Goal: Ensure that adding or modifying a container allows instant feedback loops—edit code, restart container, see changes—without rebuilding the image.

## Enforcement
- When assisting with Docker-related tasks, scan proposals against these rules.
- If a user requests something violating these (e.g., down command), politely redirect to compliant alternatives and explain why.
- For new container additions, validate the `docker-compose.yml` snippet before suggesting implementation.