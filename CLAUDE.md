# CLAUDE.md

## Core Principles
- **ULTRATHINK** before making changes
- **KISS principle** - Keep it simple and maintainable  
- **Security first** - Validate input, encrypt sensitive data
- **Docker-first** - All development uses containers
- Always update documentation to reflect the changes of the project

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
npm run dev

# Testing (enforced quality gates)
npm test                    # Run all tests
npm run test:coverage       # Coverage reports
cd backend && npm test      # Backend only
cd frontend && npm test     # Frontend only

# Building (tests required to pass)
npm run build              # Full build with test gates
cd backend && npm run build  # Backend build
cd frontend && npm run build # Frontend build

# Database
cd backend && npx prisma migrate dev
```

## Test Enforcement
- **Coverage Thresholds**: Backend ≥90%, Frontend ≥85%
- **Pre-commit Hooks**: All tests must pass before commits
- **Build Gates**: Tests required for all builds
- **Fail Fast**: Tests bail on first failure

## CI/CD Pipeline
- **Development**: Auto-deploy on `main` branch push after tests pass
- **Staging**: Manual approval required, includes prod data replication
- **Production**: Manual approval required, includes backup & health checks
- **Rollback**: Automatic rollback capability on deployment failures

## Deployment Environments
```bash
# Development (automatic)
./scripts/deploy.sh dev

# Staging (with prod data replication)  
./scripts/deploy.sh staging v1.2.3
./scripts/replicate-data.sh

# Production (manual approval)
./scripts/deploy.sh production v1.2.3
```

## Current Status
✅ Authentication (JWT + 2FA) | ✅ Project Management | ✅ File Uploads  
✅ Testing Infrastructure (Backend: 100%, Frontend: 97.5%)  
✅ Docker Environment | ✅ CI/CD Pipeline | ✅ Production Ready