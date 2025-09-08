#!/usr/bin/env python
import os
import django
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import User, Product, ProductImage, Category

def create_test_products():
    print("Creating test products...")
    
    # Create test vendor
    user, created = User.objects.get_or_create(
        username='testvendor',
        defaults={
            'email': 'testvendor@example.com',
            'first_name': 'Test',
            'last_name': 'Vendor',
            'role': 'vendor',
            'phone': '+998901234567',
            'is_verified': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Created vendor: {user.username}")
    else:
        print(f"Vendor already exists: {user.username}")

    # Create categories
    categories = [
        {'name': 'Electronics', 'slug': 'electronics'},
        {'name': 'Clothing', 'slug': 'clothing'},
        {'name': 'Books', 'slug': 'books'},
        {'name': 'Home & Garden', 'slug': 'home-garden'},
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name']}
        )
        if created:
            print(f"Created category: {category.name}")

    # Sample products data
    products_data = [
        {
            'title': 'iPhone 15 Pro',
            'slug': 'iphone-15-pro',
            'description': 'Latest iPhone with advanced features',
            'price_uzs': 15000000,  # 150,000 UZS
            'category': 'electronics',
            'vendor': user,
            'is_active': True,
            'stock': 10
        },
        {
            'title': 'Samsung Galaxy S24',
            'slug': 'samsung-galaxy-s24',
            'description': 'Premium Android smartphone',
            'price_uzs': 12000000,  # 120,000 UZS
            'category': 'electronics',
            'vendor': user,
            'is_active': True,
            'stock': 15
        },
        {
            'title': 'Nike Air Max',
            'slug': 'nike-air-max',
            'description': 'Comfortable running shoes',
            'price_uzs': 2500000,  # 25,000 UZS
            'category': 'clothing',
            'vendor': user,
            'is_active': True,
            'stock': 20
        },
        {
            'title': 'Adidas T-Shirt',
            'slug': 'adidas-t-shirt',
            'description': 'Comfortable cotton t-shirt',
            'price_uzs': 500000,  # 5,000 UZS
            'category': 'clothing',
            'vendor': user,
            'is_active': True,
            'stock': 50
        },
        {
            'title': 'Python Programming Book',
            'slug': 'python-programming-book',
            'description': 'Learn Python programming from scratch',
            'price_uzs': 300000,  # 3,000 UZS
            'category': 'books',
            'vendor': user,
            'is_active': True,
            'stock': 25
        },
        {
            'title': 'Garden Plant Pot',
            'slug': 'garden-plant-pot',
            'description': 'Beautiful ceramic plant pot',
            'price_uzs': 800000,  # 8,000 UZS
            'category': 'home-garden',
            'vendor': user,
            'is_active': True,
            'stock': 30
        },
        {
            'title': 'MacBook Pro M3',
            'slug': 'macbook-pro-m3',
            'description': 'Powerful laptop for professionals',
            'price_uzs': 25000000,  # 250,000 UZS
            'category': 'electronics',
            'vendor': user,
            'is_active': True,
            'stock': 5
        },
        {
            'title': 'Wireless Headphones',
            'slug': 'wireless-headphones',
            'description': 'High-quality wireless headphones',
            'price_uzs': 1800000,  # 18,000 UZS
            'category': 'electronics',
            'vendor': user,
            'is_active': True,
            'stock': 12
        }
    ]

    # Create products
    for product_data in products_data:
        category = Category.objects.get(slug=product_data['category'])
        
        product, created = Product.objects.get_or_create(
            slug=product_data['slug'],
            defaults={
                'title': product_data['title'],
                'description': product_data['description'],
                'price_uzs': product_data['price_uzs'],
                'category': category,
                'vendor': product_data['vendor'],
                'is_active': product_data['is_active'],
                'stock': product_data['stock']
            }
        )
        
        if created:
            print(f"Created product: {product.title}")
            
            # Add a placeholder image
            try:
                # Create a simple placeholder image URL
                image_url = f"https://via.placeholder.com/400x400/cccccc/666666?text={product.title.replace(' ', '+')}"
                
                # Download and save image
                response = requests.get(image_url)
                if response.status_code == 200:
                    img_temp = NamedTemporaryFile(delete=True)
                    img_temp.write(response.content)
                    img_temp.flush()
                    
                    image = ProductImage.objects.create(
                        product=product,
                        image=File(img_temp, name=f"{product.slug}.jpg")
                    )
                    print(f"Added image for: {product.title}")
            except Exception as e:
                print(f"Could not add image for {product.title}: {e}")
        else:
            print(f"Product already exists: {product.title}")

    print("Test products creation completed!")

if __name__ == '__main__':
    create_test_products()
