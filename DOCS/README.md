# Documentation Index

This directory contains comprehensive documentation for the Orion Task System project, organized by category.

## 📁 Directory Structure

### Architecture (`architecture/`)

Documentation about system architecture, components, and services:

- **[AWS Architecture](architecture/aws-architecture.md)** - AWS services, data flow, and conflict resolution
- **[Component Library](architecture/component-library.md)** - Component library structure, principles, and roadmap
- **[Project Structure](architecture/project-structure.md)** - Detailed directory structure and organization
- **[Service Consolidation](architecture/service-consolidation.md)** - Service organization and consolidation summary
- **[Component Consolidation](architecture/component-consolidation-summary.md)** - Component consolidation summary

### Development (`development/`)

Development guidelines, testing, and setup documentation:

- **[Development Guidelines](development/development-guidelines.md)** - Coding standards, testing requirements, and best practices
- **[Testing Guide](development/testing.md)** - Unit test requirements, coverage, and examples
- **[Coverage Setup](development/coverage-setup.md)** - GitHub Actions coverage reporting and Codecov setup
- **[Logging Service](development/logging-service.md)** - Centralized logging service documentation
- **[Testing Coordinated Seeding](development/testing-coordinated-seeding.md)** - Testing guide for coordinated seeding feature
- **[Testing Sync](development/testing-sync.md)** - Testing guide for sync functionality

### Features (`features/`)

Feature-specific documentation and implementation details:

- **[Implementation Status](features/implementation-status.md)** - Current feature implementation status
- **[Task System Package](features/task-system-package.md)** - Task system package (LX Integration) documentation
- **[Task System Fixture and Hydration](features/task-system-fixture-and-hydration.md)** - Fixture generation and data hydration
- **[Translation Memory](features/translation-memory.md)** - Translation service and memory management
- **[Analytics Implementation](features/analytics-implementation.md)** - User engagement analytics implementation plan
- **[Temp Answer GraphQL Mutation](features/temp-answer-graphql-mutation.md)** - Temporary answer mutation details

### Troubleshooting (`troubleshooting/`)

Troubleshooting guides and fixes:

- **[Native Build Fixes](troubleshooting/native-build-fixes.md)** - Required fixes for iOS and Android native builds
- **[Troubleshooting Unauthorized](troubleshooting/troubleshooting-unauthorized.md)** - AWS authentication issues

### Planning (`planning/`)

Roadmaps, todos, and planning documents:

- **[Roadmap](planning/roadmap.md)** - Future development priorities and planned features
- **[Todos](planning/todos.md)** - Comprehensive task list and future work
- **[Current Rule Logic](planning/current-rule-logic.md)** - Current rule implementation status

## 📚 Quick Reference

### Getting Started

- [Project Structure](architecture/project-structure.md)
- [Development Guidelines](development/development-guidelines.md)
- [Testing Guide](development/testing.md)

### Architecture

- [AWS Architecture](architecture/aws-architecture.md)
- [Component Library](architecture/component-library.md)
- [Service Consolidation](architecture/service-consolidation.md)

### Features

- [Implementation Status](features/implementation-status.md)
- [Task System Package](features/task-system-package.md)

### Development Tools

- [Logging Service](development/logging-service.md)
- [Coverage Setup](development/coverage-setup.md)

### Troubleshooting

- [Native Build Fixes](troubleshooting/native-build-fixes.md)
- [Troubleshooting Unauthorized](troubleshooting/troubleshooting-unauthorized.md)

## 🔍 Finding Documentation

- **Architecture questions?** → Check `architecture/`
- **Development setup?** → Check `development/`
- **Feature details?** → Check `features/`
- **Having issues?** → Check `troubleshooting/`
- **Planning work?** → Check `planning/`

## 📝 Contributing

When adding new documentation:

1. Place files in the appropriate subdirectory
2. Update this README with a link to the new document
3. Follow existing documentation patterns and formatting
4. Include mermaid diagrams for complex concepts
5. Keep documentation concise and focused
