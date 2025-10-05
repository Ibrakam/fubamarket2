# API URL Configuration Setup

Этот документ описывает, как настроить API URLs для работы в разных окружениях (development и production).

## 🔧 Что было изменено

### 1. Создан централизованный конфиг API
- **Файл**: `fubamarket/lib/api-config.ts`
- **Функция**: Централизует все API endpoints и делает их конфигурируемыми

### 2. Переменные окружения
- **Development**: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- **Production**: `NEXT_PUBLIC_API_URL=/api`

### 3. Обновлены все компоненты
Все файлы теперь используют `API_ENDPOINTS` вместо жестко заданных URL.

## 📁 Файлы конфигурации

### Development
Создайте файл `fubamarket/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production
Создайте файл `fubamarket/.env.production`:
```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 🚀 Автоматическая настройка

### Для Development
```bash
# Скопируйте пример файла
cp fubamarket/env.local.example fubamarket/.env.local

# Или создайте вручную
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > fubamarket/.env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> fubamarket/.env.local

# Для production
echo "NEXT_PUBLIC_API_URL=/api" > fubamarket/.env.production
echo "NEXT_PUBLIC_APP_URL=https://your-domain.com" >> fubamarket/.env.production
```

### Для Production
Используйте скрипт `production_setup.sh` - он автоматически создаст правильные переменные окружения.

## 🔄 Обновление существующих файлов

Если у вас есть файлы с жестко заданными URL, используйте скрипт:

```bash
# Запустите скрипт для обновления всех файлов
./fix_remaining_urls.sh
```

## 📋 Доступные API Endpoints

Все endpoints теперь доступны через `API_ENDPOINTS`:

```typescript
import API_ENDPOINTS from '@/lib/api-config'

// Auth
API_ENDPOINTS.LOGIN
API_ENDPOINTS.REGISTER
API_ENDPOINTS.PROFILE

// Products
API_ENDPOINTS.PRODUCTS
API_ENDPOINTS.FEATURED_PRODUCTS
API_ENDPOINTS.PRODUCT_BY_ID('123')

// Orders
API_ENDPOINTS.ORDERS
API_ENDPOINTS.CREATE_ORDER

// Admin
API_ENDPOINTS.ADMIN_DASHBOARD
API_ENDPOINTS.ADMIN_USERS
API_ENDPOINTS.ADMIN_ORDERS

// Vendor
API_ENDPOINTS.VENDOR_PRODUCTS
API_ENDPOINTS.VENDOR_ORDERS

// Ops
API_ENDPOINTS.OPS_ORDERS
API_ENDPOINTS.OPS_WITHDRAWALS
```

## 🛠️ Ручное обновление файла

Если нужно обновить файл вручную:

1. **Добавьте импорт**:
```typescript
import API_ENDPOINTS from '@/lib/api-config'
```

2. **Замените жестко заданные URL**:
```typescript
// Было
const response = await fetch('http://127.0.0.1:8000/api/products')

// Стало
const response = await fetch(API_ENDPOINTS.PRODUCTS)
```

## 🔍 Проверка конфигурации

### Проверить переменные окружения
```bash
# В development
echo $NEXT_PUBLIC_API_URL

# В production
cat fubamarket/.env.production
```

### Проверить, что все URL обновлены
```bash
# Найти оставшиеся жестко заданные URL
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts"
```

## 🚨 Важные моменты

1. **Переменные окружения** должны начинаться с `NEXT_PUBLIC_` для доступности в браузере
2. **В production** используйте `/api` как базовый путь (относительный URL)
3. **В development** используйте полный URL с портом (например, `http://127.0.0.1:8000`)
4. **Перезапустите** Next.js сервер после изменения переменных окружения
4. **Проверьте** CORS настройки в Django для production домена

## 🔧 Troubleshooting

### API не работает в production
1. Проверьте переменные окружения
2. Убедитесь, что домен добавлен в `ALLOWED_HOSTS` в Django
3. Проверьте CORS настройки

### API не работает в development
1. Убедитесь, что Django сервер запущен на порту 8000
2. Проверьте файл `.env.local`
3. Перезапустите Next.js сервер

### Ошибки CORS
Добавьте ваш домен в `CORS_ALLOWED_ORIGINS` в Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "http://localhost:3000",
]
```

## ✅ Готово!

Теперь ваш проект готов к развертыванию на сервере без ошибок с API URLs! 🎉
