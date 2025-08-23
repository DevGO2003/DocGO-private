# Sử dụng Python 3.11 slim image
FROM python:3.11-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt system dependencies cần thiết
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    mariadb-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Tạo thư mục uploads nếu chưa có
RUN mkdir -p uploads

# Expose port 8002 (theo quy tắc port mapping)
EXPOSE 8002

# Thiết lập biến môi trường
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Command khởi chạy service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
