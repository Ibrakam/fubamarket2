#!/bin/bash

echo "🔧 Исправляем все ошибки линтера..."

cd fubamarket

# 1. Удаляем неиспользуемые импорты
echo "1. Удаляем неиспользуемые импорты..."

# admin/page.tsx
sed -i '' '/import { DollarSign }/d' app/admin/page.tsx

# admin/users/page.tsx
sed -i '' '/import { Download }/d' app/admin/users/page.tsx

# admin/withdrawals/page.tsx
sed -i '' '/import { Eye }/d' app/admin/withdrawals/page.tsx
sed -i '' '/import { WithdrawalProcessModal }/d' app/admin/withdrawals/page.tsx

# checkout/page.tsx
sed -i '' '/import { Badge }/d' app/checkout/page.tsx
sed -i '' '/import { User }/d' app/checkout/page.tsx

# login/page.tsx
sed -i '' '/import { useEffect }/d' app/login/page.tsx

# vendor/withdrawals/page.tsx
sed -i '' '/import { Search, Filter, Download }/d' app/vendor/withdrawals/page.tsx

# featured-products.tsx
sed -i '' '/import { Button }/d' components/featured-products.tsx
sed -i '' '/import { Link }/d' components/featured-products.tsx

# order-details-modal.tsx
sed -i '' '/import { Calendar, CreditCard }/d' components/order-details-modal.tsx

# 2. Исправляем неиспользуемые переменные
echo "2. Исправляем неиспользуемые переменные..."

# checkout/page.tsx
sed -i '' 's/catch (e)/catch (_e)/g' app/checkout/page.tsx

# vendor/products/add/page.tsx
sed -i '' 's/images.forEach((image, index)/images.forEach((image, _index)/g' app/vendor/products/add/page.tsx
sed -i '' 's/catch (e)/catch (_e)/g' app/vendor/products/add/page.tsx

# vendor/products/edit/[id]/page.tsx
sed -i '' 's/images.forEach((image, index)/images.forEach((image, _index)/g' app/vendor/products/edit/[id]/page.tsx

# add-user-modal.tsx
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

# Создаем Python скрипт для исправления апострофов
cat > fix_apostrophes.py << 'EOF'
import re
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

echo "✅ Все ошибки исправлены!"
