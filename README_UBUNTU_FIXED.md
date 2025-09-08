# FubaMarket2 Ubuntu Deployment - Fixed Guide

Полное руководство по развертыванию FubaMarket2 на Ubuntu сервере с исправленными API URLs и ошибками линтера.

## 🚀 Быстрый старт для Ubuntu

### 1. Полная настройка проекта (ОБЯЗАТЕЛЬНО!)
```bash
# Запустите главный скрипт настройки
./ubuntu_setup.sh
```

Этот скрипт автоматически:
- ✅ Конвертирует все скрипты для Ubuntu
- ✅ Исправляет все жестко заданные API URLs
- ✅ Исправляет все ошибки линтера
- ✅ Исправляет проблемы с апострофами в JavaScript
- ✅ Создает файлы окружения

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

### 🔧 Основные скрипты
- **`ubuntu_setup.sh`** - Главный скрипт настройки (используйте этот!)
- **`fix_urls_ubuntu_fixed.sh`** - Исправляет API URLs
- **`fix_specific_errors.sh`** - Исправляет ошибки линтера
- **`quick_fix_apostrophes.sh`** - Исправляет проблемы с апострофами
- **`convert_to_ubuntu.sh`** - Конвертирует скрипты для Ubuntu

### 🚀 Скрипты развертывания
- **`production_setup.sh`** - Полная автоматическая настройка production сервера
- **`setup_supervisor.sh`** - Быстрая настройка только Supervisor
- **`manage_services.sh`** - Управление сервисами

### ⚙️ Конфигурации
- **`fubamarket2-production.conf`** - Production конфигурация Supervisor
- **`fubamarket/lib/api-config.ts`** - Централизованный конфиг API endpoints
- **`env.production.example`** - Пример переменных для production

## 🎯 Что решает эта проблема

### ❌ Проблемы до исправления:
1. **Жестко заданные API URLs** - не работали на сервере
2. **Ошибки линтера** - `npm run build` падал с ошибками
3. **Проблемы с апострофами** - `&apos;` в JavaScript коде
4. **Скрипты для macOS** - не работали на Ubuntu

### ✅ Решение:
1. **Конфигурируемые API URLs** - работают везде
2. **Исправленные ошибки линтера** - `npm run build` проходит успешно
3. **Правильные апострофы** - `'` в JavaScript, `&apos;` в JSX
4. **Скрипты для Ubuntu** - работают на Linux серверах

## 🔧 Как это работает

### 1. Централизованная конфигурация API
```typescript
// fubamarket/lib/api-config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  // ... все endpoints
}
```

### 2. Переменные окружения
- **Development**: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- **Production**: `NEXT_PUBLIC_API_URL=https://your-domain.com`

### 3. Автоматическое исправление
Скрипт `ubuntu_setup.sh` автоматически:
- Конвертирует все скрипты для Ubuntu
- Заменяет жестко заданные URL на конфигурируемые
- Исправляет все ошибки линтера
- Исправляет проблемы с апострофами в JavaScript коде

## 📊 Статистика исправлений

### API URLs исправлены в:
- ✅ `contexts/auth-context.tsx` - Аутентификация
- ✅ `hooks/use-product-filters.ts` - Фильтры продуктов
- ✅ `components/featured-products.tsx` - Рекомендуемые продукты
- ✅ `components/latest-reviews.tsx` - Последние отзывы
- ✅ `app/checkout/page.tsx` - Страница оформления заказа
- ✅ `app/admin/page.tsx` - Админ панель
- ✅ `app/product/[id]/page.tsx` - Страница продукта
- ✅ И еще 20+ файлов...

### Ошибки линтера исправлены:
- ✅ **Апострофы в JavaScript**: `&apos;` → `'`
- ✅ **Кавычки в JavaScript**: `&quot;` → `"`
- ✅ **Неиспользуемые импорты**: Удалены
- ✅ **Any типы**: `any` → `unknown`
- ✅ **Пустые интерфейсы**: Исправлены

## 🛠️ Управление

### Проверка статуса
```bash
# Проверить, что все URL обновлены
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts"
# Должно вернуть 0 результатов (кроме api-config.ts)

# Проверить, что нет ошибок линтера
npm run build
# Должно пройти без ошибок

# Проверить, что нет HTML entities в JavaScript
grep -r "&apos;" fubamarket --include="*.tsx" --include="*.ts"
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

## 🔒 Безопасность

### Включено в production setup:
- ✅ SSL сертификаты (Let's Encrypt)
- ✅ Firewall (UFW)
- ✅ Security headers в Nginx
- ✅ Автоматические обновления системы
- ✅ Регулярные бэкапы

## 📈 Производительность

### Оптимизации:
- ✅ Gunicorn с 3 воркерами для Django
- ✅ Production build для Next.js
- ✅ Gzip сжатие в Nginx
- ✅ Кэширование статических файлов
- ✅ Redis для кэширования

## 🆘 Troubleshooting

### Если что-то не работает:
1. **Проверьте логи**: `sudo ./manage_services.sh logs`
2. **Проверьте статус**: `sudo ./manage_services.sh status`
3. **Перезапустите сервисы**: `sudo ./manage_services.sh restart`
4. **Проверьте переменные окружения**
5. **Убедитесь, что все URL обновлены**
6. **Проверьте, что нет HTML entities в JavaScript**

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

## ✅ Final Verification

После развертывания проверьте:

1. **Frontend доступен**: `https://your-domain.com`
2. **API работает**: `https://your-domain.com/api/products`
3. **Admin панель**: `https://your-domain.com/admin`
4. **SSL сертификат**: Зеленый замок в браузере
5. **Все сервисы запущены**: `sudo supervisorctl status`
6. **Build проходит**: `npm run build`
7. **Нет HTML entities в JavaScript**: `grep -r "&apos;" fubamarket --include="*.tsx" --include="*.ts"`

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
# 1. Настройте проект для Ubuntu
./ubuntu_setup.sh

# 2. Разверните на сервере
sudo ./production_setup.sh

# 3. Управляйте сервисами
sudo ./manage_services.sh status
```

**Ваше приложение готово к production на Ubuntu!** 🎉

## 🔄 Backup & Recovery

### Автоматические бэкапы
```bash
# Проверить cron задачи
sudo crontab -l

# Ручной бэкап
sudo /usr/local/bin/backup-fubamarket2.sh
```

### Восстановление из бэкапа
```bash
# Восстановить базу данных
sudo -u postgres psql fubamarket2 < /var/backups/fubamarket2/database_YYYYMMDD_HHMMSS.sql

# Восстановить медиа файлы
sudo tar -xzf /var/backups/fubamarket2/media_YYYYMMDD_HHMMSS.tar.gz -C /path/to/project/apps/api/
```

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи сервисов
2. Убедитесь, что все скрипты выполнены
3. Проверьте переменные окружения
4. Убедитесь, что все URL обновлены
5. Проверьте, что нет ошибок линтера
6. Проверьте, что нет HTML entities в JavaScript

**Удачи с развертыванием!** 🚀
