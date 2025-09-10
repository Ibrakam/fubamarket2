#!/bin/bash

echo "🚀 Запуск проекта FubaMarket..."

# Проверяем, что мы в правильной директории
if [ ! -f "fubamarket/package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой папки проекта"
    exit 1
fi

# Функция для проверки, запущен ли процесс
check_process() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Функция для остановки процессов
stop_processes() {
    echo "🛑 Остановка серверов..."
    
    # Останавливаем Django сервер
    if check_process 8000; then
        echo "Останавливаем Django сервер..."
        pkill -f "python manage.py runserver"
    fi
    
    # Останавливаем Next.js сервер
    if check_process 3000; then
        echo "Останавливаем Next.js сервер..."
        pkill -f "npm start"
    fi
    
    sleep 2
}

# Обработка сигналов для корректного завершения
trap stop_processes SIGINT SIGTERM

# Останавливаем существующие процессы
stop_processes

echo "📦 Установка зависимостей..."

# Устанавливаем зависимости для Next.js
cd fubamarket
if [ ! -d "node_modules" ]; then
    echo "Устанавливаем Node.js зависимости..."
    npm install
fi

# Устанавливаем недостающие пакеты
echo "Устанавливаем недостающие пакеты..."
npm install @radix-ui/react-switch

cd ..

# Устанавливаем зависимости для Django
cd apps/api
if [ ! -d ".venv" ]; then
    echo "❌ Виртуальное окружение не найдено. Создайте его командой: python -m venv .venv"
    exit 1
fi

echo "Активируем виртуальное окружение..."
source .venv/bin/activate

echo "Устанавливаем Python зависимости..."
pip install -r requirements.txt

echo "🔄 Применяем миграции..."
python manage.py migrate

echo "👤 Создаем суперпользователя (если не существует)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell

cd ../..

echo "🚀 Запуск серверов..."

# Запускаем Django сервер в фоне
echo "Запускаем Django сервер на порту 8000..."
cd apps/api
source .venv/bin/activate
python manage.py runserver &
DJANGO_PID=$!

# Ждем запуска Django сервера
sleep 3

# Запускаем Next.js сервер в фоне
echo "Запускаем Next.js сервер на порту 3000..."
cd ../../fubamarket
npm start &
NEXTJS_PID=$!

# Ждем запуска Next.js сервера
sleep 5

echo ""
echo "✅ Проект успешно запущен!"
echo ""
echo "🌐 Доступные URL:"
echo "   Frontend (Next.js): http://localhost:3000"
echo "   Backend (Django):   http://localhost:8000"
echo "   Admin Panel:        http://localhost:8000/admin"
echo ""
echo "👤 Данные для входа в админку:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📱 Мобильная версия оптимизирована!"
echo "   - Адаптивный дизайн для всех устройств"
echo "   - Мобильное меню с поиском"
echo "   - Оптимизированные карточки товаров"
echo ""
echo "📝 Для остановки серверов нажмите Ctrl+C"
echo ""

# Ждем завершения процессов
wait $DJANGO_PID $NEXTJS_PID
