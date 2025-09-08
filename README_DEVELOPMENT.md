# FubaMarket2 Development Guide

Руководство по запуску и разработке FubaMarket2 проекта.

## 🚀 Быстрый старт для разработки

### 1. Настройка проекта
```bash
# Настройте проект для Ubuntu (исправляет все проблемы)
./ubuntu_setup.sh
```

### 2. Запуск серверов разработки
```bash
# Запустить оба сервера (Django + Next.js)
./start_dev_servers.sh
```

Или по отдельности:
```bash
# Запустить только Django сервер
./start_django.sh

# В другом терминале запустить Next.js сервер
cd fubamarket && npm run dev
```

## 📦 Что включено

### 🔧 Скрипты разработки
- **`start_dev_servers.sh`** - Запускает оба сервера (Django + Next.js)
- **`start_django.sh`** - Запускает только Django сервер
- **`fix_import_errors.sh`** - Исправляет проблемы с импортами
- **`ubuntu_setup.sh`** - Полная настройка проекта

### 🚀 Скрипты развертывания
- **`production_setup.sh`** - Полная автоматическая настройка production сервера
- **`setup_supervisor.sh`** - Быстрая настройка только Supervisor
- **`manage_services.sh`** - Управление сервисами

## 🎯 Решенные проблемы

### ❌ Проблемы до исправления:
1. **Жестко заданные API URLs** - не работали на сервере
2. **Ошибки линтера** - `npm run build` падал с ошибками
3. **Проблемы с апострофами** - `&apos;` в JavaScript коде
4. **Проблемы с импортами** - `Search` не определен
5. **Django сервер не запущен** - `Failed to fetch` ошибки

### ✅ Решение:
1. **Конфигурируемые API URLs** - работают везде
2. **Исправленные ошибки линтера** - `npm run build` проходит успешно
3. **Правильные апострофы** - `'` в JavaScript, `&apos;` в JSX
4. **Исправленные импорты** - все иконки правильно импортированы
5. **Автоматический запуск серверов** - Django и Next.js запускаются вместе

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
- Исправляет проблемы с импортами

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

# Проверить, что Django сервер запущен
curl http://127.0.0.1:8000/api/products
# Должно вернуть JSON с продуктами
```

### Управление серверами
```bash
# Запустить оба сервера
./start_dev_servers.sh

# Остановить все серверы
pkill -f 'python manage.py runserver'
pkill -f 'npm run dev'

# Проверить статус портов
lsof -i :8000  # Django
lsof -i :3001  # Next.js
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
7. **Проверьте, что Django сервер запущен**

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

После настройки проверьте:

1. **Django API доступен**: `http://127.0.0.1:8000/api/products`
2. **Next.js App доступен**: `http://localhost:3001`
3. **Admin панель**: `http://localhost:3001/admin`
4. **Build проходит**: `npm run build`
5. **Нет HTML entities в JavaScript**: `grep -r "&apos;" fubamarket --include="*.tsx" --include="*.ts"`
6. **Все импорты работают**: Нет ошибок `Search is not defined`

## 🎉 Готово!

Ваш FubaMarket2 проект готов к разработке! 🚀

### Полезные ссылки:
- **Django API**: `http://127.0.0.1:8000`
- **Next.js App**: `http://localhost:3001`
- **Admin**: `http://localhost:3001/admin`
- **API Docs**: `http://127.0.0.1:8000/api/`

## 📋 Краткая инструкция

```bash
# 1. Настройте проект
./ubuntu_setup.sh

# 2. Запустите серверы разработки
./start_dev_servers.sh

# 3. Откройте браузер
open http://localhost:3001
```

**Удачи с разработкой!** 🚀
