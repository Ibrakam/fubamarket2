#!/bin/bash

# Simple script to fix remaining hardcoded URLs

echo "Fixing remaining hardcoded API URLs..."

# Function to add import and fix URLs in a file
fix_file() {
    local file="$1"
    echo "Fixing $file..."
    
    # Add import if not exists
    if ! grep -q "import API_ENDPOINTS" "$file"; then
        # Find the last import line and add our import after it
        sed -i '' '/^import.*from.*$/a\
import API_ENDPOINTS from "@/lib/api-config"
' "$file"
    fi
    
    # Replace common patterns
    sed -i '' 's|"http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    sed -i '' 's|'http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    
    # Fix specific endpoints
    sed -i '' 's|API_ENDPOINTS\.auth/login|API_ENDPOINTS.LOGIN|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.auth/register|API_ENDPOINTS.REGISTER|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.auth/profile|API_ENDPOINTS.PROFILE|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.products|API_ENDPOINTS.PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.products/featured|API_ENDPOINTS.FEATURED_PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.reviews/latest|API_ENDPOINTS.LATEST_REVIEWS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.orders/create|API_ENDPOINTS.CREATE_ORDER|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/dashboard|API_ENDPOINTS.ADMIN_DASHBOARD|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/users|API_ENDPOINTS.ADMIN_USERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/orders|API_ENDPOINTS.ADMIN_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.admin/withdrawals|API_ENDPOINTS.ADMIN_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/products|API_ENDPOINTS.VENDOR_PRODUCTS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/orders|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.vendor/withdrawals|API_ENDPOINTS.VENDOR_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.ops/orders|API_ENDPOINTS.OPS_ORDERS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.ops/withdrawals|API_ENDPOINTS.OPS_WITHDRAWALS|g' "$file"
    sed -i '' 's|API_ENDPOINTS\.stats|API_ENDPOINTS.STATS|g' "$file"
}

# Get list of files that still have hardcoded URLs
files_with_urls=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort -u)

for file in $files_with_urls; do
    if [ -f "$file" ]; then
        fix_file "$file"
    fi
done

echo "URL fixing completed!"
