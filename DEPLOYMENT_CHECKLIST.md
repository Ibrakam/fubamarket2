# FubaMarket2 Deployment Checklist

Полный чек-лист для развертывания вашего FubaMarket2 проекта на сервере.

## 📋 Pre-deployment Checklist

### 1. ✅ Обновление API URLs
```bash
# Обновите все жестко заданные URL на конфигурируемые
./final_url_update.sh

# Проверьте, что все URL обновлены
grep -r "http://127.0.0.1:8000" fubamarket --include="*.tsx" --include="*.ts"
# Должно вернуть 0 результатов
```

### 2. ✅ Настройка переменных окружения
```bash
# Для development
cp fubamarket/env.local.example fubamarket/.env.local

# Для production (автоматически создается скриптом)
# NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 3. ✅ Проверка зависимостей
```bash
# Django
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Next.js
cd fubamarket
npm install
npm run build
```

## 🚀 Deployment Options

### Option 1: Полная автоматическая настройка
```bash
# Загрузите все файлы на сервер
sudo ./production_setup.sh
```

**Что включает:**
- ✅ Nginx с SSL
- ✅ PostgreSQL
- ✅ Redis
- ✅ Supervisor
- ✅ Firewall
- ✅ Автоматические бэкапы
- ✅ Log rotation

### Option 2: Только Supervisor
```bash
# Настройте только Supervisor
sudo ./setup_supervisor.sh
```

### Option 3: Ручная настройка
Следуйте инструкциям в `SUPERVISOR_SETUP.md`

## 🔧 Post-deployment Configuration

### 1. Настройка базы данных
```bash
# Обновите пароль в .env.production
# DATABASE_URL=postgresql://username:password@localhost:5432/fubamarket2
```

### 2. Настройка email
```bash
# Обновите email настройки в .env.production
# EMAIL_HOST=smtp.gmail.com
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Настройка домена
```bash
# Обновите домен в .env.production
# ALLOWED_HOSTS=your-domain.com,www.your-domain.com
# NEXT_PUBLIC_API_URL=https://your-domain.com
```

## 🛠️ Management Commands

### Управление сервисами
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

### Прямые команды Supervisor
```bash
# Статус сервисов
sudo supervisorctl status

# Перезапуск сервисов
sudo supervisorctl restart fubamarket2-django-prod
sudo supervisorctl restart fubamarket2-nextjs-prod

# Логи
sudo tail -f /var/log/supervisor/fubamarket2-django-prod.log
sudo tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log
```

## 🔍 Monitoring & Troubleshooting

### Проверка статуса
```bash
# Статус всех сервисов
sudo supervisorctl status

# Статус Nginx
sudo systemctl status nginx

# Статус PostgreSQL
sudo systemctl status postgresql

# Статус Redis
sudo systemctl status redis-server
```

### Проверка логов
```bash
# Django логи
sudo tail -f /var/log/supervisor/fubamarket2-django-prod.log

# Next.js логи
sudo tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System логи
sudo journalctl -u nginx -f
```

### Проверка портов
```bash
# Проверить, что порты открыты
sudo netstat -tlnp | grep -E ':(80|443|3000|8000)'
```

## 🔒 Security Checklist

### 1. Firewall
```bash
# Проверить статус UFW
sudo ufw status

# Должны быть открыты только:
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)
```

### 2. SSL сертификаты
```bash
# Проверить SSL сертификаты
sudo certbot certificates

# Обновить сертификаты
sudo certbot renew --dry-run
```

### 3. Обновления системы
```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Проверить автоматические обновления
sudo systemctl status unattended-upgrades
```

## 📊 Performance Monitoring

### 1. Мониторинг ресурсов
```bash
# Использование памяти
free -h

# Использование диска
df -h

# Загрузка CPU
htop
```

### 2. Мониторинг базы данных
```bash
# Подключиться к PostgreSQL
sudo -u postgres psql fubamarket2

# Проверить активные соединения
SELECT * FROM pg_stat_activity;
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

## 🆘 Emergency Procedures

### 1. Сервис не запускается
```bash
# Проверить логи
sudo ./manage_services.sh logs

# Перезапустить все сервисы
sudo ./manage_services.sh restart

# Проверить конфигурацию
sudo nginx -t
```

### 2. База данных недоступна
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Перезапустить PostgreSQL
sudo systemctl restart postgresql

# Проверить соединения
sudo -u postgres psql -c "SELECT 1;"
```

### 3. SSL сертификат истек
```bash
# Обновить сертификаты
sudo certbot renew

# Перезагрузить Nginx
sudo systemctl reload nginx
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
