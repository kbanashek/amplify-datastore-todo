#!/bin/bash

# ============================================================================
# Amplify Backend Setup Script
# ============================================================================
# This script automates the complete setup of a fresh Amplify backend:
#   1. Backs up existing schema
#   2. Cleans up old Amplify files
#   3. Initializes Amplify (Gen 1)
#   4. Adds GraphQL API with conflict detection
#   5. Restores schema
#   6. Optionally pushes to AWS
#
# Usage:
#   ./scripts/setup-amplify-backend.sh [--push] [--refresh] [--fresh]
#
# Options:
#   --push    Automatically push to AWS after setup (requires IAM permissions)
#   --refresh Pull existing backend environment (use when backend already exists)
#   --fresh   Force fresh setup (default behavior - cleans everything first)
# ============================================================================

set -e  # Exit on error

# Configuration
PROFILE="${AWS_PROFILE:-amplify-user}"
REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${AMPLIFY_ENV:-dev}"
PROJECT_NAME="${AMPLIFY_PROJECT_NAME:-LXTodoApp}"
SCHEMA_BACKUP="/tmp/schema-backup-$(date +%Y%m%d-%H%M%S).graphql"
AUTO_PUSH=false
REFRESH_MODE=false
FRESH_MODE=true

# Parse arguments
if [[ "$*" == *"--push"* ]]; then
    AUTO_PUSH=true
fi
if [[ "$*" == *"--refresh"* ]]; then
    REFRESH_MODE=true
    FRESH_MODE=false
fi
if [[ "$*" == *"--fresh"* ]]; then
    FRESH_MODE=true
    REFRESH_MODE=false
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Step $1: $2${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_step "0" "Checking Prerequisites"
    
    if ! command -v amplify &> /dev/null; then
        log_error "Amplify CLI not found. Install it with: npm install -g @aws-amplify/cli"
        exit 1
    fi
    
    if ! aws configure list-profiles 2>/dev/null | grep -q "^${PROFILE}$"; then
        log_warning "AWS profile '${PROFILE}' not found. Make sure it's configured."
        log_info "Run: aws configure --profile ${PROFILE}"
    fi
    
    # Check for IAM policy file
    if [ -f "minimal-policy-final.json" ]; then
        log_info "Found minimal-policy-final.json - make sure IAM permissions are set"
    elif [ -f "minimal-policy.json" ]; then
        log_info "Found minimal-policy.json - make sure IAM permissions are set"
    else
        log_warning "No IAM policy file found. You may need to set up permissions manually."
    fi
    
    log_success "Prerequisites check complete"
}

# Step 1: Backup schema
backup_schema() {
    log_step "1" "Backing Up Schema"
    
    SCHEMA_PATHS=(
        "amplify/backend/api/lxtodoapp/schema.graphql"
        "amplify/backend/api/*/schema.graphql"
    )
    
    SCHEMA_FOUND=false
    
    for pattern in "${SCHEMA_PATHS[@]}"; do
        for schema_file in $pattern; do
            if [ -f "$schema_file" ]; then
                cp "$schema_file" "$SCHEMA_BACKUP"
                log_success "Schema backed up: $schema_file → $SCHEMA_BACKUP"
                SCHEMA_FOUND=true
                break 2
            fi
        done
    done
    
    if [ "$SCHEMA_FOUND" = false ]; then
        if [ -f "/tmp/schema-backup.graphql" ]; then
            cp /tmp/schema-backup.graphql "$SCHEMA_BACKUP"
            log_success "Using existing backup: /tmp/schema-backup.graphql → $SCHEMA_BACKUP"
        else
            log_warning "No schema found to backup. You'll need to create one manually."
        fi
    fi
}

# Step 2: Clean up old Amplify files (only in fresh mode)
cleanup_amplify_files() {
    if [ "$REFRESH_MODE" = true ]; then
        log_step "2" "Skipping Cleanup (Refresh Mode)"
        log_info "Refresh mode: Keeping existing files to pull updates"
        return 0
    fi
    
    log_step "2" "Cleaning Up Old Amplify Files"
    
    # Remove Amplify directories
    if [ -d "amplify" ]; then
        rm -rf amplify/
        log_success "Removed amplify/ directory"
    fi
    
    # Remove config files
    CONFIG_FILES=(
        ".amplifyrc.json"
        ".amplifyrc"
        "aws-exports.js"
        "src/aws-exports.js"
        "amplifyconfiguration.json"
        "awsconfiguration.json"
    )
    
    for file in "${CONFIG_FILES[@]}"; do
        if [ -f "$file" ]; then
            rm -f "$file"
            log_success "Removed $file"
        fi
    done
    
    log_success "Cleanup complete"
}

# Step 3: Pull or Initialize Amplify
pull_or_init_amplify() {
    if [ "$REFRESH_MODE" = true ]; then
        log_step "3" "Pulling Existing Backend Environment"
        
        log_info "Running: AWS_PROFILE=${PROFILE} amplify pull"
        log_info "This will pull the existing backend configuration from AWS."
        log_info ""
        
        read -p "Press Enter to continue with amplify pull..."
        
        if AWS_PROFILE="${PROFILE}" amplify pull --yes; then
            log_success "Backend environment pulled successfully"
        else
            log_error "Failed to pull backend environment"
            log_info "If the environment doesn't exist, use --fresh to create a new one"
            exit 1
        fi
    else
        log_step "3" "Initializing Amplify (Gen 1)"
        
        log_info "Running: AWS_PROFILE=${PROFILE} amplify init"
        log_info ""
        log_info "When prompted, please:"
        log_info "  ✓ Choose 'y' (yes) for Amplify Gen 1"
        log_info "  ✓ Project name: ${PROJECT_NAME} (or press Enter)"
        log_info "  ✓ Environment: ${ENV_NAME} (or press Enter)"
        log_info "  ✓ App type: JavaScript"
        log_info "  ✓ Framework: React Native"
        log_info "  ✓ Source directory: src (or press Enter)"
        log_info "  ✓ AWS Profile: ${PROFILE}"
        log_info ""
        
        read -p "Press Enter to continue with amplify init..."
        
        if AWS_PROFILE="${PROFILE}" amplify init \
            --appId "" \
            --envName "${ENV_NAME}" \
            --defaultEditor "code" \
            --projectName "${PROJECT_NAME}" \
            --type "javascript" \
            --framework "react-native" \
            --srcDir "src" \
            --distributionDir "/" \
            --buildCommand "npm run-script build" \
            --startCommand "npm run-script start" \
            --providers "awscloudformation" \
            --yes 2>/dev/null || \
            AWS_PROFILE="${PROFILE}" amplify init; then
            log_success "Amplify initialized"
        else
            log_error "Amplify initialization failed"
            exit 1
        fi
    fi
}

# Step 4: Add GraphQL API (only if not in refresh mode)
add_graphql_api() {
    if [ "$REFRESH_MODE" = true ]; then
        log_step "4" "Checking GraphQL API"
        log_info "Refresh mode: Skipping API addition (should already exist)"
        
        # Check if API already exists
        if [ -d "amplify/backend/api" ] && [ -n "$(find amplify/backend/api -type d -mindepth 1 -maxdepth 1)" ]; then
            log_success "GraphQL API found in pulled configuration"
        else
            log_warning "No API found. You may need to add it manually with: amplify add api"
        fi
        return 0
    fi
    
    log_step "4" "Adding GraphQL API with Conflict Detection"
    
    log_info "Running: AWS_PROFILE=${PROFILE} amplify add api"
    log_info ""
    log_info "When prompted, please:"
    log_info "  ✓ Service: GraphQL"
    log_info "  ✓ Enable conflict detection: Yes"
    log_info "  ✓ Resolution strategy: Auto Merge (or your preference)"
    log_info "  ✓ Schema template: Blank Schema"
    log_info "  ✓ Edit schema now: No (we'll restore it)"
    log_info ""
    
    read -p "Press Enter to continue with amplify add api..."
    
    # Note: amplify add api doesn't support full non-interactive mode
    # User will need to interact, but we provide clear instructions
    if AWS_PROFILE="${PROFILE}" amplify add api; then
        log_success "GraphQL API added"
    else
        log_error "Failed to add GraphQL API"
        exit 1
    fi
}

# Step 5: Restore schema
restore_schema() {
    log_step "5" "Restoring Schema"
    
    # Find the API directory (it might have a different name)
    API_DIR=$(find amplify/backend/api -name "schema.graphql" -type f | head -1 | xargs dirname 2>/dev/null || echo "")
    
    if [ -z "$API_DIR" ]; then
        # Try to find any API directory
        API_DIR=$(find amplify/backend/api -type d -mindepth 1 -maxdepth 1 | head -1)
    fi
    
    if [ -z "$API_DIR" ]; then
        log_error "Could not find API directory. Please restore schema manually."
        log_info "Expected location: amplify/backend/api/[api-name]/schema.graphql"
        exit 1
    fi
    
    SCHEMA_FILE="${API_DIR}/schema.graphql"
    
    if [ -f "$SCHEMA_BACKUP" ]; then
        cp "$SCHEMA_BACKUP" "$SCHEMA_FILE"
        log_success "Schema restored: $SCHEMA_BACKUP → $SCHEMA_FILE"
    elif [ -f "/tmp/schema-backup.graphql" ]; then
        cp /tmp/schema-backup.graphql "$SCHEMA_FILE"
        log_success "Schema restored: /tmp/schema-backup.graphql → $SCHEMA_FILE"
    else
        log_warning "No schema backup found. You'll need to create the schema manually."
        log_info "Schema location: $SCHEMA_FILE"
    fi
}

# Step 6: Push to AWS (optional)
push_to_aws() {
    log_step "6" "Pushing to AWS"
    
    log_info "Running: AWS_PROFILE=${PROFILE} amplify push --yes"
    log_warning "This will deploy resources to AWS. Make sure you have proper IAM permissions."
    log_info ""
    
    if AWS_PROFILE="${PROFILE}" amplify push --yes; then
        log_success "Deployment complete!"
        log_info ""
        log_info "Next steps:"
        log_info "  1. Get the new API key from AWS AppSync Console"
        log_info "  2. Update aws-exports.js with the new API key"
        log_info "  3. Run: npx amplify codegen models (to generate DataStore models)"
    else
        log_error "Deployment failed. Check the error messages above."
        log_error "Deployment failed. Check the error messages above."
        log_info "Common issues:"
        log_info "  - Missing IAM permissions (see minimal-policy-final.json)"
        log_info "  - Policy too large (use minimal-policy-final.json - under 2048 chars)"
        log_info "  - CloudFormation stack conflicts"
        log_info ""
        log_info "IAM Policy Setup:"
        log_info "  1. Use minimal-policy-final.json (compact version)"
        log_info "  2. AWS Console → IAM → Users → ${PROFILE}"
        log_info "  3. Update inline policy with the compact JSON"
        exit 1
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                  Amplify Backend Setup Script                                ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log_info "Configuration:"
    log_info "  AWS Profile: ${PROFILE}"
    log_info "  Region: ${REGION}"
    log_info "  Environment: ${ENV_NAME}"
    log_info "  Project Name: ${PROJECT_NAME}"
    log_info "  Mode: $([ "$REFRESH_MODE" = true ] && echo "Refresh (pull existing)" || echo "Fresh (new setup)")"
    log_info "  Auto Push: ${AUTO_PUSH}"
    echo ""
    
    if [ "$REFRESH_MODE" = true ]; then
        log_info "Refresh mode will:"
        log_info "  - Pull existing backend configuration"
        log_info "  - Keep local files"
        log_info "  - Restore schema if backup exists"
    else
        log_info "Fresh mode will:"
        log_info "  - Backup schema"
        log_info "  - Clean all local Amplify files"
        log_info "  - Initialize new Amplify project"
        log_info "  - Add GraphQL API"
        log_info "  - Restore schema"
    fi
    echo ""
    
    read -p "Continue with setup? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Cancelled"
        exit 0
    fi
    
    check_prerequisites
    backup_schema
    cleanup_amplify_files
    pull_or_init_amplify
    add_graphql_api
    restore_schema
    
    if [ "$AUTO_PUSH" = true ]; then
        push_to_aws
    else
        echo ""
        log_step "6" "Next Steps"
        log_info "To deploy to AWS, run:"
        log_info "  AWS_PROFILE=${PROFILE} amplify push --yes"
        log_info ""
        log_info "After deployment:"
        log_info "  1. Get the new API key from AWS AppSync Console"
        log_info "  2. Update aws-exports.js with the new API key"
        log_info "  3. Run: npx amplify codegen models"
    fi
    
    echo ""
    log_success "Setup complete! 🎉"
    echo ""
}

# Run main
main

