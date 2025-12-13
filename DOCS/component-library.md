# Component Library

The app is building out a **comprehensive, reusable component library** organized by purpose and reusability.

## Component Library Structure

```
components/
├── ui/                          # 🎨 Base UI Components (Design System)
│   ├── IconSymbol.tsx          # Icon component with SF Symbols support
│   ├── TabBarBackground.tsx     # Tab bar styling component
│   ├── Button.tsx               # Button component with variants + loading state
│   ├── Card.tsx                 # Card container with consistent border + padding
│   ├── TextField.tsx            # Text input with label + helper/error text
│   ├── LoadingSpinner.tsx       # Consistent loading indicator
│   ├── DatePicker.tsx           # Date-only picker field (wraps native DateTimePicker)
│   ├── DateTimePicker.tsx       # Date + time picker field (wraps native DateTimePicker)
│   └── ...                      # Future: Modal, Badge, EmptyState, etc.
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
  - ✅ `Button` - Standardized button component with variants (primary, secondary, outline, ghost) + loading state
  - ✅ `TextField` - Text input with label + helper/error text
  - ✅ `Card` - Reusable card container with consistent border + padding
  - 🚧 `Modal` - Modal/dialog component with animations
  - 🚧 `Badge` - Status badges and labels
  - ✅ `LoadingSpinner` - Consistent loading indicators
  - 🚧 `EmptyState` - Empty state messages with icons

## Usage Examples

### Button

```tsx
import { Button } from "@/components/ui/Button";

<Button label="Save" onPress={handleSave} />;
<Button variant="outline" label="Cancel" onPress={handleCancel} />;
<Button loading label="Saving..." />;
```

### DatePicker / DateTimePicker

```tsx
import { DatePicker } from "@/components/ui/DatePicker";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select a date"
/>;

<DateTimePicker
  value={selectedDateTime}
  onChange={setSelectedDateTime}
  placeholder="Select date & time"
/>;
```

### Card

```tsx
import { Card } from "@/components/ui/Card";

<Card>
  <Text>Content</Text>
</Card>;
```

### TextField

```tsx
import { TextField } from "@/components/ui/TextField";

<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  helperText="We’ll never share your email."
/>;
<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  errorText="Please enter a valid email."
/>;
```

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
