# Scripts Directory

This directory contains utility scripts for managing the Amplify backend setup and deployment.

## Available Scripts

### `setup-amplify-backend.sh`

**Purpose:** Complete automation of Amplify backend setup from scratch.

**What it does:**

**Fresh Mode (--fresh, default):**

1. Backs up existing GraphQL schema
2. Cleans up all old Amplify files and directories
3. Initializes Amplify (Gen 1)
4. Adds GraphQL API with conflict detection enabled
5. Restores your schema
6. Optionally pushes to AWS

**Refresh Mode (--refresh):**

1. Backs up existing GraphQL schema
2. Pulls existing backend configuration from AWS
3. Keeps local files (no cleanup)
4. Restores schema if backup exists
5. Optionally pushes updates to AWS

**Usage:**

```bash
# Fresh setup (default - cleans everything and starts new)
./scripts/setup-amplify-backend.sh --fresh

# Refresh existing environment (pulls from AWS, keeps local files)
./scripts/setup-amplify-backend.sh --refresh

# Fresh setup with auto-push (requires IAM permissions)
./scripts/setup-amplify-backend.sh --fresh --push

# Refresh and push updates
./scripts/setup-amplify-backend.sh --refresh --push
```

**Configuration:**

Set these environment variables to customize behavior:

```bash
export AWS_PROFILE=amplify-user        # AWS profile to use
export AWS_REGION=us-east-1            # AWS region
export AMPLIFY_ENV=dev                 # Amplify environment name
export AMPLIFY_PROJECT_NAME=LXTodoApp # Project name
```

**Prerequisites:**

- Amplify CLI installed: `npm install -g @aws-amplify/cli`
- AWS profile configured: `aws configure --profile amplify-user`
- Proper IAM permissions (see `minimal-policy.json` in project root)

**What you'll need to do manually:**

During `amplify init`:

- Choose **"y" (yes)** for Amplify Gen 1
- Enter project name (or press Enter for default)
- Enter environment name (or press Enter for default)
- Choose app type: **JavaScript**
- Choose framework: **React Native**
- Choose AWS profile: **amplify-user**

During `amplify add api`:

- Choose service: **GraphQL**
- Enable conflict detection: **Yes**
- Resolution strategy: **Auto Merge** (or your preference)
- Schema template: **Blank Schema**
- Edit schema now: **No** (script will restore it)

**After setup:**

1. Get the new API key from AWS AppSync Console
2. Update `aws-exports.js` with the new API key
3. Generate DataStore models: `npx amplify codegen models`

---

## Other Scripts

### `fix-stack.sh`

Fixes stuck CloudFormation stacks by deleting failed nested stacks and continuing rollback.

**Usage:**

```bash
./fix-stack.sh
```

### `fresh-start.sh`

Removes all Amplify files for a complete fresh start (doesn't automate init).

**Usage:**

```bash
./fresh-start.sh
```

---

## Troubleshooting

### IAM Permission Errors

If you get permission errors during `amplify push`, update your IAM policy:

1. **Use the compact policy:** `minimal-policy-final.json` (under 2048 characters)
2. **AWS Console → IAM → Users → [your-user]**
3. **Update inline policy** with the compact JSON
4. **Important:** Inline policies have a 2048 non-whitespace character limit

The compact policy includes all required permissions:

- CloudFormation (stack operations)
- S3 (deployment bucket)
- IAM (role management including TagRole)
- AppSync (API and schema operations)
- DynamoDB (table operations)

### Schema Not Found

If the script can't find your schema, it will create a backup location. Make sure your schema is at:

- `amplify/backend/api/[api-name]/schema.graphql`

Or manually restore from `/tmp/schema-backup-*.graphql`

### CloudFormation Stack Conflicts

If you have stuck CloudFormation stacks, use `fix-stack.sh` to clean them up before running setup again.

---

## Version Management

### `version-bump.sh`

Automatically creates a new version branch, commits changes, and pushes to remote.

**Usage:**

```bash
# Patch version (0.0.1 -> 0.0.2) - bug fixes, small changes
./scripts/version-bump.sh patch "Fix sync issue"

# Minor version (0.0.1 -> 0.1.0) - new features, non-breaking changes
./scripts/version-bump.sh minor "Add new sync feature"

# Major version (0.0.1 -> 1.0.0) - breaking changes
./scripts/version-bump.sh major "Refactor API"
```

**What it does:**

1. Detects current version from branch name (e.g., `v0.0.1`)
2. Increments version based on type (major/minor/patch)
3. Creates new branch (e.g., `v0.0.2`)
4. Stages all changes
5. Commits with versioned message
6. Pushes to origin

**Examples:**

```bash
# Quick patch bump
./scripts/version-bump.sh patch

# Minor with custom message
./scripts/version-bump.sh minor "Add question sync support"

# Major with breaking changes
./scripts/version-bump.sh major "Refactor DataStore services"
```

---

## For New Developers

**First time setup:**

1. Install Amplify CLI: `npm install -g @aws-amplify/cli`
2. Configure AWS profile: `aws configure --profile amplify-user`
3. Get IAM permissions from your team lead (see `minimal-policy.json`)
4. Run setup script: `./scripts/setup-amplify-backend.sh`
5. Follow the prompts during `amplify init` and `amplify add api`
6. After setup, get API key from AWS Console and update `aws-exports.js`

**Daily workflow:**

- Make schema changes in `amplify/backend/api/[api-name]/schema.graphql`
- Push changes: `AWS_PROFILE=amplify-user amplify push --yes`
- Update `aws-exports.js` if API key changes
- Generate models: `npx amplify codegen models`
