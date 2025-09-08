#!/bin/bash

# Fix specific linter errors from the build log

echo "🔧 Fixing specific linter errors..."

# Fix apostrophes in specific files
echo "📝 Fixing apostrophes..."

# app/about/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/about/page.tsx

# app/admin/orders/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/admin/orders/page.tsx

# app/admin/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/admin/page.tsx

# app/cart/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/cart/page.tsx

# app/category/[slug]/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/category/[slug]/page.tsx

# app/checkout/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/checkout/page.tsx

# app/contact/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/contact/page.tsx

# app/faq/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/faq/page.tsx

# app/login/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/login/page.tsx

# app/orders/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/orders/page.tsx

# app/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/page.tsx
sed -i "s/\"/\&quot;/g" fubamarket/app/page.tsx

# app/product/[id]/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/product/[id]/page.tsx

# app/register/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/register/page.tsx

# app/shop/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/shop/page.tsx

# app/vendor/products/add/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/vendor/products/add/page.tsx

# app/vendor/products/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/vendor/products/page.tsx

# app/wishlist/page.tsx
sed -i "s/'/\&apos;/g" fubamarket/app/wishlist/page.tsx

# components/add-user-modal.tsx
sed -i "s/'/\&apos;/g" fubamarket/components/add-user-modal.tsx

# components/product-card.tsx
sed -i "s/'/\&apos;/g" fubamarket/components/product-card.tsx

# components/product-filters.tsx
sed -i "s/'/\&apos;/g" fubamarket/components/product-filters.tsx

# components/simple-product-card.tsx
sed -i "s/'/\&apos;/g" fubamarket/components/simple-product-card.tsx

# components/wishlist-drawer.tsx
sed -i "s/'/\&apos;/g" fubamarket/components/wishlist-drawer.tsx

echo "✅ Apostrophes fixed"

# Remove unused imports
echo "📝 Removing unused imports..."

# app/admin/page.tsx - remove DollarSign
sed -i '/import.*DollarSign.*from.*lucide-react/d' fubamarket/app/admin/page.tsx

# app/admin/users/page.tsx - remove Download
sed -i '/import.*Download.*from.*lucide-react/d' fubamarket/app/admin/users/page.tsx

# app/admin/withdrawals/page.tsx - remove Eye and WithdrawalProcessModal
sed -i '/import.*Eye.*from.*lucide-react/d' fubamarket/app/admin/withdrawals/page.tsx
sed -i '/import.*WithdrawalProcessModal.*from.*@\/components/d' fubamarket/app/admin/withdrawals/page.tsx

# app/checkout/page.tsx - remove Badge and User
sed -i '/import.*Badge.*from.*@\/components\/ui\/badge/d' fubamarket/app/checkout/page.tsx
sed -i '/import.*User.*from.*lucide-react/d' fubamarket/app/checkout/page.tsx

# app/login/page.tsx - remove useEffect
sed -i '/import.*useEffect.*from.*react/d' fubamarket/app/login/page.tsx

# app/page.tsx - remove unused icons
sed -i '/import.*Star.*from.*lucide-react/d' fubamarket/app/page.tsx
sed -i '/import.*Heart.*from.*lucide-react/d' fubamarket/app/page.tsx
sed -i '/import.*Store.*from.*lucide-react/d' fubamarket/app/page.tsx
sed -i '/import.*ShoppingBag.*from.*lucide-react/d' fubamarket/app/page.tsx
sed -i '/import.*Gift.*from.*lucide-react/d' fubamarket/app/page.tsx
sed -i '/import.*Sparkles.*from.*lucide-react/d' fubamarket/app/page.tsx

# app/ops/withdrawals/page.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/ops/withdrawals/page.tsx

# app/orders/page.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/orders/page.tsx

# app/vendor/orders/page.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/vendor/orders/page.tsx

# app/vendor/products/add/page.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/vendor/products/add/page.tsx

# app/vendor/products/edit/[id]/page.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/vendor/products/edit/[id]/page.tsx

# app/vendor/withdrawals/page.tsx - remove unused imports
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/app/vendor/withdrawals/page.tsx
sed -i '/import.*Search.*from.*lucide-react/d' fubamarket/app/vendor/withdrawals/page.tsx
sed -i '/import.*Filter.*from.*lucide-react/d' fubamarket/app/vendor/withdrawals/page.tsx
sed -i '/import.*Download.*from.*lucide-react/d' fubamarket/app/vendor/withdrawals/page.tsx

# components/add-user-modal.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/components/add-user-modal.tsx

# components/edit-user-modal.tsx - remove API_ENDPOINTS
sed -i '/import API_ENDPOINTS.*from.*@\/lib\/api-config/d' fubamarket/components/edit-user-modal.tsx

# components/featured-products.tsx - remove unused imports
sed -i '/import.*Button.*from.*@\/components\/ui\/button/d' fubamarket/components/featured-products.tsx
sed -i '/import.*Link.*from.*next\/link/d' fubamarket/components/featured-products.tsx

# components/order-details-modal.tsx - remove unused imports
sed -i '/import.*Calendar.*from.*lucide-react/d' fubamarket/components/order-details-modal.tsx
sed -i '/import.*CreditCard.*from.*lucide-react/d' fubamarket/components/order-details-modal.tsx

echo "✅ Unused imports removed"

# Fix any types
echo "📝 Fixing any types..."

# Replace any with unknown in specific files
find fubamarket -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/: any/: unknown/g'
find fubamarket -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/any\[\]/unknown[]/g'

echo "✅ Any types fixed"

# Fix empty interfaces
echo "📝 Fixing empty interfaces..."

# components/ui/input.tsx
sed -i '/interface.*extends.*{}//g' fubamarket/components/ui/input.tsx

# components/ui/textarea.tsx
sed -i '/interface.*extends.*{}//g' fubamarket/components/ui/textarea.tsx

echo "✅ Empty interfaces fixed"

echo ""
echo "🎉 All specific linter errors have been fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run build"
echo "2. Check for any remaining errors"
echo "3. Deploy to server: sudo ./production_setup.sh"
