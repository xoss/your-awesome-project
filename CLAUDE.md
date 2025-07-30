# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Guidelines

## Considerations
- Always re-evaluate my considerations and adhere strictly to the principles outlined in claude.md 
- Follow the principles of good software design and development
- Prioritize maintainability, readability, and performance
- Keep security and privacy in mind at all times
- Ensure code is modular and reusable
- Use version control effectively
- Write tests to validate functionality
- Document code and architecture clearly
- Use consistent coding styles and conventions

### Code Quality
- **Keep it simple** - KISS principle is paramount
- Always ULTRATHINK
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
- Implement robust input validation and sanitization techniques
- Use encryption for sensitive data at rest and in transit
- Regularly update and patch dependencies to address security vulnerabilities

### Development Workflow
- Use Git branches for features and bug fixes
- Submit changes via pull requests
- Review PRs thoroughly with constructive feedback
- Use semantic versioning for releases
- Keep dependencies up to date

### Performance
- Optimize where necessary, but prioritize readability and maintainability
- Implement caching strategies for expensive operations
- Use lazy loading and asynchronous processing where appropriate
- Profile and monitor application performance regularly
- Implement efficient data structures and algorithms
- Use connection pooling for database and external service connections
- Minimize unnecessary computations and reduce time complexity
- Consider using memoization for repeated expensive computations

### Redundancy & Reliability
- Implement retry mechanisms for network and external service calls
- Use circuit breakers to prevent cascading failures
- Design with fault tolerance in mind
- Implement proper error handling and graceful degradation
- Use distributed systems patterns for improved reliability
- Implement health checks and self-healing mechanisms
- Design stateless components to improve scalability
- Use load balancing to distribute traffic and reduce single points of failure

### Monitoring & Logging
- Implement comprehensive logging with different severity levels
- Use structured logging for easier parsing and analysis
- Add correlation IDs for tracing requests across services
- Set up centralized logging and monitoring solutions
- Include contextual information in logs for easier debugging
- Monitor key performance metrics and set up alerting
- Implement distributed tracing for microservices
- Use log rotation and retention policies
- Set up real-time monitoring and anomaly detection
- Create dashboards for visualizing system health and performance
- Implement automated alerting for critical issues

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