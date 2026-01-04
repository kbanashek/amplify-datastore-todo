# Mock Data for UI Development & Testing

This directory contains centralized mock data for developing and testing UI components.

## Available Mocks

### Data Factories

#### `Task.mock.ts`

```typescript
import { createMockTask } from "@orion/task-system/src/__mocks__/Task.mock";

const task = createMockTask("task-123", "Complete Report", Date.now());
// Returns a fully formed Task with all required fields
```

#### `Appointment.mock.ts`

```typescript
import { createMockAppointment } from "@orion/task-system/src/__mocks__/Appointment.mock";

const appointment = createMockAppointment("appt-1", "Doctor Visit");
// Uses fixed date (2025-01-15) to prevent snapshot drift
```

#### `GroupedTask.mock.ts`

```typescript
import { createMockGroupedTasks } from "@orion/task-system/src/__mocks__/GroupedTask.mock";

const grouped = createMockGroupedTasks();
// Returns full GroupedTask[] structure with day groups, time groups, etc.
```

#### `translationMocks.ts`

```typescript
import {
  createMockI18n,
  createMockT,
  mockUseTaskTranslation,
} from "@orion/task-system/src/__mocks__/translationMocks";

// For testing components that use translations
jest.mock("@translations/index", () => ({
  useTaskTranslation: () => mockUseTaskTranslation,
}));
```

### Module Mocks

#### `expo-image-picker.ts`

Automatic mock for `expo-image-picker` module used by Jest.

#### `DataStore.mock.ts` (in `__tests__/__mocks__/`)

Mock for AWS Amplify DataStore operations.

---

## Usage in Tests

```typescript
import { createMockTask } from "../__mocks__/Task.mock";
import { createMockAppointment } from "../__mocks__/Appointment.mock";

describe("MyComponent", () => {
  it("should render tasks", () => {
    const tasks = [
      createMockTask("1", "Task 1"),
      createMockTask("2", "Task 2"),
    ];

    render(<MyComponent tasks={tasks} />);
    // ...
  });
});
```

## Usage in Storybook

```typescript
import { createMockTask } from "@orion/task-system/src/__mocks__/Task.mock";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof TaskCard> = {
  title: "Components/TaskCard",
  component: TaskCard,
};

export const Default: StoryObj = {
  args: {
    task: createMockTask("task-1", "Sample Task", Date.now()),
  },
};
```

## Adding New Mocks

1. Create a new file: `[EntityName].mock.ts`
2. Export a factory function: `createMock[EntityName]`
3. Document usage in this README
4. Export from `index.ts` for convenience

---

**Best Practices:**

- ✅ Use factory functions for flexibility
- ✅ Provide sensible defaults
- ✅ Allow overrides via parameters
- ✅ Use fixed dates for snapshots
- ✅ Keep mocks simple and focused
- ❌ Don't put test logic in mocks
- ❌ Don't create overly complex mock scenarios
