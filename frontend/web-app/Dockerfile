# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with optimizations
RUN npm ci --prefer-offline --no-audit --progress=false

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application with optimizations
RUN npm run build

# =============================================================================
# Stage 3: Development
# =============================================================================
FROM node:18-alpine AS dev
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev --prefer-offline --no-audit

# Copy source code (will be overridden by volume mount)
COPY . .

# Environment variables
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE 3000

# Start dev server with Turbopack
CMD ["npm", "run", "dev"]

# =============================================================================
# Stage 4: Production Runner
# =============================================================================
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "server.js"]


