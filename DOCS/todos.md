# Project Todos

## CI/CD and Testing

### Ephemeral Developer Environments

**Status:** 📝 To Do - Feasibility Study

**Overview:**
Create isolated, temporary AWS Amplify environments for each developer to enable parallel development without conflicts, easier testing, and safer experimentation.

📖 **For detailed information**, see [Ephemeral Developer Environments](ephemeral-environments.md)

**Quick Summary:**

- Each developer gets their own isolated AWS Amplify environment (e.g., `dev-kyle`, `dev-alice`)
- Estimated cost: ~$5-15/month per active environment
- Benefits: Isolation, parallel development, easier testing, faster onboarding, cost control
- Implementation: Scripts for create/destroy/list/switch environments, CI/CD integration
- Workflow: Create environment → Develop → Test → Destroy when done

**Next Steps:**

- [ ] Research Amplify environment management best practices
- [ ] Create proof-of-concept script for environment creation
- [ ] Test environment creation/destruction workflow
- [ ] Document AWS permissions required
- [ ] Estimate costs and set up monitoring
- [ ] Create developer onboarding guide
- [ ] Integrate with CI/CD for PR environments
- [ ] Set up automatic cleanup of stale environments

### AWS Credentials in CI/CD

**Status:** ⚠️ Partial Implementation

**Current State:**

- GitHub Actions workflow configured for PR tests
- Tests that require AWS credentials are currently skipped in CI
- Tests requiring AWS services (TranslationService, DataStore, Amplify) are excluded from CI runs

**What Needs to be Done:**

- [ ] Configure GitHub Secrets for AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- [ ] Set up AWS CodeArtifact authentication in GitHub Actions
- [ ] Enable full test suite in CI once credentials are configured
- [ ] Consider using AWS IAM roles for GitHub Actions instead of access keys
- [ ] Add integration tests that can run with mocked AWS services

**Test Files Currently Skipped in CI:**

- Tests that use `TranslationService` (requires AWS Translate)
- Tests that use `DataStore` directly (requires AWS Amplify configuration)
- Tests that require Amplify initialization

**Workaround:**

- Tests are run locally where AWS credentials are available
- CI runs lint, format checks, and non-AWS-dependent unit tests
- Full test suite should be run locally before merging PRs

## Dependency Management

### CodeArtifact Integration

**Status:** ⚠️ Temporarily Disabled

**Current State:**

- CodeArtifact registries have been overridden in `.npmrc` to use npmjs.org
- All scoped registries (`@orion`, `@sentry`, `@aws-sdk`, `@aws-amplify`) point to npmjs.org
- `yarn.lock` has been updated to use npm registry URLs instead of CodeArtifact
- Workspace dependency `@orion/task-system` uses `file:packages/task-system` protocol

**What Needs to be Done:**

- [ ] Re-enable CodeArtifact authentication for scoped packages
- [ ] Configure CodeArtifact credentials in CI/CD (GitHub Actions)
- [ ] Update `.npmrc` to use CodeArtifact registries for:
  - `@orion:registry` → CodeArtifact orion-aws-npm-repo
  - `@sentry:registry` → CodeArtifact orion-be-utils
  - `@aws-sdk:registry` → CodeArtifact orion-be-utils (if needed)
  - `@aws-amplify:registry` → CodeArtifact orion-be-utils (if needed)
- [ ] Update `yarn.lock` to use CodeArtifact URLs (or regenerate after re-enabling)
- [ ] Document CodeArtifact authentication setup for local development
- [ ] Consider using AWS IAM roles for CodeArtifact access instead of tokens
- [ ] Set up token refresh automation for CodeArtifact credentials

**Notes:**

- CodeArtifact was disabled to resolve build issues with expired credentials
- When re-enabling, ensure credentials are properly refreshed and not expired
- Consider using AWS CLI `aws codeartifact get-authorization-token` for token management
- May need to update CI/CD workflows to refresh tokens before `yarn install`

## Translation / i18n

### Translation Memory (Offline Strategy)

- [ ] Add tooling to export runtime translation memory (`translation_memory:*`) to a JSON file under `src/translations/`
- [ ] Add additional seed translation pairs (e.g. `memory.en-fr.json`, `memory.en-de.json`)
- [ ] Add a small debug/admin screen to inspect translation memory + clear/export it
- [ ] Consider replacing AWS Translate with a fully offline dictionary-based system for stable UI strings

## User Engagement Analytics

**Status:** 📝 To Do - Planning Complete

**Overview:**
Implement comprehensive user engagement tracking to understand all user actions when filling out task questions. Track interactions including question answers, navigation, app state changes (backgrounding), and time spent on screens.

📖 **For detailed information**, see [Analytics Implementation](analytics-implementation.md)

**Quick Summary:**

- Track all user interactions during question completion flow
- Real-time dashboards via AWS Pinpoint
- Data export to S3 via Kinesis Data Firehose for custom analysis
- Track: question answers, screen navigation, app backgrounding, time spent
- Anonymous by default (no PII, only metadata)

**Key Features:**

- Question answer tracking (question ID, screen index, answer type, validation status)
- Screen navigation tracking (next, previous, review actions)
- App state tracking (background/foreground during question flow)
- Time tracking (time spent on each screen, total task completion time)
- Task lifecycle tracking (started, completed, abandoned)

**Next Steps:**

- [ ] Install `@aws-amplify/analytics` package
- [ ] Configure Amplify Analytics with Pinpoint
- [ ] Create AnalyticsService with event tracking methods
- [ ] Create useAnalytics hook for component integration
- [ ] Create useAppStateTracking hook for background/foreground tracking
- [ ] Integrate analytics into question flow hooks (useAnswerManagement, useQuestionNavigation, useQuestionSubmission, useQuestionsScreen)
- [ ] Create AnalyticsContext for app-wide analytics
- [ ] Configure AWS Kinesis Data Firehose and S3 bucket for event export
- [ ] Update Amplify backend configuration to include Analytics
- [ ] Write unit tests for analytics components
- [ ] Document analytics implementation and usage

## Task/Activities Rule Engine Implementation

### Overview

Create a comprehensive rule engine system to evaluate and enforce task/activity rules, process actions, and handle rule-based workflows. This will bring the rule fields from "stored but not enforced" to "fully functional rule system".

### Architecture Plan

#### Core Components

1. **RuleEngine Service** (`src/services/RuleEngine.ts`)
   - Main entry point for rule evaluation
   - Coordinates between validators, parsers, and action processors
   - Provides unified API for rule checking

2. **Rule Validators** (`src/services/rules/`)
   - `CompletionRuleValidator.ts` - Validates completion rules (early/late completion, edits)
   - `VisibilityRuleValidator.ts` - Validates visibility rules (showBeforeStart, expiration)
   - `TimeRuleValidator.ts` - Validates time-based rules (start/end times)

3. **Rule Parser** (`src/services/rules/RuleParser.ts`)
   - Parses JSON rules from `rules` field
   - Validates rule structure
   - Converts JSON to executable rule objects

4. **Action Processor** (`src/services/rules/ActionProcessor.ts`)
   - Parses JSON actions from `actions` field
   - Executes actions (START_TIMED_TASK, etc.)
   - Handles action side effects

5. **Rule Evaluator** (`src/services/rules/RuleEvaluator.ts`)
   - Evaluates rule conditions using json-rules-engine
   - Handles triggers (ON_TASK_COMPLETION, ON_TASK_START, ON_ANSWER_VALUE)
   - Executes rule actions when conditions are met

6. **Anchor Rescheduler** (`src/services/rules/AnchorRescheduler.ts`)
   - Monitors appointment changes
   - Finds tasks linked via anchors
   - Recalculates task dates based on new anchor dates

#### Integration Points

1. **Task Display** (`src/hooks/useTaskList.ts`, `src/components/TasksView.tsx`)
   - Check visibility rules before showing tasks
   - Filter tasks based on `showBeforeStart` and expiration

2. **Task Completion** (`src/hooks/useQuestionSubmission.ts`)
   - Validate completion rules before allowing submission
   - Check `allowEarlyCompletion`, `allowLateCompletion`
   - Process actions after completion
   - Evaluate rules and trigger actions

3. **Task Editing** (`src/hooks/useQuestionsScreen.ts`)
   - Check `allowLateEdits` before allowing edits
   - Validate edit permissions

4. **Appointment Updates** (`src/services/AppointmentService.ts`)
   - Trigger anchor rescheduling when appointments change
   - Update linked tasks

### Implementation Steps

#### Phase 1: Foundation (Rule Infrastructure)

- [ ] **1.1** Create `src/services/RuleEngine.ts`
  - Basic structure and API
  - Rule evaluation entry points
  - Error handling

- [ ] **1.2** Create `src/services/rules/` directory structure
  - Organize rule-related services

- [ ] **1.3** Install `json-rules-engine` dependency
  - Add to package.json
  - Install and configure

- [ ] **1.4** Create `src/services/rules/RuleParser.ts`
  - Parse JSON rules from string
  - Validate rule structure
  - Convert to rule engine format
  - Handle malformed rules gracefully

- [ ] **1.5** Create `src/services/rules/ActionParser.ts`
  - Parse JSON actions from string
  - Validate action structure
  - Convert to executable action objects

#### Phase 2: Completion Rules (Validation)

- [ ] **2.1** Create `src/services/rules/CompletionRuleValidator.ts`
  - `validateEarlyCompletion(task, currentTime)` - Check if task can be completed early
  - `validateLateCompletion(task, currentTime)` - Check if task can be completed late
  - `validateLateEdits(task, currentTime)` - Check if task can be edited after completion
  - Return validation results with error messages

- [ ] **2.2** Create `src/services/rules/VisibilityRuleValidator.ts`
  - `isTaskVisible(task, currentTime)` - Check if task should be shown
  - `isTaskExpired(task, currentTime)` - Check if task is expired
  - `shouldShowBeforeStart(task, currentTime)` - Check showBeforeStart rule
  - Return visibility status

- [ ] **2.3** Create `src/services/rules/TimeRuleValidator.ts`
  - `isWithinTimeWindow(task, currentTime)` - Check if current time is within task window
  - `getTimeUntilStart(task, currentTime)` - Calculate time until task starts
  - `getTimeUntilExpiration(task, currentTime)` - Calculate time until task expires
  - Helper methods for time calculations

- [ ] **2.4** Integrate validators into TaskService
  - Add validation checks to `getTasks()` for filtering
  - Add validation checks before task operations

- [ ] **2.5** Integrate validators into useQuestionSubmission
  - Check completion rules before allowing submission
  - Show appropriate error messages
  - Block submission if rules violated

- [ ] **2.6** Integrate validators into useQuestionsScreen
  - Check `allowLateEdits` before allowing edits
  - Show appropriate UI feedback

#### Phase 3: Rule Evaluation (json-rules-engine)

- [ ] **3.1** Create `src/services/rules/RuleEvaluator.ts`
  - Initialize json-rules-engine
  - Evaluate rule conditions
  - Handle different trigger types (ON_TASK_COMPLETION, ON_TASK_START, ON_ANSWER_VALUE)
  - Return evaluation results

- [ ] **3.2** Create rule fact builders
  - `buildTaskFacts(task)` - Convert task to facts for rule engine
  - `buildAnswerFacts(answers)` - Convert answers to facts
  - `buildContextFacts(context)` - Add context (current time, user, etc.)

- [ ] **3.3** Integrate rule evaluation into task completion flow
  - Evaluate rules when task is completed
  - Evaluate rules when task is started
  - Evaluate rules when answers change (for ON_ANSWER_VALUE)

- [ ] **3.4** Create rule evaluation hooks
  - `useRuleEvaluation(task)` - Hook for evaluating rules
  - `useRuleTriggers(task, answers)` - Hook for monitoring triggers

#### Phase 4: Action Processing

- [ ] **4.1** Create `src/services/rules/ActionProcessor.ts`
  - `processActions(actions, context)` - Execute actions
  - Handle different action types:
    - `START_TIMED_TASK` - Create and start a timed task
    - `START_SCHEDULED_TASK` - Create and schedule a task
    - `END_RECURRENCE` - End a recurring task series
  - Return action execution results

- [ ] **4.2** Create action handlers
  - `handleStartTimedTask(action, context)` - Create timed task
  - `handleStartScheduledTask(action, context)` - Create scheduled task
  - `handleEndRecurrence(action, context)` - End recurrence

- [ ] **4.3** Integrate action processing into rule evaluation
  - Execute actions when rules are triggered
  - Handle action failures gracefully
  - Log action execution

- [ ] **4.4** Create action execution queue
  - Queue actions for execution
  - Handle async action execution
  - Retry failed actions

#### Phase 5: Anchor-Based Rescheduling

- [ ] **5.1** Create `src/services/rules/AnchorRescheduler.ts`
  - `findTasksByEventId(eventId)` - Find tasks linked to appointment
  - `rescheduleTasksForAppointment(appointment, oldDate, newDate)` - Reschedule linked tasks
  - `recalculateTaskDate(task, newAnchorDate)` - Calculate new task date
  - `updateTaskDates(tasks, newDates)` - Update task dates in database

- [ ] **5.2** Create appointment change monitor
  - Monitor appointment updates
  - Detect date changes
  - Trigger rescheduling

- [ ] **5.3** Integrate rescheduling into AppointmentService
  - Hook into appointment update flow
  - Trigger rescheduling when dates change
  - Handle rescheduling errors

- [ ] **5.4** Create rescheduling validation
  - Validate that tasks can be rescheduled
  - Check `canMoveSeriesWithVisit` flag in anchors
  - Prevent rescheduling of completed tasks (optional)

#### Phase 6: Testing & Documentation

- [ ] **6.1** Create unit tests for RuleEngine
  - Test rule parsing
  - Test rule evaluation
  - Test validation logic
  - Test action processing

- [ ] **6.2** Create unit tests for validators
  - Test completion rule validation
  - Test visibility rule validation
  - Test time rule validation
  - Test edge cases

- [ ] **6.3** Create unit tests for action processor
  - Test action parsing
  - Test action execution
  - Test action failures

- [ ] **6.4** Create unit tests for anchor rescheduler
  - Test task finding
  - Test date recalculation
  - Test rescheduling flow

- [ ] **6.5** Create integration tests
  - Test full rule evaluation flow
  - Test action execution flow
  - Test rescheduling flow

- [ ] **6.6** Update documentation
  - Document rule engine architecture
  - Document rule format
  - Document action format
  - Document usage examples

#### Phase 7: UI Integration

- [ ] **7.1** Add rule validation feedback to UI
  - Show error messages when rules violated
  - Disable buttons when rules prevent action
  - Show rule status indicators

- [ ] **7.2** Add rule information display
  - Show task rule status
  - Show expiration countdown
  - Show completion window

- [ ] **3.3** Add action execution feedback
  - Show when actions are executed
  - Show action results
  - Handle action errors in UI

### Technical Details

#### Rule Format (JSON)

```typescript
interface TaskRule {
  trigger: "ON_TASK_COMPLETION" | "ON_TASK_START" | "ON_ANSWER_VALUE";
  conditions: RuleCondition[];
  actions: RuleAction[];
}

interface RuleCondition {
  fact: string; // e.g., "task.status", "answer.value"
  operator: string; // e.g., "equal", "greaterThan"
  value: any;
}

interface RuleAction {
  type: "START_TIMED_TASK" | "START_SCHEDULED_TASK" | "END_RECURRENCE";
  params: {
    taskDefId?: string;
    offset?: number;
    endAfter?: number;
    // ... other params
  };
}
```

#### Action Format (JSON)

```typescript
interface TaskAction {
  type: "START_TIMED_TASK" | "START_SCHEDULED_TASK" | "END_RECURRENCE";
  params: {
    taskDefId?: string;
    offset?: number; // minutes
    endAfter?: number; // minutes
    dayOffset?: number;
    // ... other params
  };
}
```

#### Rule Engine API

```typescript
class RuleEngine {
  // Validation
  static validateCompletion(task: Task, currentTime: number): ValidationResult;
  static validateVisibility(task: Task, currentTime: number): VisibilityResult;

  // Evaluation
  static evaluateRules(task: Task, facts: RuleFacts): EvaluationResult;
  static evaluateTrigger(trigger: string, task: Task, context: any): boolean;

  // Actions
  static processActions(
    actions: TaskAction[],
    context: ActionContext
  ): Promise<ActionResult[]>;

  // Rescheduling
  static rescheduleTasksForAppointment(appointment: Appointment): Promise<void>;
}
```

### Dependencies

- `json-rules-engine` - For rule condition evaluation
- Existing services: `TaskService`, `AppointmentService`, `ActivityService`

### Possible Solutions & Libraries

#### json-rules-engine

**Library**: [json-rules-engine](https://github.com/cachecontrol/json-rules-engine) by CacheControl

**Documentation**: https://github.com/cachecontrol/json-rules-engine/blob/HEAD/docs/rules.md

**Why it's a good fit:**

- **JSON-Based Rules**: Rules are defined using simple JSON structures, making them easy to read, maintain, and store in our `rules` field
- **Boolean Logic Support**: Supports `ALL` and `ANY` operators, allowing for complex nested conditions perfect for our rule conditions
- **Performance Optimization**: Offers priority levels and caching settings to fine-tune performance
- **Security**: Does not use `eval()`, ensuring a secure evaluation environment
- **Isomorphic**: Can run in both Node.js and browser environments (works with React Native)
- **Lightweight and Extendable**: The library is minimal in size and can be extended as needed
- **Event-Driven**: Supports event-based rule triggering, which aligns with our trigger types (ON_TASK_COMPLETION, ON_TASK_START, ON_ANSWER_VALUE)

**Example Integration:**

```typescript
import { Engine } from "json-rules-engine";

// Initialize engine for task rules
const engine = new Engine();

// Add rule from task.rules JSON field
engine.addRule({
  conditions: {
    all: [
      {
        fact: "task.status",
        operator: "equal",
        value: "COMPLETED",
      },
      {
        fact: "answer.value",
        operator: "greaterThan",
        value: 5,
      },
    ],
  },
  event: {
    type: "TRIGGER_ACTION",
    params: {
      actionType: "START_TIMED_TASK",
      taskDefId: "some-task-id",
    },
  },
});

// Evaluate with facts
const facts = {
  "task.status": task.status,
  "answer.value": answerValue,
  currentTime: Date.now(),
};

const { events } = await engine.run(facts);
// Process triggered events/actions
```

**Considerations:**

- Rules can be parsed from JSON strings stored in `task.rules` field
- Facts can be built from task data, answers, and context
- Events can trigger our action processor
- Supports complex nested conditions with `all` and `any` operators
- Can be extended with custom operators if needed

### File Structure

```
src/
  services/
    RuleEngine.ts                    # Main rule engine service
    rules/
      RuleParser.ts                  # Parse JSON rules
      ActionParser.ts                # Parse JSON actions
      RuleEvaluator.ts               # Evaluate rules with json-rules-engine
      ActionProcessor.ts             # Execute actions
      CompletionRuleValidator.ts      # Validate completion rules
      VisibilityRuleValidator.ts      # Validate visibility rules
      TimeRuleValidator.ts            # Validate time-based rules
      AnchorRescheduler.ts            # Handle anchor-based rescheduling
      types.ts                        # Rule and action type definitions
      utils.ts                        # Rule utility functions
  hooks/
    useRuleEvaluation.ts             # Hook for rule evaluation
    useRuleValidation.ts             # Hook for rule validation
  __tests__/
    services/
      rules/
        RuleEngine.test.ts
        RuleParser.test.ts
        ActionProcessor.test.ts
        CompletionRuleValidator.test.ts
        VisibilityRuleValidator.test.ts
        AnchorRescheduler.test.ts
```

### Considerations

1. **Performance**: Rule evaluation should be fast, cache parsed rules when possible
2. **Error Handling**: Gracefully handle malformed rules, missing data, action failures
3. **Logging**: Log rule evaluations, action executions, rescheduling operations
4. **Backward Compatibility**: Handle tasks/activities without rules gracefully
5. **Testing**: Comprehensive test coverage for all rule types and edge cases
6. **Documentation**: Clear documentation for rule format, action format, and usage

### Future Enhancements

- Rule versioning and migration
- Rule templates and presets
- Rule debugging tools
- Rule performance monitoring
- Rule analytics and reporting
