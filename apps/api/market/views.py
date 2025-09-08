from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import Product, Order, User, WithdrawalRequest, OrderItem, Review
from .serializers import (
    ProductSerializer, OrderSerializer, UserSerializer, 
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    WithdrawalRequestSerializer, CreateWithdrawalRequestSerializer, ReviewSerializer
)

@api_view(["GET"]) 
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if user.check_password(serializer.validated_data['old_password']):
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Product Views
@api_view(["GET"]) 
@permission_classes([AllowAny])
def list_products(request):
    products = Product.objects.filter(is_active=True)
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(["GET"]) 
@permission_classes([AllowAny])
def get_product(request, slug: str):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    return Response(ProductSerializer(product, context={'request': request}).data)

@api_view(["GET"]) 
@permission_classes([AllowAny])
def get_product_by_id(request, id: int):
    product = get_object_or_404(Product, id=id, is_active=True)
    return Response(ProductSerializer(product, context={'request': request}).data)

# Vendor Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_me(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_data = UserSerializer(request.user).data
    products = Product.objects.filter(vendor=request.user)
    products_data = ProductSerializer(products, many=True, context={'request': request}).data
    
    return Response({
        'user': user_data,
        'products': products_data,
        'products_count': products.count(),
        'active_products': products.filter(is_active=True).count(),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_products(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.filter(vendor=request.user)
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response({'products': serializer.data})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def toggle_product_status(request, product_id):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    product = get_object_or_404(Product, id=product_id, vendor=request.user)
    product.is_active = not product.is_active
    product.save()
    
    return Response({
        'message': f'Product {"activated" if product.is_active else "deactivated"}',
        'is_active': product.is_active
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_orders(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get orders for products sold by this vendor
    vendor_products = Product.objects.filter(vendor=request.user)
    orders = Order.objects.filter(items__product__in=vendor_products).distinct()
    
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response({'orders': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    # Check if order contains vendor's products
    vendor_products = Product.objects.filter(vendor=request.user)
    if not order.items.filter(product__in=vendor_products).exists():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    new_status = request.data.get('status')
    if new_status in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        order.status = new_status
        order.save()
        return Response({'message': f'Order status updated to {new_status}'})
    
    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_withdrawals(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawals = WithdrawalRequest.objects.filter(user=request.user)
    serializer = WithdrawalRequestSerializer(withdrawals, many=True)
    return Response({'withdrawals': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_withdrawal_request(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CreateWithdrawalRequestSerializer(data=request.data)
    if serializer.is_valid():
        withdrawal = serializer.save(user=request.user)
        return Response(WithdrawalRequestSerializer(withdrawal).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if request.user.role not in ['superadmin', 'ops']:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.count()
    total_vendors = User.objects.filter(role='vendor').count()
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    pending_withdrawals = WithdrawalRequest.objects.filter(status='pending').count()
    
    return Response({
        'total_users': total_users,
        'total_vendors': total_vendors,
        'total_products': total_products,
        'total_orders': total_orders,
        'pending_withdrawals': pending_withdrawals,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    """Получить публичную статистику для главной страницы"""
    try:
        total_users = User.objects.count()
        total_vendors = User.objects.filter(role='vendor').count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        
        return Response({
            'total_users': total_users,
            'total_vendors': total_vendors,
            'total_products': total_products,
            'total_orders': total_orders
        })
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if request.user.role != 'superadmin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response({'users': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """Обновить данные пользователя"""
    if request.user.role != 'superadmin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Обновляем только разрешенные поля
    allowed_fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_verified']
    data = {field: request.data.get(field) for field in allowed_fields if field in request.data}
    
    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    """Создать нового пользователя"""
    if request.user.role != 'superadmin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Используем RegisterSerializer для создания пользователя
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Обновляем дополнительные поля если они переданы
        if 'role' in request.data:
            user.role = request.data['role']
        if 'is_verified' in request.data:
            user.is_verified = request.data['is_verified']
        user.save()
        
        # Возвращаем данные пользователя
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    if request.user.role not in ['superadmin', 'ops']:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response({'orders': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    if request.user.role != 'superadmin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get('status')
    
    if new_status in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        order.status = new_status
        order.save()
        return Response({'message': f'Order status updated to {new_status}'})
    
    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_withdrawals(request):
    if request.user.role not in ['superadmin', 'ops']:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawals = WithdrawalRequest.objects.all()
    serializer = WithdrawalRequestSerializer(withdrawals, many=True)
    return Response({'withdrawals': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    if request.user.role not in ['superadmin', 'ops']:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawal = get_object_or_404(WithdrawalRequest, id=withdrawal_id)
    status_action = request.data.get('status')
    
    if status_action == 'approved':
        withdrawal.status = 'approved'
        withdrawal.processed_by = request.user
        withdrawal.save()
        return Response({'message': 'Withdrawal approved'})
    elif status_action == 'rejected':
        withdrawal.status = 'rejected'
        withdrawal.processed_by = request.user
        withdrawal.save()
        return Response({'message': 'Withdrawal rejected'})
    else:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

# Ops Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ops_orders(request):
    if request.user.role != 'ops':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response({'orders': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def ops_update_order_status(request, order_id):
    if request.user.role != 'ops':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get('status')
    
    if new_status in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        order.status = new_status
        order.save()
        return Response({'message': f'Order status updated to {new_status}'})
    
    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ops_withdrawals(request):
    if request.user.role != 'ops':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawals = WithdrawalRequest.objects.all()
    serializer = WithdrawalRequestSerializer(withdrawals, many=True)
    return Response({'withdrawals': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ops_process_withdrawal(request, withdrawal_id):
    if request.user.role != 'ops':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    withdrawal = get_object_or_404(WithdrawalRequest, id=withdrawal_id)
    status_action = request.data.get('status')
    
    if status_action == 'approved':
        withdrawal.status = 'approved'
        withdrawal.processed_by = request.user
        withdrawal.save()
        return Response({'message': 'Withdrawal approved'})
    elif status_action == 'rejected':
        withdrawal.status = 'rejected'
        withdrawal.processed_by = request.user
        withdrawal.save()
        return Response({'message': 'Withdrawal rejected'})
    else:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

# Legacy views for backward compatibility
@api_view(["POST"]) 
@permission_classes([AllowAny])
def create_order(request):
    # Legacy order creation - keeping for compatibility
    return Response({"message": "Order creation endpoint"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(["GET"]) 
@permission_classes([AllowAny])
def checkout_payme(request, public_id: str):
    # Legacy PayMe checkout - keeping for compatibility
    return Response({"message": "PayMe checkout endpoint"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(["POST"]) 
@permission_classes([AllowAny])
def payme_webhook(request):
    # Legacy PayMe webhook - keeping for compatibility
    return Response({"message": "PayMe webhook endpoint"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Создание нового заказа"""
    try:
        data = request.data
        user = request.user
        
        # Валидация данных
        if not data.get('items') or not isinstance(data['items'], list):
            return Response(
                {"error": "Items are required and must be a list"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем заказ в транзакции
        with transaction.atomic():
            # Создаем заказ
            order = Order.objects.create(
                customer_name=user.first_name + ' ' + user.last_name if user.first_name or user.last_name else user.username,
                customer_phone=user.phone or '',
                customer_address=data.get('shipping_address', ''),
                total_amount=data.get('total_amount', 0),
                status='pending'
            )
            
            # Создаем элементы заказа
            total_calculated = 0
            for item_data in data['items']:
                try:
                    product = Product.objects.get(id=item_data['product_id'])
                    quantity = item_data['quantity']
                    price = item_data.get('price', product.price_uzs)
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price
                    )
                    
                    total_calculated += price * quantity
                    
                except Product.DoesNotExist:
                    return Response(
                        {"error": f"Product with id {item_data['product_id']} not found"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Обновляем общую сумму заказа
            order.total_amount = total_calculated
            order.save()
            
            # Возвращаем созданный заказ
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Reviews API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_reviews(request, product_id):
    """Получить отзывы для продукта"""
    try:
        reviews = Review.objects.filter(product_id=product_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Создать отзыв"""
    try:
        data = request.data
        data['user'] = request.user.id
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Featured products API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_products(request):
    """Получить рекомендуемые продукты"""
    try:
        # Получаем продукты с высоким рейтингом или популярные
        products = Product.objects.filter(is_active=True).order_by('-created_at')[:8]
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Latest reviews API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_latest_reviews(request):
    """Получить последние отзывы"""
    try:
        reviews = Review.objects.select_related('product', 'user').order_by('-created_at')[:6]
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

