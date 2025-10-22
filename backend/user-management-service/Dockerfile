# Development Dockerfile với hot reload & cache optimization
# Sử dụng Maven image có sẵn Maven và JDK 17
FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

# Copy Maven settings với mirrors tối ưu cho Việt Nam
COPY ../maven-settings.xml /root/.m2/settings.xml

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies (cache layer)
# Mount ~/.m2 từ host để tái sử dụng cache
RUN mvn dependency:go-offline -B || true

# Copy source code (thay đổi thường xuyên nhất)
COPY src ./src

# Compile Lombok annotations trước để tránh lỗi khi volume mount
RUN mvn compile -DskipTests || true

# Expose port 8001
EXPOSE 8001

# Enable hot reload với Spring DevTools
# Log unbuffered để debug dễ hơn
ENV MAVEN_OPTS="-XX:+TieredCompilation -XX:TieredStopAtLevel=1"
CMD ["mvn", "spring-boot:run", \
     "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=docker -Dspring.devtools.restart.enabled=true", \
     "-Dspring-boot.run.fork=false"]
