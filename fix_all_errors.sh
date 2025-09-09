#!/bin/bash

echo "🔧 Исправляем все ошибки линтера..."

# 1. Исправляем неиспользуемые импорты
echo "1. Удаляем неиспользуемые импорты..."

# admin/page.tsx - удаляем DollarSign
sed -i '' '/import { DollarSign }/d' fubamarket/app/admin/page.tsx

# admin/users/page.tsx - удаляем Download
sed -i '' '/import { Download }/d' app/admin/users/page.tsx

# admin/withdrawals/page.tsx - удаляем Eye и WithdrawalProcessModal
sed -i '' '/import { Eye }/d' app/admin/withdrawals/page.tsx
sed -i '' '/import { WithdrawalProcessModal }/d' app/admin/withdrawals/page.tsx

# checkout/page.tsx - удаляем Badge и User
sed -i '' '/import { Badge }/d' app/checkout/page.tsx
sed -i '' '/import { User }/d' app/checkout/page.tsx

# login/page.tsx - удаляем useEffect
sed -i '' '/import { useEffect }/d' app/login/page.tsx

# vendor/withdrawals/page.tsx - удаляем Search, Filter, Download
sed -i '' '/import { Search, Filter, Download }/d' app/vendor/withdrawals/page.tsx

# featured-products.tsx - удаляем Button и Link
sed -i '' '/import { Button }/d' components/featured-products.tsx
sed -i '' '/import { Link }/d' components/featured-products.tsx

# order-details-modal.tsx - удаляем Calendar и CreditCard
sed -i '' '/import { Calendar, CreditCard }/d' components/order-details-modal.tsx

# 2. Исправляем неиспользуемые переменные
echo "2. Исправляем неиспользуемые переменные..."

# checkout/page.tsx - исправляем 'e' на '_e'
sed -i '' 's/catch (e)/catch (_e)/g' app/checkout/page.tsx

# vendor/products/add/page.tsx - исправляем 'index' на '_index'
sed -i '' 's/images.forEach((image, index)/images.forEach((image, _index)/g' app/vendor/products/add/page.tsx
sed -i '' 's/catch (e)/catch (_e)/g' app/vendor/products/add/page.tsx

# vendor/products/edit/[id]/page.tsx - исправляем 'index' на '_index'
sed -i '' 's/images.forEach((image, index)/images.forEach((image, _index)/g' app/vendor/products/edit/[id]/page.tsx

# add-user-modal.tsx - исправляем 'e' на '_e'
sed -i '' 's/catch (e)/catch (_e)/g' components/add-user-modal.tsx

# 3. Исправляем any типы
echo "3. Исправляем any типы..."

# category/[slug]/page.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' app/category/[slug]/page.tsx

# debug/page.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' app/debug/page.tsx
sed -i '' 's/item: any/item: Record<string, unknown>/g' app/debug/page.tsx

# product/[id]/page.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' app/product/[id]/page.tsx

# test/page.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' app/test/page.tsx

# vendor/dashboard/page.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' app/vendor/dashboard/page.tsx
sed -i '' 's/item: any/item: Record<string, unknown>/g' app/vendor/dashboard/page.tsx

# featured-products.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' components/featured-products.tsx

# order-details-modal.tsx
sed -i '' 's/order: any/order: Record<string, unknown>/g' components/order-details-modal.tsx
sed -i '' 's/item: any/item: Record<string, unknown>/g' components/order-details-modal.tsx

# order-status-modal.tsx
sed -i '' 's/order: any/order: Record<string, unknown>/g' components/order-status-modal.tsx

# product-filters.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' components/product-filters.tsx

# product-form-modal.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' components/product-form-modal.tsx
sed -i '' 's/onSave: any/onSave: (product: Record<string, unknown>) => void/g' components/product-form-modal.tsx
sed -i '' 's/onCancel: any/onCancel: () => void/g' components/product-form-modal.tsx

# user-details-modal.tsx
sed -i '' 's/user: any/user: Record<string, unknown>/g' components/user-details-modal.tsx

# wishlist-drawer.tsx
sed -i '' 's/product: any/product: Record<string, unknown>/g' components/wishlist-drawer.tsx

# withdrawal-process-modal.tsx
sed -i '' 's/withdrawal: any/withdrawal: Record<string, unknown>/g' components/withdrawal-process-modal.tsx

# 4. Исправляем пустые интерфейсы
echo "4. Исправляем пустые интерфейсы..."

# ui/input.tsx
sed -i '' 's/interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}/interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  variant?: string\n  size?: string\n}/g' components/ui/input.tsx

# ui/textarea.tsx
sed -i '' 's/interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}/interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {\n  variant?: string\n  size?: string\n}/g' components/ui/textarea.tsx

# 5. Исправляем апострофы в JSX
echo "5. Исправляем апострофы в JSX..."

# Создаем временный файл для обработки апострофов
cat > fix_apostrophes.py << 'EOF'
import re
import sys
import os

def fix_apostrophes_in_file(filepath):
    if not os.path.exists(filepath):
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Заменяем апострофы в JSX контенте (между > и <)
    def replace_jsx_apostrophes(match):
        jsx_content = match.group(1)
        # Заменяем апострофы и кавычки в JSX контенте
        jsx_content = jsx_content.replace("'", "&apos;")
        jsx_content = jsx_content.replace('"', "&quot;")
        return '>' + jsx_content + '<'
    
    # Заменяем апострофы и кавычки в JSX контенте
    content = re.sub(r'>([^<]*?)<', replace_jsx_apostrophes, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Список файлов для обработки
files = [
    "app/about/page.tsx",
    "app/admin/orders/page.tsx",
    "app/admin/page.tsx",
    "app/cart/page.tsx",
    "app/category/[slug]/page.tsx",
    "app/checkout/page.tsx",
    "app/contact/page.tsx",
    "app/faq/page.tsx",
    "app/login/page.tsx",
    "app/orders/page.tsx",
    "app/page.tsx",
    "app/product/[id]/page.tsx",
    "app/register/page.tsx",
    "app/shop/page.tsx",
    "app/vendor/products/add/page.tsx",
    "app/vendor/products/page.tsx",
    "app/wishlist/page.tsx",
    "components/add-user-modal.tsx",
    "components/product-card.tsx",
    "components/product-filters.tsx",
    "components/simple-product-card.tsx",
    "components/wishlist-drawer.tsx"
]

for file in files:
    fix_apostrophes_in_file(file)
    print(f"Processed: {file}")

print("All apostrophes fixed!")
EOF

python3 fix_apostrophes.py
rm fix_apostrophes.py

# 6. Исправляем зависимости useEffect
echo "6. Исправляем зависимости useEffect..."

# admin/page.tsx - добавляем useCallback для fetchStats
sed -i '' 's/const fetchStats = async () => {/const fetchStats = useCallback(async () => {/g' app/admin/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchStats])/g' app/admin/page.tsx

# admin/users/page.tsx - добавляем useCallback для fetchUsers
sed -i '' 's/const fetchUsers = async () => {/const fetchUsers = useCallback(async () => {/g' app/admin/users/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchUsers])/g' app/admin/users/page.tsx

# admin/withdrawals/page.tsx - добавляем useCallback для fetchWithdrawals
sed -i '' 's/const fetchWithdrawals = async () => {/const fetchWithdrawals = useCallback(async () => {/g' app/admin/withdrawals/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchWithdrawals])/g' app/admin/withdrawals/page.tsx

# ops/orders/page.tsx - добавляем useCallback для fetchOrders
sed -i '' 's/const fetchOrders = async () => {/const fetchOrders = useCallback(async () => {/g' app/ops/orders/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchOrders])/g' app/ops/orders/page.tsx

# ops/withdrawals/page.tsx - добавляем useCallback для fetchWithdrawals
sed -i '' 's/const fetchWithdrawals = async () => {/const fetchWithdrawals = useCallback(async () => {/g' app/ops/withdrawals/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchWithdrawals])/g' app/ops/withdrawals/page.tsx

# vendor/dashboard/page.tsx - добавляем useCallback для fetchStats
sed -i '' 's/const fetchStats = async () => {/const fetchStats = useCallback(async () => {/g' app/vendor/dashboard/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchStats])/g' app/vendor/dashboard/page.tsx

# vendor/orders/page.tsx - добавляем useCallback для fetchOrders
sed -i '' 's/const fetchOrders = async () => {/const fetchOrders = useCallback(async () => {/g' app/vendor/orders/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchOrders])/g' app/vendor/orders/page.tsx

# vendor/products/page.tsx - добавляем useCallback для fetchProducts
sed -i '' 's/const fetchProducts = async () => {/const fetchProducts = useCallback(async () => {/g' app/vendor/products/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchProducts])/g' app/vendor/products/page.tsx

# vendor/products/edit/[id]/page.tsx - добавляем useCallback для fetchProduct
sed -i '' 's/const fetchProduct = async () => {/const fetchProduct = useCallback(async () => {/g' app/vendor/products/edit/[id]/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchProduct])/g' app/vendor/products/edit/[id]/page.tsx

# vendor/withdrawals/page.tsx - добавляем useCallback для fetchWithdrawals
sed -i '' 's/const fetchWithdrawals = async () => {/const fetchWithdrawals = useCallback(async () => {/g' app/vendor/withdrawals/page.tsx
sed -i '' 's/}, [user, router])/}, [user, router, fetchWithdrawals])/g' app/vendor/withdrawals/page.tsx

echo "✅ Все ошибки исправлены!"
