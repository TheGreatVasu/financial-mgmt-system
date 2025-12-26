#!/bin/bash

# Deployment script for Financial Management System Backend
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}💡 Please copy .env.example to .env and configure it:${NC}"
    echo "   cp .env.example .env"
    echo "   nano .env  # or use your preferred editor"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed!${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 is not installed. Installing PM2 globally...${NC}"
    npm install -g pm2
fi

PM2_VERSION=$(pm2 -v)
echo -e "${GREEN}✅ PM2 version: $PM2_VERSION${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run db:migrate || {
    echo -e "${RED}❌ Database migration failed!${NC}"
    echo -e "${YELLOW}💡 Make sure your MySQL database is running and .env is configured correctly${NC}"
    exit 1
}

echo -e "${GREEN}✅ Database migrations completed${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop existing PM2 process if running
echo -e "${YELLOW}🛑 Stopping existing PM2 process (if running)...${NC}"
pm2 stop financial-mgmt-backend 2>/dev/null || true
pm2 delete financial-mgmt-backend 2>/dev/null || true

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (optional - uncomment if you want auto-start on server reboot)
# echo -e "${YELLOW}⚙️  Setting up PM2 startup script...${NC}"
# pm2 startup

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Application Status:${NC}"
pm2 status

echo ""
echo -e "${GREEN}📝 Useful PM2 commands:${NC}"
echo "   pm2 logs financial-mgmt-backend    # View logs"
echo "   pm2 restart financial-mgmt-backend # Restart app"
echo "   pm2 stop financial-mgmt-backend    # Stop app"
echo "   pm2 monit                          # Monitor app"

