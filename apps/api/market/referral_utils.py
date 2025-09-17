"""
Утилиты для работы с реферальной системой
"""
import uuid
import hashlib
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from .models import ReferralAttribution, ReferralReward, ReferralBalance

def generate_anonymous_id():
    """Генерирует уникальный ID для анонимного пользователя"""
    return str(uuid.uuid4())

def generate_referral_code():
    """Генерирует уникальный код реферальной ссылки"""
    return str(uuid.uuid4())[:8].upper()

def get_or_create_anonymous_id(request):
    """Получает или создает anonymous_id для пользователя"""
    anonymous_id = request.COOKIES.get('anonymous_id')
    if not anonymous_id:
        anonymous_id = generate_anonymous_id()
    return anonymous_id

def set_anonymous_id_cookie(response, anonymous_id):
    """Устанавливает cookie с anonymous_id"""
    response.set_cookie(
        'anonymous_id', 
        anonymous_id, 
        max_age=365*24*60*60,  # 1 год
        httponly=True,
        secure=settings.DEBUG == False,  # HTTPS только в продакшене
        samesite='Lax'
    )
    return response

def track_referral_from_url(request, product_slug=None):
    """
    Отслеживает реферальное посещение из URL параметров
    Вызывается при загрузке страницы товара или главной страницы
    """
    ref_code = request.GET.get('ref')
    utm_source = request.GET.get('utm_source')
    
    if not ref_code or utm_source != 'referral':
        return None
    
    # Получаем anonymous_id
    anonymous_id = get_or_create_anonymous_id(request)
    
    # Данные для отправки на API
    tracking_data = {
        'referral_code': ref_code,
        'anonymous_id': anonymous_id,
        'utm_source': utm_source,
        'utm_medium': request.GET.get('utm_medium'),
        'utm_campaign': request.GET.get('utm_campaign'),
    }
    
    return tracking_data

def get_referral_attribution_for_product(anonymous_id, user, product):
    """
    Получает активную атрибуцию для товара
    """
    if user and user.is_authenticated:
        # Ищем по пользователю
        attribution = ReferralAttribution.objects.filter(
            user=user,
            product=product,
            expires_at__gt=timezone.now()
        ).first()
    else:
        # Ищем по anonymous_id
        attribution = ReferralAttribution.objects.filter(
            anonymous_id=anonymous_id,
            product=product,
            expires_at__gt=timezone.now()
        ).first()
    
    return attribution

def create_referral_reward_for_order(order, anonymous_id=None, user=None):
    """
    Создает реферальные вознаграждения для заказа
    """
    rewards_created = []
    
    with transaction.atomic():
        for order_item in order.items.all():
            # Ищем атрибуцию для этого товара
            attribution = get_referral_attribution_for_product(
                anonymous_id, user, order_item.product
            )
            
            if not attribution:
                continue
            
            # Проверяем, не создано ли уже вознаграждение для этого товара
            existing_reward = ReferralReward.objects.filter(
                order=order,
                product=order_item.product,
                referral_link=attribution.referral_link
            ).first()
            
            if existing_reward:
                continue
            
            # Создаем вознаграждение
            reward = create_single_referral_reward(
                attribution, order, order_item
            )
            
            if reward:
                rewards_created.append(reward)
    
    return rewards_created

def create_single_referral_reward(attribution, order, order_item):
    """
    Создает одно реферальное вознаграждение
    """
    from .models import ReferralProgram
    
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
        
        # Создаем вознаграждение
        reward = ReferralReward.objects.create(
            referral_link=attribution.referral_link,
            order=order,
            attributed_user=attribution.referral_link.user,
            product=order_item.product,
            order_amount=order_amount,
            reward_percentage=reward_percentage,
            reward_amount=reward_amount,
            locked_amount=reward_amount,  # Блокируем всю сумму
            fraud_score=0.0,  # Будет рассчитано позже
            ip_address=attribution.last_visit.ip_address,
            user_agent=attribution.last_visit.user_agent
        )
        
        # Обновляем статистику реферальной ссылки
        attribution.referral_link.total_conversions += 1
        attribution.referral_link.total_rewards += reward_amount
        attribution.referral_link.save(update_fields=['total_conversions', 'total_rewards'])
        
        return reward
        
    except Exception as e:
        print(f"Error creating referral reward: {e}")
        return None

def approve_referral_rewards_for_order(order):
    """
    Одобряет реферальные вознаграждения для заказа
    (вызывается при подтверждении заказа)
    """
    rewards = ReferralReward.objects.filter(
        order=order,
        status='PENDING'
    )
    
    approved_count = 0
    with transaction.atomic():
        for reward in rewards:
            reward.status = 'APPROVED'
            reward.available_amount = reward.locked_amount
            reward.locked_amount = 0
            reward.approved_at = timezone.now()
            reward.save()
            approved_count += 1
    
    return approved_count

def reverse_referral_rewards_for_order(order):
    """
    Отменяет реферальные вознаграждения для заказа
    (вызывается при отмене или возврате заказа)
    """
    rewards = ReferralReward.objects.filter(
        order=order,
        status__in=['PENDING', 'APPROVED']
    )
    
    reversed_count = 0
    with transaction.atomic():
        for reward in rewards:
            reward.status = 'REVERSED'
            reward.locked_amount = 0
            reward.available_amount = 0
            reward.reversed_at = timezone.now()
            reward.save()
            reversed_count += 1
    
    return reversed_count

def get_user_referral_balance(user):
    """
    Получает баланс реферальных вознаграждений пользователя
    """
    balance, created = ReferralBalance.objects.get_or_create(user=user)
    balance.update_balance()
    return balance

def can_user_request_payout(user, amount):
    """
    Проверяет, может ли пользователь запросить выплату
    """
    balance = get_user_referral_balance(user)
    
    # Проверяем минимальную сумму выплаты
    from .models import ReferralProgram
    program = ReferralProgram.objects.filter(is_active=True).first()
    if not program:
        return False, "Реферальная программа неактивна"
    
    if amount < program.min_payout_amount:
        return False, f"Минимальная сумма выплаты: {program.min_payout_amount}"
    
    # Проверяем доступные средства
    if amount > balance.available_amount:
        return False, "Недостаточно средств для выплаты"
    
    return True, "OK"

def generate_referral_url(referral_link, request, product_slug=None):
    """
    Генерирует полную реферальную ссылку
    """
    base_url = request.build_absolute_uri('/')
    
    if product_slug:
        return f"{base_url}product/{product_slug}?ref={referral_link.code}&utm_source=referral"
    else:
        return f"{base_url}?ref={referral_link.code}&utm_source=referral"

def get_referral_stats_for_user(user, days=30):
    """
    Получает статистику реферальной программы для пользователя
    """
    from django.db.models import Sum, Count
    from datetime import timedelta
    
    start_date = timezone.now() - timedelta(days=days)
    
    # Статистика по ссылкам
    links = user.referral_links.all()
    total_links = links.count()
    
    # Статистика по кликам
    total_clicks = links.aggregate(Sum('total_clicks'))['total_clicks__sum'] or 0
    
    # Статистика по конверсиям
    total_conversions = links.aggregate(Sum('total_conversions'))['total_conversions__sum'] or 0
    
    # Статистика по вознаграждениям
    rewards = ReferralReward.objects.filter(
        attributed_user=user,
        created_at__gte=start_date
    )
    
    total_rewards = rewards.aggregate(Sum('reward_amount'))['reward_amount__sum'] or 0
    pending_rewards = rewards.filter(status='PENDING').aggregate(Sum('locked_amount'))['locked_amount__sum'] or 0
    approved_rewards = rewards.filter(status='APPROVED').aggregate(Sum('available_amount'))['available_amount__sum'] or 0
    
    # Конверсионная ставка
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    
    return {
        'total_links': total_links,
        'total_clicks': total_clicks,
        'total_conversions': total_conversions,
        'total_rewards': total_rewards,
        'pending_rewards': pending_rewards,
        'approved_rewards': approved_rewards,
        'conversion_rate': round(conversion_rate, 2),
        'period_days': days
    }

