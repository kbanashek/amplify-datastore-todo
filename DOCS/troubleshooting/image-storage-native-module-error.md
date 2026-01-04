# Image Storage Native Module Errors

## Errors

When running the app after adding S3 image storage integration, you may see:

```
WARN  Amplify has not been configured. Please call Amplify.configure() before using this service.
ERROR  [runtime not ready]: Error: Cannot find native module 'FileSystem', js engine: hermes
```

## Root Causes

### 1. FileSystem Native Module Not Found

**Error:** `Cannot find native module 'FileSystem'`

**Cause:** `expo-file-system` was added to `package.json` but the native module hasn't been compiled into the app binary.

**Solution:** Rebuild the development client to include the native module.

### 2. Amplify Not Configured

**Error:** `Amplify has not been configured`

**Cause:** Amplify Storage is being imported before `Amplify.configure()` is called.

**Solution:** Ensure Amplify is configured in your app's entry point before any components mount.

## Solutions

### For Native Modules (iOS/Android)

#### iOS

```bash
cd /Users/Kyle.Banashek/Source/orion-task-system

# Clean and rebuild
yarn ios:install-pods
yarn ios
```

Or using EAS:

```bash
# Build new development client
eas build --profile development --platform ios

# Install on device/simulator
```

#### Android

```bash
cd /Users/Kyle.Banashek/Source/orion-task-system

# Clean and rebuild
yarn android
```

Or using EAS:

```bash
# Build new development client
eas build --profile development --platform android

# Install on device/emulator
```

### For Amplify Configuration

Ensure `Amplify.configure()` is called early in your app's lifecycle:

**Current Setup (Correct):**

```typescript
// src/amplify-init-sync.ts
import { Amplify } from "@aws-amplify/core";
import { configureAmplify } from "./amplify-config";

// Self-executing function ensures synchronous execution
(function initializeAmplify() {
  configureAmplify();
})();

export const AMPLIFY_INITIALIZED = true;
```

```typescript
// entry.js or app/_layout.tsx
import "./src/amplify-init-sync"; // Import FIRST, before other imports

// ... rest of app
```

## Why Rebuild is Required

### Native Modules

React Native apps are compiled binaries that include:

1. JavaScript bundle (your code)
2. Native modules (platform-specific code)

When you add a new native module like `expo-file-system`:

- The JavaScript code is updated immediately (via Fast Refresh)
- The native code is NOT updated until you rebuild

**Think of it like:**

- JavaScript = content of a website (updates instantly)
- Native modules = browser plugins (need reinstall)

### Development vs Production

- **Development:** Use development client (includes all native modules)
- **Production:** Build standalone app with required native modules

## Verification

After rebuilding, verify the module is available:

```typescript
import * as FileSystem from "expo-file-system";

console.log("FileSystem available:", !!FileSystem.documentDirectory);
// Should log: FileSystem available: true
```

## Alternative: Conditional Import (Not Recommended)

If you can't rebuild immediately, you can make the image capture feature optional:

```typescript
// In ImageCaptureQuestion.tsx
let ImageStorageService: any;
try {
  ImageStorageService = require("@services/ImageStorageService").getImageStorageService();
} catch (error) {
  // Native module not available
  ImageStorageService = null;
}

if (!ImageStorageService) {
  return <Text>Image capture requires app rebuild</Text>;
}
```

**However, the proper solution is to rebuild the app.**

## Common Mistakes

### ❌ Don't: Try to fix with package reinstall

```bash
# This won't help - the issue is native code, not JavaScript
yarn install
```

### ❌ Don't: Clear Metro cache

```bash
# This won't help - Metro bundles JavaScript, not native code
yarn start --clear
```

### ✅ Do: Rebuild the app

```bash
# iOS
yarn ios

# Android
yarn android
```

## Testing Without Rebuild

If you need to test other features without rebuilding:

1. **Comment out image storage imports** temporarily:

```typescript
// Temporarily disable to test other features
// import { getImageStorageService } from "@services/ImageStorageService";
```

2. **Use fallback UI** in `ImageCaptureQuestion`:

```typescript
if (!ImagePicker) {
  return (
    <View>
      <Text>Image capture unavailable - rebuild required</Text>
    </View>
  );
}
```

3. **Rebuild when ready** to enable full functionality.

## Summary

| Error                                    | Cause                                   | Solution                                     |
| ---------------------------------------- | --------------------------------------- | -------------------------------------------- |
| `Cannot find native module 'FileSystem'` | Native module not compiled              | Rebuild app (`yarn ios` / `yarn android`)    |
| `Amplify has not been configured`        | Import order issue                      | Ensure `amplify-init-sync.ts` imported first |
| Both errors                              | Fresh install after adding dependencies | Rebuild app                                  |

**Bottom line:** After adding `expo-file-system`, you must rebuild the app to include the native module. This is expected React Native behavior.
