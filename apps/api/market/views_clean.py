from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Q
from django.db import transaction
from datetime import timedelta
from rest_framework.exceptions import PermissionDenied
import logging

from .models import (
    ReferralProgram, ReferralLink, ReferralVisit, ReferralAttribution,
    ReferralReward, ReferralPayout, ReferralBalance, User, Product, 
    Category, Order, OrderItem, WithdrawalRequest, ProductImage
)
from .serializers import (
    ReferralProgramSerializer, ReferralLinkSerializer, ReferralLinkCreateSerializer,
    ReferralVisitSerializer, ReferralAttributionSerializer, ReferralRewardSerializer,
    ReferralRewardUpdateSerializer, ReferralPayoutSerializer, ReferralPayoutCreateSerializer,
    ReferralBalanceSerializer, ReferralStatsSerializer, ReferralLinkStatsSerializer,
    ProductSerializer, ProductCreateSerializer, CategorySerializer, OrderSerializer, 
    WithdrawalRequestSerializer, UserSerializer, ProductImageSerializer
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


# Referral Links Management
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


# Visit Tracking (public endpoint)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_referral_visit(request):
    """Отслеживание перехода по реферальной ссылке"""
    try:
        referral_code = request.data.get('referral_code')
        anonymous_id = request.data.get('anonymous_id')
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        if not referral_code or not anonymous_id:
            return Response(
                {'error': 'referral_code и anonymous_id обязательны'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            referral_link = ReferralLink.objects.get(code=referral_code, is_active=True)
        except ReferralLink.DoesNotExist:
            return Response(
                {'error': 'Реферальная ссылка не найдена'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Создаем запись о переходе
        visit = ReferralVisit.objects.create(
            referral_link=referral_link,
            anonymous_id=anonymous_id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        referral_link.total_clicks += 1
        referral_link.save()

        return Response({
            'success': True,
            'message': 'Переход успешно отслежен',
            'visit_id': visit.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error tracking visit: {str(e)}')
        return Response(
            {'error': 'Ошибка при отслеживании перехода'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_referral_conversion(request):
    """Отслеживание конверсии по реферальной ссылке"""
    try:
        referral_code = request.data.get('referral_code')
        anonymous_id = request.data.get('anonymous_id')
        product_id = request.data.get('product_id')
        order_id = request.data.get('order_id')
        amount = request.data.get('amount', 0)

        if not referral_code or not anonymous_id:
            return Response(
                {'error': 'referral_code и anonymous_id обязательны'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            referral_link = ReferralLink.objects.get(code=referral_code, is_active=True)
        except ReferralLink.DoesNotExist:
            return Response(
                {'error': 'Реферальная ссылка не найдена'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        attribution, created = ReferralAttribution.objects.get_or_create(
            referral_link=referral_link,
            anonymous_id=anonymous_id,
            defaults={
                'converted': True,
                'conversion_date': timezone.now(),
                'product_id': product_id,
                'order_id': order_id,
                'conversion_amount': amount
            }
        )

        if not created:
            attribution.converted = True
            attribution.conversion_date = timezone.now()
            attribution.product_id = product_id
            attribution.order_id = order_id
            attribution.conversion_amount = amount
            attribution.save()

        referral_link.total_conversions += 1
        referral_link.total_rewards += float(amount) * (referral_link.product.referral_commission / 100) if referral_link.product else 0
        referral_link.save()

        if referral_link.user and referral_link.product:
            reward_amount = float(amount) * (referral_link.product.referral_commission / 100)
            ReferralReward.objects.create(
                user=referral_link.user,
                referral_link=referral_link,
                product=referral_link.product,
                amount=reward_amount,
                status='pending'
            )

        return Response({
            'success': True,
            'message': 'Конверсия успешно отслежена',
            'attribution_id': attribution.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error tracking conversion: {str(e)}')
        return Response(
            {'error': 'Ошибка при отслеживании конверсии'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Referral Rewards
class ReferralRewardListView(generics.ListAPIView):
    serializer_class = ReferralRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReferralReward.objects.filter(user=self.request.user)


class ReferralRewardUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralRewardUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReferralReward.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def process_referral_purchase(request):
    """Обработка покупки по реферальной ссылке"""
    try:
        referral_code = request.data.get('referral_code')
        anonymous_id = request.data.get('anonymous_id')
        product_id = request.data.get('product_id')
        order_id = request.data.get('order_id')
        amount = request.data.get('amount', 0)

        if not referral_code or not anonymous_id:
            return Response(
                {'error': 'referral_code и anonymous_id обязательны'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            referral_link = ReferralLink.objects.get(code=referral_code, is_active=True)
        except ReferralLink.DoesNotExist:
            return Response(
                {'error': 'Реферальная ссылка не найдена'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Создаем атрибуцию
        attribution, created = ReferralAttribution.objects.get_or_create(
            referral_link=referral_link,
            anonymous_id=anonymous_id,
            defaults={
                'converted': True,
                'conversion_date': timezone.now(),
                'product_id': product_id,
                'order_id': order_id,
                'conversion_amount': amount
            }
        )

        if not created:
            attribution.converted = True
            attribution.conversion_date = timezone.now()
            attribution.product_id = product_id
            attribution.order_id = order_id
            attribution.conversion_amount = amount
            attribution.save()

        # Обновляем статистику ссылки
        referral_link.total_conversions += 1
        referral_link.total_rewards += float(amount) * (referral_link.product.referral_commission / 100) if referral_link.product else 0
        referral_link.save()

        # Создаем вознаграждение
        if referral_link.user and referral_link.product:
            reward_amount = float(amount) * (referral_link.product.referral_commission / 100)
            ReferralReward.objects.create(
                user=referral_link.user,
                referral_link=referral_link,
                product=referral_link.product,
                amount=reward_amount,
                status='pending'
            )

            # Обновляем баланс пользователя
            balance, created = ReferralBalance.objects.get_or_create(
                user=referral_link.user,
                defaults={
                    'total_earned': 0,
                    'locked_amount': 0,
                    'available_amount': 0,
                    'total_paid_out': 0
                }
            )
            balance.total_earned += reward_amount
            balance.available_amount += reward_amount
            balance.save()

        return Response({
            'success': True,
            'message': 'Покупка успешно обработана',
            'attribution_id': attribution.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error processing purchase: {str(e)}')
        return Response(
            {'error': 'Ошибка при обработке покупки'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Payout Management
class ReferralPayoutListCreateView(generics.ListCreateAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralPayout.objects.all()
        return ReferralPayout.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReferralPayoutCreateSerializer
        return ReferralPayoutSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReferralPayoutDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return ReferralPayout.objects.all()
        return ReferralPayout.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_payout(request):
    """Запрос на выплату реферальных вознаграждений"""
    try:
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'bank_transfer')
        account_details = request.data.get('account_details', '')

        if not amount or float(amount) <= 0:
            return Response(
                {'error': 'Сумма должна быть больше 0'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            balance = ReferralBalance.objects.get(user=request.user)
            if balance.available_balance < float(amount):
                return Response(
                    {'error': 'Недостаточно средств на балансе'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ReferralBalance.DoesNotExist:
            return Response(
                {'error': 'Баланс не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        payout = ReferralPayout.objects.create(
            user=request.user,
            amount=amount,
            payment_method=payment_method,
            account_details=account_details,
            status='pending'
        )

        return Response({
            'success': True,
            'message': 'Запрос на выплату создан',
            'payout_id': payout.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error creating payout request: {str(e)}')
        return Response(
            {'error': 'Ошибка при создании запроса на выплату'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_payout(request, pk):
    """Одобрение выплаты (только для админов)"""
    try:
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Недостаточно прав'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        payout = get_object_or_404(ReferralPayout, pk=pk)

        if payout.status != 'pending':
            return Response(
                {'error': 'Выплата уже обработана'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        payout.status = 'approved'
        payout.processed_by = request.user
        payout.processed_at = timezone.now()
        payout.save()

        balance = ReferralBalance.objects.get(user=payout.user)
        balance.available_balance -= payout.amount
        balance.paid_balance += payout.amount
        balance.save()

        return Response({
            'success': True,
            'message': 'Выплата одобрена'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error approving payout: {str(e)}')
        return Response(
            {'error': 'Ошибка при одобрении выплаты'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_payout(request, pk):
    """Отклонение выплаты (только для админов)"""
    try:
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Недостаточно прав'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        payout = get_object_or_404(ReferralPayout, pk=pk)
        rejection_reason = request.data.get('reason', '')

        if payout.status != 'pending':
            return Response(
                {'error': 'Выплата уже обработана'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        payout.status = 'rejected'
        payout.processed_by = request.user
        payout.processed_at = timezone.now()
        payout.rejection_reason = rejection_reason
        payout.save()

        return Response({
            'success': True,
            'message': 'Выплата отклонена'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error rejecting payout: {str(e)}')
        return Response(
            {'error': 'Ошибка при отклонении выплаты'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Balance Management
class ReferralBalanceView(generics.RetrieveAPIView):
    serializer_class = ReferralBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        balance, created = ReferralBalance.objects.get_or_create(
            user=self.request.user,
            defaults={
                'total_earned': 0,
                'locked_amount': 0,
                'available_amount': 0,
                'total_paid_out': 0
            }
        )
        return balance


# Statistics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def referral_stats(request):
    """Общая статистика реферальной программы (только для админов)"""
    try:
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Только администраторы могут просматривать статистику'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        total_links = ReferralLink.objects.count()
        active_links = ReferralLink.objects.filter(is_active=True).count()
        total_clicks = ReferralVisit.objects.count()
        total_conversions = ReferralAttribution.objects.filter(converted=True).count()
        total_rewards = ReferralReward.objects.aggregate(
            total=Sum('amount')
        )['total'] or 0

        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0

        return Response({
            'total_links': total_links,
            'active_links': active_links,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_rewards': float(total_rewards),
            'conversion_rate': conversion_rate
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error fetching stats: {str(e)}')
        return Response(
            {'error': 'Ошибка при получении статистики'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_referral_stats(request):
    """Статистика реферальной программы для пользователя"""
    try:
        user = request.user

        # Простая статистика без сложных запросов
        total_links = 0
        active_links = 0
        total_clicks = 0
        total_conversions = 0
        total_rewards = 0.0
        conversion_rate = 0.0
        monthly_rewards = 0.0
        weekly_rewards = 0.0
        daily_rewards = 0.0
        top_products = []
        recent_activity = []

        try:
            # Получаем реферальные ссылки пользователя
            referral_links = ReferralLink.objects.filter(user=user)
            total_links = referral_links.count()
            active_links = referral_links.filter(is_active=True).count()
        except Exception:
            pass

        try:
            # Статистика по переходам
            total_clicks = ReferralVisit.objects.filter(referral_link__user=user).count()
        except Exception:
            pass

        try:
            # Статистика по конверсиям
            total_conversions = ReferralAttribution.objects.filter(
                referral_link__user=user, 
                converted=True
            ).count()
        except Exception:
            pass

        try:
            # Статистика по вознаграждениям
            total_rewards = ReferralReward.objects.filter(user=user).aggregate(
                total=Sum('amount')
            )['total'] or 0
            total_rewards = float(total_rewards)
        except Exception:
            pass

        # Конверсия
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0

        return Response({
            'total_links': total_links,
            'active_links': active_links,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_rewards': total_rewards,
            'conversion_rate': conversion_rate,
            'monthly_rewards': monthly_rewards,
            'weekly_rewards': weekly_rewards,
            'daily_rewards': daily_rewards,
            'top_products': top_products,
            'recent_activity': recent_activity
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error fetching user referral stats: {str(e)}')
        return Response(
            {'error': f'Ошибка при загрузке статистики: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def referral_analytics(request):
    """Детальная аналитика реферальной программы"""
    try:
        time_range = request.GET.get('time_range', '30d')

        if time_range == '7d':
            days = 7
        elif time_range == '30d':
            days = 30
        elif time_range == '90d':
            days = 90
        elif time_range == '1y':
            days = 365
        else:
            days = 30

        start_date = timezone.now() - timedelta(days=days)

        visits = ReferralVisit.objects.filter(visited_at__gte=start_date)
        attributions = ReferralAttribution.objects.filter(created_at__gte=start_date, converted=True)
        rewards = ReferralReward.objects.filter(created_at__gte=start_date)

        total_clicks = visits.count()
        total_conversions = attributions.count()
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        total_revenue = sum([float(attr.conversion_amount or 0) for attr in attributions])
        total_commission = sum([float(reward.amount) for reward in rewards])
        avg_order_value = total_revenue / total_conversions if total_conversions > 0 else 0

        daily_stats = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            day_visits = visits.filter(visited_at__date=date.date())
            day_attributions = attributions.filter(created_at__date=date.date())
            day_rewards = rewards.filter(created_at__date=date.date())

            daily_stats.append({
                'date': date.date().isoformat(),
                'clicks': day_visits.count(),
                'conversions': day_attributions.count(),
                'revenue': sum([float(attr.conversion_amount or 0) for attr in day_attributions]),
                'commission': sum([float(reward.amount) for reward in day_rewards])
            })

        product_stats = {}
        for attr in attributions:
            if attr.product:
                if attr.product.id not in product_stats:
                    product_stats[attr.product.id] = {
                        'id': attr.product.id,
                        'title': attr.product.title,
                        'clicks': 0,
                        'conversions': 0,
                        'revenue': 0,
                        'commission': 0
                    }
                product_stats[attr.product.id]['conversions'] += 1
                product_stats[attr.product.id]['revenue'] += float(attr.conversion_amount or 0)

        for visit in visits:
            if visit.referral_link.product:
                product_id = visit.referral_link.product.id
                if product_id in product_stats:
                    product_stats[product_id]['clicks'] += 1

        for reward in rewards:
            if reward.product and reward.product.id in product_stats:
                product_stats[reward.product.id]['commission'] += float(reward.amount)

        top_products = sorted(
            product_stats.values(),
            key=lambda x: x['conversions'],
            reverse=True
        )[:10]

        for product in top_products:
            product['conversion_rate'] = (product['conversions'] / product['clicks'] * 100) if product['clicks'] > 0 else 0

        referrer_stats = {}
        for attr in attributions:
            if attr.referral_link.user:
                user_id = attr.referral_link.user.id
                if user_id not in referrer_stats:
                    referrer_stats[user_id] = {
                        'id': user_id,
                        'username': attr.referral_link.user.username,
                        'clicks': 0,
                        'conversions': 0,
                        'revenue': 0,
                        'commission': 0
                    }
                referrer_stats[user_id]['conversions'] += 1
                referrer_stats[user_id]['revenue'] += float(attr.conversion_amount or 0)

        for visit in visits:
            if visit.referral_link.user:
                user_id = visit.referral_link.user.id
                if user_id in referrer_stats:
                    referrer_stats[user_id]['clicks'] += 1

        for reward in rewards:
            if reward.user and reward.user.id in referrer_stats:
                referrer_stats[reward.user.id]['commission'] += float(reward.amount)

        top_referrers = sorted(
            referrer_stats.values(),
            key=lambda x: x['conversions'],
            reverse=True
        )[:10]

        conversion_funnel = {
            'visitors': visits.values('anonymous_id').distinct().count(),
            'clicks': total_clicks,
            'conversions': total_conversions,
            'revenue': total_revenue
        }

        return Response({
            'overview': {
                'total_clicks': total_clicks,
                'total_conversions': total_conversions,
                'conversion_rate': conversion_rate,
                'total_revenue': total_revenue,
                'total_commission': total_commission,
                'avg_order_value': avg_order_value
            },
            'daily_stats': daily_stats,
            'top_products': top_products,
            'top_referrers': top_referrers,
            'conversion_funnel': conversion_funnel
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error fetching analytics: {str(e)}')
        return Response(
            {'error': 'Ошибка при загрузке аналитики'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Admin views for managing rewards
class AdminReferralRewardListView(generics.ListAPIView):
    serializer_class = ReferralRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()


class AdminReferralRewardUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralRewardUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()


class AdminReferralPayoutListView(generics.ListAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return ReferralPayout.objects.none()
        return ReferralPayout.objects.all()


class AdminReferralPayoutUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return ReferralPayout.objects.none()
        return ReferralPayout.objects.all()


# Product Management
class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # Public access for reading

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Only admins can create products
        if not self.request.user.is_authenticated or self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать продукты")
        serializer.save(vendor=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins can see all products, vendors only their own
        if self.request.user.role == 'superadmin':
            return Product.objects.all()
        elif self.request.user.role == 'vendor':
            return Product.objects.filter(vendor=self.request.user)
        return Product.objects.none()

    def perform_update(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять продукты")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять продукты")
        instance.delete()


# Featured Products View
class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by('-total_sales')[:8]


# Reviews Views
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer  # TODO: Create ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # TODO: Implement Review model and return actual queryset
        return Product.objects.none()


class LatestReviewsView(generics.ListAPIView):
    serializer_class = ProductSerializer  # TODO: Create ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # TODO: Implement Review model and return actual queryset
        return Product.objects.none()


# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Логин пользователя"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username и password обязательны'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    from django.contrib.auth import authenticate
    from rest_framework_simplejwt.tokens import RefreshToken

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Неверные учетные данные'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'error': 'Аккаунт деактивирован'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    serializer = UserSerializer(user)

    return Response({
        'access': access_token,
        'refresh': str(refresh),
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Регистрация нового пользователя"""
    from django.contrib.auth import get_user_model
    from rest_framework_simplejwt.tokens import RefreshToken

    User = get_user_model()

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    password2 = request.data.get('password2')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    phone = request.data.get('phone', '')
    referral_code = request.data.get('referral_code', '')

    if not username or not email or not password:
        return Response(
            {'error': 'Username, email и password обязательны'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != password2:
        return Response(
            {'error': 'Пароли не совпадают'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Пользователь с таким username уже существует'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Пользователь с таким email уже существует'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role='vendor'
        )

        if referral_code:
            pass  # TODO: Add referral code processing logic

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        serializer = UserSerializer(user)

        return Response({
            'access': access_token,
            'refresh': str(refresh),
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Ошибка при создании пользователя: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Получение профиля пользователя"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# Category Management
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут создавать категории")
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять категории")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять категории")
        instance.delete()


# Order Management
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Обновление статуса заказа"""
    try:
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response(
                {'error': 'Статус обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if self.request.user.role not in ['superadmin', 'ops']:
            return Response(
                {'error': 'Недостаточно прав'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        order.status = new_status
        order.save()

        return Response({
            'success': True,
            'message': 'Статус заказа обновлен'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error updating order status: {str(e)}')
        return Response(
            {'error': 'Ошибка при обновлении статуса заказа'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Withdrawal Management
class WithdrawalRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WithdrawalRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'superadmin':
            return WithdrawalRequest.objects.all()
        return WithdrawalRequest.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_withdrawal(request, withdrawal_id):
    """Обработка запроса на вывод средств"""
    try:
        withdrawal = get_object_or_404(WithdrawalRequest, id=withdrawal_id)
        action = request.data.get('action')  # 'approve' or 'reject'

        if not action:
            return Response(
                {'error': 'Действие обязательно'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if self.request.user.role not in ['superadmin', 'ops']:
            return Response(
                {'error': 'Недостаточно прав'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if action == 'approve':
            withdrawal.status = 'approved'
            withdrawal.processed_by = self.request.user
            withdrawal.processed_at = timezone.now()
            withdrawal.save()

            return Response({
                'success': True,
                'message': 'Запрос на вывод одобрен'
            }, status=status.HTTP_200_OK)

        elif action == 'reject':
            rejection_reason = request.data.get('reason', '')
            withdrawal.status = 'rejected'
            withdrawal.processed_by = self.request.user
            withdrawal.processed_at = timezone.now()
            withdrawal.rejection_reason = rejection_reason
            withdrawal.save()

            return Response({
                'success': True,
                'message': 'Запрос на вывод отклонен'
            }, status=status.HTTP_200_OK)

        else:
            return Response(
                {'error': 'Неверное действие'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f'Error processing withdrawal: {str(e)}')
        return Response(
            {'error': 'Ошибка при обработке запроса на вывод'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Product Images
class ProductImageListCreateView(generics.ListCreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут загружать изображения")
        serializer.save()


class ProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять изображения")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять изображения")
        instance.delete()








