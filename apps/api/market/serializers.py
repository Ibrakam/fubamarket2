from rest_framework import serializers
from .models import Product, ProductImage, Order, OrderItem, User, WithdrawalRequest, Review
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'balance', 'is_verified', 'referral_code', 'created_at']
        read_only_fields = ['id', 'balance', 'referral_code', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'referral_code']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        referral_code = validated_data.pop('referral_code', None)
        
        user = User.objects.create_user(**validated_data)
        
        if referral_code:
            try:
                referrer = User.objects.get(referral_code=referral_code)
                user.referred_by = referrer
                user.save()
            except User.DoesNotExist:
                pass
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')

        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt', 'sort_order']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

class ProductSerializer(serializers.ModelSerializer):
    photos = ProductImageSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'vendor', 'vendor_name', 'category', 'category_name', 'title', 'slug', 'price_uzs', 'description', 'stock', 'is_active', 'photos', 'created_at', 'updated_at']
        read_only_fields = ['vendor', 'slug', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Auto-generate slug from title
        from django.utils.text import slugify
        import uuid
        
        title = validated_data.get('title', '')
        base_slug = slugify(title)
        slug = base_slug
        
        # Ensure unique slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Передаем контекст запроса в сериализатор изображений
        if 'photos' in representation:
            photos_data = []
            for photo in instance.photos.all():
                photo_serializer = ProductImageSerializer(photo, context=self.context)
                photos_data.append(photo_serializer.data)
            representation['photos'] = photos_data
        return representation

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'product_image', 'quantity', 'price']

    def get_product_image(self, obj):
        if obj.product.photos.exists():
            request = self.context.get('request')
            photo = obj.product.photos.first()
            if request:
                return request.build_absolute_uri(photo.image.url)
            return photo.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'public_id', 'customer_name', 'customer_phone', 'customer_address', 'total_amount', 'status', 'payment_status', 'vendor_name', 'items', 'created_at', 'updated_at']

    def get_vendor_name(self, obj):
        first_item = obj.items.first()
        if first_item and first_item.product and first_item.product.vendor:
            return first_item.product.vendor.username
        return "Unknown Vendor"

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_title', 'user', 'user_name', 'user_first_name', 'user_last_name', 'rating', 'comment', 'verified', 'created_at']

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'user', 'user_name', 'user_email', 'user_first_name', 'user_last_name', 'amount', 'status', 'bank_details', 'notes', 'created_at', 'processed_at', 'processed_by', 'processed_by_name']
        read_only_fields = ['user', 'processed_at', 'processed_by']

    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return obj.processed_by.username
        return None

class CreateWithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = ['amount', 'bank_details', 'notes']

