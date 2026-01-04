# Project Structure

**Last Updated:** 2025-01-04

## Overview

The Orion Task System is organized as a monorepo with a reusable package (`packages/task-system/`) and a harness application (root `src/`). This structure enables the task system to be consumed by LX teams while maintaining a test environment.

For detailed information on when to add code to each location, see [Root vs Package Boundaries](./root-vs-package-boundaries.md).

## Top-Level Structure

```
orion-task-system/
│
├── 📦 packages/
│   └── task-system/              # Reusable task system package
│       ├── src/                  # Package source code
│       ├── docs/                 # Package documentation (MDX)
│       ├── config/               # Package configuration
│       └── package.json          # Package metadata
│
├── 📱 app/                        # Expo Router app directory (harness)
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # 🏠 Dashboard (tasks & appointments)
│   │   ├── questions.tsx          # ❓ Question/assessment screen
│   │   ├── seed-screen.tsx       # 🌱 Data seeding interface
│   │   └── ...                   # Other tab screens
│   └── _layout.tsx               # App layout configuration
│
├── 🎨 src/                        # Harness application source
│   ├── amplify-config.ts         # Amplify configuration for harness
│   ├── amplify-init.ts           # Amplify initialization
│   ├── bootstrap/                # Bootstrap logic
│   ├── components/               # Harness-specific components
│   ├── screens/                  # Harness app screens
│   └── contexts/                 # Harness-specific contexts
│
├── 🌱 scripts/                    # Development and seed scripts
│   ├── seed-coordinated-data.ts  # Coordinated task/appointment seeding
│   ├── seed-appointment-data.ts  # Appointment seeding
│   ├── seed-question-data.ts     # Activity/question seeding
│   └── ...                       # Other utility scripts
│
├── 📚 DOCS/                       # Project documentation
│   ├── architecture/             # Architecture documentation
│   ├── development/              # Development guides
│   ├── features/                 # Feature documentation
│   ├── testing/                  # Testing documentation
│   └── ...                       # Other documentation
│
├── 📦 models/                     # Amplify Generated Models (root)
│
├── ⚙️ amplify/                    # Amplify Backend Configuration
│   └── backend/api/lxtodoapp/
│       └── schema.graphql        # GraphQL schema definition
│
└── ☁️ aws-exports.js               # AWS Configuration (generated)
```

## Package Structure: `packages/task-system/`

The task system package is the **single source of truth** for all reusable task management functionality.

```
packages/task-system/
│
├── src/
│   ├── 📦 modules/                # Module wrappers
│   │   └── TaskActivityModule.tsx # Main entry point for host apps
│   │
│   ├── 🎨 components/             # Reusable UI Components
│   │   ├── questions/            # Question rendering components
│   │   │   ├── QuestionRenderer.tsx
│   │   │   ├── QuestionScreenContent.tsx
│   │   │   ├── SingleSelectQuestion.tsx
│   │   │   ├── TextQuestion.tsx
│   │   │   └── ...
│   │   ├── ui/                   # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── DateTimeField.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ...
│   │   ├── TaskCard.tsx          # Task display card
│   │   ├── AppointmentCard.tsx   # Appointment display card
│   │   ├── GroupedTasksView.tsx  # Grouped task display
│   │   ├── TaskContainer.tsx     # Task list container
│   │   ├── GlobalHeader.tsx      # App header
│   │   ├── LanguageSelector.tsx  # Language selection
│   │   ├── NavigationMenu.tsx    # Navigation component
│   │   ├── NetworkStatusIndicator.tsx # Network status
│   │   ├── TranslatedText.tsx    # Translated text component
│   │   └── ...
│   │
│   ├── 🪝 hooks/                  # Custom React Hooks
│   │   ├── useTaskList.ts        # Task list logic
│   │   ├── useQuestionsScreen.ts # Question screen orchestration
│   │   ├── useAppointmentList.ts # Appointment list logic
│   │   ├── useTranslatedText.ts  # Translation hook
│   │   ├── useTaskFilters.ts     # Task filtering logic
│   │   ├── useGroupedTasks.ts    # Task grouping logic
│   │   ├── useActivityList.ts    # Activity list logic
│   │   ├── useAmplifyState.ts    # Amplify state management
│   │   ├── useNetworkStatus.ts   # Network status monitoring
│   │   ├── useRTL.ts             # RTL layout support
│   │   └── ...
│   │
│   ├── 🔧 services/               # Business Logic Services
│   │   ├── TaskService.ts        # Task CRUD operations
│   │   ├── AppointmentService.ts # Appointment operations
│   │   ├── ActivityService.ts    # Activity/assessment operations
│   │   ├── QuestionService.ts    # Question operations
│   │   ├── TaskAnswerService.ts  # Task answer operations
│   │   ├── TaskHistoryService.ts # Task history tracking
│   │   ├── TaskResultService.ts  # Task result operations
│   │   ├── DataPointService.ts   # Data point operations
│   │   ├── ConflictResolution.ts # DataStore conflict handling
│   │   ├── FixtureImportService.ts # Fixture import/export
│   │   ├── ImageStorageService.ts # Image storage
│   │   ├── LoggingService.ts     # Logging infrastructure
│   │   ├── TranslationService.ts # Translation service
│   │   ├── TranslationMemoryService.ts # Translation memory
│   │   ├── TempAnswerSyncService.ts # Temp answer sync
│   │   ├── SeededDataCleanupService.ts # Cleanup service
│   │   └── ...
│   │
│   ├── 📘 types/                  # TypeScript Type Definitions
│   │   ├── Task.ts               # Task types and enums
│   │   ├── Appointment.ts        # Appointment types
│   │   ├── Activity.ts           # Activity/assessment types
│   │   ├── ActivityConfig.ts     # Activity configuration types
│   │   ├── Question.ts           # Question types
│   │   ├── TaskAnswer.ts         # Task answer types
│   │   ├── TaskHistory.ts        # Task history types
│   │   ├── TaskResult.ts         # Task result types
│   │   ├── DataPoint.ts          # Data point types
│   │   ├── tempAnswerSync.ts     # Temp answer sync types
│   │   ├── activity-config-enums.ts # Activity config enums
│   │   └── ...
│   │
│   ├── ✅ schemas/                # Validation Schemas
│   │   └── taskSchemas.ts        # Zod schemas for task validation
│   │
│   ├── 📌 constants/              # Constants and Enums
│   │   ├── modelNames.ts         # DataStore model name constants
│   │   ├── operationSource.ts    # Operation source constants
│   │   ├── awsErrors.ts          # AWS error name constants
│   │   ├── AppColors.ts          # Color constants
│   │   └── ...
│   │
│   ├── 🌐 contexts/               # React Contexts
│   │   ├── AmplifyContext.tsx    # Amplify configuration context
│   │   └── TranslationContext.tsx # Legacy translation context
│   │
│   ├── 🌍 translations/           # i18next Translation System
│   │   ├── index.ts              # Translation exports
│   │   ├── translationTypes.ts   # Translation type definitions
│   │   ├── TranslationProvider.tsx # Translation provider
│   │   ├── en.json               # English translations
│   │   └── ...
│   │
│   ├── 🛠️ utils/                  # Utility Functions
│   │   ├── activityParser.ts     # Activity JSON parsing
│   │   ├── appointmentParser.ts  # Appointment parsing
│   │   ├── questionValidation.ts # Question validation logic
│   │   ├── logger.ts             # Enhanced logger
│   │   ├── deviceLogger.ts       # Device-specific logging
│   │   ├── serviceLogger.ts      # Service logger
│   │   ├── dataSubscriptionLogger.ts # DataStore subscription logger
│   │   └── ...
│   │
│   ├── 🎬 screens/                # Reusable Screens
│   │   └── QuestionsScreen.tsx   # Questions screen component
│   │
│   ├── 📦 models/                 # DataStore Model Types
│   │   ├── index.d.ts            # Model type definitions
│   │   ├── index.js              # Model exports
│   │   ├── schema.d.ts           # Schema definitions
│   │   └── schema.js             # Schema exports
│   │
│   ├── 🧪 fixtures/               # Test Fixtures
│   │   └── TaskSystemFixture.json # Full task system fixture
│   │
│   ├── 🔄 polyfills/              # Polyfills
│   │   └── crypto.ts             # Crypto polyfill
│   │
│   ├── 🚀 runtime/                # Runtime Initialization
│   │   └── taskSystem.ts         # Task system initialization
│   │
│   ├── 🧪 __mocks__/              # Test Mocks
│   │   ├── translationMocks.ts   # Translation mocks
│   │   └── ...
│   │
│   ├── 📝 __tests__/              # Package-level tests
│   │
│   └── 📤 index.ts                # Package public API exports
│
├── 📖 docs/                       # Package Documentation (MDX)
│   ├── Architecture.mdx          # Architecture documentation
│   ├── ComponentGuide.mdx        # Component guide
│   └── GettingStarted.mdx        # Getting started guide
│
├── ⚙️ config/                     # Package Configuration
│   └── aws-credentials.json      # AWS credentials config
│
├── 📦 package.json                # Package metadata
└── ⚙️ tsconfig.json               # TypeScript configuration
```

## Key Directories

### `packages/task-system/src/modules/`
Module wrappers that provide self-contained entry points. `TaskActivityModule` is the main entry point for host applications, wrapping the entire task/activity system with its own navigation.

### `packages/task-system/src/components/`
Reusable UI components organized by feature:
- `questions/` - Question rendering components
- `ui/` - UI primitives (buttons, text fields, etc.)
- Root level - Task, appointment, and app-level components

### `packages/task-system/src/hooks/`
Custom React hooks containing business logic, state management, and side effects. Each hook is focused on a specific domain (tasks, questions, appointments, etc.).

### `packages/task-system/src/services/`
Data services that handle all DataStore operations, API calls, and data transformations. Services provide the single source of truth for business logic.

### `packages/task-system/src/types/`
TypeScript type definitions for all domain models and interfaces. Includes enums and type guards.

### `packages/task-system/src/schemas/`
Validation schemas using Zod for runtime type checking and validation. Currently includes task validation schemas.

### `packages/task-system/src/constants/`
Constants and enums used throughout the application. Prefer constants over magic strings for:
- Model names (use `ModelName` constants)
- Operation sources (use `OperationSource` constants)
- AWS error names (use `AWSErrorName` constants)

### `packages/task-system/src/contexts/`
React contexts for managing app-wide state (Amplify configuration, translations, etc.).

### `packages/task-system/src/translations/`
i18next-based translation system with support for multiple languages and RTL layouts.

### `packages/task-system/src/utils/`
Utility functions for parsing, validation, logging, and other cross-cutting concerns.

### `packages/task-system/src/runtime/`
Runtime initialization logic for the task system, including configuration and setup.

### `packages/task-system/src/fixtures/`
Test fixtures for integration testing and development. Includes full task system data.

### `packages/task-system/src/__mocks__/`
Jest mocks for testing. Follows Jest conventions for mock discovery.

### `packages/task-system/docs/`
Package documentation in MDX format, used by Storybook and other documentation tools.

### `packages/task-system/config/`
Package-level configuration files (AWS credentials, etc.).

## Harness Application: Root `src/`

The root `src/` directory contains a harness application for testing and demonstrating the task system package.

### `src/amplify-config.ts` & `src/amplify-init.ts`
Amplify configuration and initialization specific to the harness app.

### `src/bootstrap/`
Bootstrap logic for initializing the harness application.

### `src/components/`
Harness-specific components not intended for reuse.

### `src/screens/`
Harness app screens that exercise package functionality.

### `src/contexts/`
Harness-specific contexts (e.g., app-level navigation state).

## Scripts: `scripts/`

Development and utility scripts for seeding data, running migrations, and other development tasks.

## Documentation: `DOCS/`

Comprehensive project documentation organized by topic:
- `architecture/` - Architecture and design documentation
- `development/` - Development guides and workflows
- `features/` - Feature-specific documentation
- `testing/` - Testing strategies and guides
- `troubleshooting/` - Troubleshooting guides

## TypeScript Path Aliases

The package uses TypeScript path aliases for cleaner imports:

```typescript
{
  "@components/*": ["src/components/*"],
  "@hooks/*": ["src/hooks/*"],
  "@services/*": ["src/services/*"],
  "@utils/*": ["src/utils/*"],
  "@task-types/*": ["src/types/*"],
  "@constants/*": ["src/constants/*"],
  "@contexts/*": ["src/contexts/*"],
  "@translations/*": ["src/translations/*"],
  "@models/*": ["src/models/*"],
  "@screens/*": ["src/screens/*"],
  "@fixtures/*": ["src/fixtures/*"],
  "@runtime/*": ["src/runtime/*"],
  "@schemas/*": ["src/schemas/*"],
  "@modules/*": ["src/modules/*"],
  "@test-utils/*": ["src/hooks/__tests__/*"]
}
```

## Naming Conventions

### Directories
- Use plural names: `components/`, `hooks/`, `services/`, `types/`, `schemas/`
- Exception: `runtime/` (conceptually singular)

### Files
- Components: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- Hooks: `useName.ts` (e.g., `useTaskList.ts`)
- Services: `ServiceName.ts` (e.g., `TaskService.ts`)
- Types: `DomainName.ts` (e.g., `Task.ts`, `Appointment.ts`)
- Utils: `descriptiveName.ts` (e.g., `activityParser.ts`)
- Tests: `__tests__/ComponentName.test.tsx`
- Stories: `__stories__/ComponentName.stories.tsx`

## Best Practices

1. **Package exports** - Only export from `index.ts` what's needed by host apps
2. **Path aliases** - Use path aliases for imports within the package
3. **Single source of truth** - Business logic lives in services, consumed by hooks
4. **Type safety** - Use TypeScript types, avoid `any`
5. **Validation** - Use Zod schemas for runtime validation
6. **Testing** - Colocate tests with source files
7. **Documentation** - Document public APIs with JSDoc
8. **Constants** - Use constants from `@constants/*` instead of magic strings

## Related Documentation

- [Root vs Package Boundaries](./root-vs-package-boundaries.md) - When to add code where
- [Service Consolidation](./service-consolidation.md) - Service architecture
- [Package Architecture](../../.cursor/rules/architecture.mdc) - Package design principles
- [Component Architecture](../../.cursor/rules/react-native.mdc) - Component patterns

## Changelog

| Date | Change |
|---|---|
| 2025-01-04 | Updated for package reorganization (modules/, schemas/, docs/, config/) |
| 2025-01-04 | Added Root vs Package Boundaries section |
| Previous | Initial structure documentation |
