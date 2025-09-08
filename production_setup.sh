#!/bin/bash

# FubaMarket2 Complete Production Setup Script
# This script sets up a complete production environment for FubaMarket2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}=== FubaMarket2 Production Setup ===${NC}"
echo ""

# Get project information
read -p "Enter the full path to your FubaMarket2 project: " PROJECT_PATH
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
read -p "Enter your email for SSL certificate: " EMAIL

if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}Project directory does not exist: $PROJECT_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}Setting up production environment...${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
apt-get install -y \
    nginx \
    supervisor \
    postgresql \
    postgresql-contrib \
    redis-server \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    wget \
    htop \
    ufw

# Install Node.js 18+ if needed
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Setup PostgreSQL
echo -e "${YELLOW}Setting up PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE DATABASE fubamarket2;"
sudo -u postgres psql -c "CREATE USER fubamarket2 WITH PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fubamarket2 TO fubamarket2;"

# Setup Python virtual environment
echo -e "${YELLOW}Setting up Python environment...${NC}"
cd "$PROJECT_PATH/apps/api"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Setup Next.js
echo -e "${YELLOW}Setting up Next.js...${NC}"
cd "$PROJECT_PATH/fubamarket"
npm install
npm run build

# Create application user
echo -e "${YELLOW}Creating application user...${NC}"
useradd -r -s /bin/false fubamarket2 || true
chown -R fubamarket2:fubamarket2 "$PROJECT_PATH"

# Setup environment variables
echo -e "${YELLOW}Setting up environment variables...${NC}"
cp env.production.example "$PROJECT_PATH/.env.production"
sed -i "s|your-secret-key-here|$(openssl rand -base64 32)|g" "$PROJECT_PATH/.env.production"
sed -i "s|your-domain.com|$DOMAIN_NAME|g" "$PROJECT_PATH/.env.production"
sed -i "s|/path/to/your/FubaMarket2|$PROJECT_PATH|g" "$PROJECT_PATH/.env.production"

# Setup Next.js environment variables
echo -e "${YELLOW}Setting up Next.js environment variables...${NC}"
cat > "$PROJECT_PATH/fubamarket/.env.production" << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN_NAME
NEXT_PUBLIC_APP_URL=https://$DOMAIN_NAME
NODE_ENV=production
EOF

# Setup Django
echo -e "${YELLOW}Setting up Django...${NC}"
cd "$PROJECT_PATH/apps/api"
source .venv/bin/activate
python manage.py collectstatic --noinput
python manage.py migrate

# Setup Supervisor
echo -e "${YELLOW}Setting up Supervisor...${NC}"
# Update paths in supervisor configs
for conf_file in *.conf; do
    if [ -f "$conf_file" ]; then
        sed -i "s|/path/to/your/FubaMarket2|$PROJECT_PATH|g" "$conf_file"
        cp "$conf_file" /etc/supervisor/conf.d/
    fi
done

# Create log directories
mkdir -p /var/log/supervisor
mkdir -p /var/log/fubamarket2
chown -R fubamarket2:fubamarket2 /var/log/fubamarket2

# Setup Nginx
echo -e "${YELLOW}Setting up Nginx...${NC}"
cat > /etc/nginx/sites-available/fubamarket2 << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # SSL configuration will be added by Certbot

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Django API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    # Django Media files
    location /media/ {
        alias $PROJECT_PATH/apps/api/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Django Static files
    location /static/ {
        alias $PROJECT_PATH/apps/api/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/fubamarket2 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Setup firewall
echo -e "${YELLOW}Setting up firewall...${NC}"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Start services
echo -e "${YELLOW}Starting services...${NC}"
systemctl enable nginx
systemctl enable postgresql
systemctl enable redis-server
systemctl enable supervisor

systemctl start nginx
systemctl start postgresql
systemctl start redis-server
systemctl start supervisor

# Reload supervisor configuration
supervisorctl reread
supervisorctl update
supervisorctl start fubamarket2-django-prod
supervisorctl start fubamarket2-nextjs-prod

# Setup SSL certificate
echo -e "${YELLOW}Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email $EMAIL --agree-tos --non-interactive

# Setup log rotation
echo -e "${YELLOW}Setting up log rotation...${NC}"
cat > /etc/logrotate.d/fubamarket2 << EOF
/var/log/fubamarket2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 fubamarket2 fubamarket2
    postrotate
        supervisorctl restart fubamarket2-django-prod fubamarket2-nextjs-prod
    endscript
}
EOF

# Setup backup script
echo -e "${YELLOW}Setting up backup script...${NC}"
cat > /usr/local/bin/backup-fubamarket2.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/fubamarket2"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
sudo -u postgres pg_dump fubamarket2 > \$BACKUP_DIR/database_\$DATE.sql

# Backup media files
tar -czf \$BACKUP_DIR/media_\$DATE.tar.gz $PROJECT_PATH/apps/api/media/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-fubamarket2.sh

# Setup cron job for backups
echo "0 2 * * * /usr/local/bin/backup-fubamarket2.sh" | crontab -u root -

# Final status check
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
supervisorctl status
echo ""
echo -e "${BLUE}Nginx Status:${NC}"
systemctl status nginx --no-pager -l
echo ""
echo -e "${GREEN}Your FubaMarket2 application is now running!${NC}"
echo -e "${YELLOW}Frontend: https://$DOMAIN_NAME${NC}"
echo -e "${YELLOW}API: https://$DOMAIN_NAME/api${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  sudo ./manage_services.sh status    # Check service status"
echo -e "  sudo ./manage_services.sh restart   # Restart services"
echo -e "  sudo ./manage_services.sh logs -f   # View logs"
echo -e "  sudo nginx -t                       # Test Nginx config"
echo -e "  sudo systemctl reload nginx         # Reload Nginx"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo -e "1. Update your database password in $PROJECT_PATH/.env.production"
echo -e "2. Configure your email settings in the .env.production file"
echo -e "3. Set up monitoring and alerts for your production server"
echo -e "4. Regular backups are configured to run daily at 2 AM"
