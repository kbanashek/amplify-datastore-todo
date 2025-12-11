# AWS IAM Policy Setup for Translation Service

## Overview

The translation feature requires AWS Translate permissions. This document explains how to add the necessary permissions to your IAM user policy.

## Required Permissions

The following AWS Translate permissions are required:
- `translate:TranslateText` - Translate text from one language to another
- `translate:ListLanguages` - List supported languages (optional, for UI)
- `translate:DescribeTextTranslationJob` - Describe translation jobs (optional)

## Adding Permissions to IAM Policy

### Option 1: Update Existing Policy via AWS Console

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS account

2. **Navigate to IAM**
   - Search for "IAM" in the top search bar
   - Click on "IAM" service

3. **Find Your User**
   - Click "Users" in the left sidebar
   - Find and click on your user: `josh-amplify-user`

4. **Edit the Policy**
   - Click on the policy name (e.g., `minimal-policy-final`)
   - Click "Edit" button
   - Click "JSON" tab

5. **Add Translate Permission**
   - Add the following statement to the `Statement` array (before the closing `]`):
   
   ```json
   {
     "Sid": "Translate",
     "Effect": "Allow",
     "Action": [
       "translate:TranslateText",
       "translate:ListLanguages",
       "translate:DescribeTextTranslationJob"
     ],
     "Resource": "*"
   }
   ```

6. **Save Changes**
   - Click "Review policy"
   - Click "Save changes"

### Option 2: Update Policy via AWS CLI

1. **Get Current Policy**
   ```bash
   aws iam get-user-policy --user-name josh-amplify-user --policy-name minimal-policy-final > current-policy.json
   ```

2. **Edit the Policy File**
   - Open `minimal-policy-final.json` (or the policy file you're using)
   - Add the Translate statement as shown above

3. **Update the Policy**
   ```bash
   aws iam put-user-policy \
     --user-name josh-amplify-user \
     --policy-name minimal-policy-final \
     --policy-document file://minimal-policy-final.json
   ```

### Option 3: Attach AWS Managed Policy (Easiest)

If you prefer to use AWS managed policies:

1. **Navigate to IAM → Users → josh-amplify-user**
2. **Click "Add permissions"**
3. **Select "Attach policies directly"**
4. **Search for "Translate"**
5. **Select "AmazonTranslateFullAccess"** (or create a custom policy with only the permissions you need)
6. **Click "Next" → "Add permissions"**

**Note:** `AmazonTranslateFullAccess` grants full access. For production, create a custom policy with only the permissions listed above.

## Verify Permissions

After updating the policy, verify it works:

1. **Test via AWS CLI:**
   ```bash
   aws translate translate-text \
     --text "Hello" \
     --source-language-code en \
     --target-language-code es \
     --region us-east-1
   ```

2. **Or test in the app:**
   - Reload the app
   - Change language to Spanish (or any other language)
   - Check logs for successful translations

## Policy Statement Reference

The minimal policy statement for translation:

```json
{
  "Sid": "Translate",
  "Effect": "Allow",
  "Action": [
    "translate:TranslateText",
    "translate:ListLanguages",
    "translate:DescribeTextTranslationJob"
  ],
  "Resource": "*"
}
```

**Important Notes:**
- `Resource: "*"` is required because AWS Translate doesn't support resource-level permissions
- The policy takes effect immediately after saving
- You may need to wait a few seconds for the changes to propagate

## Troubleshooting

### Error: "User is not authorized to perform: translate:TranslateText"

**Solution:**
1. Verify the policy was saved correctly
2. Check that the policy is attached to the correct user
3. Wait 10-30 seconds for IAM changes to propagate
4. Try reloading credentials: `npm run load-aws-credentials <profile-name>`

### Error: "Credential is missing"

**Solution:**
1. Run: `npm run load-aws-credentials <profile-name>`
2. Verify credentials file exists: `src/config/aws-credentials.json`
3. Check AWS profile is configured: `aws configure list --profile <profile-name>`

## Security Best Practices

For production environments:

1. **Use least privilege:** Only grant `translate:TranslateText` if you don't need the other permissions
2. **Use IAM roles:** Consider using IAM roles instead of user credentials for better security
3. **Monitor usage:** Enable CloudTrail to monitor Translate API usage
4. **Set up billing alerts:** AWS Translate charges per character translated

## Cost Considerations

AWS Translate pricing (as of 2024):
- **Standard translation:** $15 per million characters
- **Active Custom Translation:** $60 per million characters
- **First 2 million characters per month:** Free (for standard translation)

Monitor your usage in AWS Cost Explorer or set up billing alerts.


