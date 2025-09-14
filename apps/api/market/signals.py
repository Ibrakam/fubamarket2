"""
Сигналы для автоматической обработки реферальных вознаграждений
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Order, ReferralReward
from .referral_utils import (
    create_referral_reward_for_order,
    approve_referral_rewards_for_order,
    reverse_referral_rewards_for_order
)

@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Обрабатывает изменения статуса заказа для реферальных вознаграждений
    """
    if created:
        # Новый заказ - создаем реферальные вознаграждения
        create_referral_rewards_for_new_order(instance)
    else:
        # Обновление заказа - проверяем изменение статуса
        handle_order_status_update(instance)

def create_referral_rewards_for_new_order(order):
    """
    Создает реферальные вознаграждения для нового заказа
    """
    try:
        # Получаем anonymous_id из сессии или создаем новый
        anonymous_id = None
        if hasattr(order, 'session_key') and order.session_key:
            # Здесь можно получить anonymous_id из сессии
            pass
        
        # Создаем вознаграждения
        rewards = create_referral_reward_for_order(
            order, 
            anonymous_id=anonymous_id, 
            user=order.user if order.user else None
        )
        
        if rewards:
            print(f"Created {len(rewards)} referral rewards for order {order.id}")
            
    except Exception as e:
        print(f"Error creating referral rewards for order {order.id}: {e}")

def handle_order_status_update(order):
    """
    Обрабатывает обновление статуса заказа
    """
    try:
        # Получаем предыдущее состояние заказа
        if hasattr(order, '_state') and order._state.adding:
            return  # Новый объект, не обрабатываем
        
        # Получаем предыдущий статус из базы данных
        try:
            old_order = Order.objects.get(pk=order.pk)
            old_status = old_order.status
        except Order.DoesNotExist:
            return
        
        new_status = order.status
        
        # Если статус изменился
        if old_status != new_status:
            if new_status == 'confirmed':
                # Заказ подтвержден - одобряем вознаграждения
                approved_count = approve_referral_rewards_for_order(order)
                if approved_count > 0:
                    print(f"Approved {approved_count} referral rewards for order {order.id}")
                    
            elif new_status in ['cancelled', 'refunded']:
                # Заказ отменен или возвращен - отменяем вознаграждения
                reversed_count = reverse_referral_rewards_for_order(order)
                if reversed_count > 0:
                    print(f"Reversed {reversed_count} referral rewards for order {order.id}")
                    
    except Exception as e:
        print(f"Error handling order status update for order {order.id}: {e}")

@receiver(post_save, sender=ReferralReward)
def update_referral_balance_on_reward_change(sender, instance, created, **kwargs):
    """
    Обновляет баланс пользователя при изменении вознаграждения
    """
    try:
        from .models import ReferralBalance
        
        # Обновляем баланс пользователя
        balance, created = ReferralBalance.objects.get_or_create(
            user=instance.attributed_user
        )
        balance.update_balance()
        
    except Exception as e:
        print(f"Error updating referral balance: {e}")

@receiver(post_save, sender=ReferralReward)
def log_referral_reward_creation(sender, instance, created, **kwargs):
    """
    Логирует создание реферального вознаграждения
    """
    if created:
        print(f"Created referral reward {instance.id}: "
              f"{instance.reward_amount} for {instance.attributed_user.username} "
              f"from order {instance.order.id}")

# Дополнительные сигналы для интеграции с существующей системой

@receiver(post_save, sender=Order)
def process_referral_attribution_on_order_creation(sender, instance, created, **kwargs):
    """
    Обрабатывает реферальную атрибуцию при создании заказа
    """
    if created and instance.user:
        # Если заказ создан зарегистрированным пользователем,
        # проверяем, есть ли у него активные атрибуции
        try:
            from .models import ReferralAttribution
            
            # Ищем активные атрибуции для товаров в заказе
            for order_item in instance.items.all():
                attribution = ReferralAttribution.objects.filter(
                    user=instance.user,
                    product=order_item.product,
                    expires_at__gt=timezone.now()
                ).first()
                
                if attribution:
                    print(f"Found active attribution for user {instance.user.username} "
                          f"and product {order_item.product.name}")
                    
        except Exception as e:
            print(f"Error processing referral attribution: {e}")

def cleanup_expired_attributions():
    """
    Очищает истекшие атрибуции (можно вызывать по cron)
    """
    try:
        from .models import ReferralAttribution
        
        expired_count = ReferralAttribution.objects.filter(
            expires_at__lt=timezone.now()
        ).count()
        
        if expired_count > 0:
            ReferralAttribution.objects.filter(
                expires_at__lt=timezone.now()
            ).delete()
            
            print(f"Cleaned up {expired_count} expired attributions")
            
    except Exception as e:
        print(f"Error cleaning up expired attributions: {e}")

def cleanup_old_referral_visits(days=90):
    """
    Очищает старые записи о посещениях (можно вызывать по cron)
    """
    try:
        from .models import ReferralVisit
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        old_visits = ReferralVisit.objects.filter(visited_at__lt=cutoff_date)
        count = old_visits.count()
        
        if count > 0:
            old_visits.delete()
            print(f"Cleaned up {count} old referral visits")
            
    except Exception as e:
        print(f"Error cleaning up old referral visits: {e}")

