# Component Documentation Plan

## Overview

Add comprehensive JSDoc documentation to all components modified in PR #48 (font system) to achieve 80%+ docstring coverage.

## Scope

**Total:** 40 component files (excluding already-documented AppFonts.ts, fontUtils.ts, and deleted files)

---

## File Groups

### 1. UI Components (7 files)

- [ ] `packages/task-system/src/components/ui/Button.tsx`
- [ ] `packages/task-system/src/components/ui/TextField.tsx`
- [ ] `packages/task-system/src/components/ui/DateTimeField.tsx`
- [ ] `packages/task-system/src/components/ui/FieldLabel.tsx`
- [ ] `packages/task-system/src/components/ui/NumericInput.tsx`
- [ ] `packages/task-system/src/components/ui/UnitText.tsx`
- [ ] `packages/task-system/.ondevice/SimpleStorybook.tsx` (optional - dev tool)

### 2. Main Components (10 files)

- [ ] `packages/task-system/src/components/GlobalHeader.tsx`
- [ ] `packages/task-system/src/components/GroupedTasksView.tsx`
- [ ] `packages/task-system/src/components/LanguageSelector.tsx`
- [ ] `packages/task-system/src/components/NavigationMenu.tsx`
- [ ] `packages/task-system/src/components/QuestionHeader.tsx`
- [ ] `packages/task-system/src/components/TaskCard.tsx`
- [ ] `packages/task-system/src/components/TaskFilters.tsx`
- [ ] `packages/task-system/src/components/TaskForm.tsx`
- [ ] `packages/task-system/src/components/TaskList.tsx`
- [ ] `packages/task-system/src/components/TasksView.tsx`
- [ ] `packages/task-system/src/components/ThemedText.tsx`
- [ ] `packages/task-system/src/components/TranslationTest.tsx`

### 3. Question Components (20 files)

- [ ] `packages/task-system/src/components/questions/BloodPressureQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/ClinicalDynamicInputQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/CompletionScreen.tsx`
- [ ] `packages/task-system/src/components/questions/ErrorState.tsx`
- [ ] `packages/task-system/src/components/questions/HorizontalVASQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/ImageCaptureQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/IntroductionScreen.tsx`
- [ ] `packages/task-system/src/components/questions/LoadingState.tsx`
- [ ] `packages/task-system/src/components/questions/MultiSelectQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/NavigationButtons.tsx`
- [ ] `packages/task-system/src/components/questions/NumberQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/ProgressIndicator.tsx`
- [ ] `packages/task-system/src/components/questions/QuestionRenderer.tsx`
- [ ] `packages/task-system/src/components/questions/QuestionScreenButtons.tsx`
- [ ] `packages/task-system/src/components/questions/ReviewScreen.tsx`
- [ ] `packages/task-system/src/components/questions/SingleSelectQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/TemperatureQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/TextQuestion.tsx`
- [ ] `packages/task-system/src/components/questions/WeightHeightQuestion.tsx`

### 4. Screens & Constants (3 files)

- [ ] `packages/task-system/src/screens/QuestionsScreen.tsx`
- [ ] `packages/task-system/src/constants/AppStyles.ts`
- [ ] `src/constants/AppColors.ts` (root-level file)

---

## Documentation Requirements

Each component needs:

### React Components

````typescript
/**
 * Brief component description.
 *
 * More detailed explanation if needed. What does this component do?
 * When should it be used?
 *
 * @param props - Component props
 * @returns Rendered component
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={123} />
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = props => {
  // ...
};
````

### Prop Interfaces

```typescript
/**
 * Props for the ComponentName component.
 */
interface ComponentNameProps {
  /** Brief prop description */
  prop1: string;
  /** Another prop description */
  prop2?: number;
}
```

### Exported Functions

```typescript
/**
 * Brief function description.
 *
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description
 */
export const functionName = (param1: Type1, param2: Type2): ReturnType => {
  // ...
};
```

---

## Strategy

1. **Start with UI components** - Smaller, reusable, easier to document
2. **Move to question components** - Similar patterns, can template documentation
3. **Finish with main components** - More complex, need more detail
4. **Document screens & constants** - Simple, quick wins

---

## Success Criteria

- [ ] All 40 files have JSDoc for exported components/functions/types
- [ ] `yarn check:docstrings` reports 80%+ coverage
- [ ] Documentation follows project JSDoc standards
- [ ] Examples provided for complex components
- [ ] PR created and passes all checks

---

## Timeline

**Estimated:** 2-3 hours for 40 files (~3-5 minutes per component)

**Batching:**

- Group 1 (UI): 30 minutes
- Group 2 (Questions): 1 hour
- Group 3 (Main): 45 minutes
- Group 4 (Screens): 15 minutes
- Verification & PR: 15 minutes
