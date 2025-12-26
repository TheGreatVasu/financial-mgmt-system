# 🚀 Backend Deployment Guide - Neev Cloud Server

This guide will walk you through deploying the Financial Management System backend on your Neev cloud server.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Access to your Neev cloud server (SSH access)
- ✅ MySQL database set up on Neev cloud (or external MySQL service)
- ✅ Node.js installed (version 16 or higher)
- ✅ Domain name configured (optional but recommended)
- ✅ Firewall configured to allow traffic on port 5001 (or your chosen port)

---

## 🔧 Step 1: Server Setup

### 1.1 Connect to Your Server

```bash
ssh username@your-server-ip
# or
ssh username@your-domain.com
```

### 1.2 Install Node.js (if not already installed)

```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

### 1.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 -v
```

### 1.4 Install MySQL Client (if needed)

```bash
sudo apt-get update
sudo apt-get install mysql-client
```

---

## 📁 Step 2: Upload Backend Code

### Option A: Using Git (Recommended)

```bash
# Navigate to your project directory
cd /var/www  # or your preferred directory
git clone <your-repository-url> financial-mgmt-system
cd financial-mgmt-system/backend
```

### Option B: Using SCP/SFTP

```bash
# From your local machine
scp -r backend/ username@your-server-ip:/var/www/financial-mgmt-system/
```

### Option C: Using FileZilla or similar FTP client

Upload the `backend` folder to your server.

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create .env File

```bash
cd /var/www/financial-mgmt-system/backend
cp .env.example .env
nano .env  # or use vi/vim
```

### 3.2 Configure .env File

Update the following values in your `.env` file:

```env
# Environment
NODE_ENV=production

# Server Port
PORT=5001

# JWT Secret - Generate a strong random key
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
JWT_SECRET=<generate-strong-random-key>

# MySQL Configuration (Your Neev cloud MySQL details)
MYSQL_HOST=your-mysql-host.neev.cloud
MYSQL_PORT=3306
MYSQL_USER=your-mysql-username
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=financial_mgmt_db

# Frontend URL (Your production frontend domain)
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important Notes:**
- 🔐 **JWT_SECRET**: Generate a strong random key. Never use the default value in production!
- 🗄️ **MySQL**: Ensure your MySQL database is accessible from your server
- 🌐 **CORS_ORIGIN**: Must match your frontend URL exactly (including https/http)

---

## 🗄️ Step 4: Database Setup

### 4.1 Create Database (if not exists)

Connect to MySQL:

```bash
mysql -h your-mysql-host.neev.cloud -u your-mysql-username -p
```

Create database:

```sql
CREATE DATABASE IF NOT EXISTS financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4.2 Run Migrations

```bash
cd /var/www/financial-mgmt-system/backend
npm install
npm run db:migrate
```

### 4.3 (Optional) Seed Initial Data

```bash
npm run db:seed
```

---

## 🚀 Step 5: Deploy Application

### 5.1 Install Dependencies

```bash
cd /var/www/financial-mgmt-system/backend
npm install --production
```

### 5.2 Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

### 5.3 Run Deployment Script

```bash
./deploy.sh
```

**OR** manually:

```bash
# Stop existing process (if any)
pm2 stop financial-mgmt-backend 2>/dev/null || true
pm2 delete financial-mgmt-backend 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
```

---

## 🔥 Step 6: Configure Firewall

### 6.1 Allow Port 5001 (or your chosen port)

```bash
# UFW (Ubuntu)
sudo ufw allow 5001/tcp
sudo ufw reload

# Or using iptables
sudo iptables -A INPUT -p tcp --dport 5001 -j ACCEPT
sudo iptables-save
```

### 6.2 Verify Port is Open

```bash
sudo netstat -tlnp | grep 5001
# or
sudo ss -tlnp | grep 5001
```

---

## 🌐 Step 7: Configure Reverse Proxy (Nginx - Recommended)

### 7.1 Install Nginx

```bash
sudo apt-get update
sudo apt-get install nginx
```

### 7.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/financial-mgmt-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;  # Change to your domain

    # Redirect HTTP to HTTPS (optional but recommended)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support for Socket.io
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

### 7.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/financial-mgmt-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### 7.4 (Optional) Setup SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

---

## ✅ Step 8: Verify Deployment

### 8.1 Check Application Status

```bash
pm2 status
pm2 logs financial-mgmt-backend --lines 50
```

### 8.2 Test Health Endpoint

```bash
curl http://localhost:5001/health
# or
curl http://api.your-domain.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Financial Management System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 8.3 Check Database Connection

```bash
# Check PM2 logs for database connection messages
pm2 logs financial-mgmt-backend | grep -i database
```

---

## 🔄 Step 9: Setup Auto-Start on Reboot

### 9.1 Generate PM2 Startup Script

```bash
pm2 startup
# Follow the instructions shown (usually involves running a sudo command)
```

### 9.2 Save PM2 Configuration

```bash
pm2 save
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
pm2 logs financial-mgmt-backend

# Last 100 lines
pm2 logs financial-mgmt-backend --lines 100

# Error logs only
pm2 logs financial-mgmt-backend --err
```

### Application Management

```bash
# Restart application
pm2 restart financial-mgmt-backend

# Stop application
pm2 stop financial-mgmt-backend

# Start application
pm2 start financial-mgmt-backend

# Reload application (zero-downtime)
pm2 reload financial-mgmt-backend

# Delete application
pm2 delete financial-mgmt-backend

# Monitor resources
pm2 monit
```

### Database Migrations (After Code Updates)

```bash
cd /var/www/financial-mgmt-system/backend
npm run db:migrate
pm2 restart financial-mgmt-backend
```

---

## 🔒 Security Checklist

- [ ] ✅ Strong JWT_SECRET generated and set
- [ ] ✅ Database credentials are secure
- [ ] ✅ CORS_ORIGIN matches your frontend URL exactly
- [ ] ✅ Firewall configured to allow only necessary ports
- [ ] ✅ SSL/HTTPS configured (recommended)
- [ ] ✅ PM2 running as non-root user (recommended)
- [ ] ✅ .env file has proper permissions (chmod 600 .env)
- [ ] ✅ Regular backups of database configured

---

## 🐛 Troubleshooting

### Application Won't Start

1. **Check logs:**
   ```bash
   pm2 logs financial-mgmt-backend --err
   ```

2. **Check environment variables:**
   ```bash
   pm2 env 0  # Shows environment for process 0
   ```

3. **Verify database connection:**
   ```bash
   mysql -h your-mysql-host -u your-username -p
   ```

### Database Connection Errors

1. **Check MySQL is running:**
   ```bash
   sudo systemctl status mysql
   ```

2. **Verify credentials in .env file**

3. **Check firewall allows MySQL port (3306)**

4. **Test connection manually:**
   ```bash
   mysql -h your-mysql-host -u your-username -p your-database
   ```

### CORS Errors

1. **Verify CORS_ORIGIN matches frontend URL exactly**
2. **Check frontend is using correct API URL**
3. **Check Nginx configuration includes proper headers**

### Port Already in Use

```bash
# Find process using port 5001
sudo lsof -i :5001
# or
sudo netstat -tlnp | grep 5001

# Kill the process (if needed)
sudo kill -9 <PID>
```

---

## 📝 Real-Time Data Saving

The backend is configured to save data in real-time:

- ✅ **Database Transactions**: All create/update operations use MySQL transactions
- ✅ **Socket.io**: Real-time updates broadcast to connected clients
- ✅ **Dashboard Updates**: Automatic dashboard refresh after data changes
- ✅ **Error Handling**: Proper error handling with rollback on failures

**No additional configuration needed** - real-time saving works automatically once the database is connected.

---

## 🔄 Updating the Application

When you need to update the application:

```bash
cd /var/www/financial-mgmt-system/backend

# Pull latest code (if using Git)
git pull origin main

# Install new dependencies
npm install --production

# Run migrations (if any)
npm run db:migrate

# Restart application
pm2 restart financial-mgmt-backend

# Check logs
pm2 logs financial-mgmt-backend
```

---

## 📞 Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs financial-mgmt-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify database connection
4. Check firewall settings
5. Review environment variables

---

## ✅ Deployment Complete!

Your backend should now be running on your Neev cloud server. 

**Next Steps:**
1. Update your frontend to point to the new backend URL
2. Test all API endpoints
3. Monitor logs for any issues
4. Setup regular database backups

**Backend URL:** `http://your-server-ip:5001` or `https://api.your-domain.com`

Good luck! 🎉

