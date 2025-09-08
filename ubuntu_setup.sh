#!/bin/bash

# FubaMarket2 Ubuntu Setup Script
# This script fixes all API URLs and prepares the project for Ubuntu deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 FubaMarket2 Ubuntu Setup Script${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "fubamarket/lib/api-config.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the FubaMarket2 root directory${NC}"
    echo -e "${YELLOW}Expected to find: fubamarket/lib/api-config.ts${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Converting shell scripts for Ubuntu...${NC}"
./convert_to_ubuntu.sh

echo ""
echo -e "${YELLOW}📋 Step 2: Fixing all hardcoded API URLs...${NC}"
./fix_urls_ubuntu_fixed.sh

echo ""
echo -e "${YELLOW}📋 Step 3: Fixing linter errors...${NC}"
./fix_specific_errors.sh

echo ""
echo -e "${YELLOW}📋 Step 3.5: Fixing JavaScript apostrophes...${NC}"
./quick_fix_apostrophes.sh

echo ""
echo -e "${YELLOW}📋 Step 4: Checking for remaining issues...${NC}"

# Check for remaining hardcoded URLs
remaining=$(grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo -e "${GREEN}✅ All hardcoded URLs have been fixed!${NC}"
else
    echo -e "${RED}⚠️  $remaining hardcoded URLs still remain:${NC}"
    grep -r "http://127\.0\.0\.1:8000" fubamarket --include="*.tsx" --include="*.ts" | grep -v "api-config.ts"
fi

echo ""
echo -e "${YELLOW}📋 Step 4: Setting up environment files...${NC}"

# Create .env.local for development
if [ ! -f "fubamarket/.env.local" ]; then
    echo -e "${BLUE}Creating development environment file...${NC}"
    cp fubamarket/env.local.example fubamarket/.env.local
    echo -e "${GREEN}✅ Created fubamarket/.env.local${NC}"
else
    echo -e "${BLUE}fubamarket/.env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Ubuntu setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}1. For development:${NC}"
echo "   cd fubamarket && npm run dev"
echo ""
echo -e "${YELLOW}2. For production deployment:${NC}"
echo "   sudo ./production_setup.sh"
echo ""
echo -e "${YELLOW}3. To manage services:${NC}"
echo "   sudo ./manage_services.sh status"
echo ""
echo -e "${GREEN}🚀 Your FubaMarket2 project is now ready for Ubuntu!${NC}"
