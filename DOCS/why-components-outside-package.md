# Why Components Exist Outside the Package Directory

## The Architecture Distinction

This project has **two different purposes**:

1. **Main App** (`src/components/`, `app/`) - This specific Expo Router app
2. **Reusable Package** (`packages/task-system/`) - A module that OTHER apps can embed

## Component Locations Explained

### 1. Root `components/` Directory

**Purpose**: Expo template components + base UI design system

**Contents**:

- Expo template components: `Collapsible.tsx`, `ExternalLink.tsx`, `HapticTab.tsx`, etc.
- Base UI components: `components/ui/` (Button, Card, TextField, DatePicker, etc.)

**Why here?**: These are shared design system components used by BOTH the main app AND potentially the package.

### 2. `src/components/` Directory

**Purpose**: Main app-specific components

**Contents**:

- **App layout components**: `GlobalHeader.tsx`, `NavigationMenu.tsx` - Used by Expo Router screens
- **Domain components**: TaskCard, AppointmentCard, etc. - Used by app screens
- **Question components**: Used by app screens

**Why here?**: These are components used directly by THIS app's Expo Router screens (`app/(tabs)/index.tsx`, `app/(tabs)/questions.tsx`, etc.)

**Example usage**:

```typescript
// app/(tabs)/index.tsx
import { GlobalHeader } from "../../src/components/GlobalHeader"; // ← App-specific
import { NavigationMenu } from "../../src/components/NavigationMenu"; // ← App-specific
import { TaskActivityModule } from "@orion/task-system"; // ← From package
```

### 3. `packages/task-system/src/src/components/` Directory

**Purpose**: Components for the REUSABLE package (meant to be embedded in OTHER apps)

**Contents**:

- Components needed for `TaskActivityModule` to work standalone
- Self-contained task/activity flow

**Why here?**: The package is meant to be PUBLISHED and used by OTHER apps (like LX). It needs its own copy of components to be self-contained.

## The Key Distinction

### Main App Components (`src/components/`)

- **Used by**: This app's Expo Router screens
- **Examples**: `GlobalHeader`, `NavigationMenu`
- **Purpose**: App-specific UI that wraps/uses the package

### Package Components (`packages/task-system/`)

- **Used by**: Other apps that embed `TaskActivityModule`
- **Examples**: `TaskContainer`, `GroupedTasksView`, question components
- **Purpose**: Reusable module that can be dropped into any app

## Visual Architecture

```
┌─────────────────────────────────────────────────┐
│  Main App (Expo Router)                         │
│                                                  │
│  app/(tabs)/index.tsx                           │
│    ├─ GlobalHeader (from src/components/)       │ ← App-specific
│    ├─ NavigationMenu (from src/components/)     │ ← App-specific
│    └─ TaskActivityModule (from @orion/task-system) │ ← Reusable package
│                                                  │
│  app/(tabs)/questions.tsx                       │
│    ├─ GlobalHeader (from src/components/)       │ ← App-specific
│    └─ Question components (from src/components/)│ ← App-specific
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  @orion/task-system Package                      │
│  (Can be embedded in OTHER apps)                │
│                                                  │
│  TaskActivityModule                             │
│    ├─ TaskContainer                             │
│    ├─ GroupedTasksView                          │
│    └─ QuestionsScreen                           │
│                                                  │
│  All self-contained, no dependency on           │
│  main app's GlobalHeader, NavigationMenu, etc.  │
└─────────────────────────────────────────────────┘
```

## Why This Separation?

### Main App Needs Its Own Components Because

1. **App-specific UI**: `GlobalHeader`, `NavigationMenu` are specific to THIS app's design
2. **Expo Router integration**: Components need to work with Expo Router navigation
3. **App context**: Components may use app-specific contexts, routing, etc.

### Package Needs Its Own Components Because

1. **Self-contained**: Must work without depending on main app structure
2. **Reusable**: Other apps (LX) should be able to embed it without importing main app components
3. **Independent**: Package has its own NavigationContainer, doesn't use Expo Router

## The Problem (Current State)

**Components are DUPLICATED** between `src/components/` and `packages/task-system/src/src/components/`:

- Same components exist in both places
- Files have diverged (e.g., `GroupedTasksView.tsx` differs)
- Maintenance burden - changes must be made in multiple places

## The Solution (From Consolidation Plan)

**Single source of truth**: Package should IMPORT from `src/components/` instead of duplicating:

- Keep components in `src/components/`
- Package imports from shared source
- Eliminate duplication
- Package build compiles shared source into `dist/`

## Summary

**Components exist outside the package because:**

- ✅ **App-specific components** (`GlobalHeader`, `NavigationMenu`) are used by the main app, not part of the reusable package
- ✅ **Base UI components** (`components/ui/`) are shared design system, not package-specific
- ✅ **Package components** should reference shared source, not duplicate it

**The issue isn't that components are outside the package - it's that they're DUPLICATED inside the package when they should just reference the shared source.**
