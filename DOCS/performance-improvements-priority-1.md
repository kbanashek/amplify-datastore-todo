# Performance Improvements - Priority 1

**Status**: In Progress  
**Created**: 2025-12-15  
**Target Impact**: 50-70% reduction in unnecessary re-renders, 30-50% faster subscription callbacks

## Overview

This document outlines the three highest-priority performance improvements identified in the codebase. These issues cause significant performance degradation, especially when dealing with large task lists or frequent DataStore updates.

## Issue 1: TaskService Double Subscription and Expensive Query Refresh

**Location**: `packages/task-system/src/src/services/TaskService.ts:235-315`  
**Severity**: Critical  
**Impact**: Every DataStore operation triggers a full query, causing UI blocking  
**Solution**: Option A - Remove redundant `observe` subscription

### Problem

The `subscribeTasks` method uses both `observeQuery` and `observe`, and triggers a complete `DataStore.query()` on every operation (INSERT, UPDATE, DELETE). This causes:

1. **Double callbacks**: Both subscriptions fire, causing duplicate work
2. **Full dataset queries**: Every operation queries the entire Task dataset
3. **UI blocking**: Synchronous filtering in subscription callbacks blocks the UI thread
4. **Excessive logging**: Multiple `.map()` operations for logging on every update

### Solution: Remove Redundant Observe Subscription

**Rationale**: `observeQuery` should handle all DataStore updates reliably, including remote sync. The additional `observe` subscription was added as a workaround but causes significant performance issues. We'll remove it and verify that `observeQuery` handles all scenarios correctly.

### Implementation Steps

1. **Remove `observe` subscription**: Delete lines 260-306 (the `changeObserver` code)
2. **Simplify logging**: Guard expensive `.map()` operations with `__DEV__` or remove
3. **Update unsubscribe**: Remove `changeObserver.unsubscribe()` call
4. **Test cross-device sync**: Verify that remote updates from other devices still work
5. **Monitor subscription callbacks**: Ensure `observeQuery` fires for all operations
6. **Measure improvement**: Compare subscription callback frequency before/after

### Testing Requirements

- [ ] Verify local task updates trigger subscription callbacks
- [ ] Verify remote task updates (from other devices) trigger subscription callbacks
- [ ] Verify task deletions trigger subscription callbacks
- [ ] Verify task creation triggers subscription callbacks
- [ ] Test with multiple devices syncing simultaneously
- [ ] Monitor subscription callback frequency (should be ~50% reduction)

### Expected Impact

- **50-70% reduction** in subscription callbacks (eliminating duplicate `observe` callbacks)
- **Elimination** of full dataset queries on every operation
- **Smoother UI** with no blocking during updates
- **Lower memory usage** from reduced object allocations
- **Faster subscription callbacks** (no expensive query operations)

### Rollback Plan

If `observeQuery` doesn't handle all sync scenarios, we can implement Option B (debounced query refresh) as a fallback. However, initial testing suggests `observeQuery` should be sufficient.

---

## Issue 2: useTaskList Filtering on Every Subscription Update

**Location**: `packages/task-system/src/src/hooks/useTaskList.ts:30-115`  
**Severity**: Critical  
**Impact**: Filtering runs synchronously in subscription callback, blocking UI thread

### Problem

Filtering logic runs inside the subscription callback, causing:

1. **Synchronous filtering**: Blocks UI thread during subscription updates
2. **Re-filtering unchanged data**: Filters applied even when filters haven't changed
3. **No memoization**: Filtered results recalculated on every update
4. **Excessive console.logs**: Debug logging in production code

### Solution

Separate data storage from filtering, and memoize filtered results.

### Implementation Steps

1. **Add `useMemo` import**: Import `useMemo` from React
2. **Add `allTasks` state**: Store unfiltered tasks separately from filtered tasks
3. **Update subscription callback**: Only store data, don't filter (remove filtering logic from callback)
4. **Add `useMemo` for filtering**: Memoize filtered results based on `allTasks` and `filters`
5. **Remove console.logs**: Guard with `__DEV__` or remove entirely
6. **Update return value**: Return memoized `tasks` instead of state
7. **Test filtering**: Verify all filter types still work correctly

### Testing Requirements

- [ ] Verify status filtering works correctly
- [ ] Verify taskType filtering works correctly
- [ ] Verify searchText filtering works correctly
- [ ] Verify date range filtering works correctly
- [ ] Verify combined filters work correctly
- [ ] Verify filtering updates when filters change
- [ ] Verify filtering doesn't run unnecessarily (check with React DevTools Profiler)

### Expected Impact

- **Elimination** of UI blocking during subscription updates
- **50-80% reduction** in filtering operations (only when data/filters change)
- **Faster subscription callbacks** (no synchronous filtering)
- **Better React performance** (memoization prevents unnecessary re-renders)

---

## Issue 3: TaskCard Not Memoized

**Location**: `packages/task-system/src/src/components/TaskCard.tsx`  
**Severity**: High  
**Impact**: Re-renders on every parent update, even when task data hasn't changed

### Problem

`TaskCard` re-renders whenever the parent component updates, even when:

1. **Task data unchanged**: Same task object, no prop changes
2. **Parent re-renders**: Any parent state change triggers re-render
3. **Multiple translation hooks**: 4 `useTranslatedText` hooks per card (expensive)
4. **No memoization**: Component not wrapped with `React.memo`

### Solution

Wrap component with `React.memo` and add custom comparison.

### Implementation Steps

1. **Add imports**: Import `useCallback` from React
2. **Wrap with React.memo**: Add memoization wrapper around component
3. **Add custom comparison**: Only re-render when relevant props change
4. **Memoize handlers**: Use `useCallback` for `handleBeginPress` and `handleCardPress`
5. **Remove/guard console.logs**: Guard with `__DEV__` or remove
6. **Add displayName**: Set `TaskCard.displayName` for better debugging
7. **Test re-renders**: Verify component only re-renders when props actually change
8. **Update parent components**: Ensure `onPress` and `onDelete` are memoized in parents (if needed)

### Testing Requirements

- [ ] Verify TaskCard only re-renders when task props change
- [ ] Verify TaskCard doesn't re-render when parent state changes (unrelated to task)
- [ ] Verify translation hooks only run when task data changes
- [ ] Test with React DevTools Profiler to measure re-render reduction
- [ ] Verify all TaskCard functionality still works (buttons, navigation, etc.)

### Expected Impact

- **70-90% reduction** in TaskCard re-renders
- **Faster list scrolling** (fewer components re-rendering)
- **Lower memory usage** (fewer translation hook executions)
- **Better user experience** (smoother interactions)

---

## Implementation Order

1. **Issue 1** (TaskService): Highest impact, affects all task operations
2. **Issue 2** (useTaskList): High impact, affects all task list views
3. **Issue 3** (TaskCard): High impact, affects visual performance

## Testing Checklist

After implementing each fix:

- [ ] **Unit tests pass**: All existing tests continue to pass
- [ ] **Integration tests pass**: E2E tests verify functionality
- [ ] **Cross-device sync works**: Verify remote updates still sync correctly
- [ ] **Performance measured**: Use React DevTools Profiler to measure improvements
- [ ] **No regressions**: All existing features work as expected

## Performance Measurement

### Before Implementation

- Measure subscription callback frequency (baseline)
- Measure TaskCard re-render frequency (baseline)
- Measure filtering operation frequency (baseline)
- Measure UI responsiveness during updates

### After Implementation

- Compare subscription callback frequency (target: 50% reduction)
- Compare TaskCard re-render frequency (target: 70-90% reduction)
- Compare filtering operation frequency (target: 50-80% reduction)
- Compare UI responsiveness (target: smoother, no blocking)

## Notes

- **Option A for Issue 1**: We're choosing to remove the redundant `observe` subscription. If cross-device sync issues arise, we can implement Option B (debounced query refresh) as a fallback.
- **Testing is critical**: These changes affect core data flow, so thorough testing is required before merging.
- **Monitor in production**: After deployment, monitor for any sync issues or performance regressions.
