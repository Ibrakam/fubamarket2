# FubaMarket2 Supervisor Deployment Files

Полный набор файлов для развертывания вашего FubaMarket2 проекта на сервере с помощью Supervisor.

## 📁 Файлы в комплекте

### 🚀 Основные скрипты
- **`production_setup.sh`** - Полная автоматическая настройка production сервера
- **`setup_supervisor.sh`** - Быстрая настройка только Supervisor
- **`manage_services.sh`** - Управление сервисами (start/stop/restart/logs)
- **`start_server.sh`** - Скрипт запуска для development

### ⚙️ Конфигурации Supervisor
- **`fubamarket2-production.conf`** - Production конфигурация (рекомендуется)
- **`fubamarket2-django.conf`** - Только Django сервис
- **`fubamarket2-nextjs.conf`** - Только Next.js сервис
- **`fubamarket2.conf`** - Development конфигурация

### 📋 Документация и настройки
- **`SUPERVISOR_SETUP.md`** - Подробная документация по настройке
- **`env.production.example`** - Пример переменных окружения для production
- **`README_SUPERVISOR.md`** - Этот файл

## 🚀 Быстрый старт

### Вариант 1: Полная автоматическая настройка
```bash
# Загрузите все файлы на сервер
sudo ./production_setup.sh
```

### Вариант 2: Только Supervisor
```bash
# Настройте только Supervisor
sudo ./setup_supervisor.sh
```

### ⚠️ Важно: Обновление API URLs
Перед развертыванием на сервере обязательно обновите API URLs:
```bash
# Обновите все жестко заданные URL на конфигурируемые
./final_url_update.sh
```

## 🎯 Что включает полная настройка

- ✅ **Nginx** - Reverse proxy с SSL
- ✅ **PostgreSQL** - База данных
- ✅ **Redis** - Кэширование
- ✅ **Supervisor** - Управление процессами
- ✅ **SSL сертификат** - Автоматически через Let's Encrypt
- ✅ **Firewall** - Настройка UFW
- ✅ **Backup** - Автоматические бэкапы
- ✅ **Log rotation** - Ротация логов

## 🛠️ Управление сервисами

```bash
# Проверить статус
sudo ./manage_services.sh status

# Перезапустить все сервисы
sudo ./manage_services.sh restart

# Посмотреть логи
sudo ./manage_services.sh logs -f

# Собрать Next.js
sudo ./manage_services.sh build

# Обновить и перезапустить
sudo ./manage_services.sh update
```

## 📊 Мониторинг

```bash
# Статус сервисов
sudo supervisorctl status

# Логи Django
sudo tail -f /var/log/supervisor/fubamarket2-django-prod.log

# Логи Next.js
sudo tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log

# Статус Nginx
sudo systemctl status nginx
```

## 🔧 Настройка

### 1. Обновите пути в конфигурациях
Замените `/path/to/your/FubaMarket2` на реальный путь к вашему проекту.

### 2. Настройте переменные окружения
Скопируйте `env.production.example` в `.env.production` и обновите значения:
- SECRET_KEY
- DATABASE_URL
- EMAIL настройки
- DOMAIN_NAME

### 3. Настройте базу данных
Обновите пароль базы данных в PostgreSQL и в файле `.env.production`.

## 🌐 Доступ к приложению

После настройки ваше приложение будет доступно по адресам:
- **Frontend**: `https://your-domain.com`
- **API**: `https://your-domain.com/api`
- **Admin**: `https://your-domain.com/admin`

## 🔒 Безопасность

- ✅ SSL сертификаты (Let's Encrypt)
- ✅ Firewall настроен
- ✅ Security headers в Nginx
- ✅ Автоматические обновления системы
- ✅ Регулярные бэкапы

## 📝 Логи и мониторинг

- **Django логи**: `/var/log/supervisor/fubamarket2-django-prod.log`
- **Next.js логи**: `/var/log/supervisor/fubamarket2-nextjs-prod.log`
- **Nginx логи**: `/var/log/nginx/`
- **System логи**: `/var/log/syslog`

## 🆘 Устранение неполадок

### Сервис не запускается
```bash
# Проверить логи
sudo ./manage_services.sh logs

# Проверить статус
sudo supervisorctl status

# Перезапустить
sudo ./manage_services.sh restart
```

### Проблемы с Nginx
```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить
sudo systemctl reload nginx
```

### Проблемы с базой данных
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Подключиться к базе
sudo -u postgres psql fubamarket2
```

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи сервисов
2. Убедитесь, что все пути указаны правильно
3. Проверьте права доступа к файлам
4. Убедитесь, что все зависимости установлены

## 🎉 Готово!

Ваш FubaMarket2 проект теперь работает в production режиме с:
- Автоматическим перезапуском при сбоях
- SSL сертификатами
- Мониторингом и логированием
- Регулярными бэкапами
- Оптимизированной производительностью
