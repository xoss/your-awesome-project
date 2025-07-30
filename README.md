# your-awesome-project

A containerized Node.js application built with Docker for maximum portability, scalability, and reproducibility across any system architecture.

## 🐳 Docker Setup

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start

#### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd your-awesome-project

# Copy environment file
cp .env.example .env

# Start development environment with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# App: http://localhost:3000
# Database: localhost:5432
# Redis: localhost:6379
```

#### Production Environment
```bash
# Build and start production containers
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Docker Commands

#### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Run shell inside container
docker-compose -f docker-compose.dev.yml exec app sh

# Install new dependencies
docker-compose -f docker-compose.dev.yml exec app npm install <package>
```

#### Production
```bash
# Start production environment
docker-compose up -d

# View container status
docker-compose ps

# Scale application
docker-compose up -d --scale app=3

# View health status
docker-compose exec app node healthcheck.js
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=awesome_project
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Architecture

- **Multi-stage builds** for optimized production images
- **Health checks** for container monitoring
- **Non-root user** for security
- **Volume mounts** for development hot-reload
- **Network isolation** between services
- **Data persistence** through Docker volumes

### Troubleshooting

#### Common Issues
```bash
# Clear Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# View container logs
docker-compose logs app

# Check container health
docker-compose ps
```