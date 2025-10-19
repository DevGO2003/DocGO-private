# Development Dockerfile for Spring Boot application with volume mount support
FROM eclipse-temurin:17-jdk

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt Maven
RUN apt-get update && apt-get install -y \
    maven \
    && rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Install dependencies only (no build yet)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Expose port 8001 (internal port)
EXPOSE 8001

# Command khởi chạy service với Maven spring-boot:run để hỗ trợ hot reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-Dspring.profiles.active=docker'"]
