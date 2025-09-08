# FubaMarket2 Supervisor Setup

Этот набор файлов позволяет запустить ваш FubaMarket2 проект на сервере с помощью Supervisor.

## Файлы в комплекте

- `start_server.sh` - Скрипт запуска для development режима
- `fubamarket2.conf` - Конфигурация для запуска через один скрипт
- `fubamarket2-django.conf` - Отдельная конфигурация для Django
- `fubamarket2-nextjs.conf` - Отдельная конфигурация для Next.js
- `fubamarket2-production.conf` - Production конфигурация с Gunicorn
- `setup_supervisor.sh` - Автоматический скрипт установки
- `SUPERVISOR_SETUP.md` - Этот файл с инструкциями

## Быстрая установка

1. Загрузите все файлы на ваш сервер
2. Запустите автоматический скрипт установки:
   ```bash
   sudo ./setup_supervisor.sh
   ```

## Ручная установка

### 1. Установка Supervisor

```bash
sudo apt-get update
sudo apt-get install supervisor
```

### 2. Настройка путей

Отредактируйте все `.conf` файлы и замените `/path/to/your/FubaMarket2` на реальный путь к вашему проекту.

### 3. Установка зависимостей

```bash
# Установите Gunicorn для Django
cd /path/to/your/FubaMarket2/apps/api
source .venv/bin/activate
pip install gunicorn

# Соберите Next.js для production
cd /path/to/your/FubaMarket2/fubamarket
npm run build
```

### 4. Копирование конфигурации

```bash
sudo cp fubamarket2-production.conf /etc/supervisor/conf.d/
```

### 5. Перезагрузка Supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start fubamarket2-django-prod
sudo supervisorctl start fubamarket2-nextjs-prod
```

## Управление сервисами

### Проверка статуса
```bash
sudo supervisorctl status
```

### Перезапуск сервисов
```bash
sudo supervisorctl restart fubamarket2-django-prod
sudo supervisorctl restart fubamarket2-nextjs-prod
```

### Остановка сервисов
```bash
sudo supervisorctl stop fubamarket2-django-prod
sudo supervisorctl stop fubamarket2-nextjs-prod
```

### Просмотр логов
```bash
# Django логи
sudo tail -f /var/log/supervisor/fubamarket2-django-prod.log

# Next.js логи
sudo tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log
```

## Конфигурации

### Development (fubamarket2.conf)
- Запускает Django через `runserver`
- Запускает Next.js через `npm run dev`
- Подходит для разработки

### Production (fubamarket2-production.conf)
- Запускает Django через Gunicorn с 3 воркерами
- Запускает Next.js через `npm start` (production build)
- Оптимизирован для production

### Отдельные сервисы
- `fubamarket2-django.conf` - только Django
- `fubamarket2-nextjs.conf` - только Next.js

## Настройка Nginx (опционально)

Для production рекомендуется использовать Nginx как reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Django API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Media files
    location /media/ {
        alias /path/to/your/FubaMarket2/apps/api/media/;
    }
}
```

## Мониторинг

Supervisor автоматически перезапускает сервисы при сбоях. Для мониторинга используйте:

```bash
# Статус всех сервисов
sudo supervisorctl status

# Детальная информация
sudo supervisorctl tail fubamarket2-django-prod
sudo supervisorctl tail fubamarket2-nextjs-prod
```

## Устранение неполадок

### Сервис не запускается
1. Проверьте логи: `sudo tail -f /var/log/supervisor/fubamarket2-*.log`
2. Проверьте права доступа к файлам
3. Убедитесь, что все зависимости установлены

### Порт занят
1. Проверьте, что порты 3000 и 8000 свободны: `sudo netstat -tlnp | grep :3000`
2. Остановите конфликтующие сервисы

### Проблемы с правами
1. Убедитесь, что пользователь `www-data` имеет доступ к файлам проекта
2. Проверьте права на выполнение скриптов: `chmod +x start_server.sh`

## Безопасность

Для production сервера:
1. Настройте firewall
2. Используйте HTTPS с SSL сертификатами
3. Настройте регулярные бэкапы базы данных
4. Мониторьте логи на предмет подозрительной активности
