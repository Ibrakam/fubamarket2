#!/usr/bin/env python3
"""
Скрипт для добавления тестовых фотографий к продуктам
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

    def add_test_photos():
        print("=== Добавление тестовых фотографий к продуктам ===")
        
        # Получаем первые 5 активных продуктов
        products = Product.objects.filter(is_active=True)[:5]
        print(f"Найдено {products.count()} активных продуктов")
        
        for product in products:
            print(f"\n--- Обрабатываем продукт: {product.title} (ID: {product.id}) ---")
            
            # Проверяем, есть ли уже фотографии
            existing_photos = ProductImage.objects.filter(product=product)
            if existing_photos.count() > 0:
                print(f"  У продукта уже есть {existing_photos.count()} фотографий, пропускаем")
                continue
            
            # Создаем тестовое изображение
            img = Image.new('RGB', (400, 400), color='lightblue')
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            
            # Создаем ProductImage
            photo = ProductImage.objects.create(
                product=product,
                alt=f"Test photo for {product.title}",
                sort_order=0
            )
            
            # Сохраняем изображение
            photo.image.save(
                f"test_photo_{product.id}.png",
                ContentFile(img_io.getvalue()),
                save=True
            )
            
            print(f"  ✅ Добавлена тестовая фотография: {photo.image}")
        
        print("\n=== Проверка результатов ===")
        for product in products:
            photos = ProductImage.objects.filter(product=product)
            print(f"Продукт {product.title}: {photos.count()} фотографий")

    if __name__ == "__main__":
        add_test_photos()

except ImportError as e:
    print(f"Ошибка импорта: {e}")
    print("Django не установлен или не настроен правильно")
    print("Попробуйте запустить Django сервер и проверить API через браузер")
