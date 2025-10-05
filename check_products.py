#!/usr/bin/env python3
"""
Скрипт для проверки продуктов и их фотографий в базе данных
"""

import os
import sys
import django

# Добавляем путь к Django проекту
sys.path.append('/Users/ibragimkadamzanov/PycharmProjects/FubaMarket2/apps/api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import Product, ProductImage

def check_products():
    print("=== Проверка продуктов и фотографий ===")
    
    # Получаем все активные продукты
    products = Product.objects.filter(is_active=True)[:10]
    print(f"Найдено {products.count()} активных продуктов")
    
    for product in products:
        print(f"\n--- Продукт: {product.title} (ID: {product.id}) ---")
        print(f"Цена: {product.price_uzs}")
        print(f"Категория: {product.category}")
        print(f"Активен: {product.is_active}")
        
        # Проверяем фотографии
        photos = ProductImage.objects.filter(product=product)
        print(f"Количество фотографий: {photos.count()}")
        
        for i, photo in enumerate(photos):
            print(f"  Фото {i+1}: {photo.image}")
            print(f"    Alt: {photo.alt}")
            print(f"    Sort order: {photo.sort_order}")
            print(f"    Создано: {photo.created_at}")
        
        if photos.count() == 0:
            print("  ❌ Нет фотографий!")
        else:
            print("  ✅ Есть фотографии")

if __name__ == "__main__":
    check_products()
