# FubaMarket2 Ubuntu Deployment Guide

Полное руководство по развертыванию FubaMarket2 на Ubuntu сервере с исправленными API URLs.

## 🚀 Быстрый старт для Ubuntu

### 1. Обновите API URLs (ОБЯЗАТЕЛЬНО!)
```bash
# Конвертируйте все скрипты для Ubuntu
./convert_to_ubuntu.sh

# Исправьте все жестко заданные URL
./fix_all_urls_ubuntu.sh
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

## 📦 Что включено

### 🔧 Скрипты для Ubuntu
- **`convert_to_ubuntu.sh`** - Конвертирует все скрипты с macOS на Ubuntu
- **`fix_all_urls_ubuntu.sh`** - Исправляет все жестко заданные API URLs
- **`fix_urls_ubuntu.sh`** - Альтернативный скрипт исправления URL

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
- **`env.production.example`** - Пример переменных для production
- **`fubamarket/env.local.example`** - Пример переменных для development

### 📋 Документация
- **`DEPLOYMENT_CHECKLIST.md`** - Полный чек-лист развертывания
- **`API_URL_SETUP.md`** - Инструкции по настройке API URLs
- **`SUPERVISOR_SETUP.md`** - Подробная документация по настройке
- **`README_SUPERVISOR.md`** - Краткое руководство по Supervisor
- **`README_UBUNTU.md`** - Этот файл

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
Скрипт `fix_all_urls_ubuntu.sh` автоматически:
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
# Должно вернуть 0 результатов (кроме api-config.ts)
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

## 🔄 Backup & Recovery

### 1. Автоматические бэкапы
```bash
# Проверить cron задачи
sudo crontab -l

# Ручной бэкап
sudo /usr/local/bin/backup-fubamarket2.sh
```

### 2. Восстановление из бэкапа
```bash
# Восстановить базу данных
sudo -u postgres psql fubamarket2 < /var/backups/fubamarket2/database_YYYYMMDD_HHMMSS.sql

# Восстановить медиа файлы
sudo tar -xzf /var/backups/fubamarket2/media_YYYYMMDD_HHMMSS.tar.gz -C /path/to/project/apps/api/
```

## ✅ Final Verification

После развертывания проверьте:

1. **Frontend доступен**: `https://your-domain.com`
2. **API работает**: `https://your-domain.com/api/products`
3. **Admin панель**: `https://your-domain.com/admin`
4. **SSL сертификат**: Зеленый замок в браузере
5. **Все сервисы запущены**: `sudo supervisorctl status`

## 🎉 Готово!

Ваш FubaMarket2 проект успешно развернут и готов к работе! 🚀

### Полезные ссылки:
- **Frontend**: `https://your-domain.com`
- **API**: `https://your-domain.com/api`
- **Admin**: `https://your-domain.com/admin`
- **Logs**: `/var/log/supervisor/`
- **Backups**: `/var/backups/fubamarket2/`

## 📋 Краткая инструкция

```bash
# 1. Конвертируйте скрипты для Ubuntu
./convert_to_ubuntu.sh

# 2. Исправьте API URLs
./fix_all_urls_ubuntu.sh

# 3. Разверните на сервере
sudo ./production_setup.sh

# 4. Управляйте сервисами
sudo ./manage_services.sh status
```

**Ваше приложение готово к production на Ubuntu!** 🎉
