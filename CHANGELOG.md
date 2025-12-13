# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-12-12

### Added
- Comprehensive README with architecture documentation and component library roadmap
- Component library structure documentation with base UI, question, domain, and layout components
- Component library development standards and roadmap (high/medium priority components)
- Unit test coverage requirements documentation with mandatory testing guidelines
- Mermaid architecture diagrams for component architecture and AWS architecture
- Distinction between container components (with logic) and pure presentation components

### Changed
- Enhanced README with visual improvements, badges, and better organization
- Updated README to reflect current architecture, functionality, and future work
- Improved component architecture documentation with clear layer separation
- Added translation support to TaskCard, IntroductionScreen, and validation messages
- Centralized task status update logic in useQuestionsScreen hook
- Made IntroductionScreen a pure presentation component

### Fixed
- Fixed RESUME button not appearing by ensuring proper task status handling
- Fixed translation issues in TaskCard, IntroductionScreen, and validation messages
- Improved component architecture clarity with container vs presentation distinction

## [0.1.2] - 2025-12-12

### Added
- Coordinated appointment and task seeding system (`scripts/seed-coordinated-data.ts`)
- Task-appointment relationship linking via `anchors` field with `eventId` references
- Pre-visit, visit-day, and post-visit task categories linked to appointments
- Anchor-based task scheduling with `anchorDayOffset` support
- Comprehensive rule engine implementation plan in `DOCS/todos.md`
- Testing guide for coordinated seeding (`DOCS/testing-coordinated-seeding.md`)
- Current rule logic documentation (`DOCS/current-rule-logic.md`)

### Changed
- Updated seed screen to support coordinated seeding with new button and result display
- Enhanced seed screen text to explain dynamic appointment creation
- Improved TypeScript configuration to support dynamic imports (`module: esnext`)

### Fixed
- Fixed TypeScript module configuration for dynamic imports
- Fixed markdown linting issues in documentation files

## [0.1.1] - 2025-01-13

### Added
- Appointment seeding functionality with seed script (`scripts/seed-appointment-data.ts`)
- Appointment seed results display on seed screen
- AsyncStorage persistence for seeded appointments
- Comprehensive logging for appointment loading and filtering
- Support for displaying appointments even when no tasks exist for today
- Appointment date filtering improvements with better timezone handling

### Fixed
- Reduced spacing between day groups on dashboard (from 32px to 4px)
- Fixed appointment date filtering to properly compare date parts
- Fixed appointment rendering when tasks exist for today
- Fixed TypeScript errors in GlobalHeader (rtlStyle type assertions)
- Fixed missing `deleteAllTasks` method in TaskService
- Fixed AppColors.background reference (changed to AppColors.powderGray)
- Fixed seed data screen navigation menu entry
- Fixed appointment JSON generation and loading flow

### Changed
- Improved appointment date comparison logic to handle timezone differences
- Enhanced appointment service logging for better debugging
- Updated seed screen to show appointment seeding results similar to task/activity results

## [0.1.0] - Initial Release

### Added
- Initial project setup with AWS Amplify DataStore
- Task management functionality
- Question rendering system
- Appointment display functionality
- Seed data functionality for tasks and activities

