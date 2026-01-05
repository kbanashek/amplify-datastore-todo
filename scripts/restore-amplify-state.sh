#!/bin/bash

# Restore Amplify State
# This script regenerates Amplify files that are gitignored but required for the app to run.
# Run this after: git checkout, git clean, or if aws-exports.js is missing.

set -e

echo "🔧 Restoring Amplify state..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root"
  exit 1
fi

# Check if amplify backend exists
if [ ! -d "amplify/backend" ]; then
  echo "❌ Error: amplify/backend directory not found"
  exit 1
fi

# Create .config directory if it doesn't exist
mkdir -p amplify/.config

# Create local-env-info.json
echo "📝 Creating amplify/.config/local-env-info.json..."
cat > amplify/.config/local-env-info.json <<EOF
{
  "projectPath": "$(pwd)",
  "defaultEditor": "code",
  "envName": "dev"
}
EOF

# Create #current-cloud-backend directory
echo "📝 Creating amplify/#current-cloud-backend..."
mkdir -p "amplify/#current-cloud-backend"
cp -r amplify/backend/* "amplify/#current-cloud-backend/"

# Read team-provider-info.json to get deployed backend details
if [ ! -f "amplify/team-provider-info.json" ]; then
  echo "❌ Error: amplify/team-provider-info.json not found"
  exit 1
fi

# Extract values from team-provider-info.json using node
REGION=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.Region);")
STACK_NAME=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.StackName);")
AUTH_ROLE_NAME=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.AuthRoleName);")
UNAUTH_ROLE_NAME=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.UnauthRoleName);")
AUTH_ROLE_ARN=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.AuthRoleArn);")
UNAUTH_ROLE_ARN=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.UnauthRoleArn);")
DEPLOYMENT_BUCKET=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.DeploymentBucketName);")
STACK_ID=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.StackId);")
AMPLIFY_APP_ID=$(node -e "const data = require('./amplify/team-provider-info.json'); console.log(data.dev.awscloudformation.AmplifyAppId);")

# Create amplify-meta.json
echo "📝 Creating amplify/#current-cloud-backend/amplify-meta.json..."
cat > "amplify/#current-cloud-backend/amplify-meta.json" <<EOF
{
  "providers": {
    "awscloudformation": {
      "AuthRoleName": "$AUTH_ROLE_NAME",
      "UnauthRoleArn": "$UNAUTH_ROLE_ARN",
      "AuthRoleArn": "$AUTH_ROLE_ARN",
      "Region": "$REGION",
      "DeploymentBucketName": "$DEPLOYMENT_BUCKET",
      "UnauthRoleName": "$UNAUTH_ROLE_NAME",
      "StackName": "$STACK_NAME",
      "StackId": "$STACK_ID",
      "AmplifyAppId": "$AMPLIFY_APP_ID"
    }
  },
  "api": {
    "oriontasksystem": {
      "service": "AppSync",
      "providerPlugin": "awscloudformation",
      "output": {
        "authConfig": {
          "defaultAuthentication": {
            "authenticationType": "API_KEY",
            "apiKeyConfig": {
              "apiKeyExpirationDays": 7
            }
          }
        }
      }
    }
  }
}
EOF

# Get AppSync API details from AWS (requires AWS CLI and amplify-user profile)
echo "📝 Fetching AppSync API details from AWS..."
if ! command -v aws &> /dev/null; then
  echo "⚠️  AWS CLI not found - skipping aws-exports.js generation"
  echo "   You can manually create it or run: yarn amplify-status"
  exit 0
fi

# Check if amplify-user profile exists
if ! aws configure list-profiles | grep -q "amplify-user"; then
  echo "⚠️  AWS profile 'amplify-user' not found - skipping aws-exports.js generation"
  echo "   You can manually create it or run: yarn amplify-status"
  exit 0
fi

# Get AppSync API endpoint and key
echo "📝 Getting AppSync API endpoint..."
API_ENDPOINT=$(AWS_PROFILE=amplify-user aws appsync list-graphql-apis --region "$REGION" --query "graphqlApis[?name=='oriontasksystem-dev'].uris.GRAPHQL" --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
  echo "⚠️  Could not fetch AppSync API endpoint - skipping aws-exports.js generation"
  echo "   Run: yarn amplify-status to generate aws-exports.js"
  exit 0
fi

echo "📝 Getting AppSync API key..."
API_ID=$(AWS_PROFILE=amplify-user aws appsync list-graphql-apis --region "$REGION" --query "graphqlApis[?name=='oriontasksystem-dev'].apiId" --output text 2>/dev/null || echo "")
API_KEY=$(AWS_PROFILE=amplify-user aws appsync list-api-keys --api-id "$API_ID" --region "$REGION" --query "apiKeys[0].id" --output text 2>/dev/null || echo "")

if [ -z "$API_KEY" ]; then
  echo "⚠️  Could not fetch AppSync API key - skipping aws-exports.js generation"
  echo "   Run: yarn amplify-status to generate aws-exports.js"
  exit 0
fi

# Create aws-exports.js
echo "📝 Creating aws-exports.js..."
cat > aws-exports.js <<EOF
/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "$REGION",
    "aws_appsync_graphqlEndpoint": "$API_ENDPOINT",
    "aws_appsync_region": "$REGION",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "$API_KEY",
    "aws_appsync_dangerously_connect_to_http_endpoint_for_testing": false
};

export default awsmobile;
EOF

echo "✅ Amplify state restored successfully!"
echo ""
echo "Files created:"
echo "  - amplify/.config/local-env-info.json"
echo "  - amplify/#current-cloud-backend/ (directory)"
echo "  - amplify/#current-cloud-backend/amplify-meta.json"
echo "  - aws-exports.js"
echo ""
echo "You can now run: yarn start"
