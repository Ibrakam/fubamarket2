# FubaMarket2 Ubuntu Scripts

Краткое описание всех скриптов для развертывания FubaMarket2 на Ubuntu сервере.

## 🚀 Основные скрипты

### `ubuntu_setup.sh` - Главный скрипт настройки
```bash
./ubuntu_setup.sh
```
**Что делает:**
- Конвертирует все скрипты для Ubuntu
- Исправляет все жестко заданные API URLs
- Создает файлы окружения
- Проверяет результат

### `convert_to_ubuntu.sh` - Конвертация скриптов
```bash
./convert_to_ubuntu.sh
```
**Что делает:**
- Заменяет `sed -i ''` на `sed -i` (для Linux)
- Конвертирует все .sh файлы с macOS на Ubuntu

### `fix_all_urls_ubuntu.sh` - Исправление API URLs
```bash
./fix_all_urls_ubuntu.sh
```
**Что делает:**
- Добавляет импорт `API_ENDPOINTS` во все файлы
- Заменяет жестко заданные URL на конфигурируемые
- Исправляет маппинг endpoints

## 🔧 Дополнительные скрипты

### `fix_urls_ubuntu.sh` - Альтернативный скрипт
```bash
./fix_urls_ubuntu.sh
```
**Что делает:**
- То же самое, что и `fix_all_urls_ubuntu.sh`
- Альтернативная версия

### `fix_remaining_urls.sh` - Исправление оставшихся URL
```bash
./fix_remaining_urls.sh
```
**Что делает:**
- Исправляет только оставшиеся URL
- Более быстрая версия

## 🚀 Скрипты развертывания

### `production_setup.sh` - Полная настройка сервера
```bash
sudo ./production_setup.sh
```
**Что делает:**
- Устанавливает все зависимости
- Настраивает Nginx, PostgreSQL, Redis
- Настраивает SSL сертификаты
- Настраивает Supervisor
- Создает бэкапы и мониторинг

### `setup_supervisor.sh` - Только Supervisor
```bash
sudo ./setup_supervisor.sh
```
**Что делает:**
- Устанавливает только Supervisor
- Настраивает конфигурации
- Запускает сервисы

### `manage_services.sh` - Управление сервисами
```bash
sudo ./manage_services.sh status
sudo ./manage_services.sh restart
sudo ./manage_services.sh logs
```
**Что делает:**
- Показывает статус сервисов
- Перезапускает сервисы
- Показывает логи
- Собирает Next.js
- Обновляет конфигурации

## 📋 Быстрая инструкция

### Для разработки:
```bash
# 1. Настройте проект для Ubuntu
./ubuntu_setup.sh

# 2. Запустите development серверы
cd fubamarket && npm run dev
```

### Для production:
```bash
# 1. Настройте проект для Ubuntu
./ubuntu_setup.sh

# 2. Разверните на сервере
sudo ./production_setup.sh

# 3. Управляйте сервисами
sudo ./manage_services.sh status
```

## 🔍 Проверка

### Проверить, что все URL исправлены:
```bash
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts"
# Должно вернуть 0 результатов
```

### Проверить статус сервисов:
```bash
sudo ./manage_services.sh status
```

### Проверить логи:
```bash
sudo ./manage_services.sh logs -f
```

## 📁 Файлы конфигурации

### Supervisor конфигурации:
- `fubamarket2-production.conf` - Production (рекомендуется)
- `fubamarket2-django.conf` - Только Django
- `fubamarket2-nextjs.conf` - Только Next.js
- `fubamarket2.conf` - Development

### Переменные окружения:
- `env.production.example` - Пример для production
- `fubamarket/env.local.example` - Пример для development

### API конфигурация:
- `fubamarket/lib/api-config.ts` - Централизованный конфиг

## 🆘 Troubleshooting

### Если скрипты не работают:
```bash
# Проверьте права доступа
chmod +x *.sh

# Проверьте, что вы в правильной директории
ls -la fubamarket/lib/api-config.ts
```

### Если URL не исправляются:
```bash
# Запустите скрипт вручную
./fix_all_urls_ubuntu.sh

# Проверьте результат
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts"
```

### Если сервисы не запускаются:
```bash
# Проверьте статус
sudo ./manage_services.sh status

# Проверьте логи
sudo ./manage_services.sh logs

# Перезапустите
sudo ./manage_services.sh restart
```

## 🎉 Готово!

После выполнения всех скриптов ваш FubaMarket2 проект будет готов к работе на Ubuntu сервере! 🚀
