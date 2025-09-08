#!/usr/bin/env python3
"""
Скрипт для обновления существующих баннеров с тестовыми изображениями
"""

import os
import django
from django.conf import settings

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import Banner

def update_banners_with_images():
    """Обновляем баннеры с тестовыми изображениями"""
    
    # Тестовые URL изображений
    test_images = [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop", 
        "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop"
    ]
    
    banners = Banner.objects.all()
    
    for i, banner in enumerate(banners):
        if i < len(test_images):
            banner.image_url = test_images[i]
            banner.save()
            print(f"Updated banner {banner.id} with image: {test_images[i]}")
    
    print(f"Updated {len(banners)} banners with test images")

if __name__ == "__main__":
    update_banners_with_images()
