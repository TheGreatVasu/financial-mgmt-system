# 🚀 Deployment Guide - Database Setup for GitHub & Production

## 📋 How Database Works When Pushed to GitHub

### ⚠️ **IMPORTANT: Never Commit These Files to GitHub**

The following files should **NEVER** be committed to GitHub (they're in `.gitignore`):

- `backend/.env` - Contains passwords and secrets
- `backend/logs/*` - Log files
- `node_modules/` - Dependencies (reinstall on each server)
- Database files (if any)

---

## 🔐 Environment Variables Setup

### **For Local Development:**

Create `backend/.env` file (already done):
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### **For Production/Cloud Servers:**

Each server needs its own `.env` file with production values:

```env
MYSQL_HOST=your-production-db-host.com
MYSQL_PORT=3306
MYSQL_USER=production_user
MYSQL_PASSWORD=strong_production_password
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=very-strong-random-secret-key-here
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 🌐 Deployment Options

### **Option 1: Traditional Server (VPS/Dedicated)**

**Steps:**

1. **Clone Repository:**
   ```bash
   git clone https://github.com/yourusername/financial-mgmt-system.git
   cd financial-mgmt-system
   ```

2. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set Up MySQL Database:**
   ```bash
   # On server, create database
   mysql -u root -p
   CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   exit
   ```

4. **Create `.env` File:**
   ```bash
   cd backend
   # Create .env file with production values (see above)
   nano .env
   ```

5. **Run Migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start Services:**
   ```bash
   # Backend (use PM2 for production)
   npm install -g pm2
   pm2 start src/server.js --name backend
   
   # Frontend (build for production)
   cd ../frontend
   npm run build
   # Serve with nginx or similar
   ```

---

### **Option 2: Cloud Platforms (Heroku, Railway, Render)**

#### **Heroku Example:**

1. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   ```

2. **Add MySQL Addon:**
   ```bash
   heroku addons:create cleardb:ignite
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   # Database URL is auto-set by addon
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Run Migrations:**
   ```bash
   heroku run npm run db:migrate
   heroku run npm run db:seed
   ```

---

### **Option 3: Docker Deployment**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: financial_mgmt_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      MYSQL_HOST: mysql
      MYSQL_USER: root
      MYSQL_PASSWORD: rootpassword
      MYSQL_DATABASE: financial_mgmt_db
      JWT_SECRET: your-secret-key
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 📝 Setup Instructions for New Server

### **Step-by-Step Setup Script:**

Create `setup.sh`:

```bash
#!/bin/bash

echo "Setting up Financial Management System..."

# 1. Install Node.js (if not installed)
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt-get install -y nodejs

# 2. Install MySQL (if not installed)
# sudo apt-get install mysql-server

# 3. Clone repository
git clone https://github.com/yourusername/financial-mgmt-system.git
cd financial-mgmt-system

# 4. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 5. Create database
mysql -u root -p << EOF
CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# 6. Create .env file (user must fill in)
cd ../backend
cat > .env << EOF
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_PASSWORD_HERE
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
EOF

echo "Please edit backend/.env with your actual values!"

# 7. Run migrations
npm run db:migrate
npm run db:seed

echo "Setup complete!"
```

---

## 🔒 Security Checklist for Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
- [ ] Use strong MySQL passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable firewall (only allow necessary ports)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use HTTPS for frontend

---

## 📊 Database Backup Strategy

### **Manual Backup:**
```bash
mysqldump -u root -p financial_mgmt_db > backup_$(date +%Y%m%d).sql
```

### **Automated Backup (Cron):**
```bash
# Add to crontab (crontab -e)
0 2 * * * mysqldump -u root -pPASSWORD financial_mgmt_db > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 🚨 Troubleshooting

### **"Can't connect to MySQL"**
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `.env`
- Check firewall rules

### **"Invalid token"**
- Verify JWT_SECRET matches between servers
- Check token expiration time
- Ensure token is being sent in headers

### **"Database not found"**
- Run migrations: `npm run db:migrate`
- Check database name in `.env`

---

## ✅ Quick Reference

**Local Development:**
```bash
# Start MySQL
brew services start mysql  # Mac
sudo service mysql start    # Linux

# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm run dev
```

**Production:**
```bash
# Setup
git clone <repo>
cd backend && npm install
# Create .env file
npm run db:migrate
npm run db:seed

# Run
pm2 start src/server.js
```

---

**Remember:** The database is **NOT** stored in GitHub. Each server needs its own database setup!

