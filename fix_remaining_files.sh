#!/bin/bash

# Script to fix remaining hardcoded URLs in specific files

echo "Fixing remaining hardcoded URLs..."

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
    
    # Replace specific URLs
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/withdrawals/\${withdrawalId}/process|API_ENDPOINTS.OPS_PROCESS_WITHDRAWAL(withdrawalId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/orders/\${orderId}/status|API_ENDPOINTS.OPS_ORDER_STATUS(orderId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/ops/withdrawals|API_ENDPOINTS.OPS_WITHDRAWALS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/ops/withdrawals/\${withdrawalId}/process|API_ENDPOINTS.OPS_PROCESS_WITHDRAWAL(withdrawalId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/ops/orders/\${orderId}/status|API_ENDPOINTS.OPS_ORDER_STATUS(orderId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/orders|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products/\${productId}|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products/\${productId}/update|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products/create|API_ENDPOINTS.VENDOR_CREATE_PRODUCT|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products|API_ENDPOINTS.VENDOR_PRODUCTS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/products/\${productId}/toggle-status|API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/me|API_ENDPOINTS.PROFILE|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/withdrawals|API_ENDPOINTS.VENDOR_WITHDRAWALS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/withdrawals/create|API_ENDPOINTS.VENDOR_CREATE_WITHDRAWAL|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/vendor/orders/\${orderId}/status|API_ENDPOINTS.VENDOR_ORDERS|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/users/\${user.id}|API_ENDPOINTS.ADMIN_USER_BY_ID(user.id)|g' "$file"
    sed -i '' 's|http://127\.0\.0\.1:8000/api/admin/users/create|API_ENDPOINTS.ADMIN_CREATE_USER|g' "$file"
}

# List of files to fix
files=(
    "fubamarket/app/admin/withdrawals/page.tsx"
    "fubamarket/app/admin/orders/page.tsx"
    "fubamarket/app/ops/withdrawals/page.tsx"
    "fubamarket/app/ops/orders/page.tsx"
    "fubamarket/app/orders/page.tsx"
    "fubamarket/app/vendor/products/edit/[id]/page.tsx"
    "fubamarket/app/vendor/products/add/page.tsx"
    "fubamarket/app/vendor/products/page.tsx"
    "fubamarket/app/vendor/dashboard/page.tsx"
    "fubamarket/app/vendor/withdrawals/page.tsx"
    "fubamarket/app/vendor/orders/page.tsx"
    "fubamarket/components/edit-user-modal.tsx"
    "fubamarket/components/add-user-modal.tsx"
)

# Fix each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "File not found: $file"
    fi
done

echo "URL fixing completed!"
