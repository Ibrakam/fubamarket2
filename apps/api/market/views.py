from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.db import transaction
from datetime import timedelta
from rest_framework.exceptions import PermissionDenied
import logging

from .models import (
    ReferralProgram, ReferralLink, ReferralVisit, ReferralAttribution,
    ReferralReward, ReferralPayout, ReferralBalance, User, Product, Category, Order, OrderItem, WithdrawalRequest, ProductImage
)
from .serializers import (
    ReferralProgramSerializer, ReferralLinkSerializer, ReferralLinkCreateSerializer,
    ReferralVisitSerializer, ReferralAttributionSerializer, ReferralRewardSerializer,
    ReferralRewardUpdateSerializer, ReferralPayoutSerializer, ReferralPayoutCreateSerializer,
    ReferralBalanceSerializer, ReferralStatsSerializer, ReferralLinkStatsSerializer,
    ProductSerializer, ProductCreateSerializer, CategorySerializer, OrderSerializer, WithdrawalRequestSerializer,
    UserSerializer, ProductImageSerializer
)

logger = logging.getLogger(__name__)

# Referral Program Management
class ReferralProgramListCreateView(generics.ListCreateAPIView):
    queryset = ReferralProgram.objects.all()
    serializer_class = ReferralProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReferralProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReferralProgram.objects.all()
    serializer_class = ReferralProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

# Referral Links Management - только для админов
class ReferralLinkListCreateView(generics.ListCreateAPIView):
    serializer_class = ReferralLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralLink.objects.all()
        return ReferralLink.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReferralLinkCreateSerializer
        return ReferralLinkSerializer

    def perform_create(self, serializer):
        # Только админы могут создавать реферальные ссылки
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать реферальные ссылки")
        serializer.save(user=self.request.user)

class ReferralLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReferralLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralLink.objects.all()
        return ReferralLink.objects.filter(user=self.request.user)

class ReferralLinkStatsView(generics.RetrieveAPIView):
    serializer_class = ReferralLinkStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralLink.objects.all()
        return ReferralLink.objects.filter(user=self.request.user)

# Referral Visits Tracking
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_referral_visit(request):
    """Отслеживает посещение по реферальной ссылке"""
    try:
        data = request.data
        referral_code = data.get('referral_code')
        anonymous_id = data.get('anonymous_id')
        
        if not referral_code or not anonymous_id:
            return Response(
                {'error': 'referral_code и anonymous_id обязательны'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Находим реферальную ссылку
        try:
            referral_link = ReferralLink.objects.get(code=referral_code, is_active=True)
        except ReferralLink.DoesNotExist:
            return Response(
                {'error': 'Реферальная ссылка не найдена или неактивна'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Создаем запись о посещении
        visit_data = {
            'referral_link': referral_link.id,
            'anonymous_id': anonymous_id,
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'utm_source': data.get('utm_source'),
            'utm_medium': data.get('utm_medium'),
            'utm_campaign': data.get('utm_campaign'),
        }
        
        if request.user.is_authenticated:
            visit_data['user'] = request.user.id

        serializer = ReferralVisitSerializer(data=visit_data)
        if serializer.is_valid():
            visit = serializer.save()
            
            # Обновляем счетчик кликов
            referral_link.total_clicks += 1
            referral_link.save(update_fields=['total_clicks'])
            
            # Создаем или обновляем атрибуцию
            create_or_update_attribution(referral_link, anonymous_id, request.user, visit)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error tracking referral visit: {e}")
        return Response(
            {'error': 'Ошибка при отслеживании посещения'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def create_or_update_attribution(referral_link, anonymous_id, user, visit):
    """Создает или обновляет атрибуцию реферала"""
    try:
        # Получаем настройки реферальной программы
        program = ReferralProgram.objects.filter(is_active=True).first()
        if not program:
            return

        # Определяем продукт для атрибуции
        product = referral_link.product
        if not product:
            # Если ссылка не привязана к конкретному товару, 
            # атрибуция будет создана при покупке любого товара
            return

        # Создаем или обновляем атрибуцию
        attribution, created = ReferralAttribution.objects.update_or_create(
            anonymous_id=anonymous_id,
            product=product,
            defaults={
                'user': user,
                'referral_link': referral_link,
                'expires_at': timezone.now() + timedelta(days=program.attribution_window_days),
                'last_visit': visit
            }
        )
        
        logger.info(f"Attribution {'created' if created else 'updated'} for {anonymous_id}")
        
    except Exception as e:
        logger.error(f"Error creating attribution: {e}")

# Referral Rewards Management - только для админов
class ReferralRewardListView(generics.ListAPIView):
    serializer_class = ReferralRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralReward.objects.all()
        return ReferralReward.objects.filter(attributed_user=self.request.user)

class ReferralRewardUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralRewardUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralReward.objects.all()
        return ReferralReward.objects.filter(attributed_user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_referral_purchase(request):
    """Обрабатывает покупку с реферальной атрибуцией"""
    try:
        order_id = request.data.get('order_id')
        anonymous_id = request.data.get('anonymous_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Находим заказ
        from .models import Order
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Заказ не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Ищем атрибуцию для товаров в заказе
        attributions = []
        for item in order.items.all():
            attribution = ReferralAttribution.objects.filter(
                Q(anonymous_id=anonymous_id) | Q(user=request.user),
                product=item.product,
                expires_at__gt=timezone.now()
            ).first()
            
            if attribution:
                attributions.append((attribution, item))

        if not attributions:
            return Response(
                {'message': 'Нет активных реферальных атрибуций для этого заказа'}, 
                status=status.HTTP_200_OK
            )

        # Создаем вознаграждения
        rewards_created = []
        with transaction.atomic():
            for attribution, order_item in attributions:
                reward = create_referral_reward(attribution, order, order_item, request)
                if reward:
                    rewards_created.append(reward)

        return Response({
            'message': f'Создано {len(rewards_created)} вознаграждений',
            'rewards': ReferralRewardSerializer(rewards_created, many=True).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error processing referral purchase: {e}")
        return Response(
            {'error': 'Ошибка при обработке реферальной покупки'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def create_referral_reward(attribution, order, order_item, request):
    """Создает вознаграждение за реферальную покупку"""
    try:
        # Получаем настройки реферальной программы
        program = ReferralProgram.objects.filter(is_active=True).first()
        if not program:
            return None

        # Рассчитываем сумму вознаграждения
        order_amount = order_item.price * order_item.quantity
        reward_percentage = program.reward_percentage
        reward_amount = (order_amount * reward_percentage) / 100
        
        # Применяем максимальную сумму вознаграждения
        if program.max_reward_amount and reward_amount > program.max_reward_amount:
            reward_amount = program.max_reward_amount

        # Проверяем анти-фрод
        fraud_score = calculate_fraud_score(attribution, order, request)
        if fraud_score > 0.8:  # Высокий риск мошенничества
            logger.warning(f"High fraud score {fraud_score} for attribution {attribution.id}")
            return None

        # Создаем вознаграждение
        reward = ReferralReward.objects.create(
            referral_link=attribution.referral_link,
            order=order,
            attributed_user=attribution.referral_link.user,
            product=attribution.product,
            order_amount=order_amount,
            reward_percentage=reward_percentage,
            reward_amount=reward_amount,
            locked_amount=reward_amount,  # Блокируем всю сумму
            fraud_score=fraud_score,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Обновляем статистику реферальной ссылки
        attribution.referral_link.total_conversions += 1
        attribution.referral_link.total_rewards += reward_amount
        attribution.referral_link.save(update_fields=['total_conversions', 'total_rewards'])

        logger.info(f"Created referral reward {reward.id} for {reward_amount}")
        return reward
        
    except Exception as e:
        logger.error(f"Error creating referral reward: {e}")
        return None

def calculate_fraud_score(attribution, order, request):
    """Рассчитывает оценку риска мошенничества"""
    score = 0.0
    
    # Проверяем IP адрес
    if attribution.last_visit.ip_address != request.META.get('REMOTE_ADDR'):
        score += 0.3
    
    # Проверяем User-Agent
    if attribution.last_visit.user_agent != request.META.get('HTTP_USER_AGENT'):
        score += 0.2
    
    # Проверяем время между посещением и покупкой
    time_diff = timezone.now() - attribution.last_visit.visited_at
    if time_diff.total_seconds() < 60:  # Менее минуты
        score += 0.4
    elif time_diff.total_seconds() < 300:  # Менее 5 минут
        score += 0.2
    
    # Проверяем количество покупок с этой атрибуции
    recent_rewards = ReferralReward.objects.filter(
        referral_link=attribution.referral_link,
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    if recent_rewards > 5:
        score += 0.3
    
    return min(score, 1.0)

# Referral Payouts Management - только для админов
class ReferralPayoutListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReferralPayoutCreateSerializer
        return ReferralPayoutSerializer

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralPayout.objects.all()

# Product Management - только для админов
class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()  # Вендоры не могут видеть продукты

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Только админы могут создавать продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать продукты")
        serializer.save(vendor=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()

    def perform_update(self, serializer):
        # Только админы могут обновлять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять продукты")
        serializer.save()

    def perform_destroy(self, instance):
        # Только админы могут удалять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять продукты")
        instance.delete()

# Category Management - только для админов
class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

    def perform_create(self, serializer):
        # Только админы могут создавать категории
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать категории")
        serializer.save()

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

# Order Management - только для админов
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Обновляет статус заказа - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обновлять статус заказов'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        return Response({'message': 'Статус заказа обновлен'})
        
    except Order.DoesNotExist:
        return Response(
            {'error': 'Заказ не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Withdrawal Management - только для админов
class WithdrawalRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

class WithdrawalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    """Обрабатывает запрос на вывод средств - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обрабатывать запросы на вывод'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in WithdrawalRequest.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        withdrawal.status = new_status
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        
        if new_status == 'rejected':
            withdrawal.rejection_reason = request.data.get('rejection_reason', '')
        
        withdrawal.save()
        
        return Response({'message': 'Запрос на вывод обработан'})
        
    except WithdrawalRequest.DoesNotExist:
        return Response(
            {'error': 'Запрос на вывод не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )

        return ReferralPayout.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Только админы могут создавать запросы на выплату
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать запросы на выплату")
        serializer.save(user=self.request.user)

class ReferralPayoutDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralPayout.objects.all()

# Product Management - только для админов
class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()  # Вендоры не могут видеть продукты

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Только админы могут создавать продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать продукты")
        serializer.save(vendor=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()

    def perform_update(self, serializer):
        # Только админы могут обновлять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять продукты")
        serializer.save()

    def perform_destroy(self, instance):
        # Только админы могут удалять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять продукты")
        instance.delete()

# Category Management - только для админов
class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

    def perform_create(self, serializer):
        # Только админы могут создавать категории
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать категории")
        serializer.save()

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

# Order Management - только для админов
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Обновляет статус заказа - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обновлять статус заказов'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        return Response({'message': 'Статус заказа обновлен'})
        
    except Order.DoesNotExist:
        return Response(
            {'error': 'Заказ не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Withdrawal Management - только для админов
class WithdrawalRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

class WithdrawalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    """Обрабатывает запрос на вывод средств - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обрабатывать запросы на вывод'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in WithdrawalRequest.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        withdrawal.status = new_status
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        
        if new_status == 'rejected':
            withdrawal.rejection_reason = request.data.get('rejection_reason', '')
        
        withdrawal.save()
        
        return Response({'message': 'Запрос на вывод обработан'})
        
    except WithdrawalRequest.DoesNotExist:
        return Response(
            {'error': 'Запрос на вывод не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )

        return ReferralPayout.objects.filter(user=self.request.user)

# Referral Balance - только для админов
class ReferralBalanceView(generics.RetrieveAPIView):
    serializer_class = ReferralBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут просматривать баланс")
        balance, created = ReferralBalance.objects.get_or_create(user=self.request.user)
        balance.update_balance()  # Обновляем баланс
        return balance

# Statistics - только для админов
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def referral_stats(request):
    """Получает статистику реферальной программы для пользователя"""
    try:
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Только администраторы могут просматривать статистику'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        user = request.user
        
        # Статистика по ссылкам
        links = ReferralLink.objects.filter(user=user)
        total_links = links.count()
        total_clicks = links.aggregate(Sum('total_clicks'))['total_clicks__sum'] or 0
        total_conversions = links.aggregate(Sum('total_conversions'))['total_conversions__sum'] or 0
        total_rewards = links.aggregate(Sum('total_rewards'))['total_rewards__sum'] or 0
        
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        average_reward = (total_rewards / total_conversions) if total_conversions > 0 else 0
        
        stats = {
            'total_links': total_links,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_rewards': total_rewards,
            'conversion_rate': round(conversion_rate, 2),
            'average_reward': round(average_reward, 2)
        }
        
        serializer = ReferralStatsSerializer(stats)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting referral stats: {e}")
        return Response(
            {'error': 'Ошибка при получении статистики'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Admin views for managing rewards
class AdminReferralRewardListView(generics.ListAPIView):
    serializer_class = ReferralRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not request.user.is_staff:
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()

class AdminReferralRewardUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralRewardUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not request.user.is_staff:
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()

class AdminReferralPayoutListView(generics.ListAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not request.user.is_staff:
            return ReferralPayout.objects.none()
        return ReferralPayout.objects.all()

# Product Management - только для админов
class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()  # Вендоры не могут видеть продукты

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Только админы могут создавать продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать продукты")
        serializer.save(vendor=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()

    def perform_update(self, serializer):
        # Только админы могут обновлять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять продукты")
        serializer.save()

    def perform_destroy(self, instance):
        # Только админы могут удалять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять продукты")
        instance.delete()

# Category Management - только для админов
class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

    def perform_create(self, serializer):
        # Только админы могут создавать категории
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать категории")
        serializer.save()

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

# Order Management - только для админов
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Обновляет статус заказа - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обновлять статус заказов'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        return Response({'message': 'Статус заказа обновлен'})
        
    except Order.DoesNotExist:
        return Response(
            {'error': 'Заказ не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Withdrawal Management - только для админов
class WithdrawalRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

class WithdrawalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    """Обрабатывает запрос на вывод средств - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обрабатывать запросы на вывод'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in WithdrawalRequest.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        withdrawal.status = new_status
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        
        if new_status == 'rejected':
            withdrawal.rejection_reason = request.data.get('rejection_reason', '')
        
        withdrawal.save()
        
        return Response({'message': 'Запрос на вывод обработан'})
        
    except WithdrawalRequest.DoesNotExist:
        return Response(
            {'error': 'Запрос на вывод не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


class AdminReferralPayoutUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not request.user.is_staff:
            return ReferralPayout.objects.none()
        return ReferralPayout.objects.all()

# Product Management - только для админов
class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()  # Вендоры не могут видеть продукты

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Только админы могут создавать продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать продукты")
        serializer.save(vendor=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        return Product.objects.none()

    def perform_update(self, serializer):
        # Только админы могут обновлять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять продукты")
        serializer.save()

    def perform_destroy(self, instance):
        # Только админы могут удалять продукты
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять продукты")
        instance.delete()

# Category Management - только для админов
class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

    def perform_create(self, serializer):
        # Только админы могут создавать категории
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать категории")
        serializer.save()

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Category.objects.all()
        return Category.objects.none()

# Order Management - только для админов
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Обновляет статус заказа - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обновлять статус заказов'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        return Response({'message': 'Статус заказа обновлен'})
        
    except Order.DoesNotExist:
        return Response(
            {'error': 'Заказ не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Withdrawal Management - только для админов
class WithdrawalRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

class WithdrawalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    """Обрабатывает запрос на вывод средств - только для админов"""
    if request.user.role != 'superadmin':
        return Response(
            {'error': 'Только администраторы могут обрабатывать запросы на вывод'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in WithdrawalRequest.STATUS_CHOICES]:
            return Response(
                {'error': 'Неверный статус'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        withdrawal.status = new_status
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        
        if new_status == 'rejected':
            withdrawal.rejection_reason = request.data.get('rejection_reason', '')
        
        withdrawal.save()
        
        return Response({'message': 'Запрос на вывод обработан'})
        
    except WithdrawalRequest.DoesNotExist:
        return Response(
            {'error': 'Запрос на вывод не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# User Profile Management
@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Получение и обновление профиля пользователя"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Product Images Management - только для админов
class ProductImageListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ProductImage.objects.all()
        return ProductImage.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'superadmin':
            raise PermissionDenied("Только администраторы могут создавать изображения продуктов")
        serializer.save()

class ProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ProductImage.objects.all()
        return ProductImage.objects.none()

    def perform_destroy(self, instance):
        if self.request.user.role != 'superadmin':
            raise PermissionDenied("Только администраторы могут удалять изображения продуктов")
        instance.delete()
