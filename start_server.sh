#!/bin/bash

# FubaMarket2 Server Startup Script
# This script starts both Django backend and Next.js frontend

# Set project directory
PROJECT_DIR="/path/to/your/FubaMarket2"
DJANGO_DIR="$PROJECT_DIR/apps/api"
FRONTEND_DIR="$PROJECT_DIR/fubamarket"

# Activate virtual environment
cd $DJANGO_DIR
source .venv/bin/activate

# Start Django backend
echo "Starting Django backend..."
python manage.py runserver 0.0.0.0:8000 &

# Wait a moment for Django to start
sleep 5

# Start Next.js frontend
echo "Starting Next.js frontend..."
cd $FRONTEND_DIR
npm run build
npm start &

# Keep the script running
wait
