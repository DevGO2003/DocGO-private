# Simple single-stage build for Python FastAPI application
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV headless and OCR
RUN apt-get update && apt-get install -y \
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
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libopenblas-dev \
    python3-dev \
    python3-numpy \
    libtesseract-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create results directory
RUN mkdir -p results

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app

USER appuser

# Expose port 8003 (internal container port)
EXPOSE 8003

# Thiết lập biến môi trường
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Command khởi chạy service trên cổng 8003
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
