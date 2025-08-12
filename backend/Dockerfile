# Multi-stage Dockerfile for HustleFinderIA Backend
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    tini \
    python3 \
    make \
    g++ \
    sqlite \
    postgresql-client

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci --only=development

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Use tini as PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# Start development server
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm test

# Run linting
RUN npm run lint

# Create optimized build
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production

# Install production system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    tini \
    sqlite \
    postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S hustlefinder && \
    adduser -S hustlefinder -u 1001

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=hustlefinder:hustlefinder /app .

# Remove unnecessary files
RUN rm -rf test/ docs/ *.md

# Create required directories
RUN mkdir -p logs db tmp && \
    chown -R hustlefinder:hustlefinder /app

# Switch to non-root user
USER hustlefinder

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Use tini as PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# Start production server
CMD ["node", "index.js"]

# Metadata
LABEL maintainer="HustleFinderIA Team <dev@hustlefinder.ia>"
LABEL version="1.0.0"
LABEL description="HustleFinderIA Backend Service"