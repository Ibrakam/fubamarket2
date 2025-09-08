#!/bin/bash

# Convert all shell scripts from macOS to Ubuntu/Linux
# This script fixes sed commands and other macOS-specific syntax

echo "🔧 Converting all shell scripts from macOS to Ubuntu/Linux..."

# Function to convert a file
convert_file() {
    local file="$1"
    echo "📝 Converting $file..."
    
    # Replace sed -i '' with sed -i (remove empty string for Linux)
    sed -i 's/sed -i '\'''\''/sed -i/g' "$file"
    
    echo "✅ Converted $file"
}

# Find all shell scripts
scripts=$(find . -name "*.sh" -type f)

echo "📊 Found $(echo "$scripts" | wc -l) shell scripts to convert:"
echo "$scripts"
echo ""

# Convert each script
for script in $scripts; do
    if [ -f "$script" ]; then
        convert_file "$script"
    fi
done

echo ""
echo "🎉 All shell scripts have been converted for Ubuntu/Linux!"
echo ""
echo "📋 Now you can run:"
echo "   ./fix_all_urls_ubuntu.sh"
echo "   sudo ./production_setup.sh"
