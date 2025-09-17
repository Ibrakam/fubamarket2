#!/usr/bin/env python3
import os
import sys
import django
import requests
import json

# Добавляем путь к Django проекту
sys.path.append('/Users/ibragimkadamzanov/PycharmProjects/FubaMarket2/apps/api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def create_test_user():
    # Создаем тестового пользователя
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'user'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print(f'✅ Created user: {user.username}')
    else:
        print(f'✅ User exists: {user.username}')
    
    # Создаем токен
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f'🔑 Access token: {access_token}')
    
    # Тестируем API
    test_api(access_token)
    
    return access_token

def test_api(token):
    # Тестируем создание реферальной ссылки
    url = 'http://localhost:8000/api/referral-links/create/'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    data = {
        'product_id': 9,
        'product_title': 'Test Product',
        'product_price': 75.0
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 201:
            result = response.json()
            print(f'✅ API test successful: {result}')
        else:
            print(f'❌ API test failed: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'❌ API test error: {e}')

if __name__ == '__main__':
    create_test_user()
