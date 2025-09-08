#!/usr/bin/env python3
import os
import sys
import django

# Добавляем путь к Django проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import Banner

def create_banner_data():
    """Создание тестовых данных для баннеров"""
    
    # Очищаем существующие баннеры
    Banner.objects.all().delete()
    
    # Создаем баннеры
    banners_data = [
        {
            'title': 'Bu hafta tavsiya etilgan sotuvchi',
            'subtitle': 'TAVSIYA ETILGAN SOTUVCHI',
            'description': 'Dunyo bo\'ylab ishonchli sotuvchilardan eng yaxshi mahsulotlarni kashf qiling',
            'banner_type': 'featured',
            'button_text': 'DO\'KONGA O\'TISH',
            'button_url': '/shop',
            'background_color': '#3B82F6',
            'text_color': '#FFFFFF',
            'icon': 'Store',
            'is_active': True,
            'order': 1
        },
        {
            'title': 'Bu oddiy banner',
            'subtitle': '',
            'description': '',
            'banner_type': 'simple',
            'button_text': 'XARID QILISH',
            'button_url': '/shop',
            'background_color': '#10B981',
            'text_color': '#FFFFFF',
            'icon': 'ShoppingBag',
            'is_active': True,
            'order': 2
        },
        {
            'title': 'Woo Vendor Shop',
            'subtitle': 'TAVSIYA ETILGAN SOTUVCHI',
            'description': '',
            'banner_type': 'vendor',
            'button_text': 'XARID QILISH',
            'button_url': '/shop',
            'background_color': '#8B5CF6',
            'text_color': '#FFFFFF',
            'icon': 'Sparkles',
            'is_active': True,
            'order': 3
        },
        {
            'title': 'Bu oddiy banner',
            'subtitle': '',
            'description': 'Bu matnni istalgan narsaga o\'zgartiring',
            'banner_type': 'simple',
            'button_text': 'XARID QILISH',
            'button_url': '/shop',
            'background_color': '#F472B6',
            'text_color': '#FFFFFF',
            'icon': 'Gift',
            'is_active': True,
            'order': 4
        },
        {
            'title': 'Bu oddiy sarlavha',
            'subtitle': '',
            'description': '',
            'banner_type': 'simple',
            'button_text': 'XARID QILISH',
            'button_url': '/shop',
            'background_color': '#F59E0B',
            'text_color': '#FFFFFF',
            'icon': 'Heart',
            'is_active': True,
            'order': 5
        }
    ]
    
    for banner_data in banners_data:
        banner = Banner.objects.create(**banner_data)
        print(f"Создан баннер: {banner.title}")
    
    print(f"\nСоздано {len(banners_data)} баннеров")

if __name__ == '__main__':
    create_banner_data()
