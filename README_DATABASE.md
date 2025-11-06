# Financial Management System - Database Setup

## Quick Setup Guide

This guide will help you set up the MySQL database with starter login credentials and sample data.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd backend
./setup-database.sh
```

This script will:
1. Create the database if it doesn't exist
2. Run all migrations to create tables
3. Seed the database with starter data

### Option 2: Manual Setup

#### 1. Create Database

```sql
CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Configure Environment

Create `.env` file in `backend/` directory:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=financial_mgmt_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=5001
CORS_ORIGIN=http://localhost:3000
```

#### 3. Run Migrations & Seeds

```bash
cd backend
npm run db:setup
```

Or separately:
```bash
npm run db:migrate  # Create tables
npm run db:seed     # Add starter data
```

## 🔐 Starter Login Credentials

After seeding, you can login with:

### Admin Account
- **Email:** `admin@financialsystem.com`
- **Password:** `admin123`
- **Role:** Admin

### Demo Account  
- **Email:** `demo@financialsystem.com`
- **Password:** `demo123`
- **Role:** User

### Additional Admin
- **Email:** `vasu@financialsystem.com`
- **Password:** `admin123`
- **Role:** Admin

## 📊 Sample Data Included

The database will be populated with:

- **3 Users** - Admin and demo accounts
- **5 Customers** - Sample company records
- **7 Invoices** - Various statuses (draft, sent, paid, overdue)
- **5 Payments** - Payment transactions linked to invoices
- **3 Payment MOMs** - Minutes of Meeting records
- **5 Action Items** - Follow-up tasks
- **7 Alerts** - System notifications
- **5 Audit Logs** - Activity trail

## 📋 Database Tables

1. **users** - User accounts and authentication
2. **customers** - Customer/company information
3. **invoices** - Invoice records
4. **payments** - Payment transactions
5. **payment_moms** - Minutes of Meeting
6. **action_items** - Action items for follow-ups
7. **alerts** - System alerts
8. **audit_logs** - Audit trail

## 🔧 Troubleshooting

### Connection Issues

1. **Check MySQL is running:**
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Verify database exists:**
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'financial_mgmt_db';"
   ```

3. **Check .env credentials** match your MySQL setup

### Migration Issues

If migrations fail, check:
- Database exists
- User has CREATE TABLE permissions
- No conflicting table names

### Seed Issues

If seeding fails:
- Tables must exist first (run migrations)
- Check for duplicate key errors (data may already exist)

## 📝 Manual SQL Execution

If you prefer to run SQL manually:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
mysql -u root -p financial_mgmt_db < migrations/202510150001_init_schema.sql
mysql -u root -p financial_mgmt_db < migrations/202510150002_add_missing_tables.sql

# Run seeds
mysql -u root -p financial_mgmt_db < seeds/001_seed_core.sql
mysql -u root -p financial_mgmt_db < seeds/002_seed_starter_data.sql
```

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **Change default passwords** immediately after first login
2. **Update JWT_SECRET** to a strong random string
3. **Use strong MySQL passwords**
4. **Restrict database access** to application server only
5. **Enable SSL** for database connections

## 📚 Additional Documentation

- See `backend/DATABASE_SETUP.md` for detailed setup instructions
- See `ANALYSIS.md` for system architecture details

## ✅ Verification

After setup, verify everything works:

1. **Check tables exist:**
   ```bash
   mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"
   ```

2. **Check user count:**
   ```bash
   mysql -u root -p financial_mgmt_db -e "SELECT COUNT(*) FROM users;"
   ```
   Should return: 3

3. **Test login:**
   - Start backend: `npm run dev`
   - Start frontend: `cd ../frontend && npm run dev`
   - Login at `http://localhost:3000/login` with starter credentials

## 🎯 Next Steps

1. ✅ Database setup complete
2. ✅ Start backend server: `npm run dev`
3. ✅ Start frontend: `cd ../frontend && npm run dev`
4. ✅ Login and explore the dashboard
5. ✅ Review sample data in the system

---

**Need Help?** Check the logs in `backend/logs/` for detailed error messages.

