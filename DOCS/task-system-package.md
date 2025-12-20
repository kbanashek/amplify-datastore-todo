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

## LX ownership model (recommended)

**LX should own `Amplify.configure()` and `DataStore` lifecycle.**

- **LX (host app)**:
  - calls `Amplify.configure(...)` exactly once at startup
  - starts/stops/clears `DataStore` when needed
  - mounts `@orion/task-system` only after initialization is complete
- **`@orion/task-system` (package)**:
  - never calls `Amplify.configure()`
  - exposes `initTaskSystem()` to configure DataStore-level behavior (conflict handler, etc.)
  - does not auto-start `DataStore` when `autoStartDataStore={false}`

## Minimal integration recipe (LX)

### 1) Ensure dependencies

- **Required peer deps (must exist in LX)**: `react`, `react-native`, `@aws-amplify/datastore`, `react-native-safe-area-context`, `react-native-screens`, `@react-navigation/native`, `@react-navigation/native-stack`
- **Expo**: OK. This module does not require `expo-router`.

### 2) Host-owned startup sequence

- **Configure Amplify** in LX before rendering the module (auth + endpoint + DataStore config).
- **Initialize task-system** (conflict handler etc.) and **start DataStore** in the host.
- Render the module with:
  - `<AmplifyProvider autoStartDataStore={false}>`

### 3) Example (copy/paste starting point)

See `src/screens/LXHostExample.tsx` in this repo for the exact sequence:

- `Amplify.configure(...)`
- `bootstrapTaskSystem({ startDataStore: true })`
- mount `<TaskActivityModule />` with `autoStartDataStore={false}`

## What to provide the agent (to implement in LX)

When you ask an agent/team to integrate `@orion/task-system` into LX, provide:

- **Amplify configuration details** (source of truth):
  - How LX currently configures Amplify (where `Amplify.configure()` lives)
  - Which auth mode LX uses for AppSync/DataStore (Cognito User Pools vs API key, etc.)
  - The environment(s) to support (dev/stage/prod) and how config is selected

- **DataStore lifecycle requirements**:
  - Should DataStore start at app launch or only when the module is first entered?
  - Any requirements around `DataStore.clear()` (logout, environment switch, “Force Sync” behavior)

- **Navigation constraints**:
  - Where the module should live in LX navigation hierarchy
  - Whether LX needs to provide its own header/safe-area behavior

- **Monorepo / packaging constraints**:
  - Is LX consuming from the same monorepo (workspace) or via npm registry?
  - If monorepo: LX `metro.config.js` (watchFolders / resolver) details

- **Backend/schema alignment**:
  - Confirm LX’s GraphQL schema/model generation matches the models expected by this package
  - Any custom conflict resolution rules or auth directives that differ from this harness

## LX-owned fixture data (replacement for “seed scripts”)

LX should own the “seed” content in version control (JSON fixtures) and import it at runtime.

### Why fixtures?

- **Deterministic**: stable `pk` values prevent duplicates across devices/environments
- **Editable**: non-engineers can update content without touching TS scripts
- **Reviewable**: changes are visible in code review

### How it works

- LX stores a JSON file (see `src/fixtures/task-system.fixture.v1.json` for an example)
- On app start (or when entering the module), LX calls:
  - `FixtureImportService.importTaskSystemFixture(fixture, { updateExisting: true })`
- The importer is **idempotent by `pk`**:
  - creates missing records
  - updates existing records (optional)
  - never creates duplicates if `pk` remains stable

### Absolute timestamps

This project supports **absolute millisecond timestamps** in the fixture:

- `startTimeInMillSec`
- `expireTimeInMillSec`
- `endTimeInMillSec` (optional)

LX can regenerate these values offline (script/tool) and commit the updated fixture.
