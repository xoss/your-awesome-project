# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Core Principles
- **Always ULTRATHINK** - Deep consideration before action
- **KISS principle** - Keep it simple and maintainable
- **Security first** - Validate input, encrypt sensitive data, update dependencies
- **Multi-environment aware** - Consider dev, staging, production impacts

## Task Management & Sub-Agents
**Planning Phase**: Use Claude Opus 4 for strategic thinking, architecture decisions, and complex problem analysis
**Implementation Phase**: Use Claude Sonnet for code execution, file operations, and tactical development
**Multi-Agent Coordination**: Spawn multiple sub-agents for parallel tasks when beneficial
**Task Outlining**: Always outline tasks clearly before execution, breaking complex work into manageable steps
**Plan Verification**: Always propose a detailed plan and wait for user verification before proceeding with any tasks
**Safe Operations**: Only perform safe GET requests - never make destructive internet calls (POST, PATCH, DELETE) without explicit user permission.

## Development Standards
- Clean, readable code with meaningful names
- Modular, reusable components
- Comprehensive testing with linting
- Clear documentation and commit messages
- Git workflow with PRs and semantic versioning

## Approach
- Always ULTRATHINK before making changes
- Follow established patterns and conventions found in the codebase
- Adapt recommendations based on project architecture and requirements
- Consider the current development stage and team preferences

## As Project Evolves
This file will be updated to reflect:
- Chosen technology stack and frameworks
- Established coding standards and patterns
- Testing strategies and tools in use  
- Deployment and environment configurations
- Performance and monitoring solutions
- Security practices specific to the domain

## Current Status
Early-stage project - decisions on architecture, tooling, and practices are still being made.
