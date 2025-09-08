from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, ProductImage, Order, OrderItem, WithdrawalRequest

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'balance', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'balance', 'is_verified', 'referral_code', 'referred_by')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone')}),
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'vendor', 'price_uzs', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'vendor']
    search_fields = ['title', 'description', 'vendor__username']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-created_at']

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'alt', 'sort_order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__title', 'alt']
    ordering = ['product', 'sort_order']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['public_id', 'customer_name', 'customer_phone', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['public_id', 'customer_name', 'customer_phone']
    ordering = ['-created_at']
    readonly_fields = ['public_id']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price']
    list_filter = ['order__status']
    search_fields = ['order__public_id', 'product__title']

@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'status', 'created_at', 'processed_at', 'processed_by']
    list_filter = ['status', 'created_at', 'processed_at']
    search_fields = ['user__username', 'bank_details']
    ordering = ['-created_at']
    readonly_fields = ['processed_at', 'processed_by']
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            obj.processed_by = request.user
        super().save_model(request, obj, form, change)
