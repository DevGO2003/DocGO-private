# Sử dụng Java 21 OpenJDK
FROM openjdk:21-jdk-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt Maven
RUN apt-get update && apt-get install -y \
    maven \
    && rm -rf /var/lib/apt/lists/*

# Copy pom.xml và cài đặt dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build ứng dụng
RUN mvn clean package -DskipTests

# Expose port 8001 (theo quy tắc port mapping)
EXPOSE 8001

# Command khởi chạy service
CMD ["java", "-jar", "target/auth-service-0.0.1-SNAPSHOT.jar"]
