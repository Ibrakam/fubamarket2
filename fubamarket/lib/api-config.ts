// API Configuration
// This file centralizes all API endpoints and makes them configurable

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  PROFILE: `${API_BASE_URL}/api/auth/profile/`,
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
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
  ADMIN_CREATE_USER: `${API_BASE_URL}/api/admin/users/create`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  ADMIN_WITHDRAWALS: `${API_BASE_URL}/api/admin/withdrawals`,
  
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
}

export default API_ENDPOINTS
