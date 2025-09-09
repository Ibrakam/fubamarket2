#!/bin/bash

# Script to fix apostrophes ONLY in JSX content (between > and <)

echo "🔧 Fixing apostrophes ONLY in JSX content..."

# List of files with apostrophe errors
files=(
  "fubamarket/app/product/[id]/page.tsx"
  "fubamarket/components/wishlist-drawer.tsx"
  "fubamarket/components/product-card.tsx"
  "fubamarket/components/add-user-modal.tsx"
  "fubamarket/app/wishlist/page.tsx"
  "fubamarket/app/vendor/products/page.tsx"
  "fubamarket/app/vendor/products/add/page.tsx"
  "fubamarket/app/shop/page.tsx"
  "fubamarket/app/register/page.tsx"
  "fubamarket/app/orders/page.tsx"
  "fubamarket/app/contact/page.tsx"
  "fubamarket/app/checkout/page.tsx"
  "fubamarket/app/category/[slug]/page.tsx"
  "fubamarket/app/cart/page.tsx"
  "fubamarket/app/about/page.tsx"
  "fubamarket/app/page.tsx"
  "fubamarket/app/login/page.tsx"
  "fubamarket/app/vendor/products/edit/[id]/page.tsx"
  "fubamarket/app/admin/page.tsx"
  "fubamarket/app/vendor/dashboard/page.tsx"
  "fubamarket/app/ops/orders/page.tsx"
  "fubamarket/components/auth-dropdown.tsx"
  "fubamarket/components/cart-drawer.tsx"
  "fubamarket/app/ops/withdrawals/page.tsx"
  "fubamarket/app/vendor/orders/page.tsx"
)

# Fix apostrophes in each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Create a backup
    cp "$file" "$file.backup"
    
    # Use a more sophisticated approach to fix only JSX content
    # This will only replace apostrophes that are between > and < (JSX content)
    python3 -c "
import re
import sys

with open('$file', 'r', encoding='utf-8') as f:
    content = f.read()

# Find JSX content between > and < and replace apostrophes there
def replace_jsx_apostrophes(match):
    jsx_content = match.group(1)
    # Replace apostrophes in JSX content
    jsx_content = jsx_content.replace(\"'\", \"&apos;\")
    return '>' + jsx_content + '<'

# Replace apostrophes in JSX content only
content = re.sub(r'>([^<]*?)<', replace_jsx_apostrophes, content)

with open('$file', 'w', encoding='utf-8') as f:
    f.write(content)
"
  else
    echo "File not found: $file"
  fi
done

echo "✅ Apostrophes fixed ONLY in JSX content!"
