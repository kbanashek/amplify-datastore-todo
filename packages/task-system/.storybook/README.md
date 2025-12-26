# Storybook Configuration

This directory contains the Storybook configuration for the `@orion/task-system` package.

## Files

### `main.ts`

Main Storybook configuration file that defines:

- **Story patterns**: Where to find `.stories.tsx` and `.mdx` files
- **Addons**: Essential addons for controls, docs, and interactions
- **Framework**: React + Webpack 5 configuration
- **Webpack customization**:
  - TypeScript path alias resolution (`@components`, `@hooks`, etc.)
  - React Native Web aliasing (`react-native` → `react-native-web`)
  - Native dependency mocking (DateTimePicker, Slider)
  - Platform-specific extensions (`.web.tsx`, `.web.ts`)
  - Babel loader with React Native Web plugin
  - MDX loader for documentation pages

### `preview.tsx`

Global Storybook configuration that defines:

- **Decorators**: Wraps all stories with i18n provider
- **Parameters**:
  - Controls configuration for prop editing
  - Background colors (light, dark, gray)
  - Viewport presets (mobile, tablet, desktop)
  - Layout options
  - Documentation settings
- **Global types**: Theme switcher in toolbar

### `mocks.ts`

Mock implementations for dependencies that can't run in web environment:

- **DataStore**: Mock AWS Amplify DataStore operations
- **useThemeColor**: Mock theme color hook
- **Logger**: Mock logging service

## How It Works

### Story Discovery

Storybook finds stories matching the pattern:

```
packages/task-system/src/**/*.stories.@(ts|tsx|mdx)
```

This includes:

- Component stories: `src/components/**/*.stories.tsx`
- Documentation: `src/**/*.mdx`

### React Native Web

Components written for React Native are rendered on the web using React Native Web:

1. **Webpack aliases**: `react-native` imports are redirected to `react-native-web`
2. **Platform extensions**: `.web.tsx` files are prioritized over `.tsx`
3. **Babel plugin**: `babel-plugin-react-native-web` transforms RN syntax
4. **Native mocks**: Native-only components are mocked with web equivalents

### TypeScript Path Aliases

Path aliases from `tsconfig.json` are resolved in webpack:

```typescript
@components → packages/task-system/src/components
@hooks → packages/task-system/src/hooks
@utils → packages/task-system/src/utils
// ... etc
```

### i18n Support

All stories are wrapped with `I18nextProvider`:

- Translations are loaded from `src/translations/config/i18nConfig`
- Components can use `useTaskTranslation()` hook
- All user-facing text is internationalized

### Theme Support

Global theme switcher in toolbar:

- Light theme (default)
- Dark theme
- Components can access theme through context

### Viewport Support

Predefined viewport sizes:

- **Mobile**: 375x667 (default)
- **Mobile Large**: 414x896
- **Tablet**: 768x1024
- **Desktop**: 1280x800

## Adding New Stories

Create a `.stories.tsx` file next to your component:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./MyComponent";

const meta = {
  title: "Category/MyComponent",
  component: MyComponent,
  parameters: {
    layout: "centered", // or "padded", "fullscreen"
  },
  tags: ["autodocs"], // Auto-generate docs page
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    // Component props
  },
};

// Additional variants
export const Variant: Story = {
  args: {
    // Different props
  },
};
```

### Story Categories

Organize stories by category in the title:

- `UI/ComponentName` - Base UI components
- `Domain/ComponentName` - Domain-specific components
- `Questions/ComponentName` - Question type components

### Using Hooks in Stories

For components that need state:

```typescript
export const WithState: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return <MyComponent value={value} onChange={setValue} />;
  },
};
```

Or create a wrapper component:

```typescript
const MyComponentWithState: React.FC<Props> = (props) => {
  const [value, setValue] = useState("");
  return <MyComponent {...props} value={value} onChange={setValue} />;
};

export const WithState: Story = {
  render: () => <MyComponentWithState />,
};
```

## Adding Documentation

Create a `.mdx` file in `src/`:

````mdx
import { Meta } from "@storybook/blocks";

<Meta title="Category/Page Title" />

# Page Title

Your documentation content here...

## Code Examples

```typescript
import { Component } from "@orion/task-system";

<Component prop="value" />
```
````

```

## Troubleshooting

### Module Resolution Errors
If imports fail, check:
1. Path aliases in `main.ts` match `tsconfig.json`
2. File extensions are included in webpack resolve
3. React Native Web aliases are correct

### React Native Component Errors
If RN components fail to render:
1. Check if component uses native-only APIs
2. Add mock in `mocks.ts` if needed
3. Create `.web.tsx` variant if necessary

### TypeScript Errors
If TypeScript complains:
1. Ensure types are exported from component files
2. Check `Meta` and `StoryObj` types are correct
3. Verify component props interface is exported

### Build Errors
If webpack build fails:
1. Clear cache: `rm -rf node_modules/.cache`
2. Reinstall: `yarn install`
3. Check webpack config in `main.ts`

## Performance

### Hot Reload
Storybook uses webpack HMR for fast updates:
- Component changes reload instantly
- Story changes reload the story
- Config changes require restart

### Build Optimization
Production builds are optimized:
- Tree-shaking removes unused code
- Code splitting for faster loads
- Minification for smaller bundles

## Resources

- [Storybook Docs](https://storybook.js.org/docs)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Webpack Configuration](https://webpack.js.org/configuration/)
- [Babel Plugin RN Web](https://github.com/necolas/react-native-web/tree/master/packages/babel-plugin-react-native-web)

```
