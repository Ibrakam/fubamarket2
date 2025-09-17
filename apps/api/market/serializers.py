from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
UserModel = get_user_model()
from .models import (
    ReferralProgram, ReferralLink, ReferralVisit, ReferralAttribution,
    ReferralReward, ReferralPayout, ReferralBalance, Product, ProductImage, Category, Order, OrderItem, WithdrawalRequest, Review
)



class ReferralProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralProgram
        fields = '__all__'



class ReferralLinkSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    referral_url = serializers.SerializerMethodField()

    class Meta:
        model = ReferralLink
        fields = [
            'id', 'user', 'user_username', 'product', 'product_name',
            'code', 'is_active', 'created_at', 'expires_at',
            'total_clicks', 'total_conversions', 'total_rewards', 'referral_url'
        ]
        read_only_fields = ['id', 'created_at', 'total_clicks', 'total_conversions', 'total_rewards']


    def get_referral_url(self, obj):
        """Генерирует полную реферальную ссылку"""
        request = self.context.get('request')
        if request:
            base_url = request.build_absolute_uri('/')
            if obj.product:
                return f"{base_url}product/{obj.product.slug}?ref={obj.code}&utm_source=referral"
            else:
                return f"{base_url}?ref={obj.code}&utm_source=referral"
        return None



class ReferralLinkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralLink
        fields = ['product', 'expires_at']


    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)



class ReferralVisitSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(source='referral_link.code', read_only=True)
    referrer_username = serializers.CharField(source='referral_link.user.username', read_only=True)

    class Meta:
        model = ReferralVisit
        fields = [
            'id', 'referral_link', 'referral_code', 'referrer_username',
            'anonymous_id', 'user', 'ip_address', 'user_agent',
            'utm_source', 'utm_medium', 'utm_campaign', 'visited_at'
        ]
        read_only_fields = ['id', 'visited_at']



class ReferralAttributionSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(source='referral_link.code', read_only=True)
    referrer_username = serializers.CharField(source='referral_link.user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = ReferralAttribution
        fields = [
            'id', 'anonymous_id', 'user', 'referral_link', 'referral_code',
            'referrer_username', 'product', 'product_name', 'expires_at',
            'created_at', 'last_visit', 'is_expired'
        ]
        read_only_fields = ['id', 'created_at']


    def get_is_expired(self, obj):
        return obj.is_expired()



class ReferralRewardSerializer(serializers.ModelSerializer):
    referrer_username = serializers.CharField(source='referral_link.user.username', read_only=True)
    attributed_username = serializers.CharField(source='attributed_user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    order_number = serializers.CharField(source='order.id', read_only=True)

    class Meta:
        model = ReferralReward
        fields = [
            'id', 'referral_link', 'referrer_username', 'order', 'order_number',
            'attributed_user', 'attributed_username', 'product', 'product_name',
            'order_amount', 'reward_percentage', 'reward_amount', 'locked_amount',
            'available_amount', 'status', 'created_at', 'approved_at', 'reversed_at',
            'fraud_score'
        ]
        read_only_fields = [
            'id', 'created_at', 'approved_at', 'reversed_at', 'fraud_score'
        ]



class ReferralRewardUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralReward
        fields = ['status']


    def update(self, instance, validated_data):
        new_status = validated_data.get('status')

        if new_status == 'APPROVED' and instance.status == 'PENDING':
            # Переносим сумму из locked в available
            instance.available_amount = instance.locked_amount
            instance.locked_amount = 0
            instance.approved_at = timezone.now()

        elif new_status == 'REVERSED' and instance.status in ['PENDING', 'APPROVED']:
            # Возвращаем заблокированную сумму
            instance.locked_amount = 0
            instance.available_amount = 0
            instance.reversed_at = timezone.now()

        return super().update(instance, validated_data)



class ReferralPayoutSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)

    class Meta:
        model = ReferralPayout
        fields = [
            'id', 'user', 'user_username', 'amount', 'payment_method',
            'payment_details', 'status', 'created_at', 'processed_at',
            'processed_by', 'processed_by_username', 'rejection_reason'
        ]
        read_only_fields = ['id', 'created_at', 'processed_at', 'processed_by']



class ReferralPayoutCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralPayout
        fields = ['amount', 'payment_method', 'payment_details']


    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user

        # Проверяем, что у пользователя достаточно средств
        balance, created = ReferralBalance.objects.get_or_create(user=user)
        if balance.available_amount < validated_data['amount']:
            raise serializers.ValidationError("Недостаточно средств для выплаты")

        return super().create(validated_data)



class ReferralBalanceSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ReferralBalance
        fields = [
            'id', 'user', 'user_username', 'total_earned', 'locked_amount',
            'available_amount', 'total_paid_out', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']

# Дополнительные сериализаторы для статистики


class ReferralStatsSerializer(serializers.Serializer):
    total_links = serializers.IntegerField()
    total_clicks = serializers.IntegerField()
    total_conversions = serializers.IntegerField()
    total_rewards = serializers.DecimalField(max_digits=10, decimal_places=2)
    conversion_rate = serializers.FloatField()
    average_reward = serializers.DecimalField(max_digits=10, decimal_places=2)



class ReferralLinkStatsSerializer(serializers.ModelSerializer):
    clicks_today = serializers.SerializerMethodField()
    clicks_this_week = serializers.SerializerMethodField()
    clicks_this_month = serializers.SerializerMethodField()
    conversions_today = serializers.SerializerMethodField()
    conversions_this_week = serializers.SerializerMethodField()
    conversions_this_month = serializers.SerializerMethodField()

    class Meta:
        model = ReferralLink
        fields = [
            'id', 'code', 'product', 'total_clicks', 'total_conversions',
            'total_rewards', 'clicks_today', 'clicks_this_week', 'clicks_this_month',
            'conversions_today', 'conversions_this_week', 'conversions_this_month'
        ]


    def get_clicks_today(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        today = timezone.now().date()
        return obj.visits.filter(visited_at__date=today).count()


    def get_clicks_this_week(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        return obj.visits.filter(visited_at__gte=week_ago).count()


    def get_clicks_this_month(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        month_ago = timezone.now() - timedelta(days=30)
        return obj.visits.filter(visited_at__gte=month_ago).count()


    def get_conversions_today(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        today = timezone.now().date()
        return obj.rewards.filter(created_at__date=today).count()


    def get_conversions_this_week(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        return obj.rewards.filter(created_at__gte=week_ago).count()


    def get_conversions_this_month(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        month_ago = timezone.now() - timedelta(days=30)
        return obj.rewards.filter(created_at__gte=month_ago).count()

# Product Management Serializers


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at']



class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt', 'sort_order', 'created_at']



class ProductSerializer(serializers.ModelSerializer):
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    photos = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price_uzs',
            'vendor', 'vendor_username', 'category', 'category_name',
            'is_active', 'created_at', 'updated_at', 'photos',
            'referral_commission', 'referral_enabled', 'total_sales',
            'total_referral_sales', 'sales_percentage', 'booked_quantity',
            'stock'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_sales',
                           'total_referral_sales', 'sales_percentage']



class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['title', 'slug', 'description', 'price_uzs', 'category', 'is_active']


    def create(self, validated_data):
        # Только админы могут создавать продукты
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)



class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']



class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'public_id', 'user', 'customer_username', 'customer_name',
            'customer_phone', 'customer_address', 'total_amount', 'status',
            'payment_status', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'public_id', 'created_at', 'updated_at']



class WithdrawalRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            'id', 'user', 'user_username', 'amount', 'bank_details',
            'status', 'created_at', 'processed_at', 'processed_by',
            'processed_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'processed_at', 'processed_by']

# User Profile Serializer


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    referral_code = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()


    def get_phone(self, obj):
        return getattr(obj, 'phone', None)


    def get_role(self, obj):
        return getattr(obj, 'role', None)


    def get_balance(self, obj):
        return getattr(obj, 'balance', None)


    def get_is_verified(self, obj):
        # Support either boolean field `is_verified` or `is_active` fallback
        return getattr(obj, 'is_verified', getattr(obj, 'is_active', None))


    def get_referral_code(self, obj):
        return getattr(obj, 'referral_code', None)


    def get_created_at(self, obj):
        # Common field names: `date_joined`, `created_at`
        return getattr(obj, 'created_at', getattr(obj, 'date_joined', None))

    class Meta:
        model = UserModel
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'balance', 'is_verified', 'referral_code', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'role', 'balance', 'is_verified', 'referral_code', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_name', 'user', 'user_name', 
            'rating', 'comment', 'verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'verified', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'rating', 'comment']
