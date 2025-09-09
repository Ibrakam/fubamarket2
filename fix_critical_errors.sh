#!/bin/bash

echo "🔧 Исправляем критические ошибки..."

cd fubamarket

# 1. Удаляем неиспользуемые импорты
echo "1. Удаляем неиспользуемые импорты..."

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

# 3. Исправляем пустые интерфейсы
echo "3. Исправляем пустые интерфейсы..."

# ui/input.tsx
sed -i '' 's/interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}/interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  variant?: string\n  size?: string\n}/g' components/ui/input.tsx

# ui/textarea.tsx
sed -i '' 's/interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}/interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {\n  variant?: string\n  size?: string\n}/g' components/ui/textarea.tsx

echo "✅ Критические ошибки исправлены!"
