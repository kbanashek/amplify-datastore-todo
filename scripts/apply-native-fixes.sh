#!/bin/bash
# Apply fixes to native iOS and Android code after expo prebuild
# These fixes are needed because ios/ and android/ directories are not committed
# See DOCS/native-build-fixes.md for details

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Applying native code fixes..."
echo ""

# Fix 1: iOS Podfile - Add duplicate symbols fix for JKBigInteger/JKBigDecimal
IOS_PODFILE="$PROJECT_ROOT/ios/Podfile"
if [ -f "$IOS_PODFILE" ]; then
  echo "  [iOS] Checking Podfile..."
  
  # Check if fix already exists
  if grep -q "Fix duplicate symbols between AmplifyRTNCore and RNAWSCognito" "$IOS_PODFILE"; then
    echo "    ✓ iOS Podfile fix already applied"
  else
    echo "    Applying iOS Podfile fix..."
    
    # Use a Ruby one-liner to insert the fix
    ruby -i -e "
      content = File.read(ARGV[0])
      if content.include?('Fix duplicate symbols between AmplifyRTNCore and RNAWSCognito')
        puts '    Fix already present'
        exit 0
      end
      
      fix_code = <<'FIX'
    # Fix duplicate symbols between AmplifyRTNCore and RNAWSCognito (JKBigInteger/JKBigDecimal)
    # Both libraries include the same JKBigInteger/JKBigDecimal classes, causing linker errors
    # Solution: Use build settings to exclude the .m files and script phase to remove object files
    installer.pods_project.targets.each do |target|
      if target.name == 'RNAWSCognito'
        target.build_configurations.each do |config|
          # Exclude JKBigInteger and JKBigDecimal .m files using build settings
          excluded_files = config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] || []
          excluded_files << 'JKBigInteger.m'
          excluded_files << 'JKBigDecimal.m'
          config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = excluded_files.uniq
        end
        
        # Also remove from source build phase as backup
        files_to_remove = []
        target.source_build_phase.files.each do |file|
          if file.file_ref
            file_name = file.file_ref.path || file.file_ref.name || file.file_ref.display_name
            if file_name && (file_name.include?('JKBigInteger.m') || file_name.include?('JKBigDecimal.m'))
              files_to_remove << file
            end
          end
        end
        files_to_remove.each do |file|
          target.source_build_phase.remove_file_reference(file.file_ref)
        end
        
        # Add script phase to remove object files from built library as final backup
        existing_script = target.build_phases.find { |p| p.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase) && p.name == 'Remove Duplicate JKBigInteger Symbols' }
        target.build_phases.delete(existing_script) if existing_script
        
        script_phase = target.new_shell_script_build_phase('Remove Duplicate JKBigInteger Symbols')
        script_phase.shell_script = <<-SCRIPT
          # Remove duplicate JKBigInteger and JKBigDecimal object files from RNAWSCognito
          # These are already provided by AmplifyRTNCore
          LIB_PATH=\"\${BUILT_PRODUCTS_DIR}/libRNAWSCognito.a\"
          if [ -f \"\$LIB_PATH\" ]; then
            # Extract object files, remove duplicates, and recreate library
            TEMP_DIR=\$(mktemp -d)
            cd \"\$TEMP_DIR\"
            ar -x \"\$LIB_PATH\" 2>/dev/null || true
            # Remove JKBigInteger and JKBigDecimal object files
            rm -f JKBigInteger.o JKBigDecimal.o 2>/dev/null || true
            # Recreate library without duplicates (only if we removed files)
            if [ -n \"\$(ls -A *.o 2>/dev/null)\" ]; then
              ar -rcs \"\$LIB_PATH\" *.o 2>/dev/null || true
            fi
            cd - > /dev/null
            rm -rf \"\$TEMP_DIR\"
          fi
        SCRIPT
        script_phase.run_only_for_deployment_postprocessing = '0'
      end
    end
FIX
      
      lines = content.split(\"\\n\")
      post_install_end = nil
      in_post_install = false
      indent_level = 0
      
      lines.each_with_index do |line, i|
        if line.include?('post_install do |installer|')
          in_post_install = true
          indent_level = line[/\\A */].size
        elsif in_post_install && line.strip == 'end' && line[/\\A */].size == indent_level
          post_install_end = i
          break
        end
      end
      
      if post_install_end
        new_lines = lines[0...post_install_end] + [fix_code] + lines[post_install_end..-1]
        File.write(ARGV[0], new_lines.join(\"\\n\"))
        puts '    ✓ iOS Podfile fix applied'
      else
        puts '    ✗ Could not find post_install block in Podfile'
        exit 1
      end
    " "$IOS_PODFILE"
    
    if [ $? -eq 0 ]; then
      echo "    ✓ iOS Podfile fix applied successfully"
    else
      echo "    ✗ Failed to apply iOS Podfile fix (you may need to apply it manually)"
      echo "    See DOCS/native-build-fixes.md for manual instructions"
    fi
  fi
else
  echo "  ⚠ iOS Podfile not found (ios/ directory may not exist yet)"
  echo "    Run 'expo prebuild' first, then run this script again"
fi

# Fix 2: Android MainActivity.kt - Fix onCreate to pass savedInstanceState
ANDROID_MAIN_ACTIVITY="$PROJECT_ROOT/android/app/src/main/java/com/orion/tasksystem/MainActivity.kt"
if [ -f "$ANDROID_MAIN_ACTIVITY" ]; then
  echo ""
  echo "  [Android] Checking MainActivity..."
  
  if grep -q "super.onCreate(savedInstanceState)" "$ANDROID_MAIN_ACTIVITY"; then
    echo "    ✓ Android MainActivity fix already applied"
  elif grep -q "super.onCreate(null)" "$ANDROID_MAIN_ACTIVITY"; then
    echo "    Applying Android MainActivity fix..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' 's/super\.onCreate(null)/super.onCreate(savedInstanceState)/g' "$ANDROID_MAIN_ACTIVITY"
    else
      # Linux
      sed -i 's/super\.onCreate(null)/super.onCreate(savedInstanceState)/g' "$ANDROID_MAIN_ACTIVITY"
    fi
    echo "    ✓ Android MainActivity fix applied"
  else
    echo "    ⚠ Could not find onCreate method to fix"
    echo "    See DOCS/native-build-fixes.md for manual instructions"
  fi
else
  echo ""
  echo "  ⚠ Android MainActivity not found (android/ directory may not exist yet)"
  echo "    Run 'expo prebuild' first, then run this script again"
fi

echo ""
echo "✓ Native code fixes check complete!"
echo ""
echo "Next steps:"
if [ -f "$IOS_PODFILE" ]; then
  echo "  - For iOS: Run 'cd ios && pod install'"
fi
if [ -f "$ANDROID_MAIN_ACTIVITY" ]; then
  echo "  - For Android: Rebuild the app (the fix is already applied)"
fi
echo ""
echo "For more details, see: DOCS/native-build-fixes.md"

