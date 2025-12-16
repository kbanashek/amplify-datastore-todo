# E2E Testing

This project supports E2E testing on both **mobile platforms** (iOS/Android via Maestro) and **web** (via Playwright). Both test suites focus on **task-related user behavior**: beginning tasks, navigating questions, validations, submissions, and status updates.

## Table of contents

- [Overview](#overview)
- [Mobile E2E Testing (Maestro)](#mobile-e2e-testing-maestro)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites)
  - [Build and install the Dev Client](#build-and-install-the-dev-client)
  - [Run E2E flows](#run-e2e-flows)
  - [What the suite covers](#what-the-suite-covers)
  - [Troubleshooting](#troubleshooting)
- [Web E2E Testing (Playwright)](#web-e2e-testing-playwright)
  - [Overview](#overview-2)
  - [Prerequisites](#prerequisites-1)
  - [Run E2E tests](#run-e2e-tests)
  - [What the suite covers](#what-the-suite-covers-1)
  - [Test structure](#test-structure)
  - [Troubleshooting](#troubleshooting-1)
- [Test IDs and Selectors](#test-ids-and-selectors)
- [Writing New Tests](#writing-new-tests)

---

## Overview

### Philosophy

E2E tests focus on **user-facing task behavior**, not development utilities:

- ✅ **Test**: Task flows, question navigation, validations, submissions, status updates
- ❌ **Don't test**: Seed data operations (these are development tools)

### Test Prerequisites

**Test data is automatically created** before tests run via `global-setup.ts`. You don't need to manually seed data.

**Test Data Isolation**:

- All test data is marked with `E2E_TEST_MARKER` prefix in the `pk` field
- Test data is completely isolated from your dev data
- Cleanup only removes test data, leaving dev data untouched
- Test data will sync across devices (like any DataStore data) but is clearly identifiable

**If you need to manually create test data** (for debugging or development):

1. Start the app: `yarn web` or `yarn start`
2. Navigate to the Seed Data screen (via menu or direct route)
3. Click "🌱 Seed Appointments & Tasks Together" (creates tasks with activities)
4. Note: Manually seeded data won't have the test marker unless you add it manually

### Test ID Strategy

All tests use `testID` props that map to:

- **Mobile**: Native accessibility identifiers
- **Web**: `data-testid` HTML attributes (via React Native Web)

Test IDs are centralized in `src/constants/testIds.ts` for consistency across platforms.

---

## Mobile E2E Testing (Maestro)

### Overview

- **Runner**: Maestro (black-box UI automation)
- **App under test**: Expo **Development Client** built with EAS
- **Where flows live**: `e2e/maestro/`
- **Platforms**: iOS and Android (separate flow files)

### Prerequisites

- **Maestro** installed locally (recommended via Homebrew):
  ```bash
  brew install maestro
  ```
- **EAS CLI** installed:
  ```bash
  yarn global add eas-cli
  ```
- An Expo account configured for EAS builds (see [Expo docs](https://docs.expo.dev/build/introduction/))

### Build and install the Dev Client

The E2E flows assume you have the development client installed on your simulator/emulator.

- **Android**:
  ```bash
  yarn e2e:build:android
  ```
- **iOS**:
  ```bash
  yarn e2e:build:ios
  ```

After the build completes, install the generated artifact on your target device (Android emulator / iOS simulator).

### Run E2E flows

Run platform-specific suites:

- **Android**:
  ```bash
  yarn e2e:maestro:android
  ```
- **iOS**:
  ```bash
  yarn e2e:maestro:ios
  ```

Run the default suite (runs all platforms):

```bash
yarn e2e
```

### What the suite covers

Flows are intentionally small and high-signal:

- **Seed + verify dashboard**: navigates via the menu, clears prior state, seeds coordinated data, and asserts that the dashboard renders. (Note: This includes seed operations for test setup, but the focus is on verifying task display)
- **Begin a task + questions navigation**: starts a task from the dashboard and asserts the questions screen loads
- **Task persistence**: verifies task state persists after app restart
- **Offline/online smoke (Android only)**: best-effort airplane mode toggle to shake out obvious network/offline issues

### Troubleshooting

- **Maestro can't find elements**:
  - Ensure you're running a **Dev Client build** (not Expo Go)
  - Verify you're on the expected screen
  - Check that `testID` props are correctly set in components
  - The flows rely on stable `testID` selectors defined in `src/constants/testIds.ts`

- **Seed flows hang**:
  - The seed screen shows native `Alert` dialogs that must be dismissed
  - The flows already tap `OK`; if you changed alert button text, update the flows

- **App id mismatch**:
  - Flows use `appId: com.orion.tasksystem`
  - If you change bundle identifiers in `app.json`, update the Maestro YAML files under `e2e/maestro/`

---

## Web E2E Testing (Playwright)

### Overview

- **Runner**: Playwright (modern web automation)
- **App under test**: Expo web build running on `http://localhost:8081`
- **Where tests live**: `e2e/playwright/`
- **Configuration**: `playwright.config.ts`
- **Browser**: Chromium (configurable in `playwright.config.ts`)

### Prerequisites

- Playwright is installed as a dev dependency (already in `package.json`)
- Chromium browser installed (run `npx playwright install chromium` if needed)
- The web app can be started with `yarn web` (Playwright will start it automatically)

### Run E2E tests

- **Run all tests**:

  ```bash
  yarn e2e:playwright
  # or
  yarn e2e:web
  ```

- **Run with UI mode** (interactive debugging):

  ```bash
  yarn e2e:playwright:ui
  ```

- **Run in debug mode** (step through tests):

  ```bash
  yarn e2e:playwright:debug
  ```

- **Run specific test file**:
  ```bash
  npx playwright test e2e/playwright/begin-task-and-navigate.spec.ts
  ```

Playwright will automatically:

1. Start the web server (`yarn web`)
2. Wait for it to be ready at `http://localhost:8081`
3. Run the tests
4. Generate HTML reports (opens automatically after test run)

### What the suite covers

The web test suite focuses on **task-related behavior**:

- **Begin task and navigate**: verifies dashboard loads, begins a task, and navigates to questions screen
- **Task persistence**: verifies task state persists after page reload

**Future test opportunities** (as more testIDs are added):

- Question navigation (Next/Previous buttons)
- Answering different question types (text, number, date, single-select, etc.)
- Required field validation and error display
- Task submission flow
- Status updates (OPEN → STARTED → INPROGRESS → COMPLETED)

### Automatic Test Data Setup

**Test data is automatically seeded before tests run** via `global-setup.ts`:

- Creates minimal test data (activities + tasks) needed for tests
- **All test data is marked with `E2E_TEST_MARKER` prefix** for isolation from dev data
- Runs once before all tests (not per-test)
- **Dev data remains untouched** - test data is completely isolated

**Test data cleanup is controlled by environment variable**:

- **Default (CI/CD)**: Test data is cleaned up after tests complete
- **Dev mode**: Set `E2E_CLEANUP=false` to keep test data for inspection
  ```bash
  E2E_CLEANUP=false yarn e2e:web
  ```

**Important**:

- ✅ **Cleanup only deletes test data** (items with `E2E_TEST_MARKER` prefix)
- ✅ **Dev data is never touched** - your development work is safe
- ✅ **Test data syncs across devices** but is clearly marked and can be cleaned up separately
- Use `E2E_CLEANUP=false` to inspect test data after tests complete

### Test structure

Tests are organized by user flow:

- `begin-task-and-navigate.spec.ts` - Core task flow: dashboard → begin → questions screen
- `task-persistence.spec.ts` - Verifies data persistence after page reload

Each test:

1. Navigates to the app (`page.goto("/")`)
2. Waits for React Native Web to hydrate (3 second initial wait)
3. Verifies dashboard is visible (checks for "Dashboard" header)
4. Waits for tasks to load (handles empty state gracefully)
5. Skips if no tasks available (logs message and returns)
6. Performs the test action (e.g., clicking "Begin" button)
7. Verifies expected outcome (e.g., questions screen visible)

### Troubleshooting

- **Tests fail to start**:
  - Ensure port 8081 is available
  - If another process is using it, either stop it or set `E2E_BASE_URL` environment variable to a different URL
  - Check that `yarn web` works manually

- **Elements not found**:
  - Verify the web app is running correctly by manually visiting `http://localhost:8081`
  - Check that `testID` props are correctly rendered as `data-testid` attributes in the browser DevTools
  - Use Playwright's UI mode (`yarn e2e:playwright:ui`) to see what's actually on the page
  - Check browser console for React Native Web errors

- **Timeout errors**:
  - Increase timeout in `playwright.config.ts` if your app takes longer to load
  - The default webServer timeout is 120 seconds
  - React Native Web needs time to hydrate - tests include 3 second initial wait

- **"No tasks available" message**:
  - This is expected if your database is empty
  - Tests will skip gracefully and show as "passed" (they didn't fail, they just had nothing to test)
  - To run the full test flow, ensure tasks exist in your database:
    - Use the Seed Data screen in the app (menu → Seed Data → "Seed Appointments & Tasks Together")
    - Or manually create tasks with `entityId` values pointing to activities
  - Tests will automatically detect tasks and run when they're available

- **Tests pass but seem slow**:
  - React Native Web hydration takes time
  - Tests include generous timeouts to account for this
  - Consider running tests in headed mode to see what's happening: `npx playwright test --headed`

---

## Test IDs and Selectors

### Centralized Test IDs

All test IDs are defined in `src/constants/testIds.ts`:

```typescript
export const TestIds = {
  globalHeaderMenuButton: "global_header_menu_button",
  dashboardGroupedTasksView: "dashboard_grouped_tasks_view",
  taskCardBeginButton: "task_card_begin_button",
  questionsScreenRoot: "questions_screen_root",
  // ... more test IDs
} as const;
```

### Using Test IDs in Components

Add `testID` props to components for e2e testing:

```typescript
<TouchableOpacity
  onPress={handlePress}
  testID={TestIds.taskCardBeginButton}
>
  <Text>Begin</Text>
</TouchableOpacity>
```

### How Test IDs Map to Web

React Native Web automatically maps `testID` props to `data-testid` HTML attributes:

```tsx
// React Native component
<View testID="my-test-id">Content</View>

// Renders as HTML
<div data-testid="my-test-id">Content</div>
```

Playwright can then find elements using:

```typescript
page.getByTestId("my-test-id");
```

---

## Writing New Tests

### Web Tests (Playwright)

1. Create a new `.spec.ts` file in `e2e/playwright/`
2. Import `test` and `expect` from `@playwright/test`
3. Import `TestIds` from `src/constants/testIds.ts`
4. Use `page.getByTestId()` to find elements by test ID
5. Use Playwright's built-in assertions and actions

**Example**:

```typescript
import { test, expect } from "@playwright/test";
import { TestIds } from "../../src/constants/testIds";

test.describe("My New Test Suite", () => {
  test("should do something", async ({ page }) => {
    // Navigate to app
    await page.goto("/");

    // Wait for app to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // React Native Web hydration

    // Find element by test ID
    const button = page.getByTestId(TestIds.someButton);
    await expect(button).toBeVisible({ timeout: 10000 });

    // Interact with element
    await button.click();

    // Verify outcome
    await expect(page.getByTestId(TestIds.expectedResult)).toBeVisible({
      timeout: 10000,
    });
  });
});
```

### Mobile Tests (Maestro)

1. Create a new `.yaml` file in `e2e/maestro/android/` or `e2e/maestro/ios/`
2. Use Maestro's YAML syntax to define flows
3. Reference test IDs using `id: "test_id_value"`

**Example**:

```yaml
appId: com.orion.tasksystem
---
- launchApp
- tapOn:
    id: "task_card_begin_button"
- assertVisible:
    id: "questions_screen_root"
```

### Best Practices

1. **Use test IDs, not text**: Text can change, test IDs are stable
2. **Wait for elements**: Use `waitFor` or `toBeVisible` with timeouts
3. **Handle empty states**: Tests should gracefully handle missing data
4. **Focus on user flows**: Test what users actually do, not implementation details
5. **Keep tests independent**: Each test should be able to run in isolation
6. **Use descriptive test names**: Test names should clearly describe what they verify

### Adding Test IDs to Components

When creating new components or features that need e2e testing:

1. Add the test ID constant to `src/constants/testIds.ts`
2. Add the `testID` prop to the component
3. Update tests to use the new test ID

**Example**:

```typescript
// src/constants/testIds.ts
export const TestIds = {
  // ... existing IDs
  myNewComponent: "my_new_component",
} as const;

// MyComponent.tsx
import { TestIds } from "../constants/testIds";

export const MyComponent = () => {
  return (
    <View testID={TestIds.myNewComponent}>
      {/* component content */}
    </View>
  );
};
```

---

## CI/CD Integration

### Running Tests in CI

Both test suites can be integrated into CI/CD pipelines:

**Maestro (Mobile)**:

- Requires EAS build setup
- Can run on physical devices or emulators
- See Maestro CI documentation for setup

**Playwright (Web)**:

- Runs headlessly by default
- Can run in Docker containers
- Supports parallel execution
- See Playwright CI documentation for GitHub Actions, CircleCI, etc.

### Test Reports

- **Playwright**: Generates HTML reports automatically (opens after test run)
- **Maestro**: Provides console output and can generate reports with `--format` flag

---

## Summary

- **Mobile**: Maestro tests run against Expo Dev Client on iOS/Android
- **Web**: Playwright tests run against Expo web build in Chromium
- **Focus**: Task behavior (beginning tasks, navigation, submissions, validations)
- **Test IDs**: Centralized in `src/constants/testIds.ts`
- **Prerequisites**: Tasks must exist in database (tests skip if none available)

For questions or issues, check the troubleshooting sections above or review the test files in `e2e/` for examples.
