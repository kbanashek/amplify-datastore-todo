# Troubleshooting "Unauthorized" Errors

If you're getting "Unauthorized" errors after updating the API key, follow these steps:

## Step 1: Verify API Key in aws-exports.js

Check that the API key is correctly updated:

```bash
node -e "const config = require('./aws-exports.js').default; console.log('API Key:', config.aws_appsync_apiKey?.substring(0, 15) + '...');"
```

## Step 2: Verify API Key in AWS Console

1. Go to [AWS AppSync Console](https://console.aws.amazon.com/appsync/home?region=us-east-1)
2. Select API: `lxtodoapp`
3. Go to **Settings** → **API Keys**
4. Verify the API key `da2-b655th...` exists and is **NOT expired**
5. If expired, create a new key and update `aws-exports.js`

## Step 3: Complete App Restart

**CRITICAL**: After updating the API key, you MUST:

1. **Completely close all instances** of the app (iOS, Android, Web)
2. **Kill any running Metro bundlers** or dev servers
3. **Clear app cache** (if possible):
   - iOS: Delete app and reinstall, or clear app data
   - Android: Settings → Apps → Clear Data
   - Web: Clear browser cache or use incognito mode
4. **Restart the app** from scratch

## Step 4: Check Console Logs

When the app starts, look for:

```
[Amplify] ✅ Configured with API_KEY authentication
[Amplify] API Key (first 10 chars): da2-b655th...
[useAmplifyState] Starting DataStore...
[useAmplifyState] ✅ DataStore started successfully
```

If you see the old API key prefix, the app didn't pick up the new key.

## Step 5: Force DataStore Restart

If the error persists after a complete restart, try using the "Force Sync" button on the Seed Data screen. This will:

1. Stop DataStore
2. Restart DataStore with the new configuration
3. Trigger a full sync

## Step 6: Clear DataStore Cache (Last Resort)

If nothing works, clear the DataStore cache:

1. Use the "Clear Cache & Resync" function (if available)
2. Or manually:
   ```typescript
   await DataStore.stop();
   await DataStore.clear();
   await DataStore.start();
   ```

## Common Issues

### Issue: API Key Updated But Still Getting Errors

**Cause**: App is using cached configuration or DataStore hasn't restarted.

**Fix**: Complete app restart (Step 3) + Force Sync (Step 5)

### Issue: API Key Valid But Still Unauthorized

**Cause**: API key might not have proper permissions or AppSync API configuration issue.

**Fix**:

1. Verify API key has `read` and `write` permissions in AppSync
2. Check AppSync API settings → Authorization → API Key is enabled
3. Verify the API key is associated with the correct API

### Issue: Works on One Device But Not Others

**Cause**: Different devices have different cached configurations.

**Fix**: Restart all devices completely and wait for sync (up to 10 seconds)

## Still Not Working?

If you've tried all steps and still get "Unauthorized":

1. **Double-check the API key** in AWS Console matches what's in `aws-exports.js`
2. **Verify the API key expiration date** - create a new one if needed
3. **Check AppSync API logs** in CloudWatch for detailed error messages
4. **Try creating a completely new API key** and updating `aws-exports.js`
