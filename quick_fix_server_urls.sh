#!/bin/bash

# Quick fix for server URLs

echo "🔧 Quick fix for server URLs..."

# Set server IP
SERVER_IP="81.162.55.70"

echo "📝 Setting up URLs for server: $SERVER_IP"

# Create production environment file
echo "📝 Creating production environment file..."
cat > fubamarket/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3001
EOF

echo "✅ Created fubamarket/.env.production"

# Also create .env.local for development
echo "📝 Creating local environment file..."
cat > fubamarket/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3001
EOF

echo "✅ Created fubamarket/.env.local"

echo ""
echo "🎉 Server URLs fixed!"
echo ""
echo "📋 Server URLs:"
echo "   Django API: http://$SERVER_IP:8000"
echo "   Next.js App: http://$SERVER_IP:3001"
echo ""
echo "📋 Next steps:"
echo "1. Restart Next.js server: npm run dev"
echo "2. Or build for production: npm run build && npm start"
