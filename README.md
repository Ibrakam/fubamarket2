# FubaMarket - Интернет-магазин

Полнофункциональный интернет-магазин с админ-панелью, системой заказов и управлением пользователями.

## 🚀 Быстрый запуск

### Автоматический запуск (рекомендуется)

```bash
./start_project.sh
```

### Ручной запуск

1. **Запуск Django сервера (Backend)**
```bash
cd apps/api
source .venv/bin/activate
python manage.py runserver
```

2. **Запуск Next.js сервера (Frontend)**
```bash
cd fubamarket
npm install
npm start
```

## 🌐 Доступные URL

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 👤 Данные для входа

### Админ-панель Django
- **Username**: admin
- **Password**: admin123

### Тестовые пользователи
- **Vendor**: vendor@example.com / password123
- **Ops**: ops@example.com / password123

## 🛠 Технологии

### Frontend
- Next.js 15.2.4
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI
- Lucide React

### Backend
- Django 4.2
- Django REST Framework
- SQLite (разработка)
- PostgreSQL (продакшн)

## 📁 Структура проекта

```
FubaMarket2/
├── apps/api/                 # Django Backend
│   ├── core/                # Основные настройки Django
│   ├── market/              # Приложение магазина
│   ├── manage.py
│   └── requirements.txt
├── fubamarket/              # Next.js Frontend
│   ├── app/                 # Страницы приложения
│   ├── components/          # React компоненты
│   ├── contexts/            # React контексты
│   ├── hooks/               # Кастомные хуки
│   ├── lib/                 # Утилиты и конфигурация
│   └── public/              # Статические файлы
├── start_project.sh         # Скрипт запуска
└── README.md
```

## 🔧 Команды разработки

### Frontend (Next.js)
```bash
cd fubamarket
npm run dev          # Режим разработки
npm run build        # Сборка для продакшна
npm start            # Запуск продакшн версии
npm run lint         # Проверка кода
```

### Backend (Django)
```bash
cd apps/api
source .venv/bin/activate
python manage.py runserver     # Запуск сервера
python manage.py migrate       # Применение миграций
python manage.py createsuperuser  # Создание админа
python manage.py shell         # Django shell
```

## 🎯 Функциональность

### Для покупателей
- ✅ Просмотр каталога товаров
- ✅ Поиск и фильтрация
- ✅ Корзина покупок
- ✅ Оформление заказов
- ✅ Личный кабинет
- ✅ Список желаний

### Для продавцов (Vendor)
- ✅ Управление товарами
- ✅ Просмотр заказов
- ✅ Запросы на вывод средств
- ✅ Статистика продаж

### Для операторов (Ops)
- ✅ Управление заказами
- ✅ Обработка запросов на вывод средств

### Для администраторов
- ✅ Управление пользователями
- ✅ Управление заказами
- ✅ Обработка запросов на вывод средств
- ✅ Статистика системы

## 🚀 Развертывание на сервере

### Ubuntu/Debian

1. **Установка зависимостей**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm nginx postgresql
```

2. **Настройка проекта**
```bash
git clone <repository>
cd FubaMarket2
chmod +x start_project.sh
./start_project.sh
```

3. **Настройка Nginx**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/fubamarket
sudo ln -s /etc/nginx/sites-available/fubamarket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🐛 Решение проблем

### Ошибка "Module not found"
```bash
cd fubamarket
npm install
```

### Ошибка "Port already in use"
```bash
# Остановить процессы на портах 3000 и 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Ошибка "Virtual environment not found"
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 📝 Лицензия

MIT License

## 👥 Поддержка

При возникновении проблем создайте issue в репозитории или обратитесь к разработчику.
