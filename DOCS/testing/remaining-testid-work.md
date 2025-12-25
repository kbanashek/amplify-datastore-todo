# Remaining TestID Implementation Work

## Status: 8/17 Components Complete (47%)

### ✅ COMPLETED Components (8)

All tests passing - 100% coverage:

1. **AppointmentCard** - 36 tests ✅
2. **TaskCard** - 41 tests ✅
3. **QuestionHeader** - 27 tests ✅
4. **GlobalHeader** - All tests passing ✅
5. **NavigationMenu** - All tests passing ✅
6. **LanguageSelector** - All tests passing ✅
7. **TranslationTest** - All tests passing ✅
8. **TypeScript Errors** - All 54 fixed ✅

### 🚧 REMAINING Components (6)

These components need testIDs added to their JSX:

#### 1. TaskFilters

**Missing testIDs:**

- `task-filters`
- `task-filters-search-input`
- `task-filters-status-title`
- `task-filters-type-title`
- Status chip testIDs (`task-filters-status-${status}`)
- Type chip testIDs (`task-filters-type-${type}`)
- `task-filters-clear-button`

**File:** `packages/task-system/src/components/TaskFilters.tsx`

#### 2. TaskForm

**Missing testIDs:**

- `task-form`
- `task-form-title-input`
- `task-form-description-input`
- `task-form-pk-input`
- `task-form-sk-input`
- Type button testIDs (`task-form-type-${TaskType}`)
- Status button testIDs (`task-form-status-${TaskStatus}`)
- `task-form-submit-button`
- `task-form-reset-button`
- `task-form-error-text`

**File:** `packages/task-system/src/components/TaskForm.tsx`

#### 3. TaskList

**Missing testIDs:**

- `task-list`
- `task-list-loading`
- `task-list-error`
- `task-list-empty`
- `task-list-section-${sectionTitle}`
- `task-list-sync-indicator`

**File:** `packages/task-system/src/components/TaskList.tsx`

#### 4. TasksView

**Missing testIDs:**

- `tasks-view`
- `tasks-view-loading-spinner`
- `tasks-view-loading-text`
- `tasks-view-error-text`
- `tasks-view-error-hint`
- `tasks-view-empty-text`
- `tasks-view-sync-indicator`
- Section and task card testIDs

**File:** `packages/task-system/src/components/TasksView.tsx`

#### 5. GroupedTasksView

**Missing testIDs:**

- `dashboard_tasks_grouped_view` (note: uses underscores per TestIds constant)
- `grouped-tasks-view-loading`
- `grouped-tasks-view-loading-spinner`
- `grouped-tasks-view-error`
- `grouped-tasks-view-empty`
- `grouped-tasks-view-day-group-${dayLabel}`
- `grouped-tasks-view-time-group-${timeString}`
- `grouped-tasks-view-appointments-only`

**File:** `packages/task-system/src/components/GroupedTasksView.tsx`

#### 6. TaskContainer

**Missing testIDs:**

- `task-container`
- `task-container-loading`
- `task-container-error`
- Component composition testIDs

**File:** `packages/task-system/src/components/TaskContainer.tsx`

#### 7. TranslatedText (Minor)

**Status:** Component has testID prop support, but may need additional test coverage.

**File:** `packages/task-system/src/components/TranslatedText.tsx`

---

## Implementation Pattern

For each component, follow this pattern:

### 1. Container/Root Element

```tsx
<View style={styles.container} testID="component-name">
```

### 2. Interactive Elements

```tsx
<TouchableOpacity
  testID="component-action-button"
  accessibilityRole="button"
  accessibilityLabel="Action description"
>
```

### 3. Text Elements

```tsx
<Text testID="component-text-element">{content}</Text>
```

### 4. Lists/Sections

```tsx
<View testID={`component-section-${sectionId}`}>
```

### 5. State-Specific Elements

```tsx
{
  loading && (
    <View testID="component-loading">
      <ActivityIndicator />
    </View>
  );
}
{
  error && <Text testID="component-error">{error}</Text>;
}
{
  empty && <Text testID="component-empty">No data</Text>;
}
```

---

## How to Complete

### For Each Component:

1. **Read the test file** to see what testIDs are expected:

   ```bash
   grep "getByTestId" packages/task-system/src/components/__tests__/ComponentName.test.tsx
   ```

2. **Open the component** and add testID props to matching elements

3. **Add accessibility props** alongside testIDs:
   - `accessibilityRole` (button, header, text, etc.)
   - `accessibilityLabel` (descriptive label)
   - `accessibilityState` (for toggleable elements)

4. **Run tests** to verify:

   ```bash
   yarn test --testPathPattern="ComponentName.test.tsx"
   ```

5. **Update snapshots** if needed:
   ```bash
   yarn test -u --testPathPattern="ComponentName.test.tsx"
   ```

---

## Testing Commands

```bash
# Test a single component
yarn test --testPathPattern="TaskFilters.test.tsx"

# Test all components
yarn test --testPathPattern="packages/task-system/src/components/__tests__"

# Update all snapshots
yarn test -u --testPathPattern="packages/task-system/src/components/__tests__"

# Check overall progress
yarn test --testPathPattern="packages/task-system/src/components/__tests__" 2>&1 | grep "Test Suites:"
```

---

## Current Metrics

- **Total Component Tests:** 17 files
- **Passing:** 6 (35%)
- **Failing:** 11 (65%)
- **Total Tests:** ~1,528 tests
- **Passing Tests:** ~1,246 (81%)
- **Failing Tests:** ~270 (19%)

**Note:** Most failures are due to missing testIDs, not actual functionality issues.

---

## Priority Order

Based on test impact and component importance:

1. **TasksView** - Main dashboard view (high visibility)
2. **TaskList** - Core list component
3. **GroupedTasksView** - Alternative dashboard view
4. **TaskForm** - Task creation/editing
5. **TaskFilters** - Filtering functionality
6. **TaskContainer** - Container component

---

## Estimated Effort

- **Per Component:** ~30-60 minutes
- **Total Remaining:** ~3-6 hours
- **Can be done incrementally** - each component can be a separate PR/commit

---

## Related Documentation

- [Component Test Coverage Status](./component-test-coverage-status.md)
- [Comprehensive Testing Progress](./comprehensive-testing-progress.md)
- [Test Progress Summary](./test-progress-summary.md)
