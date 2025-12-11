# Translation Troubleshooting Guide

## Common Issues and Solutions

### ⏰ Clock Skew Error

**Error Message:**
```
InvalidSignatureException: Signature not yet current: 20251214T153335Z is still later than 20251211T153836Z
```

**Problem:**
Your device's clock is out of sync with AWS servers. AWS requires requests to be within 15 minutes of server time.

**Solution:**

#### Android:
1. Open **Settings**
2. Go to **System** → **Date & time**
3. Enable **Set automatically** (or manually set correct date/time)
4. Reload the app

#### iOS:
1. Open **Settings**
2. Go to **General** → **Date & Time**
3. Enable **Set Automatically** (or manually set correct date/time)
4. Reload the app

#### Verify Fix:
After syncing time, check logs for:
- ✅ No more `InvalidSignatureException` errors
- ✅ Translations showing `changed: true`
- ✅ `Translation successful` messages

---

### 🔑 Access Denied Error

**Error Message:**
```
AccessDeniedException: User is not authorized to perform: translate:TranslateText
```

**Problem:**
IAM user doesn't have `translate:TranslateText` permission.

**Solution:**
1. Update IAM policy with Translate permissions (see `DOCS/aws-iam-policy-setup.md`)
2. Wait 10-30 seconds for IAM changes to propagate
3. Reload credentials: `npm run load-aws-credentials <profile-name>`
4. Reload the app

---

### 📝 Translations Not Appearing (`changed: false`)

**Symptom:**
Logs show `changed: false` - translations return original text.

**Possible Causes:**

1. **Clock Skew** (most common)
   - Fix: Sync device time (see above)

2. **API Returning Original Text**
   - Check: Are you translating from English to English?
   - Solution: Select a different language (not "en")

3. **Empty/Cached Response**
   - Check logs for: `No translated text in response`
   - Solution: Check AWS Translate service status

4. **Rate Limiting**
   - Check: Too many requests in short time
   - Solution: Wait a few seconds and try again

---

### 🔄 Credentials Not Loading

**Error Message:**
```
Credential is missing
```

**Solution:**

1. **Load credentials:**
   ```bash
   npm run load-aws-credentials <profile-name>
   ```

2. **Verify credentials file exists:**
   ```bash
   cat src/config/aws-credentials.json
   ```

3. **Check AWS profile:**
   ```bash
   aws configure list --profile <profile-name>
   ```

4. **Reload the app** after loading credentials

---

### 🧩 structuredClone Error

**Error Message:**
```
Property 'structuredClone' doesn't exist
```

**Problem:**
Polyfill not loading correctly.

**Solution:**

1. **Check polyfill is imported:**
   - Should see: `[Polyfill] ✅ structuredClone polyfill installed successfully`
   - If not, check import order in `entry.js` and `app/_layout.tsx`

2. **Verify polyfill file exists:**
   ```bash
   ls src/polyfills/structuredClone.ts
   ```

3. **Reload the app** completely

---

## Verification Steps

### 1. Test Translation Service
```bash
npm run test:translation
```

Should show:
- ✅ All 3 test translations successful
- ✅ 100% success rate
- ✅ No errors

### 2. Check App Logs

When changing language, look for:

**✅ Success:**
```
📝 [TranslationService] Translation successful
   - changed: true  ← KEY: Must be true!
   - translated: "¿Cuál es tu nombre?"
```

**❌ Failure:**
```
ERROR 📝 [TranslationService] Error translating text
   - errorName: "InvalidSignatureException"
   - changed: false
```

### 3. Visual Verification

- Question text should appear in selected language
- Choice options should be translated
- Review screen should show translated questions

---

## Quick Diagnostic Checklist

- [ ] Device time is synced with network time
- [ ] IAM policy includes `translate:TranslateText` permission
- [ ] Credentials loaded: `npm run load-aws-credentials <profile>`
- [ ] App reloaded after credential changes
- [ ] Language selected is NOT English (en)
- [ ] Test script passes: `npm run test:translation`
- [ ] Logs show `changed: true` for translations
- [ ] No `InvalidSignatureException` errors
- [ ] No `AccessDeniedException` errors

---

## Still Not Working?

1. **Check AWS Translate Service Status:**
   - Visit: https://status.aws.amazon.com/
   - Look for "Amazon Translate" service status

2. **Verify Region:**
   - Check logs for: `region: "us-east-1"`
   - Ensure your AWS account supports this region

3. **Check Billing:**
   - Ensure AWS account is active
   - Check for any service limits

4. **Review Full Logs:**
   - Look for any error patterns
   - Check translation service initialization logs
   - Verify credentials are being used

5. **Test with Different Language:**
   - Try Spanish (es), French (fr), or German (de)
   - Some languages may have different behavior

---

## Getting Help

If issues persist:
1. Check all logs for error patterns
2. Run test script: `npm run test:translation`
3. Verify device time is correct
4. Check IAM permissions
5. Review `DOCS/aws-iam-policy-setup.md` for policy setup


