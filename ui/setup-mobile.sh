#!/bin/bash

set -e

echo "🚀 Aura Guide mobile setup"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required. Install Node 18+ and retry."
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web app..."
npm run build

if ! command -v npx >/dev/null 2>&1; then
  echo "❌ npx is required. Please update Node.js."
  exit 1
fi

if [ ! -d "android" ]; then
  echo "🤖 Adding Android platform..."
  npx cap add android
else
  echo "✅ Android platform already added."
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  if [ ! -d "ios" ]; then
    echo "🍎 Adding iOS platform..."
    npx cap add ios
  else
    echo "✅ iOS platform already added."
  fi
else
  echo "ℹ️  Skipping iOS platform (requires macOS)."
fi

echo "🔄 Syncing Capacitor..."
npx cap sync

echo ""
echo "✅ Setup complete!"
echo "Run 'npm run build:android' to open Android Studio."
echo "On macOS run 'npm run build:ios' to open Xcode."

