#!/usr/bin/env tsx
/**
 * Script to load AWS credentials from a profile and export them
 * This can be used to populate environment variables or create a config file
 * 
 * Usage:
 *   tsx scripts/load-aws-credentials.ts [profile-name] [--env] [--config]
 * 
 * Options:
 *   --env     Export as environment variables (for shell)
 *   --config  Create a config file (for React Native)
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const profile = process.argv[2] || process.env.AWS_PROFILE || "default";
const outputEnv = process.argv.includes("--env");
const outputConfig = process.argv.includes("--config") || !outputEnv;

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  sessionToken?: string;
}

function getAWSCredentials(profileName: string): AWSCredentials | null {
  try {
    // Try to get credentials using AWS CLI
    const accessKeyId = execSync(
      `aws configure get aws_access_key_id --profile ${profileName}`,
      { encoding: "utf-8" }
    ).trim();

    const secretAccessKey = execSync(
      `aws configure get aws_secret_access_key --profile ${profileName}`,
      { encoding: "utf-8" }
    ).trim();

    const region =
      execSync(`aws configure get region --profile ${profileName}`, {
        encoding: "utf-8",
      }).trim() || "us-east-1";

    if (!accessKeyId || !secretAccessKey) {
      return null;
    }

    return {
      accessKeyId,
      secretAccessKey,
      region,
    };
  } catch (error) {
    console.error(`Error reading AWS profile '${profileName}':`, error);
    return null;
  }
}

function main() {
  console.log(`Loading AWS credentials from profile: ${profile}`);

  const credentials = getAWSCredentials(profile);

  if (!credentials) {
    console.error(`Failed to load credentials from profile '${profile}'`);
    console.error("Make sure the profile is configured: aws configure --profile <profile-name>");
    process.exit(1);
  }

  if (outputEnv) {
    // Export as environment variables (for shell scripts)
    console.log("\n# Add these to your environment:");
    console.log(`export AWS_ACCESS_KEY_ID="${credentials.accessKeyId}"`);
    console.log(`export AWS_SECRET_ACCESS_KEY="${credentials.secretAccessKey}"`);
    console.log(`export AWS_REGION="${credentials.region}"`);
    if (credentials.sessionToken) {
      console.log(`export AWS_SESSION_TOKEN="${credentials.sessionToken}"`);
    }
  }

  if (outputConfig) {
    // Create config file for React Native
    const configPath = path.join(process.cwd(), "src", "config", "aws-credentials.json");
    const configDir = path.dirname(configPath);

    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write credentials (excluding secret in readable format for security)
    const config = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken }),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ Credentials saved to: ${configPath}`);
    console.log("⚠️  Note: This file contains sensitive credentials. Make sure it's in .gitignore!");
  }

  console.log("\n✅ Credentials loaded successfully!");
}

main();


