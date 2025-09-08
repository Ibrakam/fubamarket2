#!/bin/bash

# Fix import errors in the project

echo "🔧 Fixing import errors..."

# Fix Search import in app/page.tsx
echo "📝 Fixing Search import in app/page.tsx..."
sed -i 's/import { Search, Truck, Shield, RotateCcw } from "lucide-react"/import { Search, Truck, Shield, RotateCcw } from "lucide-react"/' fubamarket/app/page.tsx

# Check if Search is used in the file
if grep -q "<Search" fubamarket/app/page.tsx; then
    echo "✅ Search icon is used in app/page.tsx"
else
    echo "⚠️  Search icon is not used in app/page.tsx"
fi

# Fix other common import issues
echo "📝 Checking for other import issues..."

# Check for missing imports in other files
files_with_issues=$(grep -r "className.*Search" fubamarket --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort -u)

for file in $files_with_issues; do
    if [ -f "$file" ]; then
        echo "📝 Checking $file for Search import..."
        if ! grep -q "import.*Search.*from.*lucide-react" "$file"; then
            echo "⚠️  $file uses Search but doesn't import it"
            # Add Search to existing lucide-react import
            sed -i 's/import { \([^}]*\) } from "lucide-react"/import { \1, Search } from "lucide-react"/' "$file"
        fi
    fi
done

echo ""
echo "🔍 Checking for remaining import issues..."

# Check for undefined components
undefined_components=$(grep -r "className.*Search" fubamarket --include="*.tsx" --include="*.ts" | grep -v "import.*Search" | wc -l)
echo "📈 Files with potential Search import issues: $undefined_components"

if [ "$undefined_components" -eq 0 ]; then
    echo "✅ All Search imports are properly defined!"
else
    echo "⚠️  Some Search imports may still need fixing:"
    grep -r "className.*Search" fubamarket --include="*.tsx" --include="*.ts" | grep -v "import.*Search" | head -5
fi

echo ""
echo "🚀 Import fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure Django server is running: cd apps/api && python manage.py runserver"
echo "2. Run: npm run dev"
echo "3. Check for any remaining errors"
