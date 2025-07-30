#!/bin/bash

# Preview environment deployment script
# Usage: ./scripts/deploy-preview.sh [branch-name] [backend-image] [frontend-image]

set -e

BRANCH_NAME=${1:-feature/example}
BACKEND_IMAGE=${2:-ghcr.io/your-repo/backend:latest}
FRONTEND_IMAGE=${3:-ghcr.io/your-repo/frontend:latest}

# Sanitize branch name for use in URLs and resource names
SANITIZED_BRANCH=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9-]/-/g' | tr '[:upper:]' '[:lower:]')
PREVIEW_URL="https://${SANITIZED_BRANCH}.preview.customer-portal.com"

echo "🚀 Deploying preview environment for branch: $BRANCH_NAME"
echo "🔗 Preview URL: $PREVIEW_URL"
echo "📦 Backend Image: $BACKEND_IMAGE"
echo "📦 Frontend Image: $FRONTEND_IMAGE"

# Create preview-specific docker-compose file
cat > "docker-compose.preview-${SANITIZED_BRANCH}.yml" << EOF
version: '3.8'

services:
  backend-${SANITIZED_BRANCH}:
    image: ${BACKEND_IMAGE}
    container_name: backend-${SANITIZED_BRANCH}
    ports:
      - "0:3001"  # Dynamic port assignment
    environment:
      - NODE_ENV=preview
      - DATABASE_URL=postgresql://postgres:password@postgres-${SANITIZED_BRANCH}:5432/preview_${SANITIZED_BRANCH}
      - REDIS_URL=redis://redis-${SANITIZED_BRANCH}:6379
      - JWT_SECRET=preview-jwt-secret-${SANITIZED_BRANCH}
      - CORS_ORIGINS=${PREVIEW_URL}
      - MINIO_ENDPOINT=minio-${SANITIZED_BRANCH}:9000
      - MINIO_ACCESS_KEY=preview${SANITIZED_BRANCH}
      - MINIO_SECRET_KEY=preview${SANITIZED_BRANCH}123
    depends_on:
      - postgres-${SANITIZED_BRANCH}
      - redis-${SANITIZED_BRANCH}
      - minio-${SANITIZED_BRANCH}
    networks:
      - preview-${SANITIZED_BRANCH}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend-${SANITIZED_BRANCH}.rule=Host(\`${SANITIZED_BRANCH}.preview.customer-portal.com\`) && PathPrefix(\`/api\`)"
      - "traefik.http.services.backend-${SANITIZED_BRANCH}.loadbalancer.server.port=3001"
      - "traefik.docker.network=preview-${SANITIZED_BRANCH}"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend-${SANITIZED_BRANCH}:
    image: ${FRONTEND_IMAGE}
    container_name: frontend-${SANITIZED_BRANCH}
    depends_on:
      - backend-${SANITIZED_BRANCH}
    networks:
      - preview-${SANITIZED_BRANCH}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend-${SANITIZED_BRANCH}.rule=Host(\`${SANITIZED_BRANCH}.preview.customer-portal.com\`)"
      - "traefik.http.services.frontend-${SANITIZED_BRANCH}.loadbalancer.server.port=80"
      - "traefik.docker.network=preview-${SANITIZED_BRANCH}"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres-${SANITIZED_BRANCH}:
    image: postgres:16-alpine
    container_name: postgres-${SANITIZED_BRANCH}
    environment:
      - POSTGRES_DB=preview_${SANITIZED_BRANCH}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_preview_${SANITIZED_BRANCH}_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - preview-${SANITIZED_BRANCH}

  redis-${SANITIZED_BRANCH}:
    image: redis:7-alpine
    container_name: redis-${SANITIZED_BRANCH}
    volumes:
      - redis_preview_${SANITIZED_BRANCH}_data:/data
    networks:
      - preview-${SANITIZED_BRANCH}

  minio-${SANITIZED_BRANCH}:
    image: minio/minio:latest
    container_name: minio-${SANITIZED_BRANCH}
    environment:
      - MINIO_ACCESS_KEY=preview${SANITIZED_BRANCH}
      - MINIO_SECRET_KEY=preview${SANITIZED_BRANCH}123
    volumes:
      - minio_preview_${SANITIZED_BRANCH}_data:/data
    command: server /data --console-address ":9001"
    networks:
      - preview-${SANITIZED_BRANCH}

volumes:
  postgres_preview_${SANITIZED_BRANCH}_data:
    name: postgres_preview_${SANITIZED_BRANCH}_data
  redis_preview_${SANITIZED_BRANCH}_data:
    name: redis_preview_${SANITIZED_BRANCH}_data
  minio_preview_${SANITIZED_BRANCH}_data:
    name: minio_preview_${SANITIZED_BRANCH}_data

networks:
  preview-${SANITIZED_BRANCH}:
    name: preview-${SANITIZED_BRANCH}
    driver: bridge
EOF

# Deploy the preview environment
echo "📦 Starting preview environment containers..."
docker-compose -f "docker-compose.preview-${SANITIZED_BRANCH}.yml" pull
docker-compose -f "docker-compose.preview-${SANITIZED_BRANCH}.yml" up -d

# Wait for services to be healthy
echo "🏥 Waiting for services to be healthy..."
timeout 300 bash -c "until docker-compose -f docker-compose.preview-${SANITIZED_BRANCH}.yml ps | grep -q 'healthy'; do sleep 5; echo 'Waiting for health checks...'; done"

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f "docker-compose.preview-${SANITIZED_BRANCH}.yml" exec -T backend-${SANITIZED_BRANCH} npm run prisma:generate
docker-compose -f "docker-compose.preview-${SANITIZED_BRANCH}.yml" exec -T backend-${SANITIZED_BRANCH} npm run prisma:migrate || echo "Migration failed, but continuing..."

# Seed with sample data
echo "🌱 Seeding database with sample data..."
docker-compose -f "docker-compose.preview-${SANITIZED_BRANCH}.yml" exec -T backend-${SANITIZED_BRANCH} npm run seed || echo "Seeding failed, but continuing..."

# Get the actual assigned port
BACKEND_PORT=$(docker port backend-${SANITIZED_BRANCH} 3001 | cut -d: -f2)
FRONTEND_PORT=$(docker port frontend-${SANITIZED_BRANCH} 80 | cut -d: -f2)

echo ""
echo "🎉 Preview environment deployed successfully!"
echo "🔗 Preview URL: $PREVIEW_URL"
echo "🖥️  Frontend: http://localhost:$FRONTEND_PORT"
echo "🔌 Backend API: http://localhost:$BACKEND_PORT"
echo "📊 Branch: $BRANCH_NAME"
echo "🏷️  Environment: preview-${SANITIZED_BRANCH}"
echo ""
echo "🧪 Test credentials:"
echo "   Email: demo@example.com"
echo "   Password: preview123"
echo ""
echo "📝 To update this environment:"
echo "   ./scripts/deploy-preview.sh $BRANCH_NAME [new-backend-image] [new-frontend-image]"
echo ""
echo "🗑️  To cleanup this environment:"
echo "   ./scripts/cleanup-preview.sh $BRANCH_NAME"