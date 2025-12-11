# Right-to-Left (RTL) Language Support

## Overview

The application supports Right-to-Left (RTL) languages including Arabic, Hebrew, Urdu, Persian, and Yiddish. When a user selects an RTL language, the UI automatically adjusts to display content from right to left.

## Supported RTL Languages

- **Arabic** (`ar`)
- **Hebrew** (`he`)
- **Urdu** (`ur`)
- **Persian/Farsi** (`fa`)
- **Yiddish** (`yi`)

## Implementation

### Automatic RTL Detection

The `TranslationService` includes an `isRTL()` function that automatically detects if a language code is RTL:

```typescript
import { isRTL } from "../services/TranslationService";

const isArabicRTL = isRTL("ar"); // true
const isEnglishRTL = isRTL("en"); // false
```

### Translation Context

The `TranslationContext` automatically:
- Detects RTL languages based on the current language selection
- Updates React Native's `I18nManager` to enable RTL mode
- Provides `isRTL` boolean in the context for components to use

```typescript
const { isRTL } = useTranslation();
```

### RTL-Aware Styling Hook

The `useRTL()` hook provides utilities for creating RTL-aware styles:

```typescript
import { useRTL } from "../hooks/useRTL";

const { isRTL, rtlStyle } = useRTL();

// Automatically flips left/right properties for RTL
<View style={rtlStyle({
  marginLeft: 10,
  marginRight: 20,
  paddingLeft: 5,
  textAlign: "left",
})} />
```

### What Gets Flipped Automatically

The `rtlStyle()` function automatically flips:
- **Margins**: `marginLeft` ↔ `marginRight`
- **Padding**: `paddingLeft` ↔ `paddingRight`
- **Borders**: `borderLeftWidth` ↔ `borderRightWidth`
- **Border Radius**: `borderTopLeftRadius` ↔ `borderTopRightRadius`, etc.
- **Text Alignment**: `textAlign: "left"` → `"right"`, `"right"` → `"left"`

### Components with RTL Support

The following components have been updated to support RTL:

- ✅ `GlobalHeader` - Header layout and text alignment
- ✅ `TaskCard` - Task card layout and arrow direction
- ✅ `TranslatedText` - Automatic text alignment
- ✅ `NavigationButtons` - Button layout
- ✅ `TextQuestion` - Input text alignment

### Manual RTL Adjustments

For components that need manual RTL adjustments:

1. **Icons**: Flip chevron directions
   ```typescript
   <IconSymbol 
     name={isRTL ? "chevron.left" : "chevron.right"} 
   />
   ```

2. **Text Alignment**: Use conditional styling
   ```typescript
   <Text style={[styles.text, isRTL && { textAlign: "right" }]}>
   ```

3. **Flex Direction**: React Native automatically handles `flexDirection: "row"` in RTL mode

## Platform Notes

### iOS
- RTL changes apply immediately via `I18nManager.forceRTL()`
- No app restart required

### Android
- RTL changes may require an app restart for full effect
- `I18nManager.forceRTL()` works, but some native components may need restart

## Testing RTL

To test RTL support:

1. Select an RTL language (e.g., Arabic) from the language selector
2. Verify:
   - Text aligns to the right
   - Layouts flip horizontally
   - Icons point in correct direction
   - Margins and padding are flipped
   - Navigation flows correctly

## Future Enhancements

- [ ] Add more RTL languages as needed
- [ ] Improve Android RTL support without requiring restart
- [ ] Add RTL-specific icon sets
- [ ] Test with actual RTL content (not just translations)

