#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import Review, Product, User

def create_test_reviews():
    """Создать тестовые отзывы"""
    
    # Получаем продукты
    products = Product.objects.all()
    if not products.exists():
        print("Нет продуктов для создания отзывов")
        return
    
    # Получаем пользователей
    users = User.objects.all()
    if not users.exists():
        print("Нет пользователей для создания отзывов")
        return
    
    # Тестовые отзывы
    test_reviews = [
        {
            'product': products[0] if products.count() > 0 else None,
            'user': users[0] if users.count() > 0 else None,
            'rating': 5,
            'comment': 'Ajoyib mahsulot! Sifat juda yaxshi va narx ham qulay.',
            'verified': True
        },
        {
            'product': products[0] if products.count() > 0 else None,
            'user': users[1] if users.count() > 1 else users[0],
            'rating': 4,
            'comment': 'Yaxshi mahsulot, lekin yetkazib berish biroz kech bo\'ldi.',
            'verified': True
        },
        {
            'product': products[1] if products.count() > 1 else None,
            'user': users[0] if users.count() > 0 else None,
            'rating': 5,
            'comment': 'Mukammal! Har bir tafsilotga e\'tibor berilgan.',
            'verified': True
        },
        {
            'product': products[1] if products.count() > 1 else None,
            'user': users[1] if users.count() > 1 else users[0],
            'rating': 5,
            'comment': 'Kutilganidan ham yaxshi. Tavsiya qilaman!',
            'verified': True
        },
        {
            'product': products[2] if products.count() > 2 else None,
            'user': users[0] if users.count() > 0 else None,
            'rating': 4,
            'comment': 'Yaxshi sifat, lekin o\'lcham biroz kichik.',
            'verified': True
        },
        {
            'product': products[2] if products.count() > 2 else None,
            'user': users[1] if users.count() > 1 else users[0],
            'rating': 5,
            'comment': 'Ajoyib dizayn va qulay. Rahmat!',
            'verified': True
        }
    ]
    
    created_count = 0
    for review_data in test_reviews:
        if review_data['product'] and review_data['user']:
            review, created = Review.objects.get_or_create(
                product=review_data['product'],
                user=review_data['user'],
                defaults={
                    'rating': review_data['rating'],
                    'comment': review_data['comment'],
                    'verified': review_data['verified']
                }
            )
            if created:
                created_count += 1
                print(f"Создан отзыв для {review_data['product'].title} от {review_data['user'].username}")
    
    print(f"Создано {created_count} отзывов")

if __name__ == "__main__":
    create_test_reviews()
