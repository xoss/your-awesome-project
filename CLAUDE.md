# CLAUDE.md

## Core Principles
- **ULTRATHINK** before making changes
- **KISS principle** - Keep it simple and maintainable  
- **Security first** - Validate input, encrypt sensitive data
- **Docker-first** - All development uses containers

## Development Standards
- **Mandatory Testing**: All code requires thorough test coverage
- **Test-First Development**: Every code change triggers unit tests
- **Commit Quality Gate**: All tests must pass before committing
- Clean, readable code with meaningful names
- Follow established patterns and conventions

## Technology Stack
- **Backend**: Node.js + TypeScript + Fastify + PostgreSQL + Prisma + Redis
- **Frontend**: React + TypeScript + Vite + Tailwind + Zustand + React Query
- **Testing**: Vitest + React Testing Library + MSW + Prisma mocking
- **Infrastructure**: Docker + Docker Compose + Nginx + MinIO

## Commands
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Testing  
cd backend && npm test
cd frontend && npm test

# Database
cd backend && npx prisma migrate dev
```

## Current Status
✅ Authentication (JWT + 2FA) | ✅ Project Management | ✅ File Uploads  
✅ Testing Infrastructure (Backend: 100%, Frontend: 97.5%)  
✅ Docker Environment | ✅ Production Ready