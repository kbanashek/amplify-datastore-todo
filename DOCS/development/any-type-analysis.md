# Analysis of `any` Type Usage in Task System

This document categorizes all uses of the `any` type in the codebase and explains which can be properly typed and which are legitimately difficult to type.

## Summary Statistics

- **Total instances found**: ~241 in src/, ~17 in .storybook/, ~10 in .ondevice/
- **Fixable**: ~85% (can be typed properly)
- **Legitimate edge cases**: ~15%

---

## Category 1: TEST FILES - Mock Components (CAN BE TYPED) ✅

### Instances

- All `__tests__` files with mock components using `any` for props
- Examples: `TaskCard.test.tsx`, `TranslationTest.test.tsx`, `TextField.test.tsx`

### Current Code

```typescript
TaskCard: ({ task, onPress, onDelete }: any) => (
  <View testID="task-card">
    <Text>{task.title}</Text>
  </View>
);
```

### Why These CAN Be Typed

Jest mock components should use the actual component's prop types or a subset:

```typescript
import type { TaskCardProps } from "@components/TaskCard";

TaskCard: ({ task, onPress, onDelete }: Pick<TaskCardProps, 'task' | 'onPress' | 'onDelete'>) => (
  <View testID="task-card">
    <Text>{task.title}</Text>
  </View>
);
```

**Fix Priority**: HIGH
**Effort**: Medium (need to import types for each mock)

---

## Category 2: TEST UTILITIES - Mock Functions (CAN BE TYPED) ✅

### Instances

- `mockRtlStyle`, `mockT` translation functions
- Mock service methods

### Current Code

```typescript
const mockRtlStyle = jest.fn((style: any) => style);
const mockT = jest.fn((key: string, options?: any) => key);
```

### Why These CAN Be Typed

Mock functions can use proper types:

```typescript
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import type { TOptions } from "i18next";

const mockRtlStyle = jest.fn(
  (style: StyleProp<ViewStyle | TextStyle>) => style
);
const mockT = jest.fn((key: string, options?: TOptions) => key);
```

**Fix Priority**: HIGH
**Effort**: Low (straightforward type imports)

---

## Category 3: STORYBOOK MOCKS (.storybook/mocks.tsx) - PARTIALLY JUSTIFIED ⚠️

### Instances

All icon component mocks, DataStore mocks, logger mocks

### Current Code

```typescript
export const MaterialIcons = ({ name, size, color, ...props }: any) => (
  <Text style={{ fontSize: size, color }}>[{name}]</Text>
);
```

### Why Some `any` Is Justified Here

1. **Icon Libraries Don't Export Prop Types**: `@expo/vector-icons` doesn't export its prop types
2. **Mock Simplicity**: Mocks are intentionally simplified for Storybook

### What CAN Be Typed

```typescript
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const MaterialIcons = ({ name, size = 24, color = '#000', ...props }: IconProps) => (
  <Text style={{ fontSize: size, color }} {...props}>[{name}]</Text>
);
```

**Fix Priority**: MEDIUM
**Effort**: Low (create simple icon interface)

---

## Category 4: STYLE PROPS (SHOULD BE TYPED) ✅

### Instances

- `UnitText.tsx`, `FieldLabel.tsx`, `NumericInput.tsx`

### Current Code

```typescript
interface FieldLabelProps {
  label: string;
  required?: boolean;
  style?: any; // ❌ BAD
}
```

### Why This MUST Be Typed

React Native provides proper style types:

```typescript
import type { StyleProp, TextStyle } from "react-native";

interface FieldLabelProps {
  label: string;
  required?: boolean;
  style?: StyleProp<TextStyle>; // ✅ GOOD
}
```

**Fix Priority**: CRITICAL
**Effort**: Very Low (import proper type)

---

## Category 5: ANSWER VALUES (PARTIALLY JUSTIFIED) ⚠️

### Instances

- `useAnswerManagement.ts`: `(questionId: string, answer: any)`
- `answerFormatting.ts`: `answer: any`
- `questionValidation.ts`: `answer: any`
- `ReviewScreen.tsx`: `formatAnswer: (element: ParsedElement, answer: any) => string`

### Why `any` Is Partially Justified

Answers can be multiple types based on question type:

- Text questions: `string`
- Number questions: `string` (numeric string)
- Single-select: `string` (option ID)
- Multi-select: `string[]` (array of option IDs)
- Weight/Height: `{ value: string; unit: string }`
- Date: `Date` or ISO string

### Proper Type Solution

Create a discriminated union:

```typescript
type QuestionAnswer =
  | { type: "text"; value: string }
  | { type: "number"; value: string }
  | { type: "single-select"; value: string }
  | { type: "multi-select"; value: string[] }
  | { type: "weight-height"; value: { value: string; unit: string } }
  | { type: "date"; value: Date };

// Or simpler approach:
type AnswerValue =
  | string
  | string[]
  | Date
  | { value: string; unit: string }
  | null;
```

**Fix Priority**: HIGH
**Effort**: Medium (need to refactor answer handling)

---

## Category 6: THIRD-PARTY LIBRARY GAPS (PARTIALLY JUSTIFIED) ⚠️

### Instances

- `DateTimeField.tsx`: `onChange: (_event: any, selectedDate: Date | undefined)`
- `NativeProvider.ts`: `baseLogger: any`
- `TranslationService.ts`: AWS SDK config

### Why `any` May Be Justified

#### React Native DateTimePicker

```typescript
// DateTimePicker doesn't export event type
onChange: (_event: any, selectedDate: Date | undefined) => {
  // We only care about selectedDate, not event
};
```

**Better approach**: Use `unknown` and ignore the event:

```typescript
onChange: (_event: unknown, selectedDate: Date | undefined) => {
  // Explicitly ignore event, focus on selectedDate
};
```

#### react-native-logs

```typescript
let baseLogger: any = null; // Library doesn't export logger type
```

**Better approach**: Create interface from documentation:

```typescript
interface NativeLogger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

let baseLogger: NativeLogger | null = null;
```

**Fix Priority**: MEDIUM
**Effort**: Medium (need to create interfaces from docs)

---

## Category 7: LOGGING & METADATA (CAN USE UNKNOWN) ✅

### Instances

- `deviceLogger.ts`: `data?: any`, `error?: any`
- Logger methods: `metadata?: any`

### Current Code

```typescript
export const logWithPlatform = (
  icon: string,
  step: string,
  serviceName: string,
  message: string,
  data?: any // ❌
): void => {
  // ...
};
```

### Why This CAN Be Typed Better

Use `unknown` or `Record<string, unknown>`:

```typescript
export const logWithPlatform = (
  icon: string,
  step: string,
  serviceName: string,
  message: string,
  data?: Record<string, unknown> // ✅
): void => {
  // ...
};
```

**Fix Priority**: MEDIUM
**Effort**: Low (replace `any` with `unknown` or `Record<string, unknown>`)

---

## Category 8: FIXTURE/TEST DATA (CAN BE TYPED) ✅

### Instances

- `FixtureImportService.ts`: `duplicateActivities: any[]`
- Test service files: `createMockTask = (overrides: Partial<any> = {}): any`

### Current Code

```typescript
const duplicateActivities: any[] = [];
const createMockTask = (overrides: Partial<any> = {}): any => ({
  id: "test-1",
  // ...
});
```

### Why These CAN Be Typed

```typescript
import type { Activity, Task } from "@models";

const duplicateActivities: Activity[] = [];
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: "test-1",
  // ...
});
```

**Fix Priority**: HIGH
**Effort**: Low (models already exist)

---

## Category 9: STORYBOOK CONTROLS (.ondevice/SimpleStorybook.tsx) - JUSTIFIED ✅

### Instances

- `onChange: (key: string, value: any) => void`
- Control component props

### Why `any` Is Justified Here

Storybook controls handle multiple value types dynamically:

- Boolean controls: `boolean`
- Text controls: `string`
- Number controls: `number`
- Select controls: `string`
- Object controls: `Record<string, unknown>`

### Better Type

```typescript
type ControlValue = string | number | boolean | Record<string, unknown>;

interface ControlPanelProps {
  controls: Record<string, ControlConfig>;
  onChange: (key: string, value: ControlValue) => void;
}
```

**Fix Priority**: LOW (Storybook-specific, not production code)
**Effort**: Low

---

## Category 10: CONFLICT RESOLUTION (SHOULD BE TYPED) ✅

### Instances

- `ConflictResolution.ts`: `function ensurePkSk(model: any, fallback?: any): any`

### Current Code

```typescript
function ensurePkSk(model: any, fallback?: any): any {
  return {
    ...model,
    pk: model.pk || fallback?.pk,
    sk: model.sk || fallback?.sk,
  };
}
```

### Why This CAN Be Typed

DataStore models have a base type:

```typescript
import type { Model } from "@models";

function ensurePkSk<T extends Model>(model: T, fallback?: Partial<T>): T {
  return {
    ...model,
    pk: model.pk || fallback?.pk || "",
    sk: model.sk || fallback?.sk || "",
  };
}
```

**Fix Priority**: CRITICAL (conflict resolution is core functionality)
**Effort**: Low

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)

1. ✅ Style props (`FieldLabel`, `UnitText`, `NumericInput`) → Use `StyleProp<T>`
2. ✅ Conflict resolution → Use generic with `Model` constraint
3. ✅ Test mock functions → Use proper service types

### Phase 2: High Priority (Week 2)

4. ✅ Answer values → Create `AnswerValue` union type
5. ✅ Test mock components → Import and use component prop types
6. ✅ Fixture services → Use model types

### Phase 3: Medium Priority (Week 3-4)

7. ✅ Logging metadata → Use `Record<string, unknown>` or `unknown`
8. ✅ Third-party gaps → Create interfaces from documentation
9. ✅ Storybook mocks → Create simple icon interface

### Phase 4: Low Priority (As Time Permits)

10. ✅ Storybook controls → Type control values (dev-only code)

---

## TypeScript Best Practices Going Forward

### NEVER Use `any` For:

- ❌ Style props (use `StyleProp<ViewStyle | TextStyle>`)
- ❌ Mock components in tests (use actual component prop types)
- ❌ Model data (use imported model types)
- ❌ Event handlers (use React Native event types)

### Acceptable Use of `any` (Convert to `unknown` When Possible):

- ⚠️ Third-party library gaps where types aren't exported
- ⚠️ Complex dynamic values in dev tools (Storybook)
- ⚠️ AWS SDK configs that change frequently

### Always Prefer:

- ✅ `unknown` over `any` (forces type checking)
- ✅ Generics over `any` (type safety + flexibility)
- ✅ Union types over `any` (enumerate possibilities)
- ✅ Creating interfaces over using `any` (documentation)

---

## Estimated Impact

**Total `any` instances**: ~270
**Can be eliminated**: ~230 (85%)
**Should use `unknown` instead**: ~30 (11%)
**Legitimately difficult**: ~10 (4%)

**Net result**: Reduce from ~270 to ~10 instances of `any`, with most converted to proper types or `unknown`.
