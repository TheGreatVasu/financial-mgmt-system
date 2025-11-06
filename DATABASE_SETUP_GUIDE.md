# 📚 Complete Database Setup Guide - Step by Step
## Learn How to Set Up Database for ANY Website

This guide explains **EVERYTHING** you need to know about setting up a database, explained in the simplest way possible.

---

## 🎯 What is a Database Setup?

Think of a database like a **filing cabinet** for your website:
- **Empty Cabinet** = Empty database (no tables, no data)
- **Drawers** = Tables (users, invoices, customers, etc.)
- **Files in Drawers** = Data (actual user records, invoices, etc.)

**Database Setup** means:
1. Creating the empty cabinet (database)
2. Creating the drawers (tables) - This is called **Migrations**
3. Putting sample files in drawers (sample data) - This is called **Seeding**

---

## 📋 Prerequisites (What You Need First)

Before starting, make sure you have:

1. **MySQL Installed** (The database software)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use: `brew install mysql` (Mac) / `apt-get install mysql` (Linux)

2. **Node.js Installed** (To run JavaScript commands)
   - Download from: https://nodejs.org/
   - Check if installed: `node --version`

3. **MySQL is Running**
   - Check: `mysql --version`
   - Start MySQL service if needed

---

## 🚀 Step-by-Step Setup Process

### **STEP 1: Install Dependencies**

**What this does:** Downloads all the code libraries your project needs.

```bash
cd backend
npm install
```

**Line-by-line explanation:**
- `cd backend` → Go into the backend folder
- `npm install` → Download all packages listed in `package.json`
  - This installs: `knex` (database tool), `mysql2` (MySQL driver), etc.

**Why:** Your code needs these tools to talk to the database.

---

### **STEP 2: Create the Database**

**What this does:** Creates an empty database (the filing cabinet).

**Option A: Using MySQL Command Line (Recommended for beginners)**

```bash
mysql -u root -p
```

**Line-by-line explanation:**
- `mysql` → Open MySQL command tool
- `-u root` → Login as "root" user (the admin user)
- `-p` → Prompt for password (you'll type your MySQL password)

After entering password, you'll see `mysql>` prompt. Then type:

```sql
CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Line-by-line explanation:**
- `CREATE DATABASE` → Make a new database
- `financial_mgmt_db` → Name of your database
- `CHARACTER SET utf8mb4` → Use UTF-8 encoding (supports all languages/emojis)
- `COLLATE utf8mb4_unicode_ci` → How to sort/compare text (case-insensitive)

Then type:
```sql
exit;
```

**Option B: Using One Command (Faster)**

```bash
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Line-by-line explanation:**
- `mysql -u root -p` → Login to MySQL
- `-e "..."` → Execute this SQL command
- The SQL command creates the database
- You'll be prompted for password

**Why:** You need an empty database before you can create tables in it.

---

### **STEP 3: Create .env File (Configuration)**

**What this does:** Stores your database connection settings (like a password manager).

**Location:** Create file `backend/.env`

**Content:**
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

**Line-by-line explanation:**

**Database Section:**
- `MYSQL_HOST=localhost` → Database is on your computer (localhost = this computer)
- `MYSQL_PORT=3306` → Port number MySQL uses (default is 3306)
- `MYSQL_USER=root` → Your MySQL username
- `MYSQL_PASSWORD=your_mysql_password` → **REPLACE** with your actual MySQL password
- `MYSQL_DATABASE=financial_mgmt_db` → Name of database you created in Step 2

**JWT Section:**
- `JWT_SECRET=...` → Secret key for encrypting login tokens (like a master key)
- `JWT_EXPIRE=7d` → Tokens expire after 7 days

**Server Section:**
- `PORT=5001` → Backend server runs on port 5001
- `NODE_ENV=development` → Running in development mode

**CORS Section:**
- `CORS_ORIGIN=...` → Which website can access your API (frontend URL)

**Why:** Your code needs to know WHERE and HOW to connect to the database. This file stores those settings securely.

**⚠️ IMPORTANT:** 
- Replace `your_mysql_password` with your actual MySQL root password
- Never commit `.env` file to Git (it's in `.gitignore`)

---

### **STEP 4: Run Migrations (Create Tables)**

**What this does:** Creates all the tables (drawers) in your database.

**What are Migrations?**
- Migration files = Instructions to create/modify tables
- Located in: `backend/migrations/`
- Files like: `202510150001_init_schema.sql` (creates users, customers, invoices tables)

**Command:**
```bash
cd backend
npm run db:migrate
```

**Line-by-line explanation:**
- `cd backend` → Go to backend folder
- `npm run db:migrate` → Run the migration script
  - This executes: `knex --knexfile knexfile.js migrate:latest`
  - `knex` → Database migration tool
  - `--knexfile knexfile.js` → Use this config file
  - `migrate:latest` → Run all pending migrations

**What happens:**
1. Knex reads `knexfile.js` to get database connection info
2. Connects to database using `.env` settings
3. Reads all files in `migrations/` folder
4. Executes SQL commands to create tables:
   - `users` table (for login accounts)
   - `customers` table (for customer info)
   - `invoices` table (for invoices)
   - `payments` table (for payments)
   - etc.
5. Records which migrations ran in `knex_migrations` table

**Why:** Your app needs tables to store data. Migrations create the structure.

**Check if it worked:**
```bash
mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"
```

This shows all tables created.

---

### **STEP 5: Run Seeds (Add Sample Data)**

**What this does:** Adds sample/initial data to your tables (like putting sample files in drawers).

**What are Seeds?**
- Seed files = SQL commands to insert initial data
- Located in: `backend/seeds/`
- Files like: `001_seed_core.sql` (creates admin users)
- Files like: `002_seed_starter_data.sql` (creates sample customers, invoices)

**Command:**
```bash
npm run db:seed
```

**Line-by-line explanation:**
- `npm run db:seed` → Run the seed script
  - This executes: `knex --knexfile knexfile.js seed:run`
  - `seed:run` → Run all seed files

**What happens:**
1. Knex connects to database
2. Reads all files in `seeds/` folder (in order: 001, 002, etc.)
3. Executes SQL INSERT commands:
   - Creates admin user: `admin@financialsystem.com` / `admin123`
   - Creates demo user: `demo@financialsystem.com` / `demo123`
   - Creates sample customers
   - Creates sample invoices
   - etc.

**Why:** You need initial data to test your app. Seeds provide that.

**Check if it worked:**
```bash
mysql -u root -p financial_mgmt_db -e "SELECT email, role FROM users;"
```

This shows all users created.

---

### **STEP 6: Run Both Together (Recommended)**

**What this does:** Runs migrations AND seeds in one command.

**Command:**
```bash
npm run db:setup
```

**Line-by-line explanation:**
- `npm run db:setup` → Runs both commands
  - This executes: `npm run db:migrate && npm run db:seed`
  - `&&` → Run second command only if first succeeds

**Why:** Faster than running them separately.

---

## 🔍 Understanding the Files

### **knexfile.js** (Database Configuration)

```javascript
require('dotenv').config()  // Load .env file

module.exports = {
  client: 'mysql2',  // Use MySQL database
  connection: {
    host: process.env.MYSQL_HOST,      // From .env: localhost
    port: Number(process.env.MYSQL_PORT || 3306),  // From .env: 3306
    user: process.env.MYSQL_USER,      // From .env: root
    password: process.env.MYSQL_PASSWORD,  // From .env: your password
    database: process.env.MYSQL_DATABASE,  // From .env: financial_mgmt_db
  },
  pool: { min: 0, max: 10 },  // Connection pool (how many connections)
  migrations: {
    tableName: 'knex_migrations',  // Table to track migrations
    directory: './migrations'       // Where migration files are
  },
  seeds: {
    directory: './seeds'  // Where seed files are
  }
}
```

**What it does:** Tells Knex how to connect to your database and where to find migration/seed files.

---

### **Migration File Example** (`migrations/202510150001_init_schema.sql`)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(191) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Line-by-line explanation:**
- `CREATE TABLE IF NOT EXISTS users` → Create table named "users" (only if it doesn't exist)
- `id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT` → 
  - `id` = column name
  - `BIGINT` = large number type
  - `PRIMARY KEY` = unique identifier for each row
  - `AUTO_INCREMENT` = automatically increases (1, 2, 3, ...)
- `email VARCHAR(191) UNIQUE NOT NULL` →
  - `email` = column name
  - `VARCHAR(191)` = text up to 191 characters
  - `UNIQUE` = no duplicates allowed
  - `NOT NULL` = required field
- `role ENUM('admin','user')` → Only allow 'admin' or 'user' values
- `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` → Auto-sets to current time when row is created

**Why:** This defines the structure of your users table.

---

### **Seed File Example** (`seeds/001_seed_core.sql`)

```sql
-- Insert admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'admin',
  'admin@financialsystem.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y',  -- Hashed password for 'admin123'
  'Admin',
  'User',
  'admin',
  1
);
```

**Line-by-line explanation:**
- `INSERT INTO users` → Add a row to users table
- `(username, email, ...)` → Column names to fill
- `VALUES (...)` → The actual data
- `password_hash` → Encrypted password (never store plain passwords!)

**Why:** Creates initial admin account so you can login.

---

## 🎯 Complete Setup Workflow (Copy-Paste Ready)

Here's the complete sequence of commands:

```bash
# Step 1: Go to backend folder
cd backend

# Step 2: Install dependencies
npm install

# Step 3: Create .env file (edit with your MySQL password)
# Create file: backend/.env
# Copy content from Step 3 above and update MYSQL_PASSWORD

# Step 4: Create database (enter your MySQL password when prompted)
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Step 5: Run migrations (creates tables)
npm run db:migrate

# Step 6: Run seeds (adds sample data)
npm run db:seed

# OR Step 5+6 together:
npm run db:setup
```

---

## 🔧 Troubleshooting

### **Error: "Access denied for user"**
**Problem:** Wrong MySQL username/password in `.env`
**Solution:** Check `MYSQL_USER` and `MYSQL_PASSWORD` in `.env`

### **Error: "Unknown database"**
**Problem:** Database doesn't exist
**Solution:** Run Step 2 again to create database

### **Error: "Table already exists"**
**Problem:** Migrations already ran
**Solution:** 
- Check: `mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"`
- If tables exist, skip migrations or reset: `knex migrate:rollback --all`

### **Error: "Cannot connect to MySQL"**
**Problem:** MySQL service not running
**Solution:** 
- Mac: `brew services start mysql`
- Linux: `sudo service mysql start`
- Windows: Start MySQL from Services

---

## 📊 How This Applies to ANY Website

The same process works for **any website**:

1. **Create Database** → Always needed
2. **Create .env** → Store connection settings
3. **Run Migrations** → Create your tables (users, posts, products, etc.)
4. **Run Seeds** → Add initial data (admin user, sample data)

**Different websites = Different tables:**
- Blog → `posts`, `comments`, `categories`
- E-commerce → `products`, `orders`, `cart`
- Social Media → `posts`, `likes`, `followers`
- This App → `users`, `customers`, `invoices`, `payments`

**The process is ALWAYS the same!**

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'financial_mgmt_db';"

# 2. Check tables exist
mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"

# 3. Check users exist
mysql -u root -p financial_mgmt_db -e "SELECT email, role FROM users;"

# 4. Check sample data exists
mysql -u root -p financial_mgmt_db -e "SELECT COUNT(*) as customer_count FROM customers;"
```

---

## 🎓 Key Concepts Summary

| Term | Simple Explanation | Real-World Example |
|------|-------------------|-------------------|
| **Database** | Filing cabinet | Empty storage space |
| **Table** | Drawer in cabinet | `users`, `invoices` |
| **Row** | One file in drawer | One user record |
| **Column** | Field in file | `email`, `name` |
| **Migration** | Instructions to create drawers | SQL to create tables |
| **Seed** | Sample files to put in drawers | Initial data (admin user) |
| **.env** | Password manager | Stores connection settings |

---

## 🚀 Next Steps After Setup

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login:**
   - Go to: `http://localhost:3000/login`
   - Email: `admin@financialsystem.com`
   - Password: `admin123`

4. **Access Database Management:**
   - Click "Database" in sidebar (admin only)
   - Or go to: `http://localhost:3000/admin/database`

---

## 💡 Pro Tips

1. **Always backup before migrations** in production
2. **Test migrations on development first**
3. **Never commit .env file** to Git
4. **Use strong passwords** in production
5. **Document your migrations** (what each one does)

---

**Congratulations!** 🎉 You now understand how database setup works for any website!

