# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Core Principles
- **Always ULTRATHINK** - Deep consideration before action
- **KISS principle** - Keep it simple and maintainable
- **Security first** - Validate input, encrypt sensitive data, update dependencies
- **Multi-environment aware** - Consider dev, staging, production impacts
- **Docker-first approach** - All development, testing, and deployment should use Docker containers for consistency and portability

## Task Management & Sub-Agents
- **Planning Phase**: Use Claude Opus 4 for strategic thinking, architecture decisions, and complex problem analysis
- **Implementation Phase**: Use Claude Sonnet for code execution, file operations, and tactical development
- **Multi-Agent Coordination**: Spawn multiple sub-agents for parallel tasks when beneficial
- **Long-Running Tasks**: ALWAYS spawn sub-agents for any task that may take >30 seconds or block user interaction (Docker builds, large file searches, compilation, test runs, etc.) to maintain responsiveness
- **Task Outlining**: Always outline tasks clearly before execution, breaking complex work into manageable steps
- **Plan Verification**: Always propose a detailed plan and wait for user verification before proceeding with any tasks
- **Safe Operations**: Only perform safe GET requests - never make destructive internet calls (POST, PATCH, DELETE) without explicit user permission.

## Development Standards
- Clean, readable code with meaningful names
- Modular, reusable components
- Comprehensive testing with linting
- Clear documentation and commit messages
- Git workflow with PRs and semantic versioning
- Containerized development workflow using Docker Compose
- Multi-stage Docker builds for optimized production images
- Environment-specific configurations (.env files)

## Approach
- Always ULTRATHINK before making changes
- Follow established patterns and conventions found in the codebase
- Adapt recommendations based on project architecture and requirements
- Consider the current development stage and team preferences

## Technology Stack & Architecture

### Backend Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify (high-performance, type-safe)
- **Database**: PostgreSQL 16+ with Prisma ORM
- **Cache/Sessions**: Redis 7+
- **Object Storage**: MinIO (S3-compatible)
- **Authentication**: JWT + 2FA (SMS via Twilio, TOTP via speakeasy)
- **Validation**: Zod for runtime type validation
- **Testing**: Vitest + Supertest

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Library**: Tailwind CSS + Headless UI
- **State Management**: Zustand (lightweight, TypeScript-first)
- **HTTP Client**: TanStack Query + Axios
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library

### Infrastructure & DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Environment**: Docker volumes for persistence
- **Monitoring**: Health checks + structured logging
- **Security**: Helmet.js, rate limiting, input sanitization

### Project Structure
```
/backend         - Fastify API server
/frontend        - React application  
/database        - PostgreSQL + Prisma schema
/storage         - MinIO object storage
/nginx           - Reverse proxy configuration
/docker          - Docker configurations
```

## Docker Environment
- **Development**: Use `docker-compose -f docker-compose.dev.yml up` for local development with hot-reload
- **Production**: Use `docker-compose up` for production-ready containers
- **Health Checks**: All services include health monitoring and graceful failure handling
- **Networking**: Services communicate through isolated Docker networks
- **Data Persistence**: Database and cache data persisted through Docker volumes

## Development Commands
- **Start Development**: `docker-compose -f docker-compose.dev.yml up`
- **Start Production**: `docker-compose up`
- **Backend Tests**: `cd backend && npm test`
- **Frontend Tests**: `cd frontend && npm test`
- **Database Migration**: `cd backend && npx prisma migrate dev`
- **Generate Prisma Client**: `cd backend && npx prisma generate`

## Security Practices
- **Input Validation**: All API inputs validated with Zod schemas
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **2FA**: SMS + TOTP authenticator app support
- **File Uploads**: Type validation, size limits, virus scanning
- **Rate Limiting**: API endpoint protection
- **CORS**: Strict origin policies
- **Secrets Management**: Environment variables, never committed

## Current Status
Customer portal project with modern full-stack architecture - implementing authentication, project management, and file upload features.
