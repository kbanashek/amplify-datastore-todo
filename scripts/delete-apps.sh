#!/bin/bash

# Delete apps from both iOS simulator and Android emulator
# Usage: ./scripts/delete-apps.sh

echo "🗑️  Deleting iOS app from simulator..."
xcrun simctl uninstall booted com.orion.tasksystem 2>&1
if [ $? -eq 0 ]; then
  echo "✅ iOS app deleted"
else
  echo "⚠️  iOS app may not be installed or simulator not running"
fi

echo ""
echo "🗑️  Deleting Android app from emulator..."
adb uninstall com.orion.tasksystem 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Android app deleted"
else
  echo "⚠️  Android app may not be installed or emulator not running"
fi

echo ""
echo "🎉 Done! Ready to reinstall both apps."
echo "   Press 'i' for iOS and 'a' for Android in Expo terminal."
