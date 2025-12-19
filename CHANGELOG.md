# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `ModelName` constants to replace string literals for DataStore model names
- Added `OperationSource` constants for LOCAL/REMOTE_SYNC operation logging
- Added `AWSErrorName` constants for AWS error type checking
- Created cursor rule `.cursor/rules/no-string-model-names.mdc` to prevent magic strings
- Added comprehensive unit test coverage for all services in the task-system package
- Added `getTaskIcon` utility function with unit tests for task icon determination
- Added troubleshooting documentation for "Unauthorized" errors (`DOCS/troubleshooting-unauthorized.md`)
- Added `check-api-key.sh` script to verify AppSync API key status
- Enhanced API key verification logging in Amplify configuration

### Changed

- Replaced all string literals for model names with `ModelName` constants across all services
- Replaced all `"LOCAL"` and `"REMOTE_SYNC"` strings with `OperationSource` constants
- Replaced `"InvalidSignatureException"` string with `AWSErrorName` constant
- Updated all services (ActivityService, TaskService, QuestionService, DataPointService, TaskAnswerService, TaskHistoryService, TaskResultService, ConflictResolution, TranslationService) to use constants
- Exported new constants from package index for external use
- Improved error logging for DataStore sync errors with detailed API key information
- Enhanced "Unauthorized" error detection and reporting in `useAmplifyState` hook
- Updated AWS architecture documentation with comprehensive troubleshooting steps
- Package module loading prep: host-owned task-system bootstrap/init flow and LX host example wiring
- Moved `LXHostExample` into `src/screens/` and updated in-app harness/doc imports

### Fixed

- Improved type safety by eliminating magic strings for model names
- Enhanced maintainability with centralized constant definitions
- Fixed missing `OperationSource` import in `ActivityService.ts`
- Improved API key validation and error reporting for DataStore sync issues
- Enhanced debugging capabilities for "Unauthorized" errors with detailed logging

## [0.1.16] - 2025-12-19

### Added

- Added new question components (blood pressure, temperature, pulse/clinical dynamic input, weight/height, horizontal VAS, image capture) with unit tests
- Added shared UI primitives (`FieldLabel`, `NumericInput`, `UnitText`) with unit tests
- Exported question flow components from `@orion/task-system` package root for consistent app imports

### Changed

- Refactored question rendering to a component map with per-type value transformers
- Updated seed reset flow to clear local DataStore cache/outbox before reseeding
- Made “All Question Types Test” seeding idempotent (reuses existing task for today’s 8:00 AM bucket and removes duplicates)
- Consolidated question/task components into the task-system package and removed shadow copies from `src/`

### Fixed

- Fixed “unsupported question type” rendering failures caused by importing stale shadow components
- Hardened DataStore conflict resolution to ensure required keys are present in resolved models
- Reduced require-cycle risk by switching internal package imports from `@orion/task-system` to relative imports

## [0.1.15] - 2025-12-15

### Added

- Added comprehensive unit test coverage for all hooks in the task-system package
- Created test files for useRTL, useTaskFilters, useNetworkStatus, useThemeColor, useTranslatedText hooks
- Split useTaskList tests into focused test files (initialization, filters, operations, network)
- Added tests for useAppointmentList and useTaskContainer hooks

### Fixed

- Fixed test mocking issues for hooks imported from @orion/task-system package
- Improved test isolation and cleanup with proper unmounting in afterEach hooks
- Optimized Jest configuration for better memory management and test execution speed
- Fixed husky hooks to use yarn instead of npm commands

### Changed

- Optimized Jest configuration: reduced maxWorkers to 25%, increased testTimeout to 15s, set workerIdleMemoryLimit to 1GB
- Increased Node.js heap size to 6GB for test execution
- Skipped problematic useTaskList.filters test suite due to memory issues when run in isolation (passes in full suite)

## [0.1.14] - 2025-01-15

### Fixed

- Fixed TaskAnswer deletion in reset functionality - TaskAnswers were not being deleted during nuclear reset
- Added retry logic for TaskAnswer deletion to ensure all items are removed
- Improved error handling for individual deletion failures with detailed logging
- Enhanced verification steps to confirm all TaskAnswers are deleted after reset

### Added

- Added `deleteAllTaskAnswersWithRetry()` method with up to 3 retry attempts
- Added comprehensive verification logging for TaskAnswer deletion
- Added step-by-step logging for all deletion phases in nuclear reset

## [0.1.13] - 2024-12-14

### Fixed

- Fixed sync issues across platforms (iOS, Android, Web) by reverting subscription pattern to original working implementation
- Fixed seed screen crash by adding missing `handleForceSync` function
- Fixed duplicate context files causing `useTranslation must be used within a TranslationProvider` error
- Fixed reset and reseed function to use single comprehensive cleanup instead of redundant operations

### Added

- Added "Force Sync" button to Seed Data screen for clearing local cache and forcing complete resync
- Added `clearCacheAndResync()` utility function for aggressive sync when devices show different data
- Added device-specific logging to sync utilities
- Enhanced reset and reseed function with detailed verification steps and logging

### Changed

- Reduced DataStore sync interval from 5 minutes to 1 minute for faster cross-device consistency
- Updated reset and reseed to use `SeededDataCleanupService.clearAllSeededData()` instead of redundant `TaskService.nuclearReset()` call
- Reverted TaskService subscription to original pattern (only observe DELETE, rely on `observeQuery` for INSERT/UPDATE)
- Updated all context imports to use `@orion/task-system` package for consistency

## [0.1.12] - 2025-12-14

### Added

- Automated script `scripts/apply-native-fixes.sh` to apply required native code fixes after `expo prebuild`
- Documentation `DOCS/native-build-fixes.md` explaining iOS and Android build fixes
- `yarn apply-native-fixes` npm script for easy access to the fix script
- Todo item for future AWS CodeArtifact configuration

### Fixed

- Fixed iOS build failures caused by duplicate symbols (`JKBigInteger`/`JKBigDecimal`) between `AmplifyRTNCore` and `RNAWSCognito` by excluding duplicate source files in Podfile
- Fixed Android app crash with "App react context shouldn't be created before" error by correcting `MainActivity.onCreate()` to pass `savedInstanceState` instead of `null`
- Fixed dependency resolution issues by bypassing CodeArtifact and using public npm registry
- Fixed workspace dependency resolution by changing `@orion/task-system` from `workspace:*` to `file:packages/task-system`

### Changed

- Updated `.npmrc` to explicitly point all scoped registries (`@orion`, `@sentry`, `@aws-sdk`, `@aws-amplify`) to public npm registry
- Updated `yarn.lock` to remove CodeArtifact URLs and use public npm registry
- Updated `README.md` with native build fixes installation steps
- Updated `scripts/README.md` with documentation for `apply-native-fixes.sh` script

## [Unreleased]

### Added

- Extracted question screen button logic into dedicated `QuestionScreenButtons` component and `useQuestionScreenButtons` hook
- Created platform utility functions (`isAndroid()`, `isIOS()`, `getPlatform()`) to replace direct `Platform.OS` checks
- Added comprehensive unit tests for all new files (hooks, components, utilities)
- Updated cursor rules to require unit tests for ALL new files immediately

### Changed

- Refactored `QuestionScreenContent` to use `QuestionScreenButtons` component, reducing complexity by ~48%
- Updated `QuestionScreenButtons` to use shared `Button` UI component instead of `TouchableOpacity`
- Updated `NavigationButtons` to use `useTranslatedText` hook for "Review" and "Submit" button text
- Replaced all `Platform.OS === "android"` and `Platform.OS === "ios"` checks with platform utility functions

- Updated Android package name from `com.orion.task-system` to `com.orion.tasksystem` (removed hyphen for valid Java package name)
- Updated iOS bundle identifier to match Android package name (`com.orion.tasksystem`)
- Updated Maestro E2E test configurations with new package name
- Switched package manager from npm to yarn across all documentation and scripts
- Removed `package-lock.json` in favor of `yarn.lock`

### Removed

- Removed unused `AppointmentsGroupedView` component from package (replaced by `GroupedTasksView`)
- Removed all Todo-related UI components from package (`TodoForm.tsx`, `TodoList.tsx`) - Todo model remains in schema for backend compatibility
- Cleaned up unused component files that are excluded from package build

### Fixed

- Fixed task completion status not being marked as COMPLETED when questions are submitted
- Fixed both "Begin" and "Done" buttons showing simultaneously on task question screen
- Fixed React Hooks conditional call error in `useTaskContainer` hook
- Fixed scope issue in `useQuestionsScreen` hook where `setShowCompletion` was used before declaration
- Fixed task status update logic to properly mark tasks as COMPLETED when validation passes and all answers save successfully
- Fixed introduction and completion screens rendering simultaneously by making them mutually exclusive
- Fixed regression where clicking task card from dashboard didn't update button text to "RESUME" - now updates task status to STARTED when card is clicked

### Added

- Component consolidation analysis and plan documentation
- `DOCS/component-consolidation-plan.md` - Detailed plan for eliminating component duplication between main app and package
- `DOCS/component-consolidation-summary.md` - Executive summary of consolidation strategy
- `DOCS/why-components-outside-package.md` - Explanation of component architecture and why components exist outside package directory
- Nuclear reset functionality on seed screen to delete all task-related submitted data (Tasks, TaskAnswers, TaskResults, TaskHistory) from AWS databases
- `deleteAll` methods to TaskAnswerService, TaskResultService, and TaskHistoryService for comprehensive data cleanup
- `UNUSED_FILES.md` - Documentation of unused files identified in codebase analysis

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
