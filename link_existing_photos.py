#!/usr/bin/env python3
"""
Скрипт для связывания существующих фотографий с продуктами
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

    def link_existing_photos():
        print("=== Связывание существующих фотографий с продуктами ===")
        
        # Получаем все активные продукты
        products = Product.objects.filter(is_active=True)
        print(f"Найдено {products.count()} активных продуктов")
        
        # Получаем все существующие фотографии
        media_path = "/Users/ibragimkadamzanov/PycharmProjects/FubaMarket2/apps/api/media/products"
        
        # Сначала проверим, есть ли уже фотографии в БД
        total_photos_in_db = ProductImage.objects.count()
        print(f"Всего фотографий в БД: {total_photos_in_db}")
        
        if total_photos_in_db > 0:
            print("В БД уже есть фотографии, пропускаем добавление")
            return
        
        # Найдем все файлы изображений
        image_files = []
        for root, dirs, files in os.walk(media_path):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_files.append(os.path.join(root, file))
        
        print(f"Найдено {len(image_files)} файлов изображений")
        
        # Связываем фотографии с продуктами
        for i, image_path in enumerate(image_files):
            print(f"\n--- Обрабатываем файл {i+1}/{len(image_files)}: {image_path} ---")
            
            # Пытаемся определить ID продукта из пути
            product_id = None
            
            # Ищем ID продукта в пути
            path_parts = image_path.split(os.sep)
            for part in path_parts:
                if part.isdigit():
                    product_id = int(part)
                    break
            
            if not product_id:
                print(f"  ❌ Не удалось определить ID продукта из пути")
                continue
            
            # Проверяем, существует ли продукт с таким ID
            try:
                product = Product.objects.get(id=product_id)
                print(f"  Найден продукт: {product.title}")
            except Product.DoesNotExist:
                print(f"  ❌ Продукт с ID {product_id} не найден")
                continue
            
            # Создаем запись ProductImage
            filename = os.path.basename(image_path)
            relative_path = image_path.replace(media_path, '').lstrip(os.sep)
            
            try:
                with open(image_path, 'rb') as f:
                    photo = ProductImage.objects.create(
                        product=product,
                        alt=f"Photo for {product.title}",
                        sort_order=0
                    )
                    photo.image.save(filename, File(f), save=True)
                    print(f"  ✅ Создана запись: {photo.image}")
            except Exception as e:
                print(f"  ❌ Ошибка при создании записи: {e}")
        
        print("\n=== Проверка результатов ===")
        total_photos = ProductImage.objects.count()
        print(f"Всего фотографий в БД: {total_photos}")
        
        for product in products:
            photos = ProductImage.objects.filter(product=product)
            if photos.count() > 0:
                print(f"Продукт {product.title}: {photos.count()} фотографий")

    if __name__ == "__main__":
        link_existing_photos()

except ImportError as e:
    print(f"Ошибка импорта: {e}")
    print("Django не установлен или не настроен правильно")
    print("Попробуйте запустить Django сервер и проверить API через браузер")
