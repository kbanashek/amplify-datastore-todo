#!/bin/bash

# Version bump script for semantic versioning
# Usage: ./scripts/version-bump.sh [major|minor|patch] [commit-message]
# Example: ./scripts/version-bump.sh patch "Fix sync issue"

set -e

# Get current branch and version
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_VERSION=$(echo "$CURRENT_BRANCH" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "")

if [ -z "$CURRENT_VERSION" ]; then
    echo "❌ Current branch doesn't appear to be a version branch (vX.Y.Z)"
    echo "   Current branch: $CURRENT_BRANCH"
    echo ""
    echo "Usage:"
    echo "  ./scripts/version-bump.sh [major|minor|patch] [commit-message]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/version-bump.sh patch \"Fix bug\""
    echo "  ./scripts/version-bump.sh minor \"Add new feature\""
    echo "  ./scripts/version-bump.sh major \"Breaking changes\""
    exit 1
fi

# Parse version
VERSION_NUM=$(echo "$CURRENT_VERSION" | sed 's/v//')
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION_NUM"

# Determine bump type
BUMP_TYPE=${1:-patch}
COMMIT_MSG=${2:-""}

case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "❌ Invalid bump type: $BUMP_TYPE"
        echo "   Must be: major, minor, or patch"
        exit 1
        ;;
esac

NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"
NEW_BRANCH="$NEW_VERSION"

echo "📦 Version Bump"
echo "==============="
echo "Current: $CURRENT_VERSION"
echo "New:     $NEW_VERSION"
echo "Type:    $BUMP_TYPE"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    echo "   Staging all changes..."
    git add -A
    echo ""
fi

# Create new branch
echo "🌿 Creating branch: $NEW_BRANCH"
git checkout -b "$NEW_BRANCH"

# Commit if there are changes or message provided
if [ -n "$COMMIT_MSG" ] || ! git diff-index --quiet HEAD --; then
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="$NEW_VERSION: Update"
    else
        COMMIT_MSG="$NEW_VERSION: $COMMIT_MSG"
    fi
    
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MSG" || echo "⚠️  No changes to commit"
fi

# Push branch
echo "🚀 Pushing branch to origin..."
git push -u origin "$NEW_BRANCH"

echo ""
echo "✅ Successfully created and pushed $NEW_BRANCH"
echo ""
echo "Current branch: $NEW_BRANCH"

