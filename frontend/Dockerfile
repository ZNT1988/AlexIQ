# Multi-stage Dockerfile for HustleFinderIA Frontend
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Use tini as PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build

# Set build environment
ARG NODE_ENV=production
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_NODE_ENV

ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm test

# Run linting
RUN npm run lint

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy health check endpoint
RUN echo '{"status":"healthy","service":"frontend","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > /usr/share/nginx/html/health

# Create non-root user
RUN addgroup -g 1001 -S hustlefinder && \
    adduser -S hustlefinder -u 1001

# Change ownership of nginx directories
RUN chown -R hustlefinder:hustlefinder /var/cache/nginx && \
    chown -R hustlefinder:hustlefinder /var/log/nginx && \
    chown -R hustlefinder:hustlefinder /etc/nginx/conf.d

# Create PID directory
RUN mkdir -p /var/run/nginx && \
    chown hustlefinder:hustlefinder /var/run/nginx

# Switch to non-root user
USER hustlefinder

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Metadata
LABEL maintainer="HustleFinderIA Team <dev@hustlefinder.ia>"
LABEL version="1.0.0"
LABEL description="HustleFinderIA Frontend Service"