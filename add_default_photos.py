#!/usr/bin/env python3
"""
Скрипт для добавления дефолтных фотографий к продуктам без фотографий
"""

import os
import sys
import django

# Добавляем путь к Django проекту
sys.path.append('/Users/ibragimkadamzanov/PycharmProjects/FubaMarket2/apps/api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

try:
    django.setup()
    from market.models import Product, ProductImage
    from django.core.files.base import ContentFile
    from PIL import Image
    import io

    def add_default_photos():
        print("=== Добавление дефолтных фотографий к продуктам ===")
        
        # Получаем продукты без фотографий
        products_without_photos = Product.objects.filter(is_active=True).exclude(
            id__in=ProductImage.objects.values_list('product_id', flat=True)
        )
        
        print(f"Найдено {products_without_photos.count()} продуктов без фотографий")
        
        # Дефолтные изображения по категориям
        default_images = {
            'Electronics': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            'Home & Garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        }
        
        for product in products_without_photos:
            print(f"\n--- Обрабатываем продукт: {product.title} (ID: {product.id}) ---")
            
            # Определяем категорию
            category_name = product.category.name if product.category else 'Electronics'
            default_image_url = default_images.get(category_name, default_images['Electronics'])
            
            print(f"  Категория: {category_name}")
            print(f"  Дефолтное изображение: {default_image_url}")
            
            # Создаем ProductImage с URL
            photo = ProductImage.objects.create(
                product=product,
                alt=f"Default photo for {product.title}",
                sort_order=0
            )
            
            # Сохраняем URL как image
            photo.image = default_image_url
            photo.save()
            
            print(f"  ✅ Добавлена дефолтная фотография: {photo.image}")
        
        print("\n=== Проверка результатов ===")
        for product in Product.objects.filter(is_active=True):
            photos = ProductImage.objects.filter(product=product)
            print(f"Продукт {product.title}: {photos.count()} фотографий")

    if __name__ == "__main__":
        add_default_photos()

except ImportError as e:
    print(f"Ошибка импорта: {e}")
    print("Django не установлен или не настроен правильно")
    print("Попробуйте запустить Django сервер и проверить API через браузер")
