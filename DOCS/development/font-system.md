# Font System Guide - Orion Task System

**Last Updated:** 2025-12-26  
**Package:** `@orion/task-system`

---

## Overview

The Orion Task System uses **Ubuntu** as the primary typeface across iOS and Android platforms. This guide provides instructions for implementing fonts consistently throughout the package.

### Key Features

- ✅ **Centralized font definitions** in `AppFonts.ts`
- ✅ **Platform-aware font resolution** (iOS vs Android)
- ✅ **Pre-configured text styles** for common use cases
- ✅ **Type-safe font utilities** with TypeScript
- ✅ **Comprehensive unit test coverage**

---

## Quick Reference

### Import Font Styles

```typescript
import { AppFonts } from "@constants/AppFonts";
```

### Usage Example

```tsx
<Text style={AppFonts.bodyBold}>Your Text Here</Text>
```

Or combine with custom styles:

```tsx
<Text style={[AppFonts.heading, { color: "#custom" }]}>
  Custom Heading
</Text>
```

---

## Available Font Styles

All font styles are defined in `packages/task-system/src/constants/AppFonts.ts`:

| Style | Font Weight | Size | Color | Typical Use |
|-------|-------------|------|-------|-------------|
| `heading` | Bold (800) | 28px | CINavy | Page titles, major headings |
| `subheading` | Medium (500) | 18px | CINavy | Section titles, subheadings |
| `body` | Regular (400) | 16px | Gray | Standard body text |
| `bodyMedium` | Medium (500) | 16px | Gray | Emphasized body text |
| `bodyBold` | Bold (800) | 16px | Gray | Strong emphasis |
| `button` | Medium (500) | 16px | White | Button labels |
| `caption` | Regular (400) | 12px | MediumDarkGray | Image captions, helper text |
| `label` | Medium (500) | 14px | Gray | Form labels, small headings |
| `small` | Regular (400) | 14px | Gray | Secondary information |

### Italic Variants

| Style | Font Weight | Size | Color | Use |
|-------|-------------|------|-------|-----|
| `bodyItalic` | Regular (400) | 16px | Gray | Italic body text |
| `bodyMediumItalic` | Medium (500) | 16px | Gray | Emphasized italic text |
| `bodyBoldItalic` | Bold (800) | 16px | Gray | Strong italic emphasis |

**Note:** Only Light (300) and Bold (800) weights have true italic variants. Medium (500) and Regular (400) fall back to their non-italic versions when `italic: true` is specified.

---

## Available Font Weights

Defined in `packages/task-system/src/utils/fontUtils.ts`:

```typescript
export const FontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 800,
};
```

| Weight | iOS Font | Android Font | Use |
|--------|----------|--------------|-----|
| 300 | `Ubuntu-Light` | `Ubuntu-L` | Lightweight UI elements |
| 400 | `Ubuntu-Regular` | `Ubuntu-R` | Standard body text |
| 500 | `Ubuntu-Medium` | `Ubuntu-M` | Subheadings, emphasis |
| 800 | `Ubuntu-Bold` | `Ubuntu-B` | Headings, strong emphasis |

---

## Available Font Sizes

Defined in `packages/task-system/src/utils/fontUtils.ts`:

```typescript
export const FontSizes = {
  xs: 12,   // Extra small
  sm: 14,   // Small
  md: 16,   // Medium (body text)
  lg: 18,   // Large
  xl: 20,   // Extra large
  xxl: 24,  // 2X large
  xxxl: 28, // 3X large (headings)
};
```

---

## Implementation Patterns

### ✅ Recommended: Use Pre-configured Styles

The simplest and most consistent approach:

```tsx
import { AppFonts } from "@constants/AppFonts";

<Text style={AppFonts.heading}>Main Heading</Text>
<Text style={AppFonts.body}>Regular body text</Text>
<Text style={AppFonts.button}>Button Text</Text>
```

### ✅ Good: Extend Pre-configured Styles

Override specific properties when needed:

```tsx
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

<Text style={[AppFonts.heading, { color: AppColors.errorRed }]}>
  Error Heading
</Text>

<Text style={[AppFonts.body, { fontSize: 18, lineHeight: 24 }]}>
  Larger body text
</Text>
```

### ✅ Acceptable: Use Font Utilities for Custom Combinations

When you need combinations not covered by `AppFonts`:

```tsx
import { getFontStyle, FontWeights, FontSizes } from "@utils/fontUtils";

const customStyle = StyleSheet.create({
  customText: {
    ...getFontStyle(FontWeights.medium, FontSizes.xl),
    color: "#custom",
    lineHeight: 28,
  },
});
```

### ❌ Never: Hardcode Font Names or Sizes

```tsx
// ❌ DON'T DO THIS
<Text style={{ fontFamily: "Ubuntu-Medium", fontSize: 16, fontWeight: "600" }}>
  Wrong approach
</Text>

// ✅ DO THIS INSTEAD
<Text style={AppFonts.bodyMedium}>
  Correct approach
</Text>
```

---

## Platform Handling

The font system automatically handles iOS/Android differences through `fontUtils.ts`:

### iOS
- Uses `fontWeight` CSS property (`"300"`, `"400"`, `"500"`, `"800"`)
- Font family names use standard iOS format (`Ubuntu-Light`, `Ubuntu-Bold`)
- Example: `{ fontFamily: "Ubuntu-Medium", fontWeight: "500" }`

### Android
- Uses different font files with `fontWeight: "normal"`
- Font family names use custom short format (`Ubuntu-L`, `Ubuntu-B`)
- Weight is encoded in the font file name
- Example: `{ fontFamily: "Ubuntu-M", fontWeight: "normal" }`

**You don't need to handle these differences manually** - `AppFonts` and `fontUtils` handle this for you.

---

## Font File Locations

All font files are located in `packages/task-system/assets/fonts/`:

### Ubuntu Font Files

**iOS:**
- `Ubuntu-Light.ttf` (300)
- `Ubuntu-Regular.ttf` (400)
- `Ubuntu-Medium.ttf` (500)
- `Ubuntu-Bold.ttf` (800)
- `Ubuntu-LightItalic.ttf` (300 italic)
- `Ubuntu-BoldItalic.ttf` (800 italic)

**Android:**
- `Ubuntu-L.ttf` (Light - 300)
- `Ubuntu-R.ttf` (Regular - 400)
- `Ubuntu-M.ttf` (Medium - 500)
- `Ubuntu-B.ttf` (Bold - 800)
- `Ubuntu-LI.ttf` (Light Italic)
- `Ubuntu-BI.ttf` (Bold Italic)

---

## Common Use Cases

### Headings

```tsx
<Text style={AppFonts.heading}>
  Main Page Title
</Text>

<Text style={AppFonts.subheading}>
  Section Title
</Text>
```

### Body Text

```tsx
<Text style={AppFonts.body}>
  Regular paragraph text goes here.
</Text>

<Text style={AppFonts.bodyMedium}>
  Emphasized paragraph text.
</Text>

<Text style={AppFonts.bodyBold}>
  Strongly emphasized text.
</Text>
```

### Buttons

```tsx
<Button>
  <Text style={AppFonts.button}>
    Submit Form
  </Text>
</Button>
```

### Form Labels

```tsx
<Text style={AppFonts.label}>
  Email Address
</Text>
<TextInput style={AppFonts.body} />
```

### Captions and Helper Text

```tsx
<Text style={AppFonts.caption}>
  * Required field
</Text>

<Text style={AppFonts.small}>
  Additional information about this field
</Text>
```

---

## Best Practices

### ✅ Do

1. **Use `AppFonts` whenever possible** for consistency
2. **Import from `@constants/AppFonts`** using path aliases
3. **Combine with `AppColors`** from `@constants/AppColors`
4. **Let the system handle platform differences**
5. **Use array syntax** for combining styles: `style={[AppFonts.body, customStyle]}`
6. **Test on both platforms** to verify font rendering

### ❌ Don't

1. **Don't hardcode font family names** in component styles
2. **Don't manually handle `Platform.OS`** for fonts
3. **Don't use inconsistent font weights** across similar components
4. **Don't hardcode `fontSize` or `fontWeight`** values
5. **Don't forget colors** - combine fonts with `AppColors` for consistency

---

## Integration with Color Theme

Always combine fonts with colors from the theme:

```tsx
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

const styles = StyleSheet.create({
  heading: {
    ...AppFonts.heading,
    color: AppColors.CINavy,
  },
  body: {
    ...AppFonts.body,
    color: AppColors.gray,
  },
  link: {
    ...AppFonts.bodyMedium,
    color: AppColors.CIBlue,
  },
  error: {
    ...AppFonts.small,
    color: AppColors.errorRed,
  },
});
```

---

## Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/constants/AppFonts.ts` | Pre-configured font style definitions |
| `src/utils/fontUtils.ts` | Font utilities and platform abstraction |
| `src/utils/__tests__/fontUtils.test.ts` | Unit tests for font utilities |
| `assets/fonts/` | Physical font files |

### Data Flow

```
Component
    ↓
AppFonts (from constants/AppFonts.ts)
    ↓
getFontStyle() (from utils/fontUtils.ts)
    ↓
Platform-specific font name (iOS vs Android)
    ↓
Font file in assets/fonts/
```

### Type Safety

The font system is fully type-safe:

```typescript
// FontWeight is a union type: 300 | 400 | 500 | 800
export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];

// FontSize is a union type: 12 | 14 | 16 | 18 | 20 | 24 | 28
export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];

// getFontStyle returns a properly typed TextStyle
export const getFontStyle = (
  weight: FontWeight,
  size: number,
  italic = false
): TextStyle => { ... }
```

---

## Testing

### Unit Tests

Font utilities have comprehensive unit test coverage in `src/utils/__tests__/fontUtils.test.ts`:

- ✅ Platform-specific font family resolution (iOS/Android)
- ✅ All font weights (300, 400, 500, 800)
- ✅ Italic variants (Light and Bold)
- ✅ Complete font style objects
- ✅ Edge cases and fallbacks

Run tests:

```bash
yarn test fontUtils.test.ts
```

---

## Troubleshooting

### Font Not Rendering Correctly

**Problem:** Font appears as system default instead of Ubuntu

**Solution:**
1. Verify font files exist in `packages/task-system/assets/fonts/`
2. Ensure fonts are properly loaded in app initialization
3. Check that you're using `AppFonts` (not hardcoded names)
4. Verify React Native asset bundler included the fonts

### Inconsistent Weight Across Platforms

**Problem:** Font weight looks different on iOS vs Android

**Solution:**

This is expected behavior. iOS and Android handle font weights differently:
- **iOS:** Uses CSS `fontWeight` property
- **Android:** Uses different font files (weight is in the file name)

The `AppFonts` object handles these differences automatically. Stick to pre-configured styles.

### TypeScript Errors

**Problem:** TypeScript complains about fontUtils imports

**Solution:**

Ensure you're importing from the correct paths using path aliases:

```typescript
import { AppFonts } from "@constants/AppFonts";
import { getFontStyle, FontWeights } from "@utils/fontUtils";
```

---

## Migration Guide

When updating existing components to use the font system:

### Step 1: Find Existing Font Usage

```typescript
// Old approach (before migration)
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
  },
});
```

### Step 2: Replace with AppFonts

```typescript
// New approach (after migration)
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

const styles = StyleSheet.create({
  title: {
    ...AppFonts.heading,
    color: AppColors.gray,
  },
});
```

### Step 3: Verify Consistency

- Check that similar components use similar font styles
- Ensure colors come from `AppColors`
- Test rendering on both iOS and Android

---

## Examples from Codebase

### Task Card Component

```typescript
// packages/task-system/src/components/TaskCard.tsx
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

const styles = StyleSheet.create({
  taskTitle: {
    ...AppFonts.heading,
    color: AppColors.CINavy,
  },
  taskTime: {
    ...AppFonts.bodyBold,
    color: AppColors.mediumDarkGray,
  },
  taskDescription: {
    ...AppFonts.caption,
    color: AppColors.gray,
  },
});
```

### Button Component

```typescript
// packages/task-system/src/components/ui/Button.tsx
import { AppFonts } from "@constants/AppFonts";

const styles = StyleSheet.create({
  label: {
    ...AppFonts.button,
    textAlign: "center",
  },
});
```

### Question Component

```typescript
// packages/task-system/src/components/questions/QuestionRenderer.tsx
import { AppFonts } from "@constants/AppFonts";

const styles = StyleSheet.create({
  questionText: {
    ...AppFonts.button,
    color: "#2f3542",
    marginBottom: 12,
  },
  labelText: {
    ...AppFonts.subheading,
  },
  errorText: {
    ...AppFonts.label,
    color: "#e74c3c",
  },
});
```

---

## Summary

- **Primary Font:** Ubuntu (all weights and styles)
- **Access Method:** `AppFonts` from `@constants/AppFonts`
- **Platform Handling:** Automatic via `fontUtils`
- **Best Practice:** Use pre-configured styles, combine with `AppColors`
- **Avoid:** Hardcoded font names, sizes, or weights

---

## Related Documentation

- [Color System](./color-system.md) *(if exists)*
- [Component Architecture](../../.cursor/rules/architecture.mdc)
- [TypeScript Best Practices](../../.cursor/rules/code-style.mdc)

---

**For questions or clarifications, refer to:**
- `packages/task-system/src/constants/AppFonts.ts` - Font definitions
- `packages/task-system/src/utils/fontUtils.ts` - Font utilities
- `packages/task-system/src/utils/__tests__/fontUtils.test.ts` - Usage examples

