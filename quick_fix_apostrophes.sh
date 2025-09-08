#!/bin/bash

# Quick fix for apostrophe issues in JavaScript/TypeScript files

echo "🔧 Quick fix for apostrophe issues..."

# Replace all &apos; back to ' in all TypeScript/TSX files
find fubamarket -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i 's/&apos;/'"'"'/g'

# Replace all &quot; back to " in all TypeScript/TSX files
find fubamarket -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i 's/&quot;/"/g'

echo "✅ All apostrophes and quotes fixed!"
echo "🎉 Your JavaScript/TypeScript code is now correct!"

echo ""
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Check for any remaining errors"
