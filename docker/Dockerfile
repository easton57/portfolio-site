# Multi-stage build for Vite frontend and Node.js backend

# Stage 1: Build Vite frontend
FROM node:18-alpine AS frontend-builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY *.html ./
COPY vite.config.js ./
COPY img/ ./img/

# Build the frontend
RUN npm run build

# Stage 2: Node.js backend with built frontend
FROM node:18-alpine AS backend

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies and rebuild native modules
RUN npm ci --only=production && npm rebuild && npm cache clean --force

# Copy backend application code
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./public

# Create necessary directories and set permissions
RUN mkdir -p /usr/src/app/public/rss && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/recent-posts', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "index.js"]
