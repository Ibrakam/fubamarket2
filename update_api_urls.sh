#!/bin/bash

# Script to update all hardcoded API URLs to use the centralized config

echo "Updating API URLs in all frontend files..."

# Function to update a file
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
    
    # Replace hardcoded URLs
    sed -i '' 's|http://127\.0\.0\.1:8000/api/auth/login|API_ENDPOINTS.LOGIN|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/auth/register|API_ENDPOINTS.REGISTER|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/auth/profile|API_ENDPOINTS.PROFILE|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/products|API_ENDPOINTS.PRODUCTS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/products/featured|API_ENDPOINTS.FEATURED_PRODUCTS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/reviews/latest|API_ENDPOINTS.LATEST_REVIEWS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/orders/create|API_ENDPOINTS.CREATE_ORDER|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/dashboard|API_ENDPOINTS.ADMIN_DASHBOARD|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/users|API_ENDPOINTS.ADMIN_USERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/orders|API_ENDPOINTS.ADMIN_ORDERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/withdrawals|API_ENDPOINTS.ADMIN_WITHDRAWALS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products|API_ENDPOINTS.VENDOR_PRODUCTS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/orders|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/withdrawals|API_ENDPOINTS.VENDOR_WITHDRAWALS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/ops/orders|API_ENDPOINTS.OPS_ORDERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/ops/withdrawals|API_ENDPOINTS.OPS_WITHDRAWALS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/stats|API_ENDPOINTS.STATS|g' "$file"
}

# List of files to update
files=(
    "fubamarket/app/admin/page.tsx"
    "fubamarket/app/admin/users/page.tsx"
    "fubamarket/app/admin/orders/page.tsx"
    "fubamarket/app/admin/withdrawals/page.tsx"
    "fubamarket/app/checkout/page.tsx"
    "fubamarket/app/orders/page.tsx"
    "fubamarket/app/product/[id]/page.tsx"
    "fubamarket/app/vendor/dashboard/page.tsx"
    "fubamarket/app/vendor/products/page.tsx"
    "fubamarket/app/vendor/products/add/page.tsx"
    "fubamarket/app/vendor/products/edit/[id]/page.tsx"
    "fubamarket/app/vendor/orders/page.tsx"
    "fubamarket/app/vendor/withdrawals/page.tsx"
    "fubamarket/app/ops/orders/page.tsx"
    "fubamarket/app/ops/withdrawals/page.tsx"
    "fubamarket/components/edit-user-modal.tsx"
    "fubamarket/components/add-user-modal.tsx"
)

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        update_file "$file"
    else
        echo "File not found: $file"
    fi
done

echo "API URL update completed!"
