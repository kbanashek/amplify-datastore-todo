# AWS Architecture

## High-Level Overview

```mermaid
graph TB
    A[React Native App] --> B[DataStore]
    B --> C[Local SQLite]
    B --> D[AWS AppSync]
    D --> E[DynamoDB]
    B --> F[Sync Engine]
    F --> D

    style A fill:#61DAFB
    style B fill:#FF9900
    style D fill:#232F3E
    style E fill:#4053D6
```

## Key AWS Services

| Service           | Purpose         | Usage in App                                |
| ----------------- | --------------- | ------------------------------------------- |
| **AWS Amplify**   | Framework & CLI | Backend configuration and client libraries  |
| **AWS AppSync**   | GraphQL API     | Managed GraphQL service for data operations |
| **AWS DataStore** | Offline Sync    | Offline-first data synchronization          |
| **DynamoDB**      | Database        | Cloud storage for all data                  |

## Conflict Resolution

The app implements custom conflict resolution in `src/services/ConflictResolution.ts`:

- ✅ **Task Updates**: Prefers local status changes, remote timing updates
- ✅ **Deletions**: Accepts local deletions
- ✅ **Smart Merging**: Preserves user work while accepting server updates

## Data Flow

1. **Local Operations**: All data operations happen against local SQLite database first
2. **Immediate Sync**: DataStore automatically syncs mutations (save/delete) to AppSync immediately when online
3. **Real-time Updates**: Real-time subscriptions via AppSync provide immediate updates across all devices when data changes
4. **Periodic Full Sync**: Full sync runs every 10 seconds as a safety net to catch any missed real-time updates
5. **Conflict Handling**: Custom conflict resolution logic ensures data consistency
6. **Offline Support**: App works completely offline, syncing when connection is restored

## Sync Configuration

The app is configured with:

- **Real-time Subscriptions**: Enabled for immediate cross-device updates via AppSync GraphQL subscriptions
- **Periodic Full Sync**: Every 10 seconds (`fullSyncInterval: 10000`) as a safety net for missed updates
- **No Sync Filters**: All data syncs to all devices (`syncExpressions: []`)
- **Automatic Mutation Sync**: All `DataStore.save()` and `DataStore.delete()` operations automatically sync immediately when online

This ensures iOS, Android, and web all show the same data. If you notice sync issues:

1. Wait up to 5 minutes for the next periodic sync
2. Restart the app to trigger an immediate full sync
3. Check network connectivity - sync requires online status

## Configuration

The app uses AWS Amplify configuration stored in `aws-exports.js` (generated file, not committed to repo).

To pull the latest backend configuration:

```bash
amplify pull --appId d19l3dxjz56ge3 --envName dev
```
