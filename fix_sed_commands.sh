#!/bin/bash

# Fix all sed commands in shell scripts for Ubuntu/Linux
# This script converts macOS sed commands to Linux sed commands

echo "🔧 Converting all sed commands from macOS to Ubuntu/Linux..."

# List of shell scripts to fix
scripts=(
    "final_url_update.sh"
    "fix_remaining_urls.sh"
    "update_api_urls.sh"
    "fix_remaining_files.sh"
    "final_fix.sh"
    "quick_fix.sh"
    "fix_all_remaining.sh"
    "fix_all.sh"
    "fix_remaining.sh"
    "fix_all_urls.sh"
    "fix_urls.sh"
)

# Function to fix sed commands in a file
fix_sed_commands() {
    local file="$1"
    echo "📝 Fixing $file..."
    
    # Replace sed -i '' with sed -i (remove empty string for Linux)
    sed -i 's/sed -i '\'''\''/sed -i/g' "$file"
    
    echo "✅ Fixed $file"
}

# Fix each script
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        fix_sed_commands "$script"
    else
        echo "⚠️  Script not found: $script"
    fi
done

echo ""
echo "🎉 All sed commands have been converted for Ubuntu/Linux!"
echo ""
echo "📋 Now you can run:"
echo "   ./fix_all_urls_ubuntu.sh"
echo "   sudo ./production_setup.sh"
