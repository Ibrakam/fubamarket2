#!/usr/bin/env python3
"""
Скрипт для исправления связей между продуктами и фотографиями
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
    from django.core.files import File

    def fix_product_images():
        print("=== Исправление связей между продуктами и фотографиями ===")
        
        # Получаем все активные продукты
        products = Product.objects.filter(is_active=True)
        print(f"Найдено {products.count()} активных продуктов")
        
        # Получаем все существующие фотографии
        media_path = "/Users/ibragimkadamzanov/PycharmProjects/FubaMarket2/apps/api/media/products"
        
        for product in products:
            print(f"\n--- Обрабатываем продукт: {product.title} (ID: {product.id}) ---")
            
            # Проверяем, есть ли уже фотографии в БД
            existing_photos = ProductImage.objects.filter(product=product)
            if existing_photos.count() > 0:
                print(f"  У продукта уже есть {existing_photos.count()} фотографий в БД")
                continue
            
            # Ищем фотографии в папке продукта
            product_media_path = os.path.join(media_path, str(product.id))
            if os.path.exists(product_media_path):
                print(f"  Найдена папка продукта: {product_media_path}")
                for filename in os.listdir(product_media_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        file_path = os.path.join(product_media_path, filename)
                        print(f"    Найдена фотография: {filename}")
                        
                        # Создаем запись ProductImage
                        with open(file_path, 'rb') as f:
                            photo = ProductImage.objects.create(
                                product=product,
                                alt=f"Photo for {product.title}",
                                sort_order=0
                            )
                            photo.image.save(filename, File(f), save=True)
                            print(f"    ✅ Добавлена в БД: {photo.image}")
            else:
                print(f"  Папка продукта не найдена: {product_media_path}")
        
        print("\n=== Проверка результатов ===")
        for product in products:
            photos = ProductImage.objects.filter(product=product)
            print(f"Продукт {product.title}: {photos.count()} фотографий")

    if __name__ == "__main__":
        fix_product_images()

except ImportError as e:
    print(f"Ошибка импорта: {e}")
    print("Django не установлен или не настроен правильно")
    print("Попробуйте запустить Django сервер и проверить API через браузер")
