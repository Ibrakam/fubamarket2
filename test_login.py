#!/usr/bin/env python3
import requests
import json

def test_login():
    # Тестируем вход в систему
    url = 'http://localhost:8000/api/auth/login/'
    data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Login successful!')
            print(f'🔑 Access token: {result.get("access")}')
            print(f'🔄 Refresh token: {result.get("refresh")}')
            return result.get("access")
        else:
            print(f'❌ Login failed: {response.status_code} - {response.text}')
            return None
    except Exception as e:
        print(f'❌ Login error: {e}')
        return None

def test_referral_creation(token):
    if not token:
        print('❌ No token available for referral test')
        return
    
    # Тестируем создание реферальной ссылки
    url = 'http://localhost:8000/api/referral-links/create/'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    data = {
        'product_id': 9
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 201:
            result = response.json()
            print(f'✅ Referral link created successfully!')
            print(f'🔗 Referral code: {result.get("referral_code")}')
            print(f'📦 Product: {result.get("product_title")}')
            print(f'💰 Price: ${result.get("product_price")}')
            
            # Создаем полную ссылку
            referral_url = f"http://localhost:3000/product/9?ref={result.get('referral_code')}&utm_source=referral"
            print(f'🌐 Full referral URL: {referral_url}')
        else:
            print(f'❌ Referral creation failed: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'❌ Referral creation error: {e}')

if __name__ == '__main__':
    print('🔐 Testing login...')
    token = test_login()
    
    print('\n🔗 Testing referral link creation...')
    test_referral_creation(token)
