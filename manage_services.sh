#!/bin/bash

# FubaMarket2 Service Management Script
# This script provides easy commands to manage your FubaMarket2 services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}FubaMarket2 Service Manager${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  logs      - Show logs (with -f for follow)"
    echo "  build     - Build Next.js for production"
    echo "  update    - Update and restart services"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs -f"
    echo "  $0 restart"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}This command requires root privileges. Use sudo.${NC}"
        exit 1
    fi
}

# Function to start services
start_services() {
    check_root
    echo -e "${GREEN}Starting FubaMarket2 services...${NC}"
    supervisorctl start fubamarket2-django-prod
    supervisorctl start fubamarket2-nextjs-prod
    echo -e "${GREEN}Services started!${NC}"
    supervisorctl status
}

# Function to stop services
stop_services() {
    check_root
    echo -e "${YELLOW}Stopping FubaMarket2 services...${NC}"
    supervisorctl stop fubamarket2-django-prod
    supervisorctl stop fubamarket2-nextjs-prod
    echo -e "${GREEN}Services stopped!${NC}"
}

# Function to restart services
restart_services() {
    check_root
    echo -e "${YELLOW}Restarting FubaMarket2 services...${NC}"
    supervisorctl restart fubamarket2-django-prod
    supervisorctl restart fubamarket2-nextjs-prod
    echo -e "${GREEN}Services restarted!${NC}"
    supervisorctl status
}

# Function to show status
show_status() {
    check_root
    echo -e "${BLUE}FubaMarket2 Service Status:${NC}"
    supervisorctl status fubamarket2-django-prod fubamarket2-nextjs-prod
    echo ""
    echo -e "${BLUE}System Resources:${NC}"
    echo "Memory usage:"
    free -h
    echo ""
    echo "Disk usage:"
    df -h /
    echo ""
    echo "Active connections:"
    netstat -tlnp | grep -E ':(3000|8000)'
}

# Function to show logs
show_logs() {
    check_root
    local follow_flag=""
    
    if [ "$2" = "-f" ]; then
        follow_flag="-f"
        echo -e "${BLUE}Following logs (Ctrl+C to exit)...${NC}"
    else
        echo -e "${BLUE}Recent logs:${NC}"
    fi
    
    echo -e "${YELLOW}=== Django Logs ===${NC}"
    tail $follow_flag /var/log/supervisor/fubamarket2-django-prod.log
    
    if [ "$follow_flag" = "" ]; then
        echo ""
        echo -e "${YELLOW}=== Next.js Logs ===${NC}"
        tail /var/log/supervisor/fubamarket2-nextjs-prod.log
    fi
}

# Function to build Next.js
build_nextjs() {
    echo -e "${YELLOW}Building Next.js for production...${NC}"
    
    # Find project directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    FRONTEND_DIR="$SCRIPT_DIR/fubamarket"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}Frontend directory not found: $FRONTEND_DIR${NC}"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Build for production
    echo -e "${YELLOW}Building...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Build completed successfully!${NC}"
    else
        echo -e "${RED}Build failed!${NC}"
        exit 1
    fi
}

# Function to update services
update_services() {
    check_root
    echo -e "${YELLOW}Updating FubaMarket2 services...${NC}"
    
    # Build Next.js
    build_nextjs
    
    # Reload supervisor configuration
    echo -e "${YELLOW}Reloading supervisor configuration...${NC}"
    supervisorctl reread
    supervisorctl update
    
    # Restart services
    restart_services
    
    echo -e "${GREEN}Update completed!${NC}"
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    build)
        build_nextjs
        ;;
    update)
        update_services
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
