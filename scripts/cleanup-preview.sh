#!/bin/bash

# Preview environment cleanup script
# Usage: ./scripts/cleanup-preview.sh [branch-name]

set -e

BRANCH_NAME=${1:-feature/example}
SANITIZED_BRANCH=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9-]/-/g' | tr '[:upper:]' '[:lower:]')
COMPOSE_FILE="docker-compose.preview-${SANITIZED_BRANCH}.yml"

echo "🧹 Cleaning up preview environment for branch: $BRANCH_NAME"
echo "🗑️  Sanitized name: $SANITIZED_BRANCH"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "⚠️  Compose file $COMPOSE_FILE not found. Environment may already be cleaned up."
    echo "🔍 Checking for running containers..."
    
    # Check for any containers that might still be running
    CONTAINERS=$(docker ps -a --filter "name=${SANITIZED_BRANCH}" --format "{{.Names}}" || true)
    if [ -n "$CONTAINERS" ]; then
        echo "🗑️  Found containers to cleanup: $CONTAINERS"
        echo "$CONTAINERS" | xargs docker rm -f
    else
        echo "✅ No containers found to cleanup"
    fi
    
    # Check for volumes
    VOLUMES=$(docker volume ls --filter "name=preview_${SANITIZED_BRANCH}" --format "{{.Name}}" || true)
    if [ -n "$VOLUMES" ]; then
        echo "🗑️  Found volumes to cleanup: $VOLUMES"
        echo "$VOLUMES" | xargs docker volume rm -f || true
    else
        echo "✅ No volumes found to cleanup"
    fi
    
    # Check for networks
    NETWORKS=$(docker network ls --filter "name=preview-${SANITIZED_BRANCH}" --format "{{.Name}}" || true)
    if [ -n "$NETWORKS" ]; then
        echo "🗑️  Found networks to cleanup: $NETWORKS"
        echo "$NETWORKS" | xargs docker network rm || true
    else
        echo "✅ No networks found to cleanup"
    fi
    
    echo "🎉 Manual cleanup completed!"
    exit 0
fi

echo "📦 Stopping and removing preview environment..."
docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans

echo "🗑️  Removing docker-compose file..."
rm -f "$COMPOSE_FILE"

echo "🧹 Cleaning up dangling images..."
docker image prune -f --filter "label=org.opencontainers.image.ref.name=*${SANITIZED_BRANCH}*" || true

echo "🔍 Checking for any remaining resources..."

# Clean up any remaining containers with the branch name
REMAINING_CONTAINERS=$(docker ps -a --filter "name=${SANITIZED_BRANCH}" --format "{{.Names}}" || true)
if [ -n "$REMAINING_CONTAINERS" ]; then
    echo "🗑️  Removing remaining containers: $REMAINING_CONTAINERS"
    echo "$REMAINING_CONTAINERS" | xargs docker rm -f
fi

# Clean up any remaining volumes
REMAINING_VOLUMES=$(docker volume ls --filter "name=preview_${SANITIZED_BRANCH}" --format "{{.Name}}" || true)
if [ -n "$REMAINING_VOLUMES" ]; then
    echo "🗑️  Removing remaining volumes: $REMAINING_VOLUMES"
    echo "$REMAINING_VOLUMES" | xargs docker volume rm -f || true
fi

# Clean up any remaining networks
REMAINING_NETWORKS=$(docker network ls --filter "name=preview-${SANITIZED_BRANCH}" --format "{{.Name}}" || true)
if [ -n "$REMAINING_NETWORKS" ]; then
    echo "🗑️  Removing remaining networks: $REMAINING_NETWORKS"
    echo "$REMAINING_NETWORKS" | xargs docker network rm || true
fi

echo ""
echo "🎉 Preview environment cleanup completed!"
echo "📝 Branch: $BRANCH_NAME"
echo "🏷️  Environment: preview-${SANITIZED_BRANCH}"
echo "💾 All containers, volumes, and networks have been removed"

# In a real deployment, you would also:
echo ""
echo "🔧 In production deployment, you would also:"
echo "   - Remove DNS records for ${SANITIZED_BRANCH}.preview.customer-portal.com"
echo "   - Clean up load balancer rules"
echo "   - Remove SSL certificates"
echo "   - Clean up monitoring/logging configurations"
echo "   - Remove backup snapshots for this environment"