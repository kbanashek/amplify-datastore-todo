# Nuclear Delete Scripts

## Purpose

These scripts **HARD DELETE** all items from all DynamoDB tables used by the orion-task-system.

Unlike GraphQL mutations (which DataStore can cache/ignore), these scripts use AWS CLI to directly delete items from DynamoDB tables, bypassing all DataStore sync metadata and version tracking.

## When to Use

Use these scripts when:

- DataStore sync is completely broken across devices
- Devices show different data and won't sync
- You manually cleared DynamoDB tables but devices still show stale data
- You need a guaranteed clean slate for testing

## DO NOT USE when:

- You just want to reset test data (use Dev Options screen instead)
- Sync is working fine (use Dev Options "Delete EVERYTHING")
- You have production data (these scripts are for dev/test only)

---

## Option 1: Python Script (Recommended)

**More reliable, better error handling, progress indicators**

### Prerequisites

- Python 3
- AWS CLI installed and configured (`aws configure`)

### Usage

```bash
cd /Users/Kyle.Banashek/Source/orion-task-system
./scripts/nuclear-delete-dynamodb.py
```

### What it does:

1. Checks AWS CLI is installed and credentials are configured
2. Shows which tables will be cleared
3. Requires explicit confirmation: `DELETE EVERYTHING`
4. Scans each table for all items
5. Deletes each item individually (ensures complete deletion)
6. Shows progress with live updates
7. Reports total items deleted

---

## Option 2: Bash Script

**Faster for large datasets, requires jq**

### Prerequisites

- Bash
- AWS CLI installed and configured (`aws configure`)
- `jq` installed (`brew install jq` on Mac)

### Usage

```bash
cd /Users/Kyle.Banashek/Source/orion-task-system
./scripts/nuclear-delete-dynamodb.sh
```

---

## After Running Nuclear Delete

### Step 1: Delete and Reinstall Apps on ALL Devices

**iOS:**

1. Long press app icon → Delete App
2. In terminal, press `i` to reinstall

**Android:**

1. Settings → Apps → Expo Go → Clear Storage (or uninstall)
2. In terminal, press `a` to reinstall

### Step 2: Add Fresh Test Data on ONE Device

On one device:

1. Open the app
2. Go to **Dev Options** tab
3. Press **"⚡️ Add 10 Test Tasks"**

### Step 3: Wait for Sync

Wait 10 seconds for DataStore's `fullSyncInterval` to trigger.

### Step 4: Verify Other Devices

Other devices should automatically pull the 10 tasks within 10-20 seconds.

---

## Tables Cleared

The scripts delete all items from these tables:

- `Task-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `Activity-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `Question-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `TaskAnswer-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `TaskResult-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `TaskHistory-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `TaskTempAnswer-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `DataPoint-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `DataPointInstance-lhpwtevzhnhixnfnbue6f5q7fa-dev`
- `Appointment-lhpwtevzhnhixnfnbue6f5q7fa-dev`

---

## Troubleshooting

### "AWS CLI not found"

Install AWS CLI:

```bash
# Mac
brew install awscli

# Or download from https://aws.amazon.com/cli/
```

### "AWS credentials not configured"

Configure AWS credentials:

```bash
aws configure
```

You'll need:

- AWS Access Key ID
- AWS Secret Access Key
- Region: `us-east-1`

### "Table not found"

The script will skip tables that don't exist. This is normal if some tables haven't been created yet.

### Script runs but devices still show old data

You MUST delete and reinstall the apps on ALL devices. The local SQLite cache persists across app restarts.

---

## Safety Features

- **Explicit confirmation required**: Must type `DELETE EVERYTHING`
- **AWS credential check**: Fails fast if credentials are missing
- **Table existence check**: Skips tables that don't exist
- **Progress indicators**: Shows live progress during deletion
- **Summary report**: Shows total items deleted

---

## Why This Works When GraphQL Mutations Don't

### GraphQL Mutations (via AppSync):

- Can be cached by AppSync
- Can be ignored by DataStore if sync is broken
- Update sync metadata (which might be corrupted)
- Rely on DataStore's outbox (which might be stuck)

### AWS CLI Direct Delete:

- ✅ Bypasses all caching
- ✅ Bypasses DataStore sync
- ✅ Direct DynamoDB operation
- ✅ Guaranteed to delete items
- ✅ Doesn't rely on sync metadata

---

## Example Output

```
╔════════════════════════════════════════════════════════════════╗
║                    ⚠️  NUCLEAR DELETE ⚠️                       ║
║                                                                ║
║  This will HARD DELETE all items from DynamoDB tables:        ║
║  - Task, Activity, Question, TaskAnswer, TaskResult            ║
║  - TaskHistory, TaskTempAnswer, DataPoint, DataPointInstance   ║
║  - Appointment                                                 ║
║                                                                ║
║  ⚠️  THIS CANNOT BE UNDONE!                                    ║
║  ⚠️  ALL DEVICES WILL LOSE ALL DATA!                           ║
║  ⚠️  YOU WILL NEED TO DELETE/REINSTALL APPS!                   ║
╚════════════════════════════════════════════════════════════════╝

✅ AWS CLI configured
   Account: 123456789012
   Region: us-east-1

Type 'DELETE EVERYTHING' to continue: DELETE EVERYTHING

🚀 Starting nuclear delete...

📋 Processing table: Task-lhpwtevzhnhixnfnbue6f5q7fa-dev
   🔑 Primary Key: id
   📊 Found 10 items
   🗑️  Deleting items.......... 10 items
   ✅ Deleted 10 items

📋 Processing table: Activity-lhpwtevzhnhixnfnbue6f5q7fa-dev
   🔑 Primary Key: id
   📊 Found 2 items
   🗑️  Deleting items.. 2 items
   ✅ Deleted 2 items

╔════════════════════════════════════════════════════════════════╗
║                    ✅ NUCLEAR DELETE COMPLETE                   ║
║                                                                ║
║  Deleted 12 items total                                        ║
║                                                                ║
║  NEXT STEPS:                                                   ║
║  1. Delete and reinstall apps on ALL devices                   ║
║  2. Add fresh test data on ONE device                          ║
║  3. Wait 10 seconds for sync                                   ║
║  4. Verify other devices pull the data                         ║
╚════════════════════════════════════════════════════════════════╝
```
