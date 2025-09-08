#!/bin/bash

# Fix all remaining hardcoded URLs for Ubuntu/Linux

echo "Fixing all remaining hardcoded URLs for Ubuntu..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "Fixing $file..."
    
    # Add import if not exists
    if ! grep -q "import API_ENDPOINTS" "$file"; then
        # Find the last import line and add our import after it
        sed -i '/^import.*from.*$/a\
import API_ENDPOINTS from "@/lib/api-config"
' "$file"
    fi
    
    # Replace all hardcoded URLs with API_ENDPOINTS
    sed -i 's|"http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    sed -i 's|'http://127\.0\.0\.1:8000/api/|API_ENDPOINTS.|g' "$file"
    sed -i 's|`http://127\.0\.0\.1:8000/api/|`API_ENDPOINTS.|g' "$file"
    
    # Fix specific endpoint mappings
    sed -i 's|API_ENDPOINTS\.admin/withdrawals/\${withdrawalId}/process|API_ENDPOINTS.OPS_PROCESS_WITHDRAWAL(withdrawalId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.admin/orders/\${orderId}/status|API_ENDPOINTS.OPS_ORDER_STATUS(orderId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.ops/withdrawals$|API_ENDPOINTS.OPS_WITHDRAWALS|g' "$file"
    sed -i 's|API_ENDPOINTS\.ops/withdrawals/\${withdrawalId}/process|API_ENDPOINTS.OPS_PROCESS_WITHDRAWAL(withdrawalId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.ops/orders$|API_ENDPOINTS.OPS_ORDERS|g' "$file"
    sed -i 's|API_ENDPOINTS\.ops/orders/\${orderId}/status|API_ENDPOINTS.OPS_ORDER_STATUS(orderId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/orders$|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/products/\${productId}$|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/products/\${productId}/update|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/products/create|API_ENDPOINTS.VENDOR_CREATE_PRODUCT|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/products$|API_ENDPOINTS.VENDOR_PRODUCTS|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/products/\${productId}/toggle-status|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/me|API_ENDPOINTS.PROFILE|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/withdrawals$|API_ENDPOINTS.VENDOR_WITHDRAWALS|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/withdrawals/create|API_ENDPOINTS.VENDOR_CREATE_WITHDRAWAL|g' "$file"
    sed -i 's|API_ENDPOINTS\.vendor/orders/\${orderId}/status|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i 's|API_ENDPOINTS\.admin/users/\${user.id}|API_ENDPOINTS.ADMIN_USER_BY_ID(user.id)|g' "$file"
    sed -i 's|API_ENDPOINTS\.admin/users/create|API_ENDPOINTS.ADMIN_CREATE_USER|g' "$file"
    sed -i 's|API_ENDPOINTS\.products$|API_ENDPOINTS.PRODUCTS|g' "$file"
}

# Get all files that still have hardcoded URLs (excluding api-config.ts)
files_with_urls=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts" | cut -d: -f1 | sort -u)

echo "Found $(echo "$files_with_urls" | wc -l) files to fix:"
echo "$files_with_urls"
echo ""

# Fix each file
for file in $files_with_urls; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "File not found: $file"
    fi
done

echo ""
echo "Checking for remaining hardcoded URLs..."
remaining=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts" | wc -l)
echo "Remaining hardcoded URLs: $remaining"

if [ "$remaining" -eq 0 ]; then
    echo "✅ All hardcoded URLs have been updated!"
else
    echo "⚠️  Some URLs still need manual updating:"
    grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts"
fi

echo ""
echo "Fix completed!"
