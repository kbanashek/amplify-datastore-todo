#!/bin/bash
# Cursor command: Version Bump
# This script wraps the version-bump.sh script for Cursor

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION_SCRIPT="$SCRIPT_DIR/scripts/version-bump.sh"

if [ ! -f "$VERSION_SCRIPT" ]; then
    echo "❌ Version bump script not found at: $VERSION_SCRIPT"
    exit 1
fi

# Get arguments
BUMP_TYPE=${1:-patch}
COMMIT_MSG=${2:-""}

# Run the version bump script
exec "$VERSION_SCRIPT" "$BUMP_TYPE" "$COMMIT_MSG"



