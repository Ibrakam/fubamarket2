from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
import logging
import time

from .models import (
    ReferralProgram, ReferralLink, ReferralVisit, ReferralAttribution,
    ReferralReward, ReferralPayout, ReferralBalance, User, Product,
    Category, Order, WithdrawalRequest, ProductImage, Review
)
from .serializers import (
    ReferralProgramSerializer, ReferralLinkSerializer, ReferralLinkCreateSerializer,
    ReferralRewardSerializer, ReferralRewardUpdateSerializer, ReferralPayoutSerializer,
    ReferralPayoutCreateSerializer, ReferralBalanceSerializer, ReferralLinkStatsSerializer,
    ProductSerializer, ProductCreateSerializer, CategorySerializer, OrderSerializer,
    WithdrawalRequestSerializer, UserSerializer, ProductImageSerializer, ProductImageCreateSerializer, ReviewSerializer, ReviewCreateSerializer
)
from .referral_utils import generate_referral_code

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


# Admin Dashboard
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard(request):
    """Админская панель с общей статистикой"""
    try:
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Только администраторы могут просматривать панель'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Общая статистика
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_withdrawals = WithdrawalRequest.objects.count()
        
        # Статистика по ролям
        admin_count = User.objects.filter(role='superadmin').count()
        vendor_count = User.objects.filter(role='vendor').count()
        ops_count = User.objects.filter(role='ops').count()
        
        # Статистика по статусам заказов
        pending_orders = Order.objects.filter(status='pending').count()
        completed_orders = Order.objects.filter(status='completed').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        
        # Статистика по выводам
        pending_withdrawals = WithdrawalRequest.objects.filter(status='pending').count()
        approved_withdrawals = WithdrawalRequest.objects.filter(status='approved').count()
        rejected_withdrawals = WithdrawalRequest.objects.filter(status='rejected').count()

        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_withdrawals': total_withdrawals,
            'user_stats': {
                'admins': admin_count,
                'vendors': vendor_count,
                'ops': ops_count
            },
            'order_stats': {
                'pending': pending_orders,
                'completed': completed_orders,
                'cancelled': cancelled_orders
            },
            'withdrawal_stats': {
                'pending': pending_withdrawals,
                'approved': approved_withdrawals,
                'rejected': rejected_withdrawals
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f'Error fetching admin dashboard: {str(e)}')
        return Response(
            {'error': 'Ошибка при загрузке панели администратора'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Admin User Management
class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return User.objects.none()
        return User.objects.all()


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return User.objects.none()
        return User.objects.all()


class AdminUserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise permissions.PermissionDenied("Только администраторы могут создавать пользователей")
        serializer.save()


# Admin Product Management
class AdminProductListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return Product.objects.none()
        return Product.objects.all()

    def get_serializer_class(self):
        # GET: список продуктов с полными полями
        if self.request.method == 'GET':
            return ProductSerializer
        # POST: создание продукта (назначаем vendor = request.user)
        return ProductCreateSerializer

    def perform_create(self, serializer):
        # Только супер-админ может создавать из этого эндпоинта
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied('Access denied')
        serializer.save(vendor=self.request.user)

    def create(self, request, *args, **kwargs):
        # Используем ProductCreateSerializer для валидации,
        # но возвращаем в ответе полное представление ProductSerializer,
        # чтобы фронт сразу получил все ожидаемые поля
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = Product.objects.get(pk=serializer.instance.pk)
        full_serializer = ProductSerializer(instance, context={'request': request})
        headers = self.get_success_headers(full_serializer.data)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return Product.objects.none()
        return Product.objects.all()

    def update(self, request, *args, **kwargs):
        try:
            # Логируем входящие данные для отладки
            print(f"AdminProductDetailView update - Request data: {request.data}")
            print(f"AdminProductDetailView update - User: {request.user}")
            print(f"AdminProductDetailView update - User role: {request.user.role}")
            
            # Получаем объект
            instance = self.get_object()
            print(f"AdminProductDetailView update - Instance: {instance}")
            
            # Создаем сериализатор
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            
            if serializer.is_valid():
                print("AdminProductDetailView update - Serializer is valid")
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                print(f"AdminProductDetailView update - Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"AdminProductDetailView update - Exception: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Admin Order Management
class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return Order.objects.none()
        return Order.objects.all()


class AdminOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return Order.objects.none()
        return Order.objects.all()


# Admin Withdrawal Management
class AdminWithdrawalListView(generics.ListAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return WithdrawalRequest.objects.none()
        return WithdrawalRequest.objects.all()


class AdminWithdrawalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return WithdrawalRequest.objects.none()
        return WithdrawalRequest.objects.all()


# Admin views for managing rewards
class AdminReferralRewardListView(generics.ListAPIView):
    serializer_class = ReferralRewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()


class AdminReferralRewardUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralRewardUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return ReferralReward.objects.none()
        return ReferralReward.objects.all()


class AdminReferralPayoutListView(generics.ListAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
            return ReferralPayout.objects.none()
        return ReferralPayout.objects.all()


class AdminReferralPayoutUpdateView(generics.UpdateAPIView):
    serializer_class = ReferralPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'superadmin':
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
    permission_classes = [permissions.AllowAny]  # Public access for reading

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

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
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# API endpoint для добавления дефолтных фотографий
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_default_photos(request):
    """Добавляет дефолтные фотографии к продуктам без фотографий"""
    if request.user.role != 'superadmin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Получаем продукты без фотографий
        products_without_photos = Product.objects.filter(is_active=True).exclude(
            id__in=ProductImage.objects.values_list('product_id', flat=True)
        )
        
        added_count = 0
        
        # Дефолтные изображения по категориям
        default_images = {
            'Electronics': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            'Home & Garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        }
        
        for product in products_without_photos:
            # Определяем категорию
            category_name = product.category.name if product.category else 'Electronics'
            default_image_url = default_images.get(category_name, default_images['Electronics'])
            
            # Создаем ProductImage с URL
            photo = ProductImage.objects.create(
                product=product,
                alt=f"Default photo for {product.title}",
                sort_order=0,
                image=default_image_url
            )
            
            added_count += 1
        
        return Response({
            'message': f'Added {added_count} default photos to products',
            'added_count': added_count
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Reviews Views
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.all()


class LatestReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.all().order_by('-created_at')[:10]


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

        if request.user.role not in ['superadmin', 'ops']:
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

        if request.user.role not in ['superadmin', 'ops']:
            return Response(
                {'error': 'Недостаточно прав'},
                status=status.HTTP_403_FORBIDDEN
            )

        if action == 'approve':
            withdrawal.status = 'approved'
            withdrawal.processed_by = request.user
            withdrawal.processed_at = timezone.now()
            withdrawal.save()

            return Response({
                'success': True,
                'message': 'Запрос на вывод одобрен'
            }, status=status.HTTP_200_OK)

        elif action == 'reject':
            rejection_reason = request.data.get('reason', '')
            withdrawal.status = 'rejected'
            withdrawal.processed_by = request.user
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductImageCreateSerializer
        return ProductImageSerializer

    def create(self, request, *args, **kwargs):
        try:
            print(f"ProductImageListCreateView create - Request data: {request.data}")
            print(f"ProductImageListCreateView create - Files: {request.FILES}")
            print(f"ProductImageListCreateView create - User: {request.user}")
            print(f"ProductImageListCreateView create - User role: {request.user.role}")
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"ProductImageListCreateView create - Exception: {str(e)}")
            raise e

    def perform_create(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут загружать изображения")
        print(f"ProductImageListCreateView perform_create - Saving with data: {serializer.validated_data}")
        print(f"ProductImageListCreateView perform_create - Files in request: {self.request.FILES}")
        serializer.save()


class ProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        try:
            print(f"ProductImageDetailView destroy - Request: {request}")
            print(f"ProductImageDetailView destroy - User: {request.user}")
            print(f"ProductImageDetailView destroy - User role: {request.user.role}")
            print(f"ProductImageDetailView destroy - PK: {kwargs.get('pk')}")
            
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            print(f"ProductImageDetailView destroy - Exception: {str(e)}")
            raise e

    def perform_update(self, serializer):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут обновлять изображения")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'superadmin':
            raise permissions.PermissionDenied("Только администраторы могут удалять изображения")
        print(f"ProductImageDetailView perform_destroy - Deleting instance: {instance}")
        instance.delete()


# Review Management
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]  # Allow public access for reading

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id).select_related('user', 'product')
        return Review.objects.all().select_related('user', 'product')

    def perform_create(self, serializer):
        # For now, we'll create reviews without authentication
        # In production, you might want to require authentication
        serializer.save()


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]  # Allow public access for reading


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def product_reviews(request, product_id):
    """Get reviews for a specific product"""
    try:
        reviews = Review.objects.filter(product_id=product_id).select_related('user', 'product')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f'Error fetching product reviews: {str(e)}')
        return Response(
            {'error': 'Ошибка при загрузке отзывов'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_review(request):
    """Create a new review"""
    try:
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            # For now, we'll create reviews without user authentication
            # In production, you might want to require authentication
            review = serializer.save()
            response_serializer = ReviewSerializer(review)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Error creating review: {str(e)}')
        return Response(
            {'error': 'Ошибка при создании отзыва'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_referral_link(request):
    """Create a new referral link"""
    try:
        product_id = request.data.get('product_id')

        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем, существует ли продукт
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем, существует ли уже реферальная ссылка для этого пользователя и продукта
        referral_link, created = ReferralLink.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'code': generate_referral_code()}
        )
        
        if not created:
            logger.info(f'Using existing referral link for user {request.user.id} and product {product_id}')

        return Response({
            'id': referral_link.id,
            'referral_code': referral_link.code,
            'product_title': product.title,
            'product_price': float(product.price_uzs),
            'created_at': referral_link.created_at
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error creating referral link: {str(e)}')
        import traceback
        logger.error(f'Traceback: {traceback.format_exc()}')
        return Response(
            {'error': f'Ошибка при создании реферальной ссылки: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_referral_visit(request):
    """Track a referral visit"""
    try:
        referral_code = request.data.get('referral_code')
        product_id = request.data.get('product_id')
        page_url = request.data.get('page_url')
        user_agent = request.data.get('user_agent')
        
        # UTM метки
        utm_source = request.data.get('utm_source')
        utm_medium = request.data.get('utm_medium')
        utm_campaign = request.data.get('utm_campaign')
        utm_term = request.data.get('utm_term')
        utm_content = request.data.get('utm_content')
        first_visit = request.data.get('first_visit')
        current_visit = request.data.get('current_visit')
        
        if not referral_code:
            return Response(
                {'error': 'referral_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Получаем IP адрес
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))

        # Ищем реферальную ссылку
        try:
            referral_link = ReferralLink.objects.get(code=referral_code)
        except ReferralLink.DoesNotExist:
            return Response(
                {'error': 'Referral link not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Создаем запись о посещении с UTM метками
        visit = ReferralVisit.objects.create(
            referral_link=referral_link,
            anonymous_id=f"anon_{ip_address}_{int(time.time())}",  # Временный ID для анонимного пользователя
            ip_address=ip_address,
            user_agent=user_agent,
            page_url=page_url,
            product_id=product_id,
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign,
            utm_term=utm_term,
            utm_content=utm_content
        )

        # Обновляем статистику реферальной ссылки
        referral_link.total_clicks += 1
        referral_link.save(update_fields=['total_clicks'])

        logger.info(f'Referral visit tracked: {referral_code} -> {product_id} (UTM: {utm_source}/{utm_medium}/{utm_campaign})')

        return Response({
            'success': True,
            'visit_id': visit.id,
            'utm_tracked': {
                'utm_source': utm_source,
                'utm_medium': utm_medium,
                'utm_campaign': utm_campaign,
                'utm_term': utm_term,
                'utm_content': utm_content
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error tracking referral visit: {str(e)}')
        return Response(
            {'error': 'Ошибка при отслеживании реферального перехода'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
