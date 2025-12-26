# React Native Storybook

A comprehensive Storybook implementation for the `@orion/task-system` package, running directly on-device with 21 interactive stories across 6 categories.

## Quick Start

### Accessing Storybook

1. Run the app: `yarn ios` or `yarn android`
2. From Task Dashboard, tap menu icon (☰)
3. Select "Storybook" from the menu
4. Browse 21 stories across 6 categories

### Current Components

- **Buttons** (6) - Primary, Secondary, Outline, Disabled, Loading, All Sizes
- **Form Inputs** (4) - TextField, NumericInput, DatePicker, FieldLabel
- **Layout** (2) - Card variants
- **Feedback** (4) - LoadingSpinner sizes, ProgressIndicator
- **Icons** (1) - SF Symbol samples
- **Question Types** (4) - SingleSelect, MultiSelect, TextQuestion, NumberQuestion

---

## Adding New Components

### File Organization

Stories are organized in `__stories__/` directories at each component level:

```
src/components/
├── __stories__/              # Top-level component stories
│   └── TaskCard.stories.tsx
├── ui/__stories__/           # UI component stories
│   └── Button.stories.tsx
└── questions/__stories__/    # Question component stories
    └── SingleSelectQuestion.stories.tsx
```

### Step 1: Create Story File

For `src/components/ui/NewComponent.tsx`, create:

```
src/components/ui/__stories__/NewComponent.stories.tsx
```

### Step 2: Register in SimpleStorybook.tsx

Add to the `stories` array in `.ondevice/SimpleStorybook.tsx`:

```typescript
// For stateful components, define at top level
const NewComponentExample = () => {
  const [value, setValue] = useState("");
  return <NewComponent value={value} onChange={setValue} />;
};

// Then add to stories array
{
  category: "UI Components",
  items: [
    {
      name: "New Component",
      component: NewComponentExample,
    },
  ],
}
```

---

## Best Practices

### ✅ DO

**1. Use separate components for hooks:**

```typescript
// ✅ GOOD
const TextFieldExample = () => {
  const [value, setValue] = useState("");
  return <TextField value={value} onChangeText={setValue} />;
};
```

**2. Use mock handlers (no real operations):**

```typescript
// ✅ GOOD
<Button
  label="Test"
  onPress={() => Alert.alert("Success", "Button works!")}
/>
```

**3. Wrap in consistent containers:**

```typescript
// ✅ GOOD
<View style={styles.storyContainer}>
  <MyComponent />
</View>
```

### ❌ DON'T

**1. Don't use hooks inside story definitions:**

```typescript
// ❌ BAD - Violates Rules of Hooks
{
  component: () => {
    const [value, setValue] = useState(""); // ❌
    return <TextField value={value} />;
  }
}
```

**2. Don't trigger real database operations:**

```typescript
// ❌ BAD
<TaskCard
  task={mockTask}
  onUpdateTaskStatus={async (task) => {
    await DataStore.save(task); // ❌ Real DB operation
  }}
/>
```

**3. Don't use raw text in React Native:**

```typescript
// ❌ BAD
<View>
  Raw text here // ❌ Not wrapped in <Text>
</View>
```

---

## Common Patterns

### Pattern 1: Simple Static Component

```typescript
{
  name: "Loading Spinner",
  component: () => (
    <View style={styles.storyContainer}>
      <LoadingSpinner />
    </View>
  ),
}
```

### Pattern 2: Component with State

```typescript
// Define at top level
const InteractiveExample = () => {
  const [count, setCount] = useState(0);
  return (
    <View style={styles.storyContainer}>
      <Button
        label={`Count: ${count}`}
        onPress={() => setCount(count + 1)}
      />
    </View>
  );
};

// Reference in stories
{ name: "Interactive", component: InteractiveExample }
```

### Pattern 3: Multiple Variants

```typescript
{
  name: "Button Variants",
  component: () => (
    <View style={styles.storyContainer}>
      <Button label="Primary" variant="primary" onPress={() => {}} />
      <View style={styles.spacer} />
      <Button label="Secondary" variant="secondary" onPress={() => {}} />
    </View>
  ),
}
```

---

## Common Errors & Fixes

| Error                     | Cause                            | Fix                          |
| ------------------------- | -------------------------------- | ---------------------------- |
| "Rendered more hooks..."  | useState inside inline component | Create separate component    |
| "Text strings must be..." | Raw string children              | Use `<Text>` or `label` prop |
| "Task not found"          | Mock data triggering real DB     | Use `Alert.alert()` instead  |
| Blank screen              | Component threw error            | Check Metro logs             |

---

## Architecture

### Files

- **SimpleStorybook.tsx** - Main Storybook UI component with custom navigator
- **test.stories.tsx** - Basic verification stories
- **ui-components.stories.tsx** - UI component examples (reference)
- **domain-components.stories.tsx** - Domain component examples (reference)

### Integration

The Storybook screen is mounted in the harness app at `app/(tabs)/storybook.tsx` and accessible via the navigation menu.

### Why Custom Navigator?

The default on-device Storybook UI had rendering issues, so we implemented a custom navigator that:

- Lists stories by category
- Provides clean navigation
- Shows all stories in a scrollable list
- Allows tapping to view individual stories

---

## Technical Notes

### React Version

- Project uses **React 19.0.0**
- React Native Storybook 7.6.x is compatible
- Web-based Storybook 8.x was abandoned due to React 19 incompatibility

### Dependencies

```json
{
  "@storybook/react-native": "^7.6.20",
  "@storybook/addon-ondevice-controls": "^7.6.20",
  "@storybook/addon-ondevice-actions": "^7.6.20"
}
```

### Scripts

```bash
yarn storybook-generate  # Generate story loader (if needed)
yarn storybook-start     # Start on-device Storybook server
```

---

## Resources

- **React Hooks Rules:** https://react.dev/link/rules-of-hooks
- **React Native Storybook:** https://github.com/storybookjs/react-native
- **Component List:** See `COMPONENTS_ADDED.md` in this directory
