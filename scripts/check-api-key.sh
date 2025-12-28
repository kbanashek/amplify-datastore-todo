#!/bin/bash

# Script to check and regenerate AppSync API key if needed

echo "🔍 Checking AppSync API key status..."
echo ""

# Get API ID from aws-exports.js
API_ID=$(node -e "const config = require('./aws-exports.js').default; console.log(config.aws_appsync_graphqlEndpoint.split('/')[3]);" 2>/dev/null)

if [ -z "$API_ID" ]; then
  echo "❌ Could not extract API ID from aws-exports.js"
  exit 1
fi

echo "API ID: $API_ID"
echo ""

# Try to list API keys (may fail if no permissions)
echo "Attempting to check API key status..."
aws appsync list-api-keys --api-id "$API_ID" --region us-east-1 2>&1 | head -20

echo ""
echo "📝 If you see 'AccessDenied', you'll need to check the API key in the AWS Console:"
echo "   https://console.aws.amazon.com/appsync/home?region=us-east-1#/$API_ID/settings/api-keys"
echo ""
echo "💡 To regenerate the API key:"
echo "   1. Go to AWS AppSync Console → Your API → Settings → API Keys"
echo "   2. Delete the expired key (if expired)"
echo "   3. Create a new API key"
echo "   4. Run: amplify pull --appId d2vty117li92m8 --envName dev"
echo "   5. Restart your app"






