# Database Setup Guide

## Quick Start

This guide will help you set up the MySQL database for the Financial Management System with starter credentials and sample data.

## Prerequisites

- MySQL 5.7+ or MySQL 8.0+
- Node.js 16+ installed
- npm packages installed (`npm install` in backend directory)

## Database Configuration

### 1. Create MySQL Database

```sql
CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using MySQL command line:
```bash
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Configure Environment Variables

Create or update `.env` file in the `backend` directory:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
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
```

### 3. Run Migrations

This will create all necessary tables:

```bash
cd backend
npm run db:migrate
```

Or manually:
```bash
knex --knexfile knexfile.js migrate:latest
```

### 4. Seed the Database

This will populate the database with starter credentials and sample data:

```bash
npm run db:seed
```

Or manually:
```bash
knex --knexfile knexfile.js seed:run
```

### 5. Run Both (Recommended)

```bash
npm run db:setup
```

This runs both migrations and seeds in one command.

## Starter Login Credentials

After seeding, you can login with these credentials:

### Admin Account
- **Email:** `admin@financialsystem.com`
- **Password:** `admin123`
- **Role:** Admin
- **Name:** Admin User

### Demo Account
- **Email:** `demo@financialsystem.com`
- **Password:** `demo123`
- **Role:** User
- **Name:** Demo User

### Additional Admin Account
- **Email:** `vasu@financialsystem.com`
- **Password:** `admin123`
- **Role:** Admin
- **Name:** Vasu Sharma

## Sample Data Included

The seed file includes:

### Users
- 3 starter user accounts (2 admins, 1 regular user)

### Customers
- 5 sample customers with company details

### Invoices
- 7 sample invoices with various statuses (draft, sent, paid, overdue)

### Payments
- 5 sample payment records linked to invoices

### Payment MOMs (Minutes of Meeting)
- 3 sample MOM records with meeting details and payment agreements

### Action Items
- 5 sample action items for follow-ups

### Alerts
- 7 sample system alerts (warnings, success messages, etc.)

### Audit Logs
- Sample audit trail entries

## Database Schema

### Core Tables

1. **users** - User authentication and profiles
2. **customers** - Customer/company information
3. **invoices** - Invoice records
4. **payments** - Payment transactions
5. **payment_moms** - Minutes of Meeting records
6. **action_items** - Action items for follow-ups
7. **alerts** - System alerts/notifications
8. **audit_logs** - Audit trail

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check MySQL is running:**
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Verify database exists:**
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'financial_mgmt_db';"
   ```

3. **Check credentials in `.env`:**
   - Ensure `MYSQL_USER` and `MYSQL_PASSWORD` are correct
   - Ensure `MYSQL_DATABASE` matches the created database name

### Migration Issues

If migrations fail:

1. **Check if tables already exist:**
   ```bash
   mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"
   ```

2. **Reset migrations (WARNING: This will drop all tables):**
   ```bash
   knex --knexfile knexfile.js migrate:rollback --all
   knex --knexfile knexfile.js migrate:latest
   ```

### Seed Issues

If seeding fails:

1. **Check if data already exists:**
   ```bash
   mysql -u root -p financial_mgmt_db -e "SELECT COUNT(*) FROM users;"
   ```

2. **Re-run seeds (will update existing records):**
   ```bash
   knex --knexfile knexfile.js seed:run
   ```

## Manual Database Setup

If you prefer to set up manually:

1. **Create database:**
   ```sql
   CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE financial_mgmt_db;
   ```

2. **Run migration SQL:**
   ```bash
   mysql -u root -p financial_mgmt_db < migrations/202510150001_init_schema.sql
   mysql -u root -p financial_mgmt_db < migrations/202510150002_add_missing_tables.sql
   ```

3. **Run seed SQL:**
   ```bash
   mysql -u root -p financial_mgmt_db < seeds/001_seed_core.sql
   mysql -u root -p financial_mgmt_db < seeds/002_seed_starter_data.sql
   ```

## Security Notes

⚠️ **IMPORTANT:** 

1. **Change default passwords** after first login
2. **Update JWT_SECRET** in production to a strong random string
3. **Use strong MySQL passwords** in production
4. **Restrict database access** to application server only
5. **Enable SSL** for database connections in production

## Next Steps

After database setup:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Login at `http://localhost:3000/login` with the starter credentials

4. Explore the sample data in the dashboard

## Support

For issues or questions:
- Check the `ANALYSIS.md` file for system architecture details
- Review backend logs in `backend/logs/`
- Check database connection in `backend/src/config/db.js`

