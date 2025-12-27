# Docstring Coverage Enforcement

## Overview

This project enforces **80% minimum JSDoc coverage** for all TypeScript/JavaScript files via a pre-commit hook.

## What Gets Checked

The docstring checker validates JSDoc comments for:

- ✅ **Exported functions** (regular and async)
- ✅ **Exported arrow functions** (const declarations)
- ✅ **Exported classes** and their public methods
- ✅ **Exported interfaces**
- ✅ **Exported types**
- ✅ **Exported constants** and variables

## What's Excluded

The checker **skips**:

- ❌ Test files (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- ❌ Storybook files (`*.stories.tsx`)
- ❌ Type declaration files (`*.d.ts`)
- ❌ Node modules
- ❌ Non-exported/internal functions

---

## JSDoc Format

### Basic Function

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - Array of items with prices
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price including tax
 */
export const calculateTotal = (items: Item[], taxRate: number): number => {
  // ...
};
```

### React Component

```typescript
/**
 * Button component with various styles and sizes.
 *
 * @param props - Component props
 * @param props.label - Button text label
 * @param props.onPress - Callback when button is pressed
 * @param props.variant - Visual style variant
 * @returns Rendered button component
 */
export const Button: React.FC<ButtonProps> = ({ label, onPress, variant }) => {
  // ...
};
```

### Interface/Type

```typescript
/**
 * Configuration options for the task service.
 */
export interface TaskServiceConfig {
  /** Maximum number of retries for failed operations */
  maxRetries: number;
  /** Timeout in milliseconds */
  timeout: number;
}
```

### Constant

```typescript
/**
 * Standard font weights used throughout the application.
 * Maps semantic weight names to numeric values.
 */
export const FontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 800,
} as const;
```

---

## Running the Check Manually

```bash
# Check docstring coverage for staged files
yarn check:docstrings

# Check specific file
node scripts/check-docstrings.js path/to/file.ts
```

---

## Pre-Commit Hook

The docstring check runs automatically on `git commit`:

```bash
git commit -m "feat: Add new feature"

# Output:
📝 Checking docstring coverage for 3 file(s)...
📊 Overall Docstring Coverage: 85.71%
   Documented: 6/7 exports
✅ Docstring coverage check passed! (85.71%)
```

### If Coverage Fails

```bash
❌ 1 file(s) below 80% threshold:

   src/utils/helper.ts: 50.00%
   Missing JSDoc for: calculateTotal, formatDate

💡 Tip: Add JSDoc comments (/** ... */) above exported functions, classes, and types.
💡 You can also run: @coderabbitai generate docstrings
💡 Or use --no-verify to skip this check (not recommended).
```

---

## Auto-Generating Docstrings

### Option 1: CodeRabbit (Recommended)

Comment on your PR:

```
@coderabbitai generate docstrings
```

CodeRabbit will automatically:
1. Analyze your code
2. Generate comprehensive JSDoc comments
3. Create a commit with the documentation

### Option 2: Manual Documentation

Add JSDoc comments manually following the patterns above.

---

## Bypassing the Check (Not Recommended)

If you need to commit without meeting the threshold:

```bash
git commit --no-verify -m "WIP: Work in progress"
```

⚠️ **Warning:** This should only be used for:
- Work-in-progress commits on feature branches
- Emergency hotfixes (document immediately after)
- Generated code that doesn't need documentation

**Never bypass the check for:**
- Production code
- Pull requests to `main` or `develop`
- Public API changes

---

## Configuration

### Adjusting the Threshold

Edit `scripts/check-docstrings.js`:

```javascript
const THRESHOLD = 80; // Change to desired percentage
```

### Excluding Additional Patterns

Edit the filter logic in `getStagedFiles()`:

```javascript
.filter(file => !file.includes('your-pattern'))
```

---

## Troubleshooting

### "No TypeScript/JavaScript files staged"

- You haven't staged any `.ts`, `.tsx`, `.js`, or `.jsx` files
- All staged files are excluded (tests, stories, etc.)

### "Coverage 0.00%"

- No exports found in the file (internal-only code)
- JSDoc comments are not directly above exports (must be within 5 lines)
- JSDoc format is incorrect (must use `/** */`, not `/* */` or `//`)

### False Positives

If the checker incorrectly flags documented code:

1. Ensure JSDoc is **directly above** the export (max 5 lines gap)
2. Use proper JSDoc format: `/** ... */`
3. Check for typos in the export statement

---

## Best Practices

### ✅ Do

- Document **all** exported functions, classes, and types
- Use descriptive parameter and return value descriptions
- Include `@example` blocks for complex functions
- Keep JSDoc comments up-to-date with code changes
- Use `@param` and `@returns` tags consistently

### ❌ Don't

- Don't document internal/private functions (not exported)
- Don't use single-line comments (`//`) for documentation
- Don't use multi-line comments (`/* */`) instead of JSDoc
- Don't leave large gaps between JSDoc and the export
- Don't bypass the check without good reason

---

## Integration with CI/CD

The docstring check runs:

1. ✅ **Pre-commit** - Blocks commits with insufficient coverage
2. ✅ **CodeRabbit** - Warns on PRs with low coverage
3. ⚠️ **CI Pipeline** - (Optional) Can be added to GitHub Actions

To add to CI, update `.github/workflows/pr-checks.yml`:

```yaml
- name: Check Docstring Coverage
  run: yarn check:docstrings
```

---

## Examples

### Before (Fails Check)

```typescript
export const calculateTotal = (items, taxRate) => {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
};
```

### After (Passes Check)

```typescript
/**
 * Calculates the total price of items including tax.
 *
 * @param items - Array of items with price properties
 * @param taxRate - Tax rate as decimal (0.08 = 8%)
 * @returns Total price with tax applied
 */
export const calculateTotal = (items: Item[], taxRate: number): number => {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
};
```

---

## Summary

- **Threshold:** 80% minimum coverage
- **Scope:** Exported functions, classes, types, interfaces, constants
- **Enforcement:** Pre-commit hook + CodeRabbit
- **Auto-fix:** `@coderabbitai generate docstrings`
- **Manual check:** `yarn check:docstrings`
- **Bypass:** `git commit --no-verify` (use sparingly)

For questions or issues, see the [main development docs](../README.md) or contact the team.

