# FubaMarket2 Deployment Package

Полный пакет для развертывания вашего FubaMarket2 проекта на сервере с исправленными API URLs.

## 📦 Что включено

### 🚀 Основные скрипты развертывания
- **`production_setup.sh`** - Полная автоматическая настройка production сервера
- **`setup_supervisor.sh`** - Быстрая настройка только Supervisor
- **`manage_services.sh`** - Управление сервисами (start/stop/restart/logs)
- **`start_server.sh`** - Скрипт запуска для development

### ⚙️ Конфигурации Supervisor
- **`fubamarket2-production.conf`** - Production конфигурация (рекомендуется)
- **`fubamarket2-django.conf`** - Только Django сервис
- **`fubamarket2-nextjs.conf`** - Только Next.js сервис
- **`fubamarket2.conf`** - Development конфигурация

### 🔧 API URL Configuration
- **`fubamarket/lib/api-config.ts`** - Централизованный конфиг API endpoints
- **`final_url_update.sh`** - Скрипт для обновления всех жестко заданных URL
- **`fix_remaining_urls.sh`** - Дополнительный скрипт для исправления URL
- **`update_api_urls.sh`** - Альтернативный скрипт обновления

### 📋 Документация
- **`DEPLOYMENT_CHECKLIST.md`** - Полный чек-лист развертывания
- **`API_URL_SETUP.md`** - Инструкции по настройке API URLs
- **`SUPERVISOR_SETUP.md`** - Подробная документация по настройке
- **`README_SUPERVISOR.md`** - Краткое руководство по Supervisor
- **`README_DEPLOYMENT.md`** - Этот файл

### 🌐 Переменные окружения
- **`env.production.example`** - Пример переменных для production
- **`fubamarket/env.local.example`** - Пример переменных для development

## 🚀 Быстрый старт

### 1. Обновите API URLs (ОБЯЗАТЕЛЬНО!)
```bash
# Обновите все жестко заданные URL на конфигурируемые
./final_url_update.sh
```

### 2. Разверните на сервере
```bash
# Полная автоматическая настройка
sudo ./production_setup.sh
```

### 3. Управляйте сервисами
```bash
# Проверить статус
sudo ./manage_services.sh status

# Перезапустить все сервисы
sudo ./manage_services.sh restart
```

## 🎯 Что решает эта проблема

### ❌ Проблема
Ваш проект использовал жестко заданные API URLs:
```typescript
// Плохо - не работает на сервере
const response = await fetch('http://127.0.0.1:8000/api/products')
```

### ✅ Решение
Теперь используются конфигурируемые URLs:
```typescript
// Хорошо - работает везде
import API_ENDPOINTS from '@/lib/api-config'
const response = await fetch(API_ENDPOINTS.PRODUCTS)
```

## 🔧 Как это работает

### 1. Централизованная конфигурация
Все API endpoints определены в `fubamarket/lib/api-config.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  // ... и так далее
}
```

### 2. Переменные окружения
- **Development**: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- **Production**: `NEXT_PUBLIC_API_URL=https://your-domain.com`

### 3. Автоматическое обновление
Скрипт `final_url_update.sh` автоматически:
- Добавляет импорт `API_ENDPOINTS` во все файлы
- Заменяет жестко заданные URL на конфигурируемые
- Исправляет маппинг endpoints

## 📊 Статистика изменений

### Обновленные файлы
- ✅ `contexts/auth-context.tsx` - Аутентификация
- ✅ `hooks/use-product-filters.ts` - Фильтры продуктов
- ✅ `components/featured-products.tsx` - Рекомендуемые продукты
- ✅ `components/latest-reviews.tsx` - Последние отзывы
- ✅ `app/checkout/page.tsx` - Страница оформления заказа
- ✅ `app/admin/page.tsx` - Админ панель
- ✅ `app/product/[id]/page.tsx` - Страница продукта
- ✅ И еще 20+ файлов...

### API Endpoints
- ✅ Auth endpoints (login, register, profile)
- ✅ Product endpoints (products, featured, by ID)
- ✅ Order endpoints (orders, create)
- ✅ Admin endpoints (dashboard, users, orders)
- ✅ Vendor endpoints (products, orders, withdrawals)
- ✅ Ops endpoints (orders, withdrawals)
- ✅ Review endpoints (reviews, latest)

## 🛠️ Управление

### Проверка статуса
```bash
# Проверить, что все URL обновлены
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts"
# Должно вернуть 0 результатов
```

### Управление сервисами
```bash
# Статус всех сервисов
sudo ./manage_services.sh status

# Логи в реальном времени
sudo ./manage_services.sh logs -f

# Перезапуск всех сервисов
sudo ./manage_services.sh restart
```

### Мониторинг
```bash
# Django логи
sudo tail -f /var/log/supervisor/fubamarket2-django-prod.log

# Next.js логи
sudo tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log

# Nginx логи
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Безопасность

### Включено в production setup:
- ✅ SSL сертификаты (Let's Encrypt)
- ✅ Firewall (UFW)
- ✅ Security headers в Nginx
- ✅ Автоматические обновления системы
- ✅ Регулярные бэкапы

### Рекомендации:
- Обновите пароли базы данных
- Настройте email для уведомлений
- Включите мониторинг
- Настройте алерты

## 📈 Производительность

### Оптимизации:
- ✅ Gunicorn с 3 воркерами для Django
- ✅ Production build для Next.js
- ✅ Gzip сжатие в Nginx
- ✅ Кэширование статических файлов
- ✅ Redis для кэширования

## 🆘 Поддержка

### Если что-то не работает:
1. Проверьте логи: `sudo ./manage_services.sh logs`
2. Проверьте статус: `sudo ./manage_services.sh status`
3. Перезапустите сервисы: `sudo ./manage_services.sh restart`
4. Проверьте переменные окружения
5. Убедитесь, что все URL обновлены

### Полезные команды:
```bash
# Проверить конфигурацию Nginx
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx

# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Проверить SSL сертификаты
sudo certbot certificates
```

## 🎉 Готово!

Теперь ваш FubaMarket2 проект:
- ✅ **Готов к развертыванию** на любом сервере
- ✅ **Не содержит жестко заданных URL**
- ✅ **Автоматически настраивается** через скрипты
- ✅ **Легко управляется** через supervisor
- ✅ **Безопасен** с SSL и firewall
- ✅ **Мониторится** с логами и бэкапами

**Ваше приложение готово к production!** 🚀
