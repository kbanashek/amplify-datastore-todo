# Translation Verification Guide

## Quick Verification

After updating IAM permissions and reloading credentials, verify translation is working:

### Option 1: Test Script (Recommended)

```bash
# Test with current credentials
npm run test:translation

# Test with specific profile
npx tsx scripts/test-translation.ts --profile <profile-name>
```

This will:
- ✅ Test 3 sample translations
- ✅ Show success/failure for each
- ✅ Display any error messages
- ✅ Provide troubleshooting hints

### Option 2: Check App Logs

When you change the language in the app, look for these log patterns:

#### ✅ **Success Indicators:**

```
📝 [TranslationService] Translation successful
   - original: "What is your name?"
   - translated: "Comment vous appelez-vous?"
   - changed: true  ← This is key!
```

```
🌐 [useTranslatedText] Translation completed
   - changed: true  ← Text was actually translated
```

#### ❌ **Error Indicators:**

```
ERROR 📝 [TranslationService] Error translating text
   - errorName: "AccessDeniedException"
   - errorMessage: "User is not authorized..."
```

```
ERROR 📝 [TranslationService] Error translating text
   - errorName: "ReferenceError"
   - errorMessage: "Property 'structuredClone' doesn't exist"
```

## What to Look For in Logs

### 1. **Polyfill Loading**
```
[Polyfill] ✅ structuredClone polyfill installed successfully
[Polyfill] ✅ structuredClone verification test passed
```

### 2. **Credentials Loading**
```
[TranslationService] Loaded credentials from config file
[TranslationService] Using credentials from config file
```

### 3. **Translation Flow**
```
🌐 [useTranslatedText] Starting translation
🔤 [TranslationProvider] Calling translationService.translateText
📝 [TranslationService] translateText() called
📝 [TranslationService] Sending request to AWS Translate API...
📝 [TranslationService] AWS Translate API response received
📝 [TranslationService] Translation successful
   changed: true  ← MUST be true for successful translation
```

### 4. **Common Issues**

#### Access Denied
```
ERROR: AccessDeniedException
Solution: Update IAM policy with translate:TranslateText permission
See: DOCS/aws-iam-policy-setup.md
```

#### Credential Missing
```
ERROR: Credential is missing
Solution: Run: npm run load-aws-credentials <profile-name>
```

#### structuredClone Error
```
ERROR: Property 'structuredClone' doesn't exist
Solution: Check that polyfill is loading (should see [Polyfill] logs)
```

## Manual Testing Steps

1. **Reload the app** (to pick up new credentials)

2. **Navigate to a task with questions**

3. **Change language** using the language selector (🌐)

4. **Check logs for:**
   - `Translation successful` with `changed: true`
   - Question text should appear in the selected language
   - No `AccessDeniedException` errors

5. **Verify visually:**
   - Question text changes to the selected language
   - Choice options (for single/multi-select) are translated
   - Review screen shows translated questions

## Expected Behavior

### When Translation Works:
- ✅ Question text translates immediately
- ✅ Choice options translate
- ✅ Logs show `changed: true`
- ✅ No errors in console
- ✅ Translations are cached (subsequent loads are faster)

### When Translation Fails:
- ❌ Question text stays in English
- ❌ Logs show errors
- ❌ `changed: false` in logs
- ❌ Access denied or credential errors

## Troubleshooting

### Still Getting Access Denied?

1. **Verify policy was saved:**
   ```bash
   aws iam get-user-policy --user-name josh-amplify-user --policy-name minimal-policy-final
   ```

2. **Check policy includes Translate:**
   - Look for `"translate:TranslateText"` in the policy JSON

3. **Wait for propagation:**
   - IAM changes can take 10-30 seconds to propagate
   - Try again after waiting

4. **Reload credentials:**
   ```bash
   npm run load-aws-credentials <profile-name>
   ```

### Translations Not Appearing?

1. **Check language selector:**
   - Make sure you selected a language other than English
   - English (en) won't trigger translations

2. **Check logs for translation activity:**
   - Should see `🌐 [useTranslatedText] Starting translation`
   - Should see `📝 [TranslationService] translateText() called`

3. **Verify questions are being rendered:**
   - Should see `📄 [QuestionScreenContent] Rendering`
   - Should see `❓ [QuestionRenderer] Preparing question text`

## Success Checklist

- [ ] IAM policy updated with `translate:TranslateText`
- [ ] Credentials reloaded: `npm run load-aws-credentials <profile>`
- [ ] App reloaded
- [ ] Language changed to non-English
- [ ] Logs show `Translation successful` with `changed: true`
- [ ] Question text appears in selected language
- [ ] No errors in console

## Next Steps

Once translation is working:
- Translations are automatically cached for 30 days
- Subsequent translations will be faster (from cache)
- You can test with different languages
- Monitor AWS costs in Cost Explorer


