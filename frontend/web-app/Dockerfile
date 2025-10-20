# Base image nhẹ cho Node.js dev
FROM node:18-alpine AS dev

# Set working dir
WORKDIR /app

# Copy package files trước (cache layers)
COPY package*.json ./

# Install deps (dev + prod cho hot reload)
RUN npm ci --include=dev

# Copy source code (sẽ override bằng volume mount)
COPY . .

# Expose port
EXPOSE 3000

# Chạy dev server (hot reload tự động)
CMD ["npm", "run", "dev"]


