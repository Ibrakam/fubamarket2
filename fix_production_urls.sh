#!/bin/bash

# Fix production URLs for server deployment

echo "🔧 Fixing production URLs for server deployment..."

# Get server IP from user
read -p "Enter your server IP address (e.g., 81.162.55.70): " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo "❌ Server IP is required"
    exit 1
fi

echo "📝 Setting up production URLs for server: $SERVER_IP"

# Create production environment file
echo "📝 Creating production environment file..."
cat > fubamarket/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3001
EOF

echo "✅ Created fubamarket/.env.production with:"
echo "   NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000"
echo "   NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3001"

# Update API config to use production URLs
echo "📝 Updating API config for production..."
cat > fubamarket/lib/api-config.ts << EOF
// API Configuration
// This file centralizes all API endpoints for the application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: \`\${API_BASE_URL}/api/auth/login/\`,
  REGISTER: \`\${API_BASE_URL}/api/auth/register/\`,
  PROFILE: \`\${API_BASE_URL}/api/auth/profile/\`,
  
  // Product endpoints
  PRODUCTS: \`\${API_BASE_URL}/api/products\`,
  FEATURED_PRODUCTS: \`\${API_BASE_URL}/api/products/featured\`,
  PRODUCT_BY_ID: (id: string) => \`\${API_BASE_URL}/api/products/\${id}\`,
  
  // Review endpoints
  LATEST_REVIEWS: \`\${API_BASE_URL}/api/reviews/latest\`,
  
  // Order endpoints
  CREATE_ORDER: \`\${API_BASE_URL}/api/orders/create\`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: \`\${API_BASE_URL}/api/admin/dashboard\`,
  ADMIN_USERS: \`\${API_BASE_URL}/api/admin/users\`,
  ADMIN_ORDERS: \`\${API_BASE_URL}/api/admin/orders\`,
  ADMIN_WITHDRAWALS: \`\${API_BASE_URL}/api/admin/withdrawals\`,
  ADMIN_USER_BY_ID: (id: string) => \`\${API_BASE_URL}/api/admin/users/\${id}\`,
  ADMIN_CREATE_USER: \`\${API_BASE_URL}/api/admin/users/create\`,
  
  // Vendor endpoints
  VENDOR_PRODUCTS: \`\${API_BASE_URL}/api/vendor/products\`,
  VENDOR_ORDERS: \`\${API_BASE_URL}/api/vendor/orders\`,
  VENDOR_WITHDRAWALS: \`\${API_BASE_URL}/api/vendor/withdrawals\`,
  VENDOR_CREATE_PRODUCT: \`\${API_BASE_URL}/api/vendor/products/create\`,
  VENDOR_PRODUCT_BY_ID: (id: string) => \`\${API_BASE_URL}/api/vendor/products/\${id}\`,
  VENDOR_CREATE_WITHDRAWAL: \`\${API_BASE_URL}/api/vendor/withdrawals/create\`,
  
  // Ops endpoints
  OPS_ORDERS: \`\${API_BASE_URL}/api/ops/orders\`,
  OPS_WITHDRAWALS: \`\${API_BASE_URL}/api/ops/withdrawals\`,
  OPS_ORDER_STATUS: (id: string) => \`\${API_BASE_URL}/api/ops/orders/\${id}/status\`,
  OPS_PROCESS_WITHDRAWAL: (id: string) => \`\${API_BASE_URL}/api/ops/withdrawals/\${id}/process\`,
  
  // Stats endpoint
  STATS: \`\${API_BASE_URL}/api/stats\`
}

export default API_ENDPOINTS
EOF

echo "✅ Updated API config for production"

# Create a script to build with production environment
echo "📝 Creating production build script..."
cat > build_production.sh << EOF
#!/bin/bash

echo "🚀 Building Next.js app for production..."

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
export NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3001

# Build the app
cd fubamarket
npm run build

echo "✅ Production build completed!"
echo "📋 Next steps:"
echo "1. Start the production server: npm start"
echo "2. Or use supervisor: sudo ./manage_services.sh restart"
EOF

chmod +x build_production.sh

echo "✅ Created build_production.sh script"

echo ""
echo "🎉 Production URLs setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Build the app: ./build_production.sh"
echo "2. Start the production server: cd fubamarket && npm start"
echo "3. Or use supervisor: sudo ./manage_services.sh restart"
echo ""
echo "📋 Server URLs:"
echo "   Django API: http://$SERVER_IP:8000"
echo "   Next.js App: http://$SERVER_IP:3001"
