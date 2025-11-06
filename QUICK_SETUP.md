# ⚡ Quick Setup Cheat Sheet

## 🚀 Fast Setup (5 Minutes)

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Create .env file (edit MYSQL_PASSWORD!)
# Copy this to backend/.env:
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# 3. Create database
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Run setup (migrations + seeds)
npm run db:setup

# 5. Done! Login with:
# Email: admin@financialsystem.com
# Password: admin123
```

---

## 📝 Common Commands

```bash
# Run migrations only
npm run db:migrate

# Run seeds only
npm run db:seed

# Run both
npm run db:setup

# Check tables
mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"

# Check users
mysql -u root -p financial_mgmt_db -e "SELECT email, role FROM users;"
```

---

## 🔍 Troubleshooting

| Error | Solution |
|-------|----------|
| Access denied | Check `.env` password |
| Database not found | Run: `CREATE DATABASE financial_mgmt_db;` |
| Tables exist | Skip migrations or rollback |
| Can't connect | Start MySQL service |

---

## 📚 Full Guide

See `DATABASE_SETUP_GUIDE.md` for detailed explanations.

