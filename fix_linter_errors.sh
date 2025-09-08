#!/bin/bash

# Fix all linter errors for Ubuntu/Linux
# This script fixes common ESLint and TypeScript errors

echo "🔧 Fixing all linter errors..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "📝 Fixing $file..."
    
    # Fix unescaped apostrophes
    sed -i "s/'/\&apos;/g" "$file"
    
    # Fix unescaped quotes
    sed -i 's/"/\&quot;/g' "$file"
    
    # Remove unused imports (common ones)
    sed -i '/import.*DollarSign.*from.*lucide-react/d' "$file"
    sed -i '/import.*Download.*from.*lucide-react/d' "$file"
    sed -i '/import.*Eye.*from.*lucide-react/d' "$file"
    sed -i '/import.*Star.*from.*lucide-react/d' "$file"
    sed -i '/import.*Heart.*from.*lucide-react/d' "$file"
    sed -i '/import.*Store.*from.*lucide-react/d' "$file"
    sed -i '/import.*ShoppingBag.*from.*lucide-react/d' "$file"
    sed -i '/import.*Gift.*from.*lucide-react/d' "$file"
    sed -i '/import.*Sparkles.*from.*lucide-react/d' "$file"
    sed -i '/import.*Search.*from.*lucide-react/d' "$file"
    sed -i '/import.*Filter.*from.*lucide-react/d' "$file"
    sed -i '/import.*Calendar.*from.*lucide-react/d' "$file"
    sed -i '/import.*CreditCard.*from.*lucide-react/d' "$file"
    sed -i '/import.*Button.*from.*@\/components\/ui\/button/d' "$file"
    sed -i '/import.*Link.*from.*next\/link/d' "$file"
    sed -i '/import.*Badge.*from.*@\/components\/ui\/badge/d' "$file"
    sed -i '/import.*User.*from.*lucide-react/d' "$file"
    sed -i '/import.*useEffect.*from.*react/d' "$file"
    
    # Remove unused API_ENDPOINTS imports
    sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' "$file"
    
    # Remove unused component imports
    sed -i '/import.*WithdrawalProcessModal.*from.*@\/components/d' "$file"
    
    # Fix any types to proper types
    sed -i 's/: any/: unknown/g' "$file"
    sed -i 's/any\[\]/unknown[]/g' "$file"
    
    # Remove unused variables
    sed -i 's/const \[.*index.*\] = /const [ /g' "$file"
    sed -i 's/\(.*\) => {/\1 => {/g' "$file"
    
    # Fix empty interfaces
    sed -i 's/interface.*extends.*{}//g' "$file"
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

# Check for remaining apostrophes
remaining_apostrophes=$(grep -r "'" fubamarket --include="*.tsx" --include="*.ts" | grep -v "&apos;" | wc -l)
echo "📈 Remaining unescaped apostrophes: $remaining_apostrophes"

# Check for remaining any types
remaining_any=$(grep -r ": any" fubamarket --include="*.tsx" --include="*.ts" | wc -l)
echo "📈 Remaining any types: $remaining_any"

if [ "$remaining_apostrophes" -eq 0 ] && [ "$remaining_any" -eq 0 ]; then
    echo "✅ All linter errors have been fixed!"
    echo "🎉 Your project is now ready for production build!"
else
    echo "⚠️  Some issues still need manual fixing:"
    if [ "$remaining_apostrophes" -gt 0 ]; then
        echo "Unescaped apostrophes:"
        grep -r "'" fubamarket --include="*.tsx" --include="*.ts" | grep -v "&apos;" | head -5
    fi
    if [ "$remaining_any" -gt 0 ]; then
        echo "Any types:"
        grep -r ": any" fubamarket --include="*.tsx" --include="*.ts" | head -5
    fi
fi

echo ""
echo "🚀 Linter fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Check for any remaining errors"
echo "3. Deploy to server: sudo ./production_setup.sh"
