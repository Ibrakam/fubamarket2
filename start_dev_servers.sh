#!/bin/bash

# Start both Django and Next.js development servers

echo "🚀 Starting development servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if Django server is already running
if check_port 8000; then
    echo -e "${GREEN}✅ Django server is already running on port 8000${NC}"
else
    echo -e "${YELLOW}📝 Starting Django server...${NC}"
    # Start Django server in background
    ./start_django.sh &
    DJANGO_PID=$!
    echo -e "${GREEN}✅ Django server started with PID: $DJANGO_PID${NC}"
fi

# Wait a moment for Django to start
sleep 3

# Check if Next.js server is already running
if check_port 3001; then
    echo -e "${GREEN}✅ Next.js server is already running on port 3001${NC}"
else
    echo -e "${YELLOW}📝 Starting Next.js server...${NC}"
    # Start Next.js server in background
    cd fubamarket && npm run dev &
    NEXTJS_PID=$!
    echo -e "${GREEN}✅ Next.js server started with PID: $NEXTJS_PID${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Development servers are starting!${NC}"
echo ""
echo -e "${YELLOW}📋 Server URLs:${NC}"
echo -e "${GREEN}  Django API: http://127.0.0.1:8000${NC}"
echo -e "${GREEN}  Next.js App: http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}📋 To stop servers:${NC}"
echo -e "${RED}  Press Ctrl+C or run: pkill -f 'python manage.py runserver' && pkill -f 'npm run dev'${NC}"
echo ""
echo -e "${BLUE}🚀 Happy coding!${NC}"

# Keep script running
wait
