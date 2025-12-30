# Jira Story Titles - Orion Task System

This document contains all Jira story titles generated from the completed work in this repository, organized by epic.

**Total Stories: 55** (consolidated from 179 original stories)

---

## OR-26446: [Mobile] Refactor app initialization workflow into service-based architecture with improved observability

- Implement centralized logging service with multi-provider architecture (Console, Native, Sentry)
- Add platform identification and sequential initialization logging across all components
- Migrate all console logging to centralized LoggingService with proper formatting
- Implement bootstrap workflow with idempotent Amplify configuration
- Create LoggingProvider, useLogger hook, and service logger helpers for package-level logging
- Add comprehensive JSDoc documentation to all services and hooks

**Total Stories: 6**

---

## OR-26447: [Mobile] Implement AWS AppSync & DataStore with Realm migration and database creation

- Implement AWS AppSync and DataStore with offline-first synchronization and GraphQL schema
- Add type-safe constants for ModelName, OperationSource, and AWSErrorName
- Implement DataStore services for all models (Task, Activity, Question, DataPoint, TaskAnswer, TaskHistory, TaskResult, Appointment)
- Implement DataStore conflict resolution with Auto Merge strategy preserving local status changes
- Optimize DataStore sync with 1-minute intervals, force sync, and initial query pattern
- Add troubleshooting documentation and check-api-key.sh script for AppSync debugging
- Implement retry logic for TaskAnswer deletion and sync error handling
- Create comprehensive unit test coverage for all DataStore services

**Total Stories: 8**

---

## OR-26451: [Mobile] Create comprehensive task question component library with dynamic rendering system based on study configuration metadata

- Create shared UI component library (Button, Card, TextField, LoadingSpinner, FieldLabel, NumericInput, UnitText, DatePicker)
- Implement clinical question components (Blood Pressure, Temperature, Pulse, Weight/Height, HorizontalVAS)
- Implement standard question components (SingleSelect, MultiSelect, Text, Number, Date, Image Capture)
- Implement question validation system with translation and error message support
- Implement question flow screens (IntroductionScreen, ReviewScreen, CompletionScreen, QuestionHeader, QuestionScreenButtons)
- Build dynamic question rendering system with component map and value transformers
- Implement activity parser for LX JSON structure with layout and activityGroups support
- Consolidate question/task components into @orion/task-system package with proper exports
- Fix question rendering issues (unsupported types, camelCase types, raw unit keys, screen state conflicts)
- Add comprehensive unit test coverage for all question components and UI primitives

**Total Stories: 10**

---

## OR-26452: Create isolated AWS Amplify environments for each developer

- Create Amplify backend automation scripts (setup, fresh mode, refresh mode, schema backup/restore, auto-push)
- Implement CloudFormation stack management (conflict detection, fix-stack.sh, fresh-start.sh)
- Create minimal IAM policy for Amplify operations with permissions documentation
- Fix native build issues (iOS duplicate symbols, Android app crash, post-prebuild fixes)
- Fix dependency resolution by bypassing CodeArtifact and using public npm registry
- Create version-bump.sh script for automated versioning with commit message validation
- Implement pre-commit hooks for code quality (lint, format, circular dependencies, yarn integrity, TypeScript)
- Implement pre-push hooks for comprehensive testing with memory optimization
- Create GitHub Actions workflows for PR checks (unit tests, coverage reporting, PR comments)
- Fix Expo SDK 53 dependency mismatches and workspace dependency resolution

**Total Stories: 10**

---

## OR-26453: [Mobile] Implement rule engine system to evaluate and enforce task and activity rules

- Implement coordinated seeding system for task-appointment relationships with anchor-based scheduling
- Create seed-coordinated-data.ts script with pre-visit, visit-day, and post-visit task categories
- Add rule logic documentation and testing guide for coordinated seeding
- Implement Dev Options screen with useDevOptions hook for seed/sync/delete operations
- Implement fixture import workflow with pruneNonFixture, dedupe by pk, and pruneDerivedModels
- Add Nuclear reset functionality with deleteAll methods for all task-related data
- Implement appointment seeding with AsyncStorage persistence and timezone awareness
- Fix appointment filtering and display with proper date comparison and timezone formatting
- Update useGroupedTasks to show STARTED tasks regardless of expiration
- Add comprehensive logging and regression tests for rule engine functionality

**Total Stories: 10**

---

## OR-26455: Implement comprehensive user engagement tracking with AWS Pinpoint and Kinesis Firehose

- Implement TempAnswerSyncService with AsyncStorage outbox for offline temp answer storage
- Implement NetInfo auto-flush for connectivity-based synchronization
- Create temp-answer adapter types and export from @orion/task-system package
- Wire temp-answer enqueue to navigation boundaries with dedupe by task.pk

**Total Stories: 4**

---

## OR-26456: [Mobile] Ensure all components support translations and RTL rendering with integration of existing LX translation files

- Implement TranslationMemoryService with AsyncStorage backend and bundled seed translations
- Add translation support across all components (TaskCard, IntroductionScreen, validation messages, questions)
- Create useTranslatedText hook and remove package-to-host translation coupling
- Implement RTL support system with useRTL hook and RTL-aware styling for all components
- Implement standardized Ubuntu font system with 11 pre-configured styles and platform-aware resolution
- Migrate 50+ components to use centralized AppFonts system and eliminate hardcoded font values
- Implement LanguageSelector component with language switching and TranslationTest component

**Total Stories: 7**

---

## Summary by Epic

| Epic      | Title                                                           | Stories |
| --------- | --------------------------------------------------------------- | ------- |
| OR-26446  | Service-based architecture with improved observability          | 6       |
| OR-26447  | AWS AppSync & DataStore with Realm migration                    | 8       |
| OR-26451  | Task question component library with dynamic rendering          | 10      |
| OR-26452  | Isolated AWS Amplify environments for developers                | 10      |
| OR-26453  | Rule engine system for task and activity rules                  | 10      |
| OR-26455  | User engagement tracking with AWS Pinpoint and Kinesis Firehose | 4       |
| OR-26456  | Translation and RTL rendering support                           | 7       |
| **Total** |                                                                 | **55**  |

---

## Notes

- Stories were consolidated from 179 original stories to 55 stories (69% reduction)
- Related incremental work was grouped into comprehensive stories
- Service implementations were grouped by model category
- Component implementations were grouped by functional area
- Testing stories were integrated into their respective feature stories
- Bug fixes and improvements were consolidated into their feature areas
