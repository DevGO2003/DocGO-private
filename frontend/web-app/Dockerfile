# DocGO Frontend - Next.js Application (Development Mode)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
# Use npm install to sync with package-lock in repo and avoid EUSAGE mismatch in CI/build
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application in development mode
CMD ["npm", "run", "dev"]


