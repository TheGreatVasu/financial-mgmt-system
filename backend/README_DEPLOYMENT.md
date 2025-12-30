# Quick Deployment Reference

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Connect to server
ssh user@your-server

# 2. Navigate to backend
cd /path/to/backend

# 3. Copy and configure .env
cp .env.example .env
nano .env  # Update MySQL and other settings

# 4. Install dependencies
npm install --production

# 5. Setup database
npm run db:migrate

# 6. Deploy
chmod +x deploy.sh
./deploy.sh
```

## 📋 Required Environment Variables

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=<generate-random-key>
MYSQL_HOST=<your-mysql-host>
MYSQL_USER=<your-mysql-user>
MYSQL_PASSWORD=<your-mysql-password>
MYSQL_DATABASE=financial_mgmt_db
FRONTEND_URL=<your-frontend-url>
CORS_ORIGIN=<your-frontend-url>
```

## 🔧 Common Commands

```bash
# PM2 Management
pm2 status
pm2 logs financial-mgmt-backend
pm2 restart financial-mgmt-backend
pm2 stop financial-mgmt-backend

# Database
npm run db:migrate
npm run db:seed

# Health Check
curl http://localhost:5001/health
```

## 📖 Full Guide

# DEPRECATED

This file is deprecated. See `README.md` for the canonical deployment and configuration instructions.

See: `./README.md`

