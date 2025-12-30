#!/usr/bin/env ts-node

/**
 * Jira Story Creation Automation Script
 *
 * This script automates the creation of Jira stories under their respective epics.
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

interface Story {
  title: string;
  description: string;
}

interface Epic {
  epicKey: string;
  epicTitle: string;
  stories: Story[];
}

interface JiraData {
  [key: string]: Epic;
}

// Configuration from environment variables
const config = {
  baseUrl: process.env.JIRA_BASE_URL,
  email: process.env.JIRA_EMAIL,
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY,
};

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const epicFilter = args.find(arg => arg.startsWith("--epic="))?.split("=")[1];

/**
 * Validates that all required configuration is present
 */
function validateConfig(): void {
  const missing = [];
  if (!config.baseUrl) missing.push("JIRA_BASE_URL");
  if (!config.email) missing.push("JIRA_EMAIL");
  if (!config.apiToken) missing.push("JIRA_API_TOKEN");
  if (!config.projectKey) missing.push("JIRA_PROJECT_KEY");

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(v => console.error(`   - ${v}`));
    console.error("\n💡 Set these in your environment or .env file");
    process.exit(1);
  }
}

/**
 * Makes an authenticated request to the Jira API
 */
async function jiraRequest(
  endpoint: string,
  method: string,
  body?: any
): Promise<any> {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString(
    "base64"
  );

  const response = await fetch(`${config.baseUrl}/rest/api/3/${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jira API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Creates a single Jira story
 */
async function createStory(story: Story, epicKey: string): Promise<string> {
  const issue = {
    fields: {
      project: { key: config.projectKey },
      summary: story.title,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: story.description,
              },
            ],
          },
        ],
      },
      issuetype: { name: "Story" },
      parent: { key: epicKey },
    },
  };

  const result = await jiraRequest("issue", "POST", issue);
  return result.key;
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Jira Story Creation Script\n");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No stories will be created\n");
  }

  // Validate configuration
  validateConfig();

  // Load stories data
  const dataPath = path.join(__dirname, "jira-stories.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found: ${dataPath}`);
    process.exit(1);
  }

  const data: JiraData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Filter epics if specified
  const epics = epicFilter
    ? Object.entries(data).filter(([key]) => key === epicFilter)
    : Object.entries(data);

  if (epics.length === 0) {
    console.error(
      `❌ No epics found${epicFilter ? ` matching: ${epicFilter}` : ""}`
    );
    process.exit(1);
  }

  console.log(`📋 Found ${epics.length} epic(s)\n`);

  let totalStories = 0;
  let createdStories = 0;

  // Process each epic
  for (const [epicKey, epic] of epics) {
    console.log(`\n📦 Epic: ${epicKey} - ${epic.epicTitle}`);
    console.log(`   Stories to create: ${epic.stories.length}`);

    for (const story of epic.stories) {
      totalStories++;

      if (dryRun) {
        console.log(`   ✓ [DRY RUN] Would create: ${story.title}`);
      } else {
        try {
          const issueKey = await createStory(story, epicKey);
          console.log(`   ✓ Created: ${issueKey} - ${story.title}`);
          createdStories++;

          // Rate limiting: wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`   ❌ Failed to create: ${story.title}`);
          console.error(
            `      Error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  if (dryRun) {
    console.log(
      `📊 Summary: Would create ${totalStories} stories across ${epics.length} epic(s)`
    );
  } else {
    console.log(
      `📊 Summary: Created ${createdStories}/${totalStories} stories`
    );
    if (createdStories < totalStories) {
      console.log(
        `⚠️  ${totalStories - createdStories} stories failed to create`
      );
    }
  }
  console.log(`${"=".repeat(60)}\n`);
}

// Execute main function
main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
