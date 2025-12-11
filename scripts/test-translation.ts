#!/usr/bin/env tsx
/**
 * Test script to verify AWS Translate is working with current credentials
 * 
 * Usage:
 *   npx tsx scripts/test-translation.ts
 *   npx tsx scripts/test-translation.ts --profile <profile-name>
 */

import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

// Import polyfill first
import "../src/polyfills/structuredClone";

// Get profile from command line args
const args = process.argv.slice(2);
const profileIndex = args.indexOf("--profile");
const profile = profileIndex !== -1 && args[profileIndex + 1] ? args[profileIndex + 1] : undefined;

// Load credentials from profile if specified
let credentials: { accessKeyId?: string; secretAccessKey?: string; region?: string } | null = null;

if (profile) {
  try {
    const { execSync } = require("child_process");
    const accessKeyId = execSync(`aws configure get aws_access_key_id --profile ${profile}`, { encoding: "utf8" }).trim();
    const secretAccessKey = execSync(`aws configure get aws_secret_access_key --profile ${profile}`, { encoding: "utf8" }).trim();
    const region = execSync(`aws configure get region --profile ${profile}`, { encoding: "utf8" }).trim() || "us-east-1";
    
    credentials = { accessKeyId, secretAccessKey, region };
    console.log(`✅ Loaded credentials from profile: ${profile}`);
  } catch (error) {
    console.error(`❌ Failed to load credentials from profile: ${profile}`, error);
    process.exit(1);
  }
} else {
  // Try to load from config file
  try {
    credentials = require("../src/config/aws-credentials.json");
    console.log("✅ Loaded credentials from config file");
  } catch (error) {
    console.log("ℹ️  No config file found, using default AWS credential chain");
  }
}

async function testTranslation() {
  console.log("\n🧪 Testing AWS Translate...\n");

  const clientConfig: any = {
    region: credentials?.region || "us-east-1",
  };

  if (credentials?.accessKeyId && credentials?.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    };
    console.log("✅ Using explicit credentials");
  } else {
    console.log("ℹ️  Using default AWS credential chain");
  }

  const client = new TranslateClient(clientConfig);

  const testCases = [
    { text: "Hello", from: "en", to: "es", expected: "Hola" },
    { text: "What is your name?", from: "en", to: "fr", expected: "Comment vous appelez-vous?" },
    { text: "Thank you", from: "en", to: "de", expected: "Danke" },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Translating: "${testCase.text}" (${testCase.from} → ${testCase.to})`);
      
      const command = new TranslateTextCommand({
        Text: testCase.text,
        SourceLanguageCode: testCase.from,
        TargetLanguageCode: testCase.to,
      });

      const startTime = Date.now();
      const response = await client.send(command);
      const duration = Date.now() - startTime;

      if (response.TranslatedText) {
        console.log(`   ✅ Success (${duration}ms): "${response.TranslatedText}"`);
        console.log(`   📊 Source Language: ${response.SourceLanguageCode || testCase.from}`);
        successCount++;
      } else {
        console.log(`   ❌ No translated text in response`);
        failCount++;
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.name || "Unknown"}`);
      console.log(`   📄 Message: ${error.message || String(error)}`);
      
      if (error.name === "AccessDeniedException") {
        console.log(`\n   ⚠️  PERMISSION ERROR:`);
        console.log(`   The IAM user doesn't have translate:TranslateText permission.`);
        console.log(`   Please update the IAM policy as described in DOCS/aws-iam-policy-setup.md`);
      } else if (error.message?.includes("Credential")) {
        console.log(`\n   ⚠️  CREDENTIAL ERROR:`);
        console.log(`   AWS credentials are missing or invalid.`);
        console.log(`   Run: npm run load-aws-credentials <profile-name>`);
      } else if (error.message?.includes("structuredClone")) {
        console.log(`\n   ⚠️  POLYFILL ERROR:`);
        console.log(`   The structuredClone polyfill may not be loading correctly.`);
      }
      
      failCount++;
    }
  }

  console.log(`\n\n📊 Test Results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📈 Success Rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log(`\n🎉 Translation is working! You can now use it in the app.`);
    process.exit(0);
  } else {
    console.log(`\n❌ Translation is not working. Please check the errors above.`);
    process.exit(1);
  }
}

testTranslation().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


