# Testing Cross-Device Sync

This guide explains how to test that data changes reflect immediately across devices (iOS, Android, Web).

## Prerequisites

1. **All devices must be online** - Sync requires network connectivity
2. **Same AWS account** - All devices must use the same `aws-exports.js` configuration
3. **Console access** - You'll need to view logs to verify sync is working

## Quick Test Setup

### Step 1: Start Multiple Devices

Open **3 terminal windows** and run the app on different platforms:

**Terminal 1 - iOS:**

```bash
yarn ios
```

**Terminal 2 - Android:**

```bash
yarn android
```

**Terminal 3 - Web:**

```bash
yarn web
```

> **Note:** You can also use physical devices with Expo Go or development builds. The key is having multiple instances running simultaneously.

### Step 2: Verify All Devices Are Connected

On each device, check the header:

- ✅ Should show **"Online & Synced"** with a green dot
- ❌ If it shows "Offline" or "Syncing...", wait until it shows "Online & Synced"

## Test Scenarios

### Test 1: Task Status Update (Most Important)

**Purpose:** Verify that updating a task status on one device immediately appears on other devices.

**Steps:**

1. **On Device A (e.g., iOS):**
   - Navigate to Dashboard
   - Find a task with status "OPEN" or "IN_PROGRESS"
   - Click "BEGIN" or "RESUME" to start the task
   - Note the task title and current status

2. **On Device B (e.g., Android) and Device C (e.g., Web):**
   - Watch the Dashboard
   - **Expected:** Within **1-2 seconds**, the task status should update to match Device A
   - The task should show "IN_PROGRESS" or "COMPLETED" status

3. **Verify in Logs:**
   - Check Device A console for: `[iOS][TaskService] Task updated successfully - syncing to cloud immediately`
   - Check Device B console for: `[Android][TaskService] DataStore operation detected via observe`
   - Check Device C console for: `[Web][TaskService] Query refresh after UPDATE operation`

**Success Criteria:**

- ✅ Task status updates on all devices within 1-2 seconds
- ✅ All devices show the same task status
- ✅ Logs show sync operations on all devices

### Test 2: Task Completion

**Purpose:** Verify that completing a task syncs immediately.

**Steps:**

1. **On Device A:**
   - Start a task (click "BEGIN")
   - Complete all questions
   - Submit the task
   - Task should show "COMPLETED" status

2. **On Device B and C:**
   - Watch the Dashboard
   - **Expected:** Task status changes to "COMPLETED" within 1-2 seconds

**Success Criteria:**

- ✅ Task shows "COMPLETED" on all devices
- ✅ All devices show the same task list

### Test 3: Task Deletion (Nuclear Delete)

**Purpose:** Verify that deleting tasks syncs across devices.

**Steps:**

1. **On Device A:**
   - Navigate to Seed Data screen (menu → Seed Data)
   - Click "🗑️ Nuclear Reset (Delete All Data)"
   - Confirm the deletion

2. **On Device B and C:**
   - Watch the Dashboard
   - **Expected:** All tasks disappear within 2-5 seconds

**Success Criteria:**

- ✅ Tasks are removed from all devices
- ✅ All devices show empty state or no tasks

### Test 4: New Task Creation

**Purpose:** Verify that creating new tasks syncs immediately.

**Steps:**

1. **On Device A:**
   - Navigate to Seed Data screen
   - Click "🌱 Seed Appointments & Tasks Together"
   - Wait for confirmation

2. **On Device B and C:**
   - Watch the Dashboard
   - **Expected:** New tasks appear within 2-5 seconds

**Success Criteria:**

- ✅ New tasks appear on all devices
- ✅ All devices show the same task list

## Monitoring Sync in Real-Time

### View Logs

All sync operations are logged with device-specific prefixes. Look for:

**On the device making changes:**

```
[iOS][TaskService] Task updated successfully - syncing to cloud immediately
```

**On other devices receiving updates:**

```
[Android][TaskService] DataStore operation detected via observe
[Android][TaskService] Query refresh after UPDATE operation
```

### What to Look For

✅ **Good Signs:**

- Logs show `DataStore operation detected via observe` on receiving devices
- Logs show `Query refresh after UPDATE/INSERT/DELETE operation`
- Task statuses match across devices within 1-2 seconds

❌ **Warning Signs:**

- No logs on receiving devices after changes on another device
- Task statuses don't match after 10+ seconds
- Logs show errors like "Error refreshing after UPDATE"

## Troubleshooting

### Issue: Changes Don't Appear on Other Devices

**Check:**

1. **Network Status:**
   - Verify all devices show "Online & Synced"
   - Check network connectivity on all devices

2. **AWS Configuration:**
   - Ensure all devices use the same `aws-exports.js`
   - Verify AWS credentials are valid

3. **Logs:**
   - Check for errors in console logs
   - Look for `[Device][TaskService]` logs on all devices

4. **Force Sync:**
   - On the receiving device, go to Seed Data screen
   - Click "🔄 Force Sync (Clear Cache & Resync)"
   - This will clear local cache and resync from cloud

### Issue: Sync is Slow (>10 seconds)

**Possible Causes:**

- Network latency
- AWS AppSync throttling
- Large data payloads

**Solutions:**

- Check network speed
- Reduce data size (fewer tasks)
- Check AWS AppSync metrics in AWS Console

### Issue: Devices Show Different Data

**Immediate Fix:**

1. On each device showing wrong data:
   - Go to Seed Data screen
   - Click "🔄 Force Sync (Clear Cache & Resync)"
   - Wait for sync to complete

2. Verify all devices show "Online & Synced"

3. Make a small change on one device and verify it appears on others

## Automated Testing

For automated testing, see:

- **E2E Tests:** `DOCS/e2e-testing.md`
- **Web E2E:** `yarn e2e:playwright`
- **Mobile E2E:** `yarn e2e:maestro`

## Expected Sync Timing

| Operation          | Expected Sync Time | Max Acceptable Time |
| ------------------ | ------------------ | ------------------- |
| Task Status Update | < 1 second         | 2 seconds           |
| Task Completion    | < 2 seconds        | 5 seconds           |
| Task Creation      | < 2 seconds        | 5 seconds           |
| Task Deletion      | < 2 seconds        | 5 seconds           |
| Nuclear Delete     | < 5 seconds        | 10 seconds          |

> **Note:** These times assume good network connectivity. Slower networks may take longer.

## Verification Checklist

After testing, verify:

- [ ] Task status updates appear on all devices within 2 seconds
- [ ] Task completions sync immediately
- [ ] Task deletions sync across devices
- [ ] New tasks appear on all devices
- [ ] All devices show "Online & Synced" status
- [ ] Console logs show sync operations on all devices
- [ ] No errors in console logs

## Next Steps

If sync is working correctly:

- ✅ Changes should appear immediately across devices
- ✅ All devices should show consistent data
- ✅ Logs should show sync operations

If sync is not working:

- Check the troubleshooting section above
- Review AWS AppSync configuration
- Check network connectivity
- Review console logs for errors
