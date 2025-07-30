# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Guidelines

### Code Quality
- **Keep it simple** - KISS principle is paramount
- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Follow language and framework best practices
- Keep code modular and reusable

### Documentation & Comments
- Include comments for complex logic
- Document public APIs and libraries
- Maintain a comprehensive README.md
- Write clear commit messages

### Testing & Validation
- Write unit tests for critical functionality
- Ensure all tests pass before committing
- Test thoroughly before submitting code
- Use a linter for consistent formatting

### Configuration & Security
- Avoid hardcoding values - use config files or environment variables
- Handle errors gracefully with meaningful messages
- Validate and sanitize user input
- Keep security in mind when handling sensitive data

### Development Workflow
- Use Git branches for features and bug fixes
- Submit changes via pull requests
- Review PRs thoroughly with constructive feedback
- Use semantic versioning for releases
- Keep dependencies up to date

### Performance
- Optimize where necessary, but prioritize readability and maintainability

## Project Status

This is a new project with minimal setup. The repository currently contains:
- A basic README.md with just the project name
- A package-lock.json file (suggesting Node.js/npm usage)
- No package.json, source code, or build configuration yet

## Development Setup

Since this appears to be the beginning of a Node.js project:
- Run `npm init` to create a package.json file
- Install dependencies with `npm install`
- No build, test, or lint commands are configured yet

## Architecture

The project structure is not yet established. When adding code:
- Follow standard Node.js project conventions
- Consider creating a `src/` directory for source code
- Add appropriate package.json scripts for common development tasks
