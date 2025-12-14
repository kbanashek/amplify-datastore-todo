# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Component consolidation analysis and plan documentation
- `DOCS/component-consolidation-plan.md` - Detailed plan for eliminating component duplication between main app and package
- `DOCS/component-consolidation-summary.md` - Executive summary of consolidation strategy
- `DOCS/why-components-outside-package.md` - Explanation of component architecture and why components exist outside package directory

## [0.1.8] - 2025-12-13

### Added

- Base UI library primitives in `components/ui/`: `Button`, `Card`, `TextField`, `LoadingSpinner`
- Unit tests for UI primitives in `src/components/__tests__/ui-*.test.tsx`
- Testing devDependencies: `jest`, `jest-expo`, `@testing-library/react-native`, `react-test-renderer`, `@types/jest`

## [0.1.9] - 2025-12-13

### Added

- UI library date pickers: `components/ui/DatePicker`, `components/ui/DateTimePicker` (+ shared `DateTimeField`)
- Seeded activity questions for date + datetime in `scripts/seed-question-data.ts`
- Translation memory layer with bundled seeds (`src/translations/`) and `TranslationMemoryService` (AsyncStorage-backed)
- Translation memory documentation: `DOCS/translation-memory.md`

### Changed

- `DateQuestion` now uses the UI library `DateTimeField` wrapper around the native picker

### Fixed

- Prevent rendering raw `uniti18nKey` values by mapping units to display labels in `NumberQuestion`

## [0.1.10] - 2025-12-13

### Added

- Workspace npm package `@orion/task-system` (`packages/task-system`) exporting `TaskActivityModule` for drop-in task/activity flow reuse
- Package documentation: `DOCS/task-system-package.md`

### Changed

- Dashboard now renders the task/activity flow via `@orion/task-system` instead of local task components

## [0.1.11] - 2025-12-13

### Fixed

- Make `@orion/task-system` consumable by host apps by removing `@/` path-alias imports from emitted build output
- Fix iOS host bundling by removing runtime dependency on `expo-symbols` in `IconSymbol.ios`
- Fix Android scrolling by making the grouped tasks view scrollable
- Ensure re-tapping / refocusing the Tasks tab resets the embedded module back to its dashboard

### Changed

- Add required host dependency metadata for slider-based questions (`@react-native-community/slider`)
- Add `expo-random` + `react-native-get-random-values` to support secure random generation in the dev client runtime

## [0.1.7] - 2025-12-13

### Added

- Extracted timezone abbreviation formatting logic to `getTimezoneAbbreviation` utility function in `src/utils/appointmentParser.ts`
- Added comprehensive unit tests for `getTimezoneAbbreviation` function

### Changed

- Refactored `app/(tabs)/appointment-details.tsx` to use `getTimezoneAbbreviation` utility instead of inline formatting logic
- Refactored `src/components/AppointmentCard.tsx` to use `getTimezoneAbbreviation` utility instead of inline formatting logic
- Fixed potential runtime error in timezone abbreviation extraction by adding proper optional chaining

## [0.1.6] - 2025-12-13

### Added

- Husky pre-push hooks for code quality checks
- Pre-push hook runs lint, format check, and circular dependency detection
- GitHub Actions workflow for running unit tests on pull requests
- Prettier configuration for consistent code formatting
- Circular dependency detection using madge
- Enhanced error message rendering with translation support for validation messages
- Translation support for input placeholders in TextQuestion and NumberQuestion components

### Changed

- Fixed React Hooks violation by extracting ErrorMessage component from map loop
- Improved error message styling and visibility

## [0.1.5] - 2025-12-13

### Changed

- Enhanced tech stack section in README with visual tables, emojis, and "Why We Use It" explanations
- Improved tech stack presentation for better readability and engagement

## [0.1.4] - 2025-12-13

### Added

- Tech stack section to README with frontend, backend, development tools, and data storage technologies
- CMP cursor command for automated commit, merge, push workflow with flexible username support

### Changed

- Updated CMP command to support dynamic username detection instead of hardcoded username
- Improved CMP command documentation for better clarity

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
