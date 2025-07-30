# Multi-stage Docker build for Node.js backend
FROM node:20-slim AS base

# Install dependencies for native modules and SSL libraries for Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm install && npm cache clean --force
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-slim AS production
RUN apt-get update && apt-get install -y curl openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Create non-root user
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home backend
USER backend

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]