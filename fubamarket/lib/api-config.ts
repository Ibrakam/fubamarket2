// API Configuration
// This file centralizes all API endpoints and makes them configurable

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://81.162.55.70:8000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  PROFILE: `/api/auth/user`, // Use Next.js API route
  REFRESH: `${API_BASE_URL}/api/auth/refresh/`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  FEATURED_PRODUCTS: `${API_BASE_URL}/api/products/featured`,
  
  // Review endpoints
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  LATEST_REVIEWS: `${API_BASE_URL}/api/reviews/latest`,
  CREATE_REVIEW: `${API_BASE_URL}/api/reviews/create`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  CREATE_ORDER: `${API_BASE_URL}/api/orders/create`,
  ORDER_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard/`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users/`,
  ADMIN_USER_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/`,
  ADMIN_CREATE_USER: `${API_BASE_URL}/api/admin/users/create/`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders/`,
  ADMIN_ORDER_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/orders/${id}/`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/admin/products/`,
  ADMIN_PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/products/${id}/`,
  ADMIN_WITHDRAWALS: `${API_BASE_URL}/api/admin/withdrawals/`,
  ADMIN_WITHDRAWAL_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/withdrawals/${id}/`,
  
  // Vendor endpoints
  VENDOR_PRODUCTS: `${API_BASE_URL}/api/vendor/products`,
  VENDOR_PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/api/vendor/products/${id}`,
  VENDOR_CREATE_PRODUCT: `${API_BASE_URL}/api/vendor/products/create`,
  VENDOR_ORDERS: `${API_BASE_URL}/api/vendor/orders`,
  VENDOR_WITHDRAWALS: `${API_BASE_URL}/api/vendor/withdrawals`,
  VENDOR_CREATE_WITHDRAWAL: `${API_BASE_URL}/api/vendor/withdrawals/create`,
  
  // Ops endpoints
  OPS_ORDERS: `${API_BASE_URL}/api/ops/orders`,
  OPS_ORDER_STATUS: (id: string) => `${API_BASE_URL}/api/ops/orders/${id}/status`,
  OPS_WITHDRAWALS: `${API_BASE_URL}/api/ops/withdrawals`,
  OPS_PROCESS_WITHDRAWAL: (id: string) => `${API_BASE_URL}/api/ops/withdrawals/${id}/process`,
  
  // Stats endpoint
  STATS: `${API_BASE_URL}/api/stats`,
  
  // Referral endpoints
  REFERRAL_LINKS: `${API_BASE_URL}/api/referral-links/`,
  REFERRAL_LINK_BY_ID: (id: string) => `${API_BASE_URL}/api/referral-links/${id}/`,
  REFERRAL_STATS: `${API_BASE_URL}/api/referral-stats/`,
  USER_REFERRAL_STATS: `${API_BASE_URL}/api/referral-stats/user/`,
  REFERRAL_ANALYTICS: `${API_BASE_URL}/api/referral-analytics/`,
  REFERRAL_PAYOUTS: `${API_BASE_URL}/api/referral-payouts/`,
  REFERRAL_PAYOUT_BY_ID: (id: string) => `${API_BASE_URL}/api/referral-payouts/${id}/`,
  REFERRAL_BALANCE: `${API_BASE_URL}/api/referral-balance/`,
  TRACK_VISIT: `${API_BASE_URL}/api/track-visit/`,
  TRACK_CONVERSION: `${API_BASE_URL}/api/track-conversion/`,
  REQUEST_PAYOUT: `${API_BASE_URL}/api/referral-payouts/request/`,
  APPROVE_PAYOUT: (id: string) => `${API_BASE_URL}/api/referral-payouts/${id}/approve/`,
  REJECT_PAYOUT: (id: string) => `${API_BASE_URL}/api/referral-payouts/${id}/reject/`,
}

export default API_ENDPOINTS
