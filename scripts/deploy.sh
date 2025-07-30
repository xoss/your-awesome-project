#!/bin/bash

# Deployment script for Customer Portal
# Usage: ./scripts/deploy.sh [dev|staging|production] [image-tag]

set -e

ENVIRONMENT=${1:-dev}
IMAGE_TAG=${2:-latest}

echo "🚀 Deploying Customer Portal to $ENVIRONMENT environment"
echo "📦 Using image tag: $IMAGE_TAG"

case $ENVIRONMENT in
  "dev"|"development")
    echo "🔧 Deploying to Development..."
    export COMPOSE_FILE="docker-compose.dev.yml"
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    docker-compose -f $COMPOSE_FILE up -d --build
    echo "✅ Development deployment complete"
    echo "🔗 Available at: http://localhost:3000"
    ;;
    
  "staging")
    echo "🎭 Deploying to Staging..."
    export COMPOSE_FILE="docker-compose.staging.yml"
    export IMAGE_TAG=$IMAGE_TAG
    
    # Backup staging database before deployment
    echo "💾 Creating staging backup..."
    docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U $STAGING_POSTGRES_USER $STAGING_POSTGRES_DB > staging-backup-$(date +%Y%m%d-%H%M%S).sql
    
    # Deploy new version
    docker-compose -f $COMPOSE_FILE pull
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    echo "🏥 Waiting for services to be healthy..."
    timeout 300 bash -c 'until docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; do sleep 5; done'
    
    echo "✅ Staging deployment complete"
    echo "🔗 Available at: https://staging.customer-portal.com"
    ;;
    
  "production"|"prod")
    echo "🏭 Deploying to Production..."
    export COMPOSE_FILE="docker-compose.production.yml"
    export IMAGE_TAG=$IMAGE_TAG
    
    # Create production backup
    echo "💾 Creating production backup..."
    BACKUP_NAME="prod-backup-$(date +%Y%m%d-%H%M%S)"
    docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U $PROD_POSTGRES_USER $PROD_POSTGRES_DB > $BACKUP_NAME.sql
    
    # Blue-green deployment
    echo "🔄 Performing blue-green deployment..."
    docker-compose -f $COMPOSE_FILE pull
    docker-compose -f $COMPOSE_FILE up -d --no-deps backend frontend
    
    # Wait for health checks
    echo "🏥 Waiting for services to be healthy..."
    timeout 600 bash -c 'until docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; do sleep 10; done'
    
    # Run smoke tests
    echo "🧪 Running production smoke tests..."
    curl -f https://customer-portal.com/health || { echo "❌ Health check failed"; exit 1; }
    curl -f https://customer-portal.com/api/health || { echo "❌ API health check failed"; exit 1; }
    
    echo "✅ Production deployment complete"
    echo "🔗 Live at: https://customer-portal.com"
    echo "💾 Backup saved as: $BACKUP_NAME.sql"
    ;;
    
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [dev|staging|production] [image-tag]"
    exit 1
    ;;
esac

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"