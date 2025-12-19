# Component Consolidation Plan

## Current State Analysis

### Component Locations

1. **Root `components/`** (Expo template + base UI)
   - Template components: `Collapsible.tsx`, `ExternalLink.tsx`, `HapticTab.tsx`, `HelloWave.tsx`, `ParallaxScrollView.tsx`, `ThemedText.tsx`, `ThemedView.tsx`
   - Base UI: `components/ui/` (Button, Card, TextField, DatePicker, DateTimePicker, LoadingSpinner, IconSymbol, TabBarBackground)

2. **`src/components/`** (Main app domain components)
   - Domain components: TaskCard, AppointmentCard, TaskContainer, GroupedTasksView, etc.
   - Question components: `@orion/task-system` (source: `packages/task-system/src/src/components/questions/`)
   - Layout components: GlobalHeader, NavigationMenu, LanguageSelector, NetworkStatusIndicator
   - **134 TypeScript files total**

3. **`packages/task-system/src/src/components/`** (Package copy)
   - Duplicate of most `src/components/` files
   - **109 TypeScript files total**
   - Uses relative imports (`../ThemedText`) instead of path aliases (`@/components/ThemedText`)
   - Some files have diverged (e.g., `GroupedTasksView.tsx` has ScrollView changes)

### Key Findings

1. **Nested `src/src/` structure**: Package was created by copying entire `src/` directory into `packages/task-system/src/`, creating awkward nesting
2. **File divergence**: Some files are identical, others have diverged (e.g., `GroupedTasksView.tsx` has different implementations)
3. **Import path inconsistency**:
   - Main app uses `@/` path aliases
   - Package uses relative paths
4. **Missing components in package**: Package doesn't have UI components from root `components/ui/` (they're in `packages/task-system/src/src/components/ui/` but may differ)
5. **Test files**: Only exist in main app (`src/components/__tests__/`), not in package

## Consolidation Strategy

### Option 1: Shared Source with Package Build (Recommended)

**Principle**: Single source of truth in `src/`, package builds from shared source.

**Approach**:

1. Keep all components in `src/components/` (main app location)
2. Package imports from `src/` using TypeScript path mapping
3. Package build process compiles shared source into `dist/`
4. Remove duplicate `packages/task-system/src/src/` directory

**Pros**:

- ✅ Single source of truth
- ✅ No duplication
- ✅ Changes automatically reflected in package
- ✅ Easier maintenance

**Cons**:

- ⚠️ Package depends on workspace structure (but this is fine for workspace packages)
- ⚠️ Need to ensure package build handles path resolution correctly

**Implementation Steps**:

1. Update `packages/task-system/tsconfig.build.json` to reference `../../src` instead of `src/src`
2. Update all package imports to use relative paths from package root to `src/`
3. Remove `packages/task-system/src/src/` directory
4. Update package exports in `packages/task-system/src/index.ts`
5. Test package build and main app consumption

### Option 2: Symlink/Reference Strategy

**Principle**: Package references main app source via symlinks or TypeScript project references.

**Approach**:

1. Use TypeScript project references to link package to main app
2. Package source files become thin wrappers that re-export from `src/`
3. Build process resolves references

**Pros**:

- ✅ Clear separation
- ✅ TypeScript handles resolution

**Cons**:

- ⚠️ More complex build setup
- ⚠️ Symlinks can be fragile across platforms
- ⚠️ Still some duplication (wrapper files)

### Option 3: Keep Separate but Sync (Not Recommended)

**Principle**: Maintain separate copies but sync changes.

**Approach**:

1. Keep package as self-contained copy
2. Create sync script to copy changes from `src/` to package
3. Manual review of divergences

**Pros**:

- ✅ Package is truly self-contained

**Cons**:

- ❌ High maintenance burden
- ❌ Easy to forget to sync
- ❌ Divergence will continue
- ❌ Duplicate code to maintain

## Recommended Solution: Option 1

### Detailed Implementation Plan

#### Phase 1: Prepare Package Structure

1. **Update TypeScript configuration**

   ```json
   // packages/task-system/tsconfig.build.json
   {
     "compilerOptions": {
       "baseUrl": "../..", // Point to workspace root
       "rootDir": "../..", // Compile from workspace root
       "paths": {
         "@package/*": ["./packages/task-system/src/*"]
       }
     },
     "include": [
       "src/**/*.ts",
       "src/**/*.tsx",
       "../src/components/**/*.tsx", // Include shared components
       "../src/hooks/**/*.ts", // Include shared hooks
       "../src/services/**/*.ts" // Include shared services
       // ... other shared directories
     ]
   }
   ```

2. **Update package source to import from shared location**

   ```typescript
   // packages/task-system/src/TaskActivityModule.tsx
   // Change from:
   import { TaskContainer } from "./src/components/TaskContainer";
   // To:
   import { TaskContainer } from "../../src/components/TaskContainer";
   ```

3. **Create package-specific entry points**
   - Keep `packages/task-system/src/index.ts` as package entry
   - Re-export from shared source
   - Package-specific wrappers only where needed

#### Phase 2: Migrate Components

1. **Identify package-specific vs shared components**
   - **Shared**: TaskCard, AppointmentCard, TaskContainer, GroupedTasksView, all question components, UI components
   - **Package-specific**: TaskActivityModule (package entry point only)

2. **Resolve divergences**
   - Compare `GroupedTasksView.tsx` differences
   - Merge package improvements back to main app
   - Ensure main app version is authoritative

3. **Update import paths in package**
   - Change all relative imports to point to `../../src/`
   - Update any package-specific utilities

#### Phase 3: Clean Up

1. **Remove duplicate directory**

   ```bash
   rm -rf packages/task-system/src/src
   ```

2. **Update build configuration**
   - Ensure build process correctly resolves shared imports
   - Test build output

3. **Update documentation**
   - Document new structure
   - Update import examples

#### Phase 4: Testing & Validation

1. **Build package**

   ```bash
   yarn build:task-system
   ```

2. **Test main app consumption**
   - Verify `@orion/task-system` imports work
   - Test TaskActivityModule rendering
   - Verify no runtime errors

3. **Test package in isolation** (if needed)
   - Create test consumer app
   - Verify package is self-contained in `dist/`

## Component Organization After Consolidation

```
amplify-datastore-todo/
├── components/                    # Expo template + base UI (stays as-is)
│   ├── ui/                       # Base UI components
│   └── ...                       # Template components
│
├── src/                          # Main app source (shared with package)
│   ├── components/               # ✅ Single source of truth
│   │   ├── questions/           # Question components
│   │   ├── TaskCard.tsx         # Domain components
│   │   ├── TaskContainer.tsx
│   │   └── ...
│   ├── hooks/                    # Shared hooks
│   ├── services/                 # Shared services
│   └── ...
│
└── packages/task-system/         # Package (imports from src/)
    ├── src/
    │   ├── index.ts              # Package entry (re-exports)
    │   └── TaskActivityModule.tsx # Package-specific wrapper
    ├── dist/                     # Built output
    └── tsconfig.build.json       # References ../../src
```

## Migration Checklist

- [ ] Update `packages/task-system/tsconfig.build.json` to reference shared source
- [ ] Update `TaskActivityModule.tsx` imports to use `../../src/`
- [ ] Compare and merge diverged files (GroupedTasksView, etc.)
- [ ] Update all package component imports
- [ ] Test package build: `yarn build:task-system`
- [ ] Verify main app still works with updated package
- [ ] Remove `packages/task-system/src/src/` directory
- [ ] Update documentation
- [ ] Update CHANGELOG.md

## Risk Mitigation

1. **Backup before migration**: Create branch or tag current state
2. **Incremental migration**: Migrate one component at a time, test after each
3. **Keep package build working**: Don't break package build during migration
4. **Test both consumers**: Verify both main app and package work after changes

## Long-term Benefits

- ✅ **Single source of truth**: No more duplicate code
- ✅ **Easier maintenance**: Fix once, works everywhere
- ✅ **Consistent behavior**: Package and app use same components
- ✅ **Better testing**: Tests in main app cover package components
- ✅ **Clearer structure**: No confusing nested directories

## Questions to Resolve

1. **Should UI components in `components/ui/` be moved to `src/components/ui/`?**
   - Currently: Root `components/ui/` and package has `src/src/components/ui/`
   - Recommendation: Move to `src/components/ui/` for consistency

2. **How to handle ThemedText/ThemedView?**
   - Currently in root `components/` and package `src/src/components/`
   - Recommendation: Move to `src/components/` or create shared theme package

3. **Package versioning strategy?**
   - When to bump package version when shared source changes?
   - Should package version track main app version?
