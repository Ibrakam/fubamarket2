#!/bin/bash

# Test API connection

echo "🔍 Testing API connection..."

SERVER_IP="81.162.55.70"
API_URL="http://$SERVER_IP:8000"

echo "📝 Testing connection to: $API_URL"

# Test basic connection
echo "📝 Testing basic connection..."
if curl -s --connect-timeout 10 "$API_URL" > /dev/null; then
    echo "✅ Basic connection successful"
else
    echo "❌ Basic connection failed"
    exit 1
fi

# Test API endpoints
echo "📝 Testing API endpoints..."

# Test products endpoint
echo "📝 Testing products endpoint..."
if curl -s --connect-timeout 10 "$API_URL/api/products" > /dev/null; then
    echo "✅ Products endpoint accessible"
else
    echo "❌ Products endpoint failed"
fi

# Test featured products endpoint
echo "📝 Testing featured products endpoint..."
if curl -s --connect-timeout 10 "$API_URL/api/products/featured" > /dev/null; then
    echo "✅ Featured products endpoint accessible"
else
    echo "❌ Featured products endpoint failed"
fi

# Test reviews endpoint
echo "📝 Testing reviews endpoint..."
if curl -s --connect-timeout 10 "$API_URL/api/reviews/latest" > /dev/null; then
    echo "✅ Reviews endpoint accessible"
else
    echo "❌ Reviews endpoint failed"
fi

echo ""
echo "🎉 API connection test completed!"
echo ""
echo "📋 If all tests passed, your Next.js app should now work correctly."
echo "📋 If some tests failed, check your Django server configuration."
