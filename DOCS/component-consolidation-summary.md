# Component Consolidation - Executive Summary

## The Problem

Components are duplicated across three locations:

1. **Root `components/`** - Expo template + base UI (13 files)
2. **`src/components/`** - Main app components (31 component files)
3. **`packages/task-system/src/src/components/`** - Package copy (108 files)

**Key Issues:**

- ❌ **108 duplicate files** in package that should reference shared source
- ❌ **Files have diverged** (e.g., `GroupedTasksView.tsx` differs between locations)
- ❌ **Awkward nested structure** (`src/src/`) from copying entire `src/` directory
- ❌ **Import path inconsistency** (relative paths in package vs `@/` aliases in main app)
- ❌ **Maintenance burden** - changes must be made in multiple places

## Root Cause

The `@orion/task-system` package was created by copying the entire `src/` directory into `packages/task-system/src/`, creating a nested `src/src/` structure. This was done to make the package "self-contained" but resulted in:

- Massive code duplication
- Files diverging over time
- Confusing directory structure

## Recommended Solution

**Single Source of Truth**: Keep all components in `src/components/`, have the package import from shared source.

### Benefits

- ✅ **Eliminate 108 duplicate files**
- ✅ **Single source of truth** - fix once, works everywhere
- ✅ **No more divergence** - package always uses latest components
- ✅ **Simpler structure** - no nested `src/src/` directories
- ✅ **Easier testing** - tests in main app cover package components

### Implementation

1. **Update package to reference shared source**
   - Modify `packages/task-system/tsconfig.build.json` to compile from workspace root
   - Change imports in `TaskActivityModule.tsx` to use `../../src/`
   - Remove `packages/task-system/src/src/` directory

2. **Resolve divergences**
   - Compare `GroupedTasksView.tsx` and merge package improvements to main app
   - Ensure main app version is authoritative

3. **Test and validate**
   - Build package: `npm run build:task-system`
   - Verify main app works with updated package
   - Test `TaskActivityModule` rendering

## Impact Assessment

### Files to Remove

- **108 component files** in `packages/task-system/src/src/components/`
- Plus associated hooks, services, types, etc. in nested structure

### Files to Modify

- `packages/task-system/tsconfig.build.json` - Update build config
- `packages/task-system/src/TaskActivityModule.tsx` - Update imports
- `packages/task-system/src/index.ts` - Update exports
- `src/components/GroupedTasksView.tsx` - Merge package improvements

### Risk Level

- **Low** - Package is workspace-only, not published externally
- **Reversible** - Can revert if issues arise
- **Testable** - Can test incrementally

## Next Steps

See [component-consolidation-plan.md](./component-consolidation-plan.md) for detailed implementation steps.

**Quick Start:**

1. Review consolidation plan
2. Create feature branch
3. Follow Phase 1-4 migration steps
4. Test thoroughly
5. Merge when validated
