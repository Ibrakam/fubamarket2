#!/bin/bash

# Fix apostrophes in JavaScript/TypeScript files
# &apos; should be replaced back to ' in JS/TS code

echo "🔧 Fixing apostrophes in JavaScript/TypeScript files..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "📝 Fixing $file..."
    
    # Replace &apos; back to ' in JavaScript/TypeScript files
    sed -i 's/&apos;/'"'"'/g' "$file"
    
    # Replace &quot; back to " in JavaScript/TypeScript files
    sed -i 's/&quot;/"/g' "$file"
}

# Get all TypeScript/TSX files
files=$(find fubamarket -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next)

echo "📊 Found $(echo "$files" | wc -l) files to fix:"
echo "$files"
echo ""

# Fix each file
for file in $files; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "❌ File not found: $file"
    fi
done

echo ""
echo "🔍 Checking for remaining issues..."

# Check for remaining &apos;
remaining_apostrophes=$(grep -r "&apos;" fubamarket --include="*.tsx" --include="*.ts" | wc -l)
echo "📈 Remaining &apos; entities: $remaining_apostrophes"

# Check for remaining &quot;
remaining_quotes=$(grep -r "&quot;" fubamarket --include="*.tsx" --include="*.ts" | wc -l)
echo "📈 Remaining &quot; entities: $remaining_quotes"

if [ "$remaining_apostrophes" -eq 0 ] && [ "$remaining_quotes" -eq 0 ]; then
    echo "✅ All HTML entities have been fixed!"
    echo "🎉 Your JavaScript/TypeScript code is now correct!"
else
    echo "⚠️  Some HTML entities still remain:"
    if [ "$remaining_apostrophes" -gt 0 ]; then
        echo "&apos; entities:"
        grep -r "&apos;" fubamarket --include="*.tsx" --include="*.ts" | head -5
    fi
    if [ "$remaining_quotes" -gt 0 ]; then
        echo "&quot; entities:"
        grep -r "&quot;" fubamarket --include="*.tsx" --include="*.ts" | head -5
    fi
fi

echo ""
echo "🚀 Apostrophe fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Check for any remaining errors"
echo "3. Deploy to server: sudo ./production_setup.sh"
