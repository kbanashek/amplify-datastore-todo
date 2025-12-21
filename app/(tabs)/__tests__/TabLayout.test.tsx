/**
 * TabLayout Regression Tests
 *
 * These tests ensure that the bottom navigation only shows 2 tabs:
 * 1. Task Dashboard (with checkmark.circle.fill icon)
 * 2. Dev Options (with atom icon)
 *
 * All other screens should be hidden from the tab bar.
 */

import React from "react";
import { readFileSync } from "fs";
import { join } from "path";

describe("TabLayout Regression Tests", () => {
  let layoutContent: string;

  beforeAll(() => {
    // Read the actual layout file to test its structure
    const layoutPath = join(__dirname, "../_layout.tsx");
    layoutContent = readFileSync(layoutPath, "utf-8");
  });

  it("should have exactly 2 visible tabs in the layout file", () => {
    // Count Tabs.Screen components that don't have href: null
    const visibleTabPattern =
      /<Tabs\.Screen\s+name="(index|seed-screen)"[\s\S]*?options=\{\{[\s\S]*?title:\s*"(Task Dashboard|Dev Options)"[\s\S]*?\}\}[\s\S]*?\/>/g;
    const visibleTabs = layoutContent.match(visibleTabPattern);

    expect(visibleTabs).toBeTruthy();
    expect(visibleTabs?.length).toBe(2);
  });

  it("should have Task Dashboard tab with correct title and icon", () => {
    expect(layoutContent).toContain('name="index"');
    expect(layoutContent).toContain('title: "Task Dashboard"');
    expect(layoutContent).toContain('name="checkmark.circle.fill"');
  });

  it("should have Dev Options tab with correct title and React icon", () => {
    expect(layoutContent).toContain('name="seed-screen"');
    expect(layoutContent).toContain('title: "Dev Options"');
    expect(layoutContent).toContain('name="atom"');
  });

  it("should hide all other screens from tab bar", () => {
    const hiddenScreens = [
      "task-dashboard-screen",
      "activities",
      "datapoints",
      "questions",
      "task-answers",
      "task-results",
      "task-history",
      "appointment-details",
      "lx-host-example",
    ];

    hiddenScreens.forEach(screenName => {
      // Each hidden screen should have href: null
      const screenPattern = new RegExp(
        `<Tabs\\.Screen\\s+name="${screenName}"[\\s\\S]*?href:\\s*null`,
        "g"
      );
      expect(layoutContent).toMatch(screenPattern);
    });
  });

  it("should not have any other visible tabs", () => {
    // Find all Tabs.Screen components
    const allTabsPattern = /<Tabs\.Screen\s+name="([^"]+)"/g;
    const allTabs: string[] = [];
    let match;

    while ((match = allTabsPattern.exec(layoutContent)) !== null) {
      allTabs.push(match[1]);
    }

    // Filter out the two visible tabs
    const visibleTabs = allTabs.filter(
      name => name === "index" || name === "seed-screen"
    );
    const hiddenTabs = allTabs.filter(
      name => name !== "index" && name !== "seed-screen"
    );

    expect(visibleTabs.length).toBe(2);
    expect(hiddenTabs.length).toBeGreaterThan(0);

    // All non-visible tabs should be hidden
    hiddenTabs.forEach(tabName => {
      const tabPattern = new RegExp(
        `<Tabs\\.Screen\\s+name="${tabName}"[\\s\\S]*?href:\\s*null`,
        "g"
      );
      expect(layoutContent).toMatch(tabPattern);
    });
  });
});
