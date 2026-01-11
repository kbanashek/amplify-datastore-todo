# Jira Story Titles - Orion Task System

This document contains all Jira story titles with comprehensive descriptions based on work completed in this repository, organized by epic.

**Format:** Stories are written as requirements (future tense) even though the work has been implemented, so they can be used as implementation specifications.

**Total Stories: 55** (consolidated from 179 original granular items)

---

## OR-26446: [Mobile] Refactor app initialization workflow into service-based architecture with improved observability

**Epic Description:** Replace legacy initialization with modern TypeScript service-oriented architecture delivering 60%+ performance improvement, enhanced observability, and improved maintainability.

### Stories (6)

1. **Implement centralized logging service with multi-provider architecture** - Create LoggingService with Console, Native, and Sentry providers, LogLevel presets, and platform identification

2. **Add platform identification and sequential initialization logging** - Implement iOS/Android/Web detection, sequential step numbering ([INIT-1], [DATA-1]), and icon conventions

3. **Migrate all console logging to centralized LoggingService** - Replace all console.\* calls with centralized service using logWithPlatform utilities

4. **Implement bootstrap workflow with idempotent Amplify configuration** - Create sequential bootstrap with configureAmplify() idempotency and initialization sequence logging

5. **Create LoggingProvider and hooks for React integration** - Implement LoggingProvider context, useLogger hook, and getServiceLogger() for non-React code

6. **Add comprehensive JSDoc documentation to services and hooks** - Document all services, hooks, and infrastructure with @param, @returns, and @example tags

---

## OR-26447: [Mobile] Implement AWS AppSync & DataStore with Realm migration and database creation

**Epic Description:** Set up AWS AppSync GraphQL API and DataStore for offline-first data persistence with automatic cloud synchronization.

### Stories (8)

1. **Implement AWS AppSync and DataStore with offline-first synchronization** - Configure AppSync, enable conflict detection, implement offline-first architecture with automatic sync

2. **Add type-safe constants for DataStore operations** - Create ModelName, OperationSource, and AWSErrorName constants to eliminate string literals

3. **Implement DataStore services for all data models** - Create service classes for Task, Activity, Question, DataPoint, TaskAnswer, TaskHistory, TaskResult, Appointment with CRUD and subscriptions

4. **Implement DataStore conflict resolution strategy** - Configure Auto Merge strategy preserving local status changes (STARTED, INPROGRESS, COMPLETED)

5. **Optimize DataStore synchronization performance** - Reduce sync interval to 1 minute, implement Force Sync, add initial query for immediate data loading

6. **Add DataStore troubleshooting tools and documentation** - Create check-api-key.sh script, enhance error logging, create troubleshooting guide

7. **Implement retry logic for critical DataStore operations** - Add deleteAllTaskAnswersWithRetry() with exponential backoff and up to 3 attempts

8. **Create comprehensive unit test coverage for DataStore services** - Test CRUD, subscriptions, conflicts, error handling with >80% coverage

---

## OR-26451: [Mobile] Create comprehensive task question component library with dynamic rendering system

**Epic Description:** Build complete question component library with dynamic rendering based on study configuration metadata from LX JSON structure.

### Stories (10)

1. **Create shared UI component library primitives** - Implement Button, Card, TextField, LoadingSpinner, FieldLabel, NumericInput, UnitText, DatePicker components

2. **Implement clinical question components** - Create BloodPressureQuestion, TemperatureQuestion, ClinicalDynamicInputQuestion, WeightHeightQuestion, HorizontalVASQuestion

3. **Implement standard question components** - Create SingleSelectQuestion, MultiSelectQuestion, TextQuestion, NumberQuestion, DateQuestion, ImageCaptureQuestion

4. **Implement question validation system** - Build validation for required fields, ranges, patterns with translation support and inline error display

5. **Implement question flow screens** - Create IntroductionScreen, ReviewScreen, CompletionScreen, QuestionHeader, QuestionScreenButtons with RTL support

6. **Build dynamic question rendering system** - Implement QuestionRenderer with type-to-component mapping, value transformers, and error boundaries

7. **Implement activity parser for LX JSON structure** - Parse LX JSON with layouts and activityGroups, match questions to screens, handle POC format

8. **Consolidate question components into @orion/task-system package** - Move components to package, set up proper exports, ensure self-containment

9. **Fix question rendering edge cases and bugs** - Handle unsupported types, fix button visibility, prevent raw unit keys, update completion status

10. **Add comprehensive unit test coverage for questions** - Test rendering, interactions, validation, RTL, edge cases with >80% coverage

---

## OR-26452: Create isolated AWS Amplify environments for each developer

**Epic Description:** Enable each developer to have isolated AWS Amplify backend environment for independent development and testing.

### Stories (10)

1. **Create Amplify backend automation scripts** - Build setup-amplify-backend.sh with fresh/refresh modes, schema backup/restore, auto-push capability

2. **Implement CloudFormation stack management tools** - Create fix-stack.sh for stuck stacks, fresh-start.sh for cleanup, add conflict detection

3. **Create minimal IAM policy documentation** - Document required permissions for CloudFormation, AppSync, S3, IAM with minimal-policy-final.json template

4. **Fix native build issues across iOS and Android** - Resolve iOS duplicate symbols, Android crashes, create apply-native-fixes.sh script

5. **Fix dependency resolution and npm registry configuration** - Update .npmrc for public npm registry, remove CodeArtifact requirements, fix workspace resolution

6. **Create version management and validation scripts** - Implement version-bump.sh with commit message validation and automatic CHANGELOG updates

7. **Implement pre-commit hooks for code quality** - Add yarn integrity, lint, format, circular dependency, TypeScript, and docstring checks

8. **Implement pre-push hooks with comprehensive testing** - Run full test suite with memory optimization, block push on failures

9. **Create GitHub Actions workflows for PR validation** - Implement pr-checks.yml with parallel lint/test jobs, coverage reporting, PR comments

10. **Fix Expo SDK dependency mismatches** - Resolve expo-doctor issues, update packages to SDK 53, fix workspace conflicts

---

## OR-26453: [Mobile] Implement rule engine system to evaluate and enforce task and activity rules

**Epic Description:** Build rule engine for task visibility, scheduling, and appointment relationships with anchor-based date calculations.

### Stories (10)

1. **Implement coordinated seeding system for task-appointment relationships** - Design anchor-based model linking tasks to appointments with anchorDayOffset scheduling

2. **Create seed-coordinated-data.ts script** - Generate coordinated test data with pre-visit, visit-day, and post-visit task categories

3. **Add rule logic documentation and testing guide** - Document rule engine logic, anchor-based scheduling, and testing procedures

4. **Implement Dev Options screen with seed/sync/delete operations** - Create dev tools UI with useDevOptions hook for data management

5. **Implement fixture import workflow with data management** - Add pruneNonFixture, dedupe by pk, pruneDerivedModels functionality

6. **Add Nuclear reset functionality with comprehensive delete methods** - Implement deleteAll for TaskAnswer, TaskResult, TaskHistory, clear cache/outbox

7. **Implement appointment seeding with timezone awareness** - Generate appointments with AsyncStorage persistence and timezone-aware display

8. **Fix appointment filtering and display logic** - Resolve date comparison issues, extract timezone utilities, add comprehensive logging

9. **Update task visibility rules for started tasks** - Modify useGroupedTasks to show STARTED tasks regardless of expiration

10. **Add regression tests for rule engine functionality** - Test scheduling calculations, visibility rules, date handling with edge cases

---

## OR-26455: Implement comprehensive user engagement tracking with AWS Pinpoint and Kinesis Firehose

**Epic Description:** Build temporary answer synchronization system with offline support for user engagement tracking.

### Stories (4)

1. **Implement TempAnswerSyncService with offline storage** - Create service with AsyncStorage outbox, enqueue/flush/retry operations, dedupe by task.pk

2. **Implement NetInfo auto-flush for connectivity-based sync** - Add automatic sync trigger on network state changes from offline to online

3. **Create temp-answer adapter types and package exports** - Design TaskSystemGraphQLExecutor and TaskSystemSaveTempAnswersMapper adapters, export from package

4. **Wire temp-answer enqueue to navigation boundaries** - Integrate temp answer saving on Next/Previous/Review navigation with dedupe logic

---

## OR-26456: [Mobile] Ensure all components support translations and RTL rendering

**Epic Description:** Add comprehensive translation and RTL support across all components with Ubuntu font system for consistent typography.

### Stories (7)

1. **Implement TranslationMemoryService with bundled seeds** - Create service with AsyncStorage backend, bundled en→es translations, and fallback logic

2. **Add translation support across all components** - Translate TaskCard, IntroductionScreen, validation messages, questions with useTranslatedText hook

3. **Remove package-to-host translation coupling** - Decouple translation system for package self-containment while allowing host overrides

4. **Implement RTL support system with useRTL hook** - Create hook for RTL detection, add RTL-aware styling to all components, flip layouts appropriately

5. **Implement standardized Ubuntu font system** - Add 12 Ubuntu fonts, create AppFonts.ts with 11 styles, implement platform-aware fontUtils

6. **Migrate components to centralized AppFonts system** - Replace 50+ components' hardcoded fonts with AppFonts, eliminate all hardcoded values

7. **Implement LanguageSelector and translation testing components** - Create UI for language switching with persistence and TranslationTest for developers

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

## Using the Automation Script

### Prerequisites

Set these environment variables:

```bash
export JIRA_BASE_URL="https://clinicalink.atlassian.net"
export JIRA_EMAIL="your-email@clinicalink.com"
export JIRA_API_TOKEN="your-api-token"  # Generate at https://id.atlassian.com/manage-profile/security/api-tokens
export JIRA_PROJECT_KEY="OR"  # Project key
```

### Commands

```bash
# Dry run (preview what would be created)
yarn ts-node scripts/create-jira-stories.ts --dry-run

# Create all stories
yarn ts-node scripts/create-jira-stories.ts

# Create stories for specific epic
yarn ts-node scripts/create-jira-stories.ts --epic=OR-26446
```

---

## Notes

- **Story Format:** All stories written as requirements/specifications even though work is complete
- **Consolidation:** 55 comprehensive stories consolidated from 179 granular items (69% reduction)
- **Descriptions:** Each story includes detailed Requirements and Acceptance Criteria sections
- **Epic Organization:** Stories grouped by epic based on primary feature area
- **Data Source:** All stories derived from CHANGELOG.md versions 0.1.0 through 0.1.30

---

## Story Structure

Each story in `jira-stories.json` includes:

- **title**: Concise story title in imperative mood
- **description**: Comprehensive description with:
  - Overview paragraph
  - **Requirements** section with bulleted list
  - **Acceptance Criteria** section with measurable outcomes

This structure ensures each Jira story provides complete implementation guidance without revealing the work is already done.
