from django.urls import path, include
from . import views

urlpatterns = [
    # Реферальная программа
    path('referral-programs/', views.ReferralProgramListCreateView.as_view(), name='referral-program-list'),
    path('referral-programs/<int:pk>/', views.ReferralProgramDetailView.as_view(), name='referral-program-detail'),
    
    # Реферальные ссылки
    path('referral-links/', views.ReferralLinkListCreateView.as_view(), name='referral-link-list-create'),
    path('referral-links/<int:pk>/', views.ReferralLinkDetailView.as_view(), name='referral-link-detail'),
    path('referral-links/<int:pk>/stats/', views.ReferralLinkStatsView.as_view(), name='referral-link-stats'),
    
    # Отслеживание посещений (публичный endpoint)
    path('track-visit/', views.track_referral_visit, name='track-referral-visit'),
    path('track-conversion/', views.track_referral_conversion, name='track-referral-conversion'),
    
    # Реферальные вознаграждения
    path('referral-rewards/', views.ReferralRewardListView.as_view(), name='referral-reward-list'),
    path('referral-rewards/<int:pk>/', views.ReferralRewardUpdateView.as_view(), name='referral-reward-update'),
    path('process-purchase/', views.process_referral_purchase, name='process-referral-purchase'),
    
    # Выплаты
    path('referral-payouts/', views.ReferralPayoutListCreateView.as_view(), name='referral-payout-list-create'),
    path('referral-payouts/<int:pk>/', views.ReferralPayoutDetailView.as_view(), name='referral-payout-detail'),
    path('referral-payouts/request/', views.request_payout, name='request-payout'),
    path('referral-payouts/<int:pk>/approve/', views.approve_payout, name='approve-payout'),
    path('referral-payouts/<int:pk>/reject/', views.reject_payout, name='reject-payout'),
    
    # Баланс
    path('referral-balance/', views.ReferralBalanceView.as_view(), name='referral-balance'),
    
    # Статистика
    path('referral-stats/', views.referral_stats, name='referral-stats'),
    path('referral-stats/user/', views.user_referral_stats, name='user-referral-stats'),
    path('referral-analytics/', views.referral_analytics, name='referral-analytics'),
    
    # Админские маршруты
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/create/', views.AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/referral-rewards/', views.AdminReferralRewardListView.as_view(), name='admin-referral-reward-list'),
    path('admin/referral-rewards/<int:pk>/', views.AdminReferralRewardUpdateView.as_view(), name='admin-referral-reward-update'),
    path('admin/referral-payouts/', views.AdminReferralPayoutListView.as_view(), name='admin-referral-payout-list'),
    path('admin/referral-payouts/<int:pk>/', views.AdminReferralPayoutUpdateView.as_view(), name='admin-referral-payout-update'),
    path('admin/products/', views.AdminProductListView.as_view(), name='admin-product-list'),
    path('admin/products/<int:pk>/', views.AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/orders/', views.AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/withdrawals/', views.AdminWithdrawalListView.as_view(), name='admin-withdrawal-list'),
    path('admin/withdrawals/<int:pk>/', views.AdminWithdrawalDetailView.as_view(), name='admin-withdrawal-detail'),
    path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),
    
    # Product Management - только для админов
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    
    # Product Images - только для админов
    path('product-images/', views.ProductImageListCreateView.as_view(), name='product-image-list-create'),
    path('product-images/<int:pk>/', views.ProductImageDetailView.as_view(), name='product-image-detail'),
    
    # Category Management - только для админов
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Order Management - только для админов
    path('orders/', views.OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/update-status/', views.update_order_status, name='update-order-status'),
    
    # Withdrawal Management - только для админов
    path('withdrawals/', views.WithdrawalRequestListCreateView.as_view(), name='withdrawal-list'),
    path('withdrawals/<int:pk>/', views.WithdrawalRequestDetailView.as_view(), name='withdrawal-detail'),
    path('withdrawals/<int:withdrawal_id>/process/', views.process_withdrawal, name='process-withdrawal'),
    
    # Reviews
    path('reviews/', views.ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    path('reviews/latest/', views.LatestReviewsView.as_view(), name='latest-reviews'),
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product-reviews'),
    path('reviews/create/', views.create_review, name='create-review'),
    
    # Referral Links
    path('referral-links/create/', views.create_referral_link, name='create-referral-link'),
    path('referral-visits/', views.track_referral_visit, name='track-referral-visit'),
    
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/user/', views.user_profile, name='user-profile'),
]