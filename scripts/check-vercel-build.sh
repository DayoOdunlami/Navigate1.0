#!/bin/bash
# Script to check latest Vercel deployment and save logs locally
# Usage: ./scripts/check-vercel-build.sh

set -e

echo "🔍 Checking latest Vercel deployment..."

# Get latest deployment
LATEST_DEPLOYMENT=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -z "$LATEST_DEPLOYMENT" ]; then
  echo "⚠️  Could not fetch deployment. Make sure you're logged in: vercel login"
  exit 1
fi

echo "📦 Latest deployment: $LATEST_DEPLOYMENT"

# Get logs
echo "📥 Fetching logs..."
vercel logs "$LATEST_DEPLOYMENT" > vercel-build-logs.txt 2>&1 || {
  echo "⚠️  Could not fetch logs. Trying alternative method..."
  vercel inspect "$LATEST_DEPLOYMENT" --logs > vercel-build-logs.txt 2>&1 || true
}

# Extract errors
echo "🔎 Extracting errors..."
grep -E "Type error|error TS|Failed to compile|Failed to build" vercel-build-logs.txt > BUILD_ERRORS.txt || {
  echo "✅ No build errors found in logs"
  echo "✅ Build successful" > BUILD_ERRORS.txt
}

echo "✅ Logs saved to vercel-build-logs.txt"
echo "✅ Errors saved to BUILD_ERRORS.txt"
echo ""
echo "📋 Latest errors:"
head -20 BUILD_ERRORS.txt

