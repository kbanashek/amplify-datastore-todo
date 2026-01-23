#!/usr/bin/env node

/**
 * Updates package.json with a build timestamp to force Metro cache invalidation.
 * This ensures Metro re-resolves the package when files change.
 */

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Add/update build timestamp
pkg._buildTimestamp = new Date().toISOString();

// Write back with proper formatting
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`✅ Updated build timestamp: ${pkg._buildTimestamp}`);
