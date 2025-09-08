import os
import django
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import requests
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from market.models import User, Product, Order, OrderItem, WithdrawalRequest

def create_test_data():
    print("Creating test data...")
    
    # Get or create test users
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'superadmin',
            'phone': '+998901234567',
            'is_verified': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('adminpass123')
        admin_user.save()
        print(f"Created admin user: {admin_user.username}")
    
    vendor_user, created = User.objects.get_or_create(
        username='testvendor',
        defaults={
            'email': 'vendor@example.com',
            'first_name': 'Test',
            'last_name': 'Vendor',
            'role': 'vendor',
            'phone': '+998901234568',
            'is_verified': True,
            'balance': Decimal('5000000')  # 50,000 UZS
        }
    )
    if created:
        vendor_user.set_password('vendorpass123')
        vendor_user.save()
        print(f"Created vendor user: {vendor_user.username}")
    
    ops_user, created = User.objects.get_or_create(
        username='ops',
        defaults={
            'email': 'ops@example.com',
            'first_name': 'Operations',
            'last_name': 'User',
            'role': 'ops',
            'phone': '+998901234569',
            'is_verified': True
        }
    )
    if created:
        ops_user.set_password('opspass123')
        ops_user.save()
        print(f"Created ops user: {ops_user.username}")
    
    # Get existing products
    products = Product.objects.filter(vendor=vendor_user)
    if not products.exists():
        print("No products found for vendor. Please run create_test_products.py first.")
        return
    
    # Create test orders
    orders_data = [
        {
            'public_id': 'ORD001',
            'customer_name': 'John Doe',
            'customer_phone': '+998901234570',
            'customer_address': 'Tashkent, Uzbekistan',
            'total_amount': Decimal('1500000'),  # 15,000 UZS
            'status': 'pending',
            'payment_status': 'paid',
            'items': [
                {'product': products[0], 'quantity': 1, 'price': Decimal('1500000')}
            ]
        },
        {
            'public_id': 'ORD002',
            'customer_name': 'Jane Smith',
            'customer_phone': '+998901234571',
            'customer_address': 'Samarkand, Uzbekistan',
            'total_amount': Decimal('2500000'),  # 25,000 UZS
            'status': 'processing',
            'payment_status': 'paid',
            'items': [
                {'product': products[1], 'quantity': 1, 'price': Decimal('2500000')}
            ]
        },
        {
            'public_id': 'ORD003',
            'customer_name': 'Bob Johnson',
            'customer_phone': '+998901234572',
            'customer_address': 'Bukhara, Uzbekistan',
            'total_amount': Decimal('800000'),  # 8,000 UZS
            'status': 'shipped',
            'payment_status': 'paid',
            'items': [
                {'product': products[2], 'quantity': 1, 'price': Decimal('800000')}
            ]
        },
        {
            'public_id': 'ORD004',
            'customer_name': 'Alice Brown',
            'customer_phone': '+998901234573',
            'customer_address': 'Andijan, Uzbekistan',
            'total_amount': Decimal('1200000'),  # 12,000 UZS
            'status': 'delivered',
            'payment_status': 'paid',
            'items': [
                {'product': products[3], 'quantity': 1, 'price': Decimal('1200000')}
            ]
        }
    ]
    
    for order_data in orders_data:
        order, created = Order.objects.get_or_create(
            public_id=order_data['public_id'],
            defaults={
                'customer_name': order_data['customer_name'],
                'customer_phone': order_data['customer_phone'],
                'customer_address': order_data['customer_address'],
                'total_amount': order_data['total_amount'],
                'status': order_data['status'],
                'payment_status': order_data['payment_status']
            }
        )
        
        if created:
            print(f"Created order: {order.public_id}")
            
            # Create order items
            for item_data in order_data['items']:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    price=item_data['price']
                )
                print(f"  - Added item: {item_data['product'].title}")
    
    # Create test withdrawal requests
    withdrawal_data = [
        {
            'amount': Decimal('1000000'),  # 10,000 UZS
            'status': 'pending',
            'bank_details': 'NBU Bank, Account: 1234567890',
            'notes': 'Monthly withdrawal request'
        },
        {
            'amount': Decimal('2000000'),  # 20,000 UZS
            'status': 'approved',
            'bank_details': 'NBU Bank, Account: 1234567890',
            'notes': 'Approved withdrawal',
            'processed_by': admin_user
        },
        {
            'amount': Decimal('500000'),  # 5,000 UZS
            'status': 'rejected',
            'bank_details': 'NBU Bank, Account: 1234567890',
            'notes': 'Insufficient funds',
            'processed_by': ops_user
        }
    ]
    
    for withdrawal_data_item in withdrawal_data:
        withdrawal, created = WithdrawalRequest.objects.get_or_create(
            user=vendor_user,
            amount=withdrawal_data_item['amount'],
            status=withdrawal_data_item['status'],
            defaults={
                'bank_details': withdrawal_data_item['bank_details'],
                'notes': withdrawal_data_item['notes'],
                'processed_by': withdrawal_data_item.get('processed_by')
            }
        )
        
        if created:
            print(f"Created withdrawal request: {withdrawal.id} - {withdrawal.status}")
    
    print("Test data creation completed!")
    print("\nTest users:")
    print(f"Admin: admin / adminpass123")
    print(f"Vendor: testvendor / vendorpass123")
    print(f"Ops: ops / opspass123")

if __name__ == '__main__':
    create_test_data()
