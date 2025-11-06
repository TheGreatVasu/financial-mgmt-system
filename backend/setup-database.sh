#!/bin/bash

# Financial Management System - Database Setup Script
# This script helps set up the MySQL database with migrations and seed data

set -e

echo "=========================================="
echo "Financial Management System - DB Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating template...${NC}"
    cat > .env << EOF
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=financial_mgmt_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}Template .env file created. Please update with your MySQL credentials.${NC}"
    echo ""
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if MySQL credentials are set
if [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_DATABASE" ]; then
    echo -e "${RED}Error: MYSQL_USER and MYSQL_DATABASE must be set in .env file${NC}"
    exit 1
fi

echo "Step 1: Creating database (if not exists)..."
mysql -u "$MYSQL_USER" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} << EOF
CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`$MYSQL_DATABASE\`;
EOF
echo -e "${GREEN}✓ Database created/verified${NC}"
echo ""

echo "Step 2: Running migrations..."
npm run db:migrate
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

echo "Step 3: Seeding database with starter data..."
npm run db:seed
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Starter Login Credentials:"
echo "-------------------------"
echo "Admin Account:"
echo "  Email: admin@financialsystem.com"
echo "  Password: admin123"
echo ""
echo "Demo Account:"
echo "  Email: demo@financialsystem.com"
echo "  Password: demo123"
echo ""
echo "Additional Admin:"
echo "  Email: vasu@financialsystem.com"
echo "  Password: admin123"
echo ""
echo "Next steps:"
echo "1. Start backend: npm run dev"
echo "2. Start frontend: cd ../frontend && npm run dev"
echo "3. Login at http://localhost:3000/login"
echo ""

