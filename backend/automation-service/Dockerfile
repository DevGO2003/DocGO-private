# Development Dockerfile với hot reload & cache optimization
# Sử dụng Python slim image cho tốc độ tối ưu
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies - minimal packages only
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libmagic1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libopenblas-dev \
    python3-dev \
    libtesseract-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
# Mount ~/.cache/pip từ host để tái sử dụng cache
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code (thay đổi thường xuyên nhất)
COPY . .

# Create results directory
RUN mkdir -p results

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port 8003
EXPOSE 8003

# Environment variables cho debug
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Hot reload với uvicorn --reload
# Log level info để debug dễ hơn
CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8003", \
     "--reload", \
     "--log-level", "info"]
