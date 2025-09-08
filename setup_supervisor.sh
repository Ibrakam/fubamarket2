#!/bin/bash

# FubaMarket2 Supervisor Setup Script
# Run this script to set up supervisor configuration for FubaMarket2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up FubaMarket2 with Supervisor...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script as root (use sudo)${NC}"
    exit 1
fi

# Get project path from user
read -p "Enter the full path to your FubaMarket2 project: " PROJECT_PATH

if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}Project directory does not exist: $PROJECT_PATH${NC}"
    exit 1
fi

# Update paths in configuration files
echo -e "${YELLOW}Updating configuration files...${NC}"

# Update start_server.sh
sed -i "s|/path/to/your/FubaMarket2|$PROJECT_PATH|g" start_server.sh

# Update all .conf files
for conf_file in *.conf; do
    if [ -f "$conf_file" ]; then
        sed -i "s|/path/to/your/FubaMarket2|$PROJECT_PATH|g" "$conf_file"
        echo -e "${GREEN}Updated $conf_file${NC}"
    fi
done

# Install supervisor if not installed
if ! command -v supervisorctl &> /dev/null; then
    echo -e "${YELLOW}Installing supervisor...${NC}"
    apt-get update
    apt-get install -y supervisor
fi

# Create log directory
mkdir -p /var/log/supervisor

# Copy configuration files to supervisor directory
echo -e "${YELLOW}Copying configuration files...${NC}"
cp fubamarket2-production.conf /etc/supervisor/conf.d/

# Make start script executable
chmod +x start_server.sh

# Install Gunicorn if not installed
echo -e "${YELLOW}Installing Gunicorn...${NC}"
cd "$PROJECT_PATH/apps/api"
source .venv/bin/activate
pip install gunicorn

# Build Next.js for production
echo -e "${YELLOW}Building Next.js for production...${NC}"
cd "$PROJECT_PATH/fubamarket"
npm run build

# Reload supervisor configuration
echo -e "${YELLOW}Reloading supervisor configuration...${NC}"
supervisorctl reread
supervisorctl update

# Start the services
echo -e "${YELLOW}Starting services...${NC}"
supervisorctl start fubamarket2-django-prod
supervisorctl start fubamarket2-nextjs-prod

# Show status
echo -e "${GREEN}Setup complete! Service status:${NC}"
supervisorctl status

echo -e "${GREEN}Your FubaMarket2 application is now running!${NC}"
echo -e "${YELLOW}Django API: http://your-server-ip:8000${NC}"
echo -e "${YELLOW}Next.js Frontend: http://your-server-ip:3000${NC}"
echo -e "${YELLOW}Logs are available in /var/log/supervisor/${NC}"

echo -e "${GREEN}Useful commands:${NC}"
echo -e "  supervisorctl status                    # Check service status"
echo -e "  supervisorctl restart fubamarket2-django-prod  # Restart Django"
echo -e "  supervisorctl restart fubamarket2-nextjs-prod  # Restart Next.js"
echo -e "  supervisorctl stop fubamarket2-django-prod     # Stop Django"
echo -e "  supervisorctl stop fubamarket2-nextjs-prod     # Stop Next.js"
echo -e "  tail -f /var/log/supervisor/fubamarket2-django-prod.log  # View Django logs"
echo -e "  tail -f /var/log/supervisor/fubamarket2-nextjs-prod.log  # View Next.js logs"
