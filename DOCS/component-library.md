# Component Library

The app is building out a **comprehensive, reusable component library** organized by purpose and reusability.

## Component Library Structure

```
components/
├── ui/                          # 🎨 Base UI Components (Design System)
│   ├── IconSymbol.tsx          # Icon component with SF Symbols support
│   ├── TabBarBackground.tsx     # Tab bar styling component
│   └── ...                     # Future: Button, Input, Card, Modal, etc.
│
src/components/
├── questions/                   # ❓ Question/Assessment Components
│   ├── QuestionRenderer.tsx    # Main question renderer
│   ├── SingleSelectQuestion.tsx
│   ├── MultiSelectQuestion.tsx
│   ├── TextQuestion.tsx
│   ├── NumberQuestion.tsx
│   ├── DateQuestion.tsx
│   ├── IntroductionScreen.tsx
│   ├── CompletionScreen.tsx
│   ├── ReviewScreen.tsx
│   ├── ProgressIndicator.tsx
│   └── ...
│
├── TaskCard.tsx                # 📋 Domain-Specific Components
├── AppointmentCard.tsx          # 📅 Domain-Specific Components
├── TasksGroupedView.tsx        # 📊 Feature Components
├── AppointmentsGroupedView.tsx
├── TaskFilters.tsx
├── TaskForm.tsx
├── GlobalHeader.tsx            # 🧩 Layout Components
├── NavigationMenu.tsx
├── LanguageSelector.tsx
├── NetworkStatusIndicator.tsx
└── ...
```

## Component Library Principles

### 1. Base UI Components (`components/ui/`)

- **Purpose**: Reusable, design-system level components
- **Characteristics**:
  - Framework-agnostic styling
  - Fully typed with TypeScript
  - Accessible (WCAG compliant)
  - Theme-aware (light/dark mode support)
  - Platform-specific variants (iOS/Android)
- **Examples**: Buttons, Inputs, Cards, Modals, Icons, Badges
- **Status**: 🚧 In Progress - Currently has `IconSymbol`, expanding to full design system

### 2. Question Components (`src/components/questions/`)

- **Purpose**: Specialized components for health assessment forms
- **Characteristics**:
  - Fully translated (i18n support)
  - Validation built-in
  - Accessible form controls
  - Consistent styling and behavior
- **Status**: ✅ Complete - All question types implemented and tested

### 3. Domain Components (`src/components/`)

- **Purpose**: Business logic components specific to tasks, appointments, etc.
- **Characteristics**:
  - Connected to data services
  - Use custom hooks for logic
  - Fully typed with domain types
- **Status**: ✅ Complete - Task and appointment components implemented

### 4. Layout Components (`src/components/`)

- **Purpose**: Navigation, headers, and layout structure
- **Characteristics**:
  - Consistent app-wide styling
  - Responsive design
  - Platform-aware
- **Status**: ✅ Complete - Header, navigation, and layout components implemented

## Component Library Roadmap

### 🔴 High Priority

- **Base UI Components Expansion**
  - ✅ `IconSymbol` - Complete
  - 🚧 `Button` - Standardized button component with variants (primary, secondary, outline)
  - 🚧 `Input` - Text input with validation states and error messages
  - 🚧 `Card` - Reusable card container with consistent styling
  - 🚧 `Modal` - Modal/dialog component with animations
  - 🚧 `Badge` - Status badges and labels
  - 🚧 `LoadingSpinner` - Consistent loading indicators
  - 🚧 `EmptyState` - Empty state messages with icons

### 🟡 Medium Priority

- **Form Components**
  - `FormField` - Wrapper for form inputs with labels and errors
  - `Select` - Dropdown/select component
  - `Checkbox` - Checkbox input component
  - `Radio` - Radio button group component
  - `DatePicker` - Date selection component
  - `TimePicker` - Time selection component

- **Feedback Components**
  - `Toast` - Toast notification system
  - `Alert` - Alert dialog component
  - `Snackbar` - Snackbar notifications

- **Navigation Components**
  - `Breadcrumb` - Breadcrumb navigation
  - `Tabs` - Tab navigation component
  - `Stepper` - Multi-step form indicator

### 🟢 Future Enhancements

- **Data Display Components**
  - `DataTable` - Sortable, filterable table
  - `Pagination` - Pagination controls
  - `InfiniteScroll` - Infinite scroll list
  - `Chart` - Chart/graph components

- **Advanced Components**
  - `Calendar` - Calendar picker component
  - `Timeline` - Timeline visualization
  - `Accordion` - Collapsible content sections
  - `Tooltip` - Tooltip component

## Component Development Standards

**All components in the library must:**

- ✅ **Be fully typed** - TypeScript interfaces for all props
- ✅ **Have unit tests** - Test rendering, interactions, and edge cases
- ✅ **Be documented** - JSDoc comments and usage examples
- ✅ **Support i18n** - All text content translatable
- ✅ **Be accessible** - WCAG 2.1 AA compliance
- ✅ **Follow design system** - Consistent styling and theming
- ✅ **Be responsive** - Work on all screen sizes
- ✅ **Support dark mode** - Theme-aware styling

**Component File Structure:**

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.stories.tsx  # Storybook stories (future)
├── index.ts                   # Barrel export
└── README.md                  # Component documentation
```

