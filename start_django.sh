#!/bin/bash

# Start Django development server

echo "🚀 Starting Django development server..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run: python -m venv .venv"
    exit 1
fi

# Activate virtual environment
echo "📝 Activating virtual environment..."
source .venv/bin/activate

# Check if Django project exists
if [ ! -f "apps/api/manage.py" ]; then
    echo "❌ Django project not found at apps/api/manage.py"
    exit 1
fi

# Navigate to Django project directory
cd apps/api

# Check if database is migrated
echo "📝 Checking database migrations..."
python manage.py showmigrations --plan | grep -q "\[ \]"
if [ $? -eq 0 ]; then
    echo "📝 Running database migrations..."
    python manage.py migrate
fi

# Start Django development server
echo "🚀 Starting Django development server on http://127.0.0.1:8000..."
echo "📋 Press Ctrl+C to stop the server"
echo ""

python manage.py runserver 127.0.0.1:8000
