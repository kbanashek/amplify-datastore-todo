# Ephemeral Developer Environments

**Status:** 📝 To Do - Feasibility Study

## Overview

Create isolated, temporary AWS Amplify environments for each developer to enable parallel development without conflicts, easier testing, and safer experimentation.

## What This Would Entail

### Technical Requirements

1. **Amplify Environment Management**
   - Each developer gets a unique environment name (e.g., `dev-kyle`, `dev-alice`, `dev-bob`)
   - Environments stored in `amplify/team-provider-info.json` with per-developer configurations
   - Each environment has its own:
     - CloudFormation stack
     - AppSync API endpoint
     - DynamoDB tables
     - IAM roles
     - S3 deployment bucket
     - API keys

2. **Environment Creation Script**
   - Automated script to create new Amplify environment for a developer
   - Generates unique environment name based on developer identifier
   - Initializes backend resources (GraphQL API, DataStore, etc.)
   - Configures environment-specific settings
   - Updates local `team-provider-info.json` and `aws-exports.js`

3. **Environment Cleanup Script**
   - Automated script to destroy developer's environment
   - Removes all AWS resources (CloudFormation stack, DynamoDB tables, etc.)
   - Cleans up local configuration files
   - Prevents orphaned resources and cost accumulation

4. **Configuration Management**
   - Environment-specific `aws-exports.js` generation
   - Per-developer API keys and authentication
   - Environment naming convention (e.g., `{env}-{developer-id}`)
   - Shared configuration for common settings (region, project name)

5. **Developer Workflow Integration**
   - Git branch-based environment association (optional)
   - Pre-commit hooks to ensure correct environment is active
   - Environment validation before operations
   - Clear documentation on environment lifecycle

### AWS Resources Per Environment

Each ephemeral environment would create:

- **CloudFormation Stack**: `amplify-{project}-{env}-{id}`
- **AppSync API**: GraphQL endpoint with unique API key
- **DynamoDB Tables**: All DataStore tables (Task, Activity, Question, etc.)
- **IAM Roles**: Auth and unauth roles for the environment
- **S3 Bucket**: Deployment artifacts and storage
- **Cognito User Pool** (if auth is added): User authentication

**Estimated Cost Per Environment:**

- CloudFormation: Free (stack management)
- AppSync: ~$4/month base + $0.0001 per query (likely < $10/month for dev)
- DynamoDB: Free tier covers most dev workloads (25GB storage, 25 RCU/WCU)
- S3: Minimal for deployment artifacts (< $1/month)
- **Total**: ~$5-15/month per active environment

### Implementation Approach

1. **Phase 1: Script Development**
   - Create `scripts/create-dev-environment.sh` - Creates new environment
   - Create `scripts/destroy-dev-environment.sh` - Destroys environment
   - Create `scripts/list-environments.sh` - Lists all environments
   - Create `scripts/switch-environment.sh` - Switches active environment

2. **Phase 2: Environment Templates**
   - Standardize environment configuration
   - Create environment template with default settings
   - Document required AWS permissions

3. **Phase 3: CI/CD Integration**
   - GitHub Actions workflow to create/destroy PR environments
   - Automatic cleanup of stale environments
   - Environment naming based on PR number or branch name

4. **Phase 4: Developer Onboarding**
   - Documentation for creating first environment
   - Troubleshooting guide
   - Cost monitoring and alerts

## Benefits

1. **Isolation**
   - Each developer works in their own AWS environment
   - No conflicts from schema changes or data modifications
   - Safe experimentation without affecting others

2. **Parallel Development**
   - Multiple developers can work on backend changes simultaneously
   - No coordination needed for schema updates
   - Independent testing and validation

3. **Easier Testing**
   - Test destructive operations (nuclear reset, schema changes) safely
   - Seed data without affecting other developers
   - Test migration scripts in isolation

4. **Faster Onboarding**
   - New developers can create their own environment immediately
   - No need to wait for shared environment access
   - Self-service environment management

5. **Cost Control**
   - Environments can be destroyed when not in use
   - Clear cost attribution per developer
   - Automatic cleanup of unused environments

6. **Production Safety**
   - Reduces risk of accidental changes to shared dev environment
   - Better separation between development and production
   - Easier to test production-like scenarios

## Workflow Examples

### Basic Developer Workflow

```bash
# Developer creates their environment
./scripts/create-dev-environment.sh kyle
# Creates environment: dev-kyle
# Generates aws-exports.js for dev-kyle
# Initializes backend resources

# Developer works normally
yarn start
# App connects to dev-kyle environment

# Developer makes schema changes
# Edit amplify/backend/api/lxtodoapp/schema.graphql
amplify push --yes
# Changes deployed to dev-kyle only

# Developer tests changes
# Seed data, test features, etc.

# At end of day or when done
./scripts/destroy-dev-environment.sh kyle
# Destroys all AWS resources
# Cleans up local config
```

### Branch-Based Environments

```bash
# Create environment for feature branch
./scripts/create-dev-environment.sh feature/new-feature
# Environment name: dev-feature-new-feature

# Work on feature
# ... make changes ...

# Create PR
# CI/CD creates temporary environment for PR testing

# Merge PR
# CI/CD destroys PR environment
# Feature merged to main
```

## Considerations

1. **Cost Management**
   - Set up AWS Cost Alerts per environment
   - Automatic cleanup of environments older than X days
   - Monthly cost review and optimization

2. **Resource Limits**
   - AWS account limits (number of CloudFormation stacks, etc.)
   - May need to request limit increases
   - Monitor resource usage

3. **Data Migration**
   - How to share seed data between environments?
   - Export/import scripts for common test data
   - Shared seed data repository

4. **Schema Synchronization**
   - How to keep schemas in sync across environments?
   - Schema versioning and migration scripts
   - Shared schema repository or template

5. **Authentication**
   - Each environment has its own API keys
   - May need separate Cognito pools if auth is added
   - Developer-specific credentials management

6. **CI/CD Integration**
   - PR-based environments (create on PR open, destroy on close)
   - Branch-based environments (longer-lived)
   - Shared "staging" environment for integration testing

## Recommended Approach

1. **Start Simple**: Manual environment creation/destruction scripts
2. **Add Automation**: CI/CD integration for PR environments
3. **Scale Up**: Branch-based environments for longer-lived features
4. **Optimize**: Automatic cleanup, cost monitoring, resource sharing

## Next Steps

- [ ] Research Amplify environment management best practices
- [ ] Create proof-of-concept script for environment creation
- [ ] Test environment creation/destruction workflow
- [ ] Document AWS permissions required
- [ ] Estimate costs and set up monitoring
- [ ] Create developer onboarding guide
- [ ] Integrate with CI/CD for PR environments
- [ ] Set up automatic cleanup of stale environments
