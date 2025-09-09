#!/bin/bash

# Simple script to fix apostrophes in JSX content

echo "🔧 Fixing apostrophes in JSX content..."

# List of files with apostrophe errors
files=(
  "fubamarket/app/about/page.tsx"
  "fubamarket/app/admin/orders/page.tsx"
  "fubamarket/app/cart/page.tsx"
  "fubamarket/app/category/[slug]/page.tsx"
  "fubamarket/app/checkout/page.tsx"
  "fubamarket/app/contact/page.tsx"
  "fubamarket/app/faq/page.tsx"
  "fubamarket/app/orders/page.tsx"
  "fubamarket/app/product/[id]/page.tsx"
  "fubamarket/app/register/page.tsx"
  "fubamarket/app/shop/page.tsx"
  "fubamarket/app/vendor/products/add/page.tsx"
  "fubamarket/app/vendor/products/page.tsx"
  "fubamarket/app/wishlist/page.tsx"
  "fubamarket/components/add-user-modal.tsx"
  "fubamarket/components/product-card.tsx"
  "fubamarket/components/product-filters.tsx"
  "fubamarket/components/simple-product-card.tsx"
  "fubamarket/components/user-details-modal.tsx"
  "fubamarket/components/wishlist-drawer.tsx"
)

# Fix apostrophes in each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Replace apostrophes in JSX content (between > and <)
    # This is a more targeted approach that only affects JSX content
    sed -i '' 's/>\([^<]*\)'\''\([^<]*\)</>\1\&apos;\2</g' "$file"
    
    # Also fix quotes in JSX content
    sed -i '' 's/>\([^<]*\)"\([^<]*\)</>\1\&quot;\2</g' "$file"
  else
    echo "File not found: $file"
  fi
done

echo "✅ Apostrophes and quotes fixed in JSX content!"
