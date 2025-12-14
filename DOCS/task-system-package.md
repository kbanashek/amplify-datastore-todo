# @orion/task-system (LX Integration)

This repo now contains a workspace package at `packages/task-system` published as **`@orion/task-system`**.

## What you get

- A **self-contained** React Native task/activity flow that you can render inside another app:
  - Task list (`TaskContainer`) → Questions flow (`QuestionsScreen`) → Completion
  - Internal React Navigation stack (no `expo-router` required)

## Primary export

- `TaskActivityModule` — drop-in component that renders the full module with its **own internal navigation container**.

## Usage in LX (high level)

```tsx
import { TaskActivityModule } from "@orion/task-system";

export function SomeScreen() {
  return <TaskActivityModule />;
}
```

## Critical runtime requirement

The module uses **AWS Amplify DataStore**. The host runtime must have Amplify/DataStore configured (typically once at app startup via `Amplify.configure(...)`).

This package intentionally does **not** try to ship a baked-in `aws-exports` because that is environment/app specific.
