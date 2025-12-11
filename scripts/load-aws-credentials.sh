#!/bin/bash
# Script to load AWS credentials from a profile and create config file for React Native
# 
# Usage:
#   ./scripts/load-aws-credentials.sh [profile-name]
#
# Example:
#   ./scripts/load-aws-credentials.sh default
#   ./scripts/load-aws-credentials.sh amplify-user

set -e

PROFILE="${1:-${AWS_PROFILE:-default}}"
CONFIG_DIR="src/config"
CONFIG_FILE="${CONFIG_DIR}/aws-credentials.json"

echo "🔑 Loading AWS credentials from profile: ${PROFILE}"

# Check if profile exists
if ! aws configure list-profiles 2>/dev/null | grep -q "^${PROFILE}$"; then
    echo "❌ Error: AWS profile '${PROFILE}' not found."
    echo ""
    echo "Available profiles:"
    aws configure list-profiles 2>/dev/null || echo "  (none found)"
    echo ""
    echo "To create a profile, run:"
    echo "  aws configure --profile ${PROFILE}"
    exit 1
fi

# Get credentials
ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile "${PROFILE}" 2>/dev/null || echo "")
SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile "${PROFILE}" 2>/dev/null || echo "")
REGION=$(aws configure get region --profile "${PROFILE}" 2>/dev/null || echo "us-east-1")

if [ -z "$ACCESS_KEY_ID" ] || [ -z "$SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: Could not read credentials from profile '${PROFILE}'"
    echo "Make sure the profile is configured with:"
    echo "  aws configure --profile ${PROFILE}"
    exit 1
fi

# Create config directory if it doesn't exist
mkdir -p "${CONFIG_DIR}"

# Create config file
cat > "${CONFIG_FILE}" <<EOF
{
  "accessKeyId": "${ACCESS_KEY_ID}",
  "secretAccessKey": "${SECRET_ACCESS_KEY}",
  "region": "${REGION}"
}
EOF

echo "✅ Credentials loaded successfully!"
echo "📁 Config file created: ${CONFIG_FILE}"
echo ""
echo "⚠️  Security Note: This file contains sensitive credentials."
echo "   Make sure it's in .gitignore (already added)."
echo ""
echo "🚀 Translation service will now use these credentials."


