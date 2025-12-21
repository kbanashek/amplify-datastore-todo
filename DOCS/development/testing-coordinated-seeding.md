# Testing Coordinated Appointment and Task Seeding

## Overview

This guide explains how to test the coordinated seeding feature that creates appointments and tasks together with relationships.

## Prerequisites

1. App is running (Expo/React Native)
2. Navigate to the Seed Data screen (seed-screen tab)

## Testing Steps

### 1. Access the Seed Screen

1. Open the app
2. Navigate to the **"seed-screen"** tab (bottom navigation)
3. You should see three sections:
   - **Tasks & Activities** (existing)
   - **Appointments & Tasks Together** (new coordinated seeding)
   - **Appointments** (existing)

### 2. Clear Existing Data (Optional but Recommended)

Before testing, you may want to clear existing data:

1. Click **"🗑️ Clear All Tasks"** (if you want to start fresh)
2. Click **"🗑️ Clear All Appointments"** (if you want to start fresh)
3. Wait for confirmation alerts

### 3. Run Coordinated Seeding

1. Scroll to the **"Appointments & Tasks Together"** section
2. Click the **"🌱 Seed Appointments & Tasks Together"** button (green button)
3. Wait for the process to complete (you'll see a loading indicator)
4. A success alert should appear showing:
   - Number of appointments created
   - Number of tasks created
   - Number of linked tasks
   - Number of standalone tasks
   - Number of activities
   - Number of relationships

### 4. Verify Results on Seed Screen

After seeding completes, scroll down to see the **"Coordinated Seed Results"** section which shows:

- **Appointments**: Total count
- **Total Tasks**: Total count
- **Linked Tasks**: Tasks linked to appointments
- **Standalone Tasks**: Tasks not linked to appointments
- **Activities**: Activity count
- **Relationships**: Number of appointment-task relationships
- **Relationships Details**: List showing each appointment and its linked tasks

### 5. Verify on Dashboard

1. Navigate to the **Dashboard** tab (Tasks tab)
2. You should see:
   - **Appointments** displayed at the top (today's appointments)
   - **Tasks** displayed below appointments
   - Both appointments and tasks should be visible for today

### 6. Verify Task-Appointment Relationships

To verify that tasks are properly linked to appointments:

#### Check Task Anchors Field

1. Open the app's console/logs
2. Look for log entries from `[SeedCoordinatedScript]`
3. You should see logs showing:
   - Task creation with `anchors` field containing `eventId`
   - `anchorDayOffset` values (-1, 0, 1, 3)
   - Relationship tracking

#### Verify Task Dates

Tasks should be scheduled relative to appointments:

- **Pre-visit tasks**: Should appear 1 day before the appointment
- **Visit-day tasks**: Should appear on the same day as the appointment
- **Post-visit tasks**: Should appear 1 or 3 days after the appointment

### 7. Test Different Scenarios

#### Scenario 1: Today's Appointments

1. Seed coordinated data
2. Check dashboard - should see today's appointments and related tasks
3. Pre-visit tasks should appear (from yesterday's appointments)
4. Visit-day tasks should appear (for today's appointments)
5. Post-visit tasks should appear (for past appointments)

#### Scenario 2: Tomorrow's Appointments

1. Seed coordinated data
2. Check dashboard - should see tomorrow's appointments
3. Pre-visit tasks should appear today (for tomorrow's appointments)
4. Visit-day tasks should appear tomorrow
5. Post-visit tasks should appear day after tomorrow

#### Scenario 3: Standalone Tasks

1. Seed coordinated data
2. Check dashboard - should see standalone tasks (not linked to appointments)
3. These tasks should have no `anchors` field or `anchorDayOffset`

### 8. Verify Data Structure

#### Check Appointment Data

Appointments should have:

- Unique `appointmentId`
- Unique `eventId` (used for linking)
- `startAt` and `endAt` dates
- `status: SCHEDULED` (for active appointments)

#### Check Task Data

Linked tasks should have:

- `anchors` field (JSON string) containing:

  ```json
  {
    "type": "VISIT",
    "eventId": "Event.abc123",
    "anchorDate": "2025-12-12T09:00:00.000Z",
    "canMoveSeriesWithVisit": true
  }
  ```

- `anchorDayOffset` field (-1, 0, 1, or 3)
- `entityId` (linking to an activity)
- `expireTimeInMillSec` calculated relative to appointment date

Standalone tasks should have:

- No `anchors` field (or null)
- No `anchorDayOffset` (or null)
- `entityId` (linking to an activity)
- Regular scheduling

### 9. Test Error Handling

#### Test with Network Issues

1. Disable network connection
2. Try to seed coordinated data
3. Should show appropriate error message

#### Test with Existing Data

1. Seed coordinated data once
2. Seed again without clearing
3. Should create additional appointments and tasks (may have duplicates)

### 10. Console Logging

Check the console for detailed logging:

```text
[SeedCoordinatedScript] Starting coordinated seed (Appointments + Tasks)...
[SeedCoordinatedScript] Step 1: Creating activities
[SeedCoordinatedScript] Step 2: Generating appointments
[SeedCoordinatedScript] Step 3: Creating tasks linked to appointments
[SeedCoordinatedScript] Creating anchored task
[SeedCoordinatedScript] Step 4: Creating standalone tasks
[SeedCoordinatedScript] Step 5: Saving appointments
[SeedCoordinatedScript] Coordinated seeding complete!
```

## Expected Results

After successful seeding, you should have:

- **4 Activities**: Health Survey, Pain Assessment, Medical History, Multi-Page Health Assessment
- **4 Appointments**: Today (2), Tomorrow (1), Next Week (1)
- **~20 Linked Tasks**: 5 tasks per appointment × 4 appointments
- **~12 Standalone Tasks**: 2-3 tasks per day × 6 days
- **4 Relationships**: One per scheduled appointment

## Troubleshooting

### Appointments Not Showing

- Check if appointments are for today's date
- Verify `AppointmentService.saveAppointments()` was called
- Check console for errors

### Tasks Not Showing

- Check if tasks are scheduled for today
- Verify `TaskService.createTask()` was called
- Check console for errors
- Verify tasks have valid `expireTimeInMillSec`

### Relationships Not Working

- Check `anchors` field in tasks (should be JSON string)
- Verify `eventId` in anchors matches appointment `eventId`
- Check `anchorDayOffset` values are correct
- Verify relationship tracking in seed results

### Type Errors

- If you see TypeScript errors, check that all imports are correct
- Verify `TaskService.createTask()` returns the expected type
- Check that activity creation functions are exported

## Next Steps

After testing, you can:

1. **Test Rescheduling**: (Future feature) When appointments are rescheduled, linked tasks should move
2. **Test Task Completion**: Complete tasks and verify they sync properly
3. **Test Task Filtering**: Verify tasks are filtered correctly by date
4. **Test Appointment Display**: Verify appointments show correctly on dashboard

## Notes

- All dates are **dynamic** - appointments and tasks are created for "today" when you seed
- If you seed on different days, you'll get different dates
- Relationships are tracked in memory during seeding and returned in the result
- The `anchors` field stores the relationship data for future rescheduling logic
