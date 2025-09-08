#!/bin/bash

# Final script to update all remaining hardcoded URLs

echo "Updating all remaining hardcoded API URLs..."

# Function to update a single file
update_file() {
    local file="$1"
    echo "Updating $file..."
    
    # Add import if not exists
    if ! grep -q "import API_ENDPOINTS" "$file"; then
        # Find the last import line and add our import after it
        sed -i '' '/^import.*from.*$/a\
import API_ENDPOINTS from "@/lib/api-config"
' "$file"
    fi
    
    # Replace all hardcoded URLs with API_ENDPOINTS
    sed -i '' 's|"http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    sed -i '' 's|'http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    sed -i '' 's|`http://127\.0\.0\.1:8000/api/|`API_ENDPOINTS.|g' "$file"
    
    # Fix specific endpoint mappings
    sed -i '' 's|API_ENDPOINTS\.auth/login|API_ENDPOINTS.LOGIN|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.auth/register|API_ENDPOINTS.REGISTER|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.auth/profile|API_ENDPOINTS.PROFILE|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.products$|API_ENDPOINTS.PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.products/featured|API_ENDPOINTS.FEATURED_PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.reviews/latest|API_ENDPOINTS.LATEST_REVIEWS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.orders/create|API_ENDPOINTS.CREATE_ORDER|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/dashboard|API_ENDPOINTS.ADMIN_DASHBOARD|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/users$|API_ENDPOINTS.ADMIN_USERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/orders$|API_ENDPOINTS.ADMIN_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/withdrawals$|API_ENDPOINTS.ADMIN_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/products$|API_ENDPOINTS.VENDOR_PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/orders$|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/withdrawals$|API_ENDPOINTS.VENDOR_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.ops/orders$|API_ENDPOINTS.OPS_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.ops/withdrawals$|API_ENDPOINTS.OPS_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.stats$|API_ENDPOINTS.STATS|g' "$file"
}

# Get all files that still have hardcoded URLs
files_with_urls=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort -u)

echo "Found $(echo "$files_with_urls" | wc -l) files to update:"
echo "$files_with_urls"
echo ""

# Update each file
for file in $files_with_urls; do
    if [ -f "$file" ]; then
        update_file "$file"
    else
        echo "File not found: $file"
    fi
done

echo ""
echo "Checking for remaining hardcoded URLs..."
remaining=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | wc -l)
echo "Remaining hardcoded URLs: $remaining"

if [ "$remaining" -eq 0 ]; then
    echo "✅ All hardcoded URLs have been updated!"
else
    echo "⚠️  Some URLs still need manual updating:"
    grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts"
fi

echo ""
echo "URL update completed!"
