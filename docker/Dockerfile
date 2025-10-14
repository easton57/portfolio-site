# Dockerfile for React frontend
FROM node:22-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY *.html ./
COPY vite.config.js ./
COPY src/img/ ./img/

# Expose port
EXPOSE 3080

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3080"]

