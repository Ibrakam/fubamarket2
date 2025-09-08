from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, ProductImage
from .serializers import ProductSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vendor_create_product(request):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Создаем продукт
        product_data = {
            'title': request.data.get('title'),
            'description': request.data.get('description', ''),
            'price_uzs': request.data.get('price_uzs'),
            'stock': request.data.get('stock', 0),
            'is_active': request.data.get('is_active', 'true').lower() == 'true',
            'vendor': request.user.id
        }
        
        product_serializer = ProductSerializer(data=product_data, context={'request': request})
        if product_serializer.is_valid():
            product = product_serializer.save(vendor=request.user)
            
            # Обрабатываем изображения
            images = request.FILES.getlist('images')
            for image in images:
                ProductImage.objects.create(product=product, image=image)
            
            # Возвращаем созданный продукт
            response_serializer = ProductSerializer(product, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def vendor_update_product(request, product_id):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = get_object_or_404(Product, id=product_id, vendor=request.user)
        
        # Обновляем основные данные продукта
        product_data = {
            'title': request.data.get('title', product.title),
            'description': request.data.get('description', product.description),
            'price_uzs': request.data.get('price_uzs', product.price_uzs),
            'stock': request.data.get('stock', product.stock),
            'is_active': request.data.get('is_active', str(product.is_active)).lower() == 'true',
        }
        
        product_serializer = ProductSerializer(product, data=product_data, partial=True, context={'request': request})
        if product_serializer.is_valid():
            product_serializer.save()
            
            # Обрабатываем новые изображения
            images = request.FILES.getlist('images')
            for image in images:
                ProductImage.objects.create(product=product, image=image)
            
            # Возвращаем обновленный продукт
            response_serializer = ProductSerializer(product, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_get_product(request, product_id):
    if request.user.role != 'vendor':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = get_object_or_404(Product, id=product_id, vendor=request.user)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.filter(is_active=True)
    return Response([{'id': c.id, 'name': c.name} for c in categories])
