from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import uuid
import string
import random
class UserRole(models.Model):
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('vendor', 'Vendor'),
        ('ops', 'Operations'),
    ]
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.get_name_display()
class User(AbstractUser):
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('vendor', 'Vendor'),
        ('ops', 'Operations'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='vendor')
    phone = models.CharField(max_length=20, blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_verified = models.BooleanField(default=False)
    referral_code = models.CharField(max_length=10, unique=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Переопределяем поля groups и user_permissions с правильными related_name
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='market_user_set',
        related_query_name='market_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='market_user_set',
        related_query_name='market_user',
    )
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
class WithdrawalRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bank_details = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_withdrawals')
    def __str__(self):
        return f"{self.user.username} - ${self.amount} ({self.status})"
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
    def __str__(self):
        return self.name
class Product(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    price_uzs = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    # Реферальная система поля
    referral_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Комиссия за реферальную продажу")
    referral_enabled = models.BooleanField(default=True, help_text="Включена ли реферальная система для этого товара")
    total_sales = models.PositiveIntegerField(default=0, help_text="Общее количество продаж")
    total_referral_sales = models.PositiveIntegerField(default=0, help_text="Количество продаж по реферальным ссылкам")
    sales_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Процент продаж")
    booked_quantity = models.PositiveIntegerField(default=0, help_text="Зарезервированное количество")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return self.title
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='products/%Y/%m/%d/')
    alt = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['sort_order', 'created_at']
    def __str__(self):
        return f"{self.product.title} - Image {self.sort_order}"
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    public_id = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        if not self.public_id:
            self.public_id = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"Order {self.public_id} - {self.customer_name}"
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self):
        return f"{self.order.public_id} - {self.product.title} x{self.quantity}"
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.rating} stars)"
# Referral System Models
def generate_referral_code():
    """Генерирует уникальный код реферальной ссылки"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not ReferralLink.objects.filter(code=code).exists():
            return code
class ReferralProgram(models.Model):
    """Настройки реферальной программы"""
    name = models.CharField(max_length=100, default="Default Referral Program")
    is_active = models.BooleanField(default=True)
    min_payout_amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    attribution_window_days = models.PositiveIntegerField(default=30)  # Окно атрибуции в днях
    reward_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)  # Процент от покупки
    max_reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Максимальная сумма вознаграждения
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
class ReferralLink(models.Model):
    """Реферальные ссылки, созданные пользователями"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_links')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, null=True, blank=True)  # Если привязан к конкретному товару
    code = models.CharField(max_length=20, unique=True, default=generate_referral_code)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Опциональная дата истечения
    # Статистика
    total_clicks = models.PositiveIntegerField(default=0)
    total_conversions = models.PositiveIntegerField(default=0)
    total_rewards = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    class Meta:
        unique_together = ['user', 'product']  # Один пользователь может создать только одну ссылку на товар
    def __str__(self):
        return f"{self.user.username} - {self.code}"
class ReferralVisit(models.Model):
    """Записи о посещениях по реферальным ссылкам"""
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='visits')
    anonymous_id = models.CharField(max_length=100)  # ID анонимного пользователя из cookie
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  # Если пользователь залогинился
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    page_url = models.URLField(max_length=500, null=True, blank=True)
    product_id = models.PositiveIntegerField(null=True, blank=True)
    utm_source = models.CharField(max_length=100, null=True, blank=True)
    utm_medium = models.CharField(max_length=100, null=True, blank=True)
    utm_campaign = models.CharField(max_length=100, null=True, blank=True)
    utm_term = models.CharField(max_length=100, null=True, blank=True)
    utm_content = models.CharField(max_length=100, null=True, blank=True)
    visited_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        indexes = [
            models.Index(fields=['anonymous_id']),
            models.Index(fields=['referral_link']),
            models.Index(fields=['visited_at']),
        ]
    def __str__(self):
        return f"Visit {self.anonymous_id} via {self.referral_link.code}"
class ReferralAttribution(models.Model):
    """Атрибуция реферальных покупок"""
    anonymous_id = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='attributions')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    expires_at = models.DateTimeField()  # Когда истекает атрибуция
    created_at = models.DateTimeField(auto_now_add=True)
    last_visit = models.ForeignKey(ReferralVisit, on_delete=models.CASCADE)
    class Meta:
        unique_together = ['anonymous_id', 'product']  # Одна атрибуция на товар для анонимного пользователя
        indexes = [
            models.Index(fields=['anonymous_id']),
            models.Index(fields=['user']),
            models.Index(fields=['expires_at']),
        ]
    def __str__(self):
        return f"Attribution {self.anonymous_id} -> {self.referral_link.user.username}"
    def is_expired(self):
        return timezone.now() > self.expires_at
class ReferralReward(models.Model):
    """Вознаграждения за реферальные покупки"""
    STATUS_CHOICES = [
        ('PENDING', 'Ожидает подтверждения'),
        ('APPROVED', 'Одобрено'),
        ('REVERSED', 'Отменено'),
        ('PAID_OUT', 'Выплачено'),
    ]
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='rewards')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='referral_rewards')
    attributed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_rewards')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    # Суммы
    order_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Сумма заказа
    reward_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # Процент вознаграждения
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Сумма вознаграждения
    locked_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Заблокированная сумма
    available_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Доступная сумма
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    reversed_at = models.DateTimeField(null=True, blank=True)
    # Анти-фрод данные
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    fraud_score = models.FloatField(default=0.0)  # Оценка вероятности мошенничества
    class Meta:
        indexes = [
            models.Index(fields=['attributed_user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    def __str__(self):
        return f"Reward {self.reward_amount} for {self.attributed_user.username}"
class ReferralPayout(models.Model):
    """Запросы на выплату реферальных вознаграждений"""
    STATUS_CHOICES = [
        ('PENDING', 'Ожидает обработки'),
        ('PROCESSING', 'Обрабатывается'),
        ('COMPLETED', 'Завершено'),
        ('REJECTED', 'Отклонено'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('BANK_TRANSFER', 'Банковский перевод'),
        ('PAYPAL', 'PayPal'),
        ('CRYPTO', 'Криптовалюта'),
        ('CASH', 'Наличные'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_details = models.JSONField()  # Детали для выплаты (номер карты, реквизиты и т.д.)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payouts')
    rejection_reason = models.TextField(null=True, blank=True)
    # Связанные вознаграждения
    rewards = models.ManyToManyField(ReferralReward, related_name='payouts')
    def __str__(self):
        return f"Payout {self.amount} for {self.user.username}"
class ReferralBalance(models.Model):
    """Баланс реферальных вознаграждений пользователя"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_balance')
    total_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Всего заработано
    locked_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Заблокировано
    available_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Доступно для вывода
    total_paid_out = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Всего выплачено
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Balance {self.user.username}: {self.available_amount}"
    def update_balance(self):
        """Обновляет баланс на основе всех вознаграждений"""
        rewards = ReferralReward.objects.filter(attributed_user=self.user)
        self.total_earned = sum(reward.reward_amount for reward in rewards)
        self.locked_amount = sum(reward.locked_amount for reward in rewards if reward.status == 'PENDING')
        self.available_amount = sum(
            reward.available_amount for reward in rewards
            if reward.status in ['APPROVED', 'PAID_OUT']
        )
        self.total_paid_out = sum(
            reward.available_amount for reward in rewards
            if reward.status == 'PAID_OUT'
        )
        self.save()
# Сигналы для автоматического обновления баланса
@receiver(post_save, sender=ReferralReward)
def update_user_balance_on_reward_change(sender, instance, **kwargs):
    """Обновляет баланс пользователя при изменении вознаграждения"""
    balance, created = ReferralBalance.objects.get_or_create(user=instance.attributed_user)
    balance.update_balance()
@receiver(post_delete, sender=ReferralReward)
def update_user_balance_on_reward_delete(sender, instance, **kwargs):
    """Обновляет баланс пользователя при удалении вознаграждения"""
    balance, created = ReferralBalance.objects.get_or_create(user=instance.attributed_user)
    balance.update_balance()
