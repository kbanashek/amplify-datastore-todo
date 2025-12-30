#!/usr/bin/env ts-node

/**
 * Jira Story Creation Automation Script
 *
 * This script automates the creation of Jira stories under their respective epics
 * using the Jira REST API.
 *
 * Prerequisites:
 * - JIRA_BASE_URL environment variable (e.g., https://clinicalink.atlassian.net)
 * - JIRA_EMAIL environment variable (your Atlassian account email)
 * - JIRA_API_TOKEN environment variable (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
 * - JIRA_PROJECT_KEY environment variable (e.g., OR for Orion)
 *
 * Usage:
 *   # Dry run (preview what would be created)
 *   yarn ts-node scripts/create-jira-stories.ts --dry-run
 *
 *   # Create stories
 *   yarn ts-node scripts/create-jira-stories.ts
 *
 *   # Create stories for specific epic only
 *   yarn ts-node scripts/create-jira-stories.ts --epic OR-26446
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";

interface JiraStoriesData {
  [epicKey: string]: {
    epicKey: string;
    epicTitle: string;
    stories: string[];
  };
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
    };
  };
}

interface CreateIssueResponse {
  id: string;
  key: string;
  self: string;
}

interface ScriptOptions {
  dryRun: boolean;
  epicFilter?: string;
}

// Configuration from environment variables
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || "";
const JIRA_EMAIL = process.env.JIRA_EMAIL || "";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "OR";

// Parse command line arguments
const args = process.argv.slice(2);
const options: ScriptOptions = {
  dryRun: args.includes("--dry-run"),
  epicFilter: args.find(arg => arg.startsWith("--epic="))?.split("=")[1],
};

/**
 * Make authenticated request to Jira API
 */
function makeJiraRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, JIRA_BASE_URL);
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString(
      "base64"
    );

    const requestOptions: https.RequestOptions = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(url, requestOptions, res => {
      let body = "";

      res.on("data", chunk => {
        body += chunk;
      });

      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Verify epic exists in Jira
 */
async function verifyEpic(epicKey: string): Promise<boolean> {
  try {
    const issue = await makeJiraRequest("GET", `/rest/api/3/issue/${epicKey}`);
    return issue.fields.issuetype.name === "Epic";
  } catch (error) {
    console.error(`❌ Epic ${epicKey} not found or not accessible`);
    return false;
  }
}

/**
 * Create a story in Jira
 */
async function createStory(
  epicKey: string,
  summary: string,
  retryCount = 0
): Promise<CreateIssueResponse> {
  const maxRetries = 3;

  try {
    const issueData = {
      fields: {
        project: {
          key: JIRA_PROJECT_KEY,
        },
        summary,
        issuetype: {
          name: "Story",
        },
        parent: {
          key: epicKey,
        },
      },
    };

    const response = await makeJiraRequest(
      "POST",
      "/rest/api/3/issue",
      issueData
    );

    return response;
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(
        `   ⚠️  Retry ${retryCount + 1}/${maxRetries} for: ${summary}`
      );
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return createStory(epicKey, summary, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Validate environment configuration
 */
function validateConfig(): boolean {
  const required = {
    JIRA_BASE_URL,
    JIRA_EMAIL,
    JIRA_API_TOKEN,
    JIRA_PROJECT_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(key => console.error(`   - ${key}`));
    console.error("\nPlease set these variables before running the script.");
    console.error("See script header for details.\n");
    return false;
  }

  return true;
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Jira Story Creation Script\n");

  // Validate configuration
  if (!validateConfig()) {
    process.exit(1);
  }

  // Load story data
  const dataPath = path.join(__dirname, "jira-stories.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Story data file not found: ${dataPath}`);
    process.exit(1);
  }

  const storiesData: JiraStoriesData = JSON.parse(
    fs.readFileSync(dataPath, "utf-8")
  );

  // Filter epics if specified
  const epicsToProcess = options.epicFilter
    ? { [options.epicFilter]: storiesData[options.epicFilter] }
    : storiesData;

  if (options.epicFilter && !epicsToProcess[options.epicFilter]) {
    console.error(`❌ Epic ${options.epicFilter} not found in data file`);
    process.exit(1);
  }

  // Show configuration
  console.log(`📋 Configuration:`);
  console.log(`   Base URL: ${JIRA_BASE_URL}`);
  console.log(`   Project: ${JIRA_PROJECT_KEY}`);
  console.log(`   Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  if (options.epicFilter) {
    console.log(`   Epic Filter: ${options.epicFilter}`);
  }
  console.log();

  // Process each epic
  const results: {
    [epicKey: string]: { success: string[]; failed: string[] };
  } = {};
  let totalStories = 0;
  let totalCreated = 0;
  let totalFailed = 0;

  for (const [epicKey, epicData] of Object.entries(epicsToProcess)) {
    console.log(`\n📦 Epic: ${epicKey} - ${epicData.epicTitle}`);
    console.log(`   Stories to create: ${epicData.stories.length}`);

    results[epicKey] = { success: [], failed: [] };

    if (!options.dryRun) {
      // Verify epic exists
      const epicExists = await verifyEpic(epicKey);
      if (!epicExists) {
        console.log(
          `   ⚠️  Skipping epic ${epicKey} - not found or not accessible\n`
        );
        continue;
      }
    }

    // Create each story
    for (let i = 0; i < epicData.stories.length; i++) {
      const story = epicData.stories[i];
      totalStories++;

      if (options.dryRun) {
        console.log(
          `   [DRY RUN] ${i + 1}/${epicData.stories.length}: ${story}`
        );
        results[epicKey].success.push(story);
      } else {
        try {
          const response = await createStory(epicKey, story);
          console.log(
            `   ✅ ${i + 1}/${epicData.stories.length}: ${response.key} - ${story}`
          );
          results[epicKey].success.push(response.key);
          totalCreated++;

          // Rate limiting - wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            `   ❌ ${i + 1}/${epicData.stories.length}: Failed - ${story}`
          );
          console.log(`      Error: ${errorMessage}`);
          results[epicKey].failed.push(story);
          totalFailed++;
        }
      }
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 Summary\n");

  for (const [epicKey, result] of Object.entries(results)) {
    console.log(`\n${epicKey}:`);
    console.log(`   ✅ Success: ${result.success.length}`);
    console.log(`   ❌ Failed: ${result.failed.length}`);

    if (result.failed.length > 0) {
      console.log(`\n   Failed stories:`);
      result.failed.forEach(story => console.log(`      - ${story}`));
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`Total Stories: ${totalStories}`);
  if (options.dryRun) {
    console.log(`Mode: DRY RUN (no stories were actually created)`);
  } else {
    console.log(`✅ Created: ${totalCreated}`);
    console.log(`❌ Failed: ${totalFailed}`);
  }
  console.log("=".repeat(80) + "\n");

  if (totalFailed > 0 && !options.dryRun) {
    console.log("⚠️  Some stories failed to create. Review the errors above.");
    process.exit(1);
  }
}

// Execute
main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
