# 🖥️ Terminal Commands - Complete Setup & Run Guide

## 📋 Quick Reference - Copy & Paste Commands

---

## 🚀 **STEP 1: Initial Setup (One-Time Per PC)**

### **1.1 Install Dependencies**

```bash
# Navigate to project root
cd financial-mgmt-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🗄️ **STEP 2: Database Setup (One-Time Per PC)**

### **2.1 Create Database**

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

*(Enter your MySQL password when prompted)*

### **2.2 Create .env File**

```bash
# Navigate to backend folder
cd backend

# Create .env file (Linux/Mac)
cat > .env << 'EOF'
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001
EOF
```

**⚠️ IMPORTANT:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

**For Windows (PowerShell):**
```powershell
cd backend
@"
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001
"@ | Out-File -FilePath .env -Encoding utf8
```

### **2.3 Run Database Migrations & Seeds**

```bash
# Still in backend folder
npm run db:setup
```

This creates all tables and adds sample data.

---

## ▶️ **STEP 3: Run Application (Every Time You Want to Use It)**

### **Option A: Run in Separate Terminals (Recommended)**

**Terminal 1 - Backend Server:**
```bash
cd financial-mgmt-system/backend
npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd financial-mgmt-system/frontend
npm run dev
```

### **Option B: Run Both in Background (Single Terminal)**

**Linux/Mac:**
```bash
# Start backend in background
cd financial-mgmt-system/backend
npm run dev &

# Start frontend in background
cd ../frontend
npm run dev &
```

**Windows (PowerShell):**
```powershell
# Start backend in background
cd financial-mgmt-system\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Start frontend in background
cd ..\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## 🔍 **STEP 4: Access Application**

After both servers are running:

1. **Open Browser:** `http://localhost:3001`
2. **Login Credentials:**
   - Email: `admin@financialsystem.com`
   - Password: `admin123`

---

## 🛠️ **Common Commands**

### **Check if Servers are Running**

```bash
# Check backend (port 5001)
lsof -i :5001

# Check frontend (port 3001)
lsof -i :3001

# Windows alternative
netstat -ano | findstr :5001
netstat -ano | findstr :3001
```

### **Stop Servers**

**If running in foreground:** Press `Ctrl + C` in each terminal

**If running in background:**
```bash
# Find and kill backend process
lsof -ti :5001 | xargs kill

# Find and kill frontend process
lsof -ti :3001 | xargs kill

# Windows
taskkill /F /PID <process_id>
```

### **Check Database Connection**

```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1;"

# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'financial_mgmt_db';"

# Check tables
mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"

# Check users
mysql -u root -p financial_mgmt_db -e "SELECT email, role FROM users;"
```

### **Reset Database (⚠️ Deletes All Data)**

```bash
cd backend

# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS financial_mgmt_db;"
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seeds again
npm run db:setup
```

---

## 📦 **Database Commands**

### **Run Migrations Only**

```bash
cd backend
npm run db:migrate
```

### **Run Seeds Only**

```bash
cd backend
npm run db:seed
```

### **Run Both (Migrations + Seeds)**

```bash
cd backend
npm run db:setup
```

---

## 🔧 **Troubleshooting Commands**

### **Check Node.js Version**

```bash
node --version
# Should be v16+ or v18+
```

### **Check MySQL Version**

```bash
mysql --version
```

### **Check if MySQL is Running**

**Mac:**
```bash
brew services list | grep mysql
```

**Linux:**
```bash
sudo service mysql status
```

**Windows:**
```powershell
Get-Service | Where-Object {$_.Name -like "*mysql*"}
```

### **Start MySQL Service**

**Mac:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo service mysql start
```

**Windows:**
```powershell
Start-Service MySQL80
```

### **Clear npm Cache (if installation fails)**

```bash
npm cache clean --force
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### **Check Port Availability**

```bash
# Mac/Linux
lsof -i :5001
lsof -i :3001

# Windows
netstat -ano | findstr :5001
netstat -ano | findstr :3001
```

---

## 🚀 **Complete Setup Script (All-in-One)**

**For Linux/Mac - Copy and paste entire block:**

```bash
#!/bin/bash

# Navigate to project
cd financial-mgmt-system

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create database
echo "🗄️ Creating database..."
read -sp "Enter MySQL root password: " MYSQL_PASS
mysql -u root -p$MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create .env file
echo "⚙️ Creating .env file..."
cd ../backend
cat > .env << EOF
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=$MYSQL_PASS
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001
EOF

# Run database setup
echo "🔧 Setting up database..."
npm run db:setup

echo "✅ Setup complete! Now run:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
```

**Save as `setup.sh` and run:**
```bash
chmod +x setup.sh
./setup.sh
```

---

## 📝 **Daily Use Commands**

### **Start Development Servers**

```bash
# Terminal 1
cd financial-mgmt-system/backend
npm run dev

# Terminal 2
cd financial-mgmt-system/frontend
npm run dev
```

### **Build for Production**

```bash
# Build frontend
cd financial-mgmt-system/frontend
npm run build

# Start production backend
cd ../backend
npm start
```

### **View Logs**

```bash
# Backend logs
cd financial-mgmt-system/backend
tail -f logs/*.log

# Or check specific log file
cat logs/error.log
```

---

## 🎯 **Quick Start (After Initial Setup)**

Once everything is set up, you only need these 2 commands:

**Terminal 1:**
```bash
cd financial-mgmt-system/backend && npm run dev
```

**Terminal 2:**
```bash
cd financial-mgmt-system/frontend && npm run dev
```

Then open: `http://localhost:3001`

---

## ⚡ **Pro Tips**

1. **Create aliases** (add to `~/.bashrc` or `~/.zshrc`):
   ```bash
   alias fm-backend="cd ~/financial-mgmt-system/backend && npm run dev"
   alias fm-frontend="cd ~/financial-mgmt-system/frontend && npm run dev"
   ```
   Then just type: `fm-backend` and `fm-frontend`

2. **Use tmux/screen** to run both in one terminal:
   ```bash
   tmux new-session -d -s fm 'cd backend && npm run dev'
   tmux split-window -h 'cd frontend && npm run dev'
   tmux attach -t fm
   ```

3. **Check if everything is working:**
   ```bash
   # Backend health check
   curl http://localhost:5001/health
   
   # Should return: {"status":"ok"}
   ```

---

## 📞 **Need Help?**

If commands fail:
1. Check Node.js is installed: `node --version`
2. Check MySQL is running: `mysql --version`
3. Check `.env` file exists and has correct password
4. Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`
5. Check ports are free: `lsof -i :5001` and `lsof -i :3001`

