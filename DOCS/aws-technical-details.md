# AWS Technical Details

This document contains detailed technical information about AWS services, configurations, and conventions used in this project.

## Table of Contents

- [DynamoDB Table Naming Convention](#dynamodb-table-naming-convention)

---

## DynamoDB Table Naming Convention

### Overview

AWS Amplify DataStore creates DynamoDB tables with a specific naming pattern to ensure uniqueness and support multiple environments.

### Naming Format

**Format**: `{ModelName}-{AppSyncAPIId}-{Environment}`

**Example**: `Task-yvqxlqmf2ndqjnb2oytn22mgei-dev`

### Breakdown

- **`Task`** - The GraphQL model name (e.g., Task, Activity, Question, TaskAnswer, DataPoint, DataPointInstance, TaskAnswer, TaskResult, TaskHistory)
- **`yvqxlqmf2ndqjnb2oytn22mgei`** - The AppSync API ID (unique identifier for your GraphQL API)
- **`dev`** - The environment name (e.g., `dev`, `staging`, `prod`)

### Why This Naming Convention?

1. **Uniqueness**: The AppSync API ID ensures your tables don't conflict with other Amplify apps in the same AWS account. This is critical when multiple projects or teams share the same AWS account.

2. **Multi-Environment Support**: The environment suffix keeps tables completely separate across different deployment environments. This prevents accidental data mixing between development, staging, and production.

3. **AWS Standard**: This is Amplify's standard convention when creating DynamoDB tables via AppSync. Following this convention ensures compatibility with Amplify tooling and best practices.

4. **Resource Management**: The consistent naming makes it easier to identify and manage resources in the AWS Console, especially when working with multiple Amplify projects.

### Finding Your AppSync API ID

The AppSync API ID is stored in the Amplify metadata file:

**Location**: `amplify/backend/amplify-meta.json`

**Path**: `api.{apiName}.output.GraphQLAPIIdOutput`

**Example**:
```json
{
  "api": {
    "lxtodoapp": {
      "output": {
        "GraphQLAPIIdOutput": "yvqxlqmf2ndqjnb2oytn22mgei"
      }
    }
  }
}
```

**When is it generated?**
- The AppSync API ID is generated when you first create the API with `amplify add api`
- It remains stable unless you delete and recreate the API
- Each Amplify app gets a unique API ID

### Important Notes

⚠️ **Do not change this naming convention**. This naming pattern is expected behavior and should not be modified because:

- It ensures proper DataStore synchronization
- It prevents conflicts with other Amplify applications
- It maintains compatibility with AWS Amplify tooling
- Custom table names would break DataStore's automatic sync functionality

### Related Files

- `amplify/backend/amplify-meta.json` - Contains the AppSync API ID
- `amplify/backend/api/lxtodoapp/schema.graphql` - Defines the GraphQL models
- `src/amplify-config.ts` - Configures Amplify and DataStore

### Viewing Tables in AWS Console

To view your DynamoDB tables:

1. Navigate to the [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Filter tables by your AppSync API ID (e.g., `yvqxlqmf2ndqjnb2oytn22mgei`)
3. All tables for your app will be listed with the pattern `{ModelName}-{APIId}-{Environment}`

### Environment-Specific Tables

When you deploy to different environments, Amplify creates separate tables:

- **Development**: `Task-yvqxlqmf2ndqjnb2oytn22mgei-dev`
- **Staging**: `Task-yvqxlqmf2ndqjnb2oytn22mgei-staging`
- **Production**: `Task-yvqxlqmf2ndqjnb2oytn22mgei-prod`

This ensures complete data isolation between environments.


