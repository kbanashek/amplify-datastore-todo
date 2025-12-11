// Simple TypeScript loader for Node.js
// Uses the TypeScript compiler API directly

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const require = createRequire(import.meta.url);

// Try to use ts-node if available, otherwise fall back to tsx
let tsLoader;
try {
  // Try tsx first (lighter weight)
  tsLoader = require.resolve('tsx/dist/loader.mjs');
} catch {
  try {
    // Fall back to ts-node
    tsLoader = require.resolve('ts-node/esm');
  } catch {
    // If neither is available, we'll need to compile manually
    console.error('Neither tsx nor ts-node is available. Please install one: npm install --save-dev tsx');
    process.exit(1);
  }
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
    return {
      shortCircuit: true,
      url: pathToFileURL(specifier).href,
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    // Use the available loader
    const loader = await import(tsLoader);
    return loader.load(url, context, nextLoad);
  }
  return nextLoad(url, context);
}



