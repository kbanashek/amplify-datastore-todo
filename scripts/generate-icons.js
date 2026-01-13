#!/usr/bin/env node

const sharp = require("sharp");
const path = require("path");

const svgPath = path.join(__dirname, "../assets/images/orion-icon.svg");
const outputDir = path.join(__dirname, "../assets/images");

const iconSizes = [
  { name: "icon.png", size: 1024 },
  { name: "adaptive-icon.png", size: 1024 },
  { name: "splash-icon.png", size: 400 },
  { name: "favicon.png", size: 48 },
];

async function generateIcons() {
  console.log("🎨 Generating app icons from SVG...\n");

  for (const { name, size } of iconSizes) {
    try {
      const outputPath = path.join(outputDir, name);
      await sharp(svgPath).resize(size, size).png().toFile(outputPath);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log("\n🎉 Icon generation complete!");
}

generateIcons().catch(console.error);
