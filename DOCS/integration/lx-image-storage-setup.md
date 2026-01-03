# LX Integration: Image Storage Configuration

This guide explains how to configure the task-system package for proper S3 image storage with organizational hierarchy.

## Overview

The task-system package now supports hierarchical S3 image paths matching Lumiere's convention:

```
s3://bucket-name/data/{organizationId}/{studyId}/{studyInstanceId}/{imageUUID}_{questionId}.jpg
```

## Configuration Required from LX

LX must provide three configuration values during package initialization:

1. **`organizationId`** - Organization/parent identifier
2. **`studyId`** - Study identifier
3. **`studyInstanceId`** - Study instance identifier

## Integration Steps

### 1. Initialize Package with S3 Hierarchy

When initializing the task-system package, pass the organization/study hierarchy:

```typescript
import { initTaskSystem } from "@orion/task-system";

await initTaskSystem({
  startDataStore: false, // LX owns DataStore lifecycle

  // S3 image storage hierarchy (required for image capture)
  organizationId: "PARENT_ID_FROM_LX_CONFIG",
  studyId: "STUDY_ID_FROM_LX_CONFIG",
  studyInstanceId: "STUDY_INSTANCE_ID_FROM_LX_CONFIG",
});
```

### 2. Example Integration in LX App

```typescript
// LX App Initialization
import { initTaskSystem } from "@orion/task-system";
import { getStudyConfig } from "./config"; // LX's config service

async function initializeTaskSystem() {
  const studyConfig = await getStudyConfig();

  await initTaskSystem({
    startDataStore: false,
    organizationId: studyConfig.parentId,
    studyId: studyConfig.studyId,
    studyInstanceId: studyConfig.studyInstanceId,
  });
}
```

## What This Enables

Once configured, image capture questions will automatically:

1. **Upload images to S3** with the correct hierarchical path:

   ```
   data/{organizationId}/{studyId}/{studyInstanceId}/EPISODIC_uuid_questionId.jpg
   ```

2. **Generate predictable filenames**:
   - Episodic tasks: `EPISODIC_{taskInstanceId}_{questionId}.jpg`
   - Regular tasks: `{taskId}_{questionId}.jpg`

3. **Store locally with offline support**:
   - Images saved to device: `/DocumentDirectory/ImageCapture/filename.jpg`
   - Automatically sync to S3 when online via DataStore

4. **Handle Android caching** correctly with timestamp parameters

## S3 Path Examples

### Episodic Task Image

```
data/ORG123/STUDY456/INSTANCE789/EPISODIC_abc-123-def_Question.xyz.jpg
```

### Regular Task Image

```
data/ORG123/STUDY456/INSTANCE789/Task.123_Question.xyz.jpg
```

### Flat Structure (if hierarchy not provided)

```
data/EPISODIC_abc-123-def_Question.xyz.jpg
```

## Harness App Example

For reference, the harness app demonstrates this pattern:

```typescript
// src/bootstrap/taskSystemBootstrap.ts
export interface TaskSystemBootstrapOptions {
  startDataStore?: boolean;
  organizationId?: string;
  studyId?: string;
  studyInstanceId?: string;
}

export async function bootstrapTaskSystem(
  options: TaskSystemBootstrapOptions = {}
): Promise<void> {
  await initTaskSystem({
    startDataStore: false,
    organizationId: options.organizationId,
    studyId: options.studyId,
    studyInstanceId: options.studyInstanceId,
  });

  // ... rest of bootstrap
}
```

## Verification

To verify the configuration is working:

1. **Check logs during initialization**:

   ```
   📁 [Platform] TaskSystem: S3 hierarchy configured: org=ORG123, study=STUDY456, instance=INSTANCE789
   ```

2. **Capture a test image** and check the logs:

   ```
   📋 [Platform] ImageStorageService: Generated S3 key {"s3Key": "data/ORG123/STUDY456/INSTANCE789/EPISODIC_uuid_q1.jpg"}
   ```

3. **Verify S3 bucket structure** shows the hierarchical path

## Important Notes

- ✅ **Values are optional**: If not provided, images use flat structure: `data/{filename}.jpg`
- ✅ **Can be updated**: Call `initTaskSystem()` again with new values if study context changes
- ✅ **Thread-safe**: Configuration is stored in module-level singleton
- ⚠️ **Must initialize before image capture**: Ensure `initTaskSystem()` runs before any image capture questions are rendered

## API Reference

### `initTaskSystem(options)`

Initializes the task-system package with configuration.

**Parameters:**

```typescript
{
  startDataStore?: boolean;      // Whether to start DataStore (LX: false)
  organizationId?: string;       // Organization/parent ID for S3 paths
  studyId?: string;              // Study ID for S3 paths
  studyInstanceId?: string;      // Study instance ID for S3 paths
}
```

**Returns:** `Promise<void>`

### `getTaskSystemConfig()`

Gets the current task system configuration (for debugging).

**Returns:**

```typescript
{
  organizationId?: string;
  studyId?: string;
  studyInstanceId?: string;
}
```

## Migration from Flat Structure

If you have existing images in flat structure (`data/{filename}.jpg`), you can:

1. **Run S3 migration** to move files to hierarchical structure
2. **Support both formats** temporarily with fallback logic in ImageStorageService
3. **Start fresh** with hierarchical structure for new images only

Contact the task-system team for migration assistance.

## Support

For questions or issues:

- Check logs for configuration errors
- Verify S3 bucket permissions for hierarchical paths
- Contact task-system package maintainers
