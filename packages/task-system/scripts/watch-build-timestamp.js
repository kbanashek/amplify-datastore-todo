#!/usr/bin/env node

/**
 * Watches dist/ directory and updates package.json timestamp when files change.
 * This forces Metro to re-resolve the package and invalidate its cache.
 */

const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "..", "dist");
const packageJsonPath = path.join(__dirname, "..", "package.json");

let lastUpdate = 0;
const DEBOUNCE_MS = 2000; // Wait 2 seconds after last change before updating (prevent loops)
let updateTimeout = null;

function updateTimestamp() {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  pkg._buildTimestamp = new Date().toISOString();
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");

  // DON'T touch dist/index.js - it triggers the watcher and creates a loop!

  console.log(`✅ [watch] Updated build timestamp: ${pkg._buildTimestamp}`);
}

function checkAndUpdate() {
  const now = Date.now();
  // Clear any pending update
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }

  // Only update if enough time has passed since last update
  if (now - lastUpdate > DEBOUNCE_MS) {
    updateTimestamp();
    lastUpdate = now;
  } else {
    // Debounce: schedule update for later
    updateTimeout = setTimeout(
      () => {
        const checkNow = Date.now();
        if (checkNow - lastUpdate > DEBOUNCE_MS) {
          updateTimestamp();
          lastUpdate = checkNow;
        }
        updateTimeout = null;
      },
      DEBOUNCE_MS - (now - lastUpdate)
    );
  }
}

// Watch dist directory recursively
console.log(`👀 Watching ${distPath} for changes...`);
fs.watch(distPath, { recursive: true }, (eventType, filename) => {
  // Ignore package.json changes (we update it, don't react to it)
  if (filename && filename.includes("package.json")) {
    return;
  }
  // Only react to actual source file changes, not our own touches
  if (filename && (filename.endsWith(".js") || filename.endsWith(".d.ts"))) {
    // Ignore if it's the index.js we just touched (avoid loop)
    if (filename === "index.js" && eventType === "change") {
      // Check if this is a real change or just our touch
      // We'll let it through but debounce will handle it
    }
    checkAndUpdate();
  }
});

// Initial timestamp
updateTimestamp();
