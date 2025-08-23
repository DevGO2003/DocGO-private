# Sử dụng Node.js 18 Alpine
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build ứng dụng Vite
RUN npm run build

# Cài đặt serve để chạy production build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Thiết lập biến môi trường
ENV NODE_ENV=production
ENV PORT=3000

# Command khởi chạy service
CMD ["serve", "-s", "dist", "-l", "3000"]
