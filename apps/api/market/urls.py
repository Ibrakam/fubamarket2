from django.urls import path
from . import views
from . import product_views

urlpatterns = [
    # Health check
    path('health', views.health),

    # Authentication
    path('auth/register', views.register),
    path('auth/login', views.login),
    path('auth/profile', views.profile),
    path('auth/change-password', views.change_password),

    # Products
    path('products', views.list_products),
    path('products/featured', views.get_featured_products, name='get_featured_products'),
    path('products/<int:id>', views.get_product_by_id),
    path('products/<slug:slug>', views.get_product),
    path('categories', product_views.get_categories),

    # Vendor endpoints
    path('vendor/me', views.vendor_me),
    path('vendor/products', views.vendor_products),
    path('vendor/products/<int:product_id>', product_views.vendor_get_product),
    path('vendor/products/create', product_views.vendor_create_product),
    path('vendor/products/<int:product_id>/update', product_views.vendor_update_product),
    path('vendor/products/<int:product_id>/toggle-status', views.toggle_product_status),
    path('vendor/orders', views.vendor_orders),
    path('vendor/orders/<int:order_id>/status', views.update_order_status),
    path('vendor/withdrawals', views.vendor_withdrawals),
    path('vendor/withdrawals/create', views.create_withdrawal_request),

    # Admin endpoints
    path('admin/dashboard', views.admin_dashboard),
    
    # Public endpoints
    path('stats', views.public_stats, name='public_stats'),
    path('admin/users', views.admin_users),
    path('admin/users/create', views.admin_create_user),
    path('admin/users/<int:user_id>', views.admin_update_user),
    path('admin/orders', views.admin_orders),
    path('admin/orders/<int:order_id>/status', views.admin_update_order_status),
    path('admin/withdrawals', views.admin_withdrawals),
    path('admin/withdrawals/<int:withdrawal_id>/process', views.process_withdrawal),

    # Ops endpoints
    path('ops/orders', views.ops_orders),
    path('ops/orders/<int:order_id>/status', views.ops_update_order_status),
    path('ops/withdrawals', views.ops_withdrawals),
    path('ops/withdrawals/<int:withdrawal_id>/process', views.ops_process_withdrawal),

    # Orders
    path('orders/create', views.create_order),

    # Reviews
    path('reviews/product/<int:product_id>', views.get_reviews, name='get_reviews'),
    path('reviews/create', views.create_review, name='create_review'),
    path('reviews/latest', views.get_latest_reviews, name='get_latest_reviews'),



    # Legacy endpoints (for backward compatibility)
    path('orders', views.create_order),
    path('checkout/<str:public_id>/payme', views.checkout_payme),
    path('payments/payme/callback', views.payme_webhook),
]
