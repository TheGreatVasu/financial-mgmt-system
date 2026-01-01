# Database Schema Fix - Deployment Guide

## Problem Summary

**Production Issue:** `/api/customers`, dashboard, and subscription endpoints return 500 errors with `ER_BAD_FIELD_ERROR: Unknown column`

**Root Cause:** Backend code expects columns that don't exist in production database because migrations weren't applied

**Solution:** 4 migration files (2 Knex JS + 2 SQL) to safely add all missing columns

---

## Quick Fix (5 minutes)

### Step 1: Apply SQL Changes (Immediate)

Choose based on your database access:

**Option A: Via SSH/CLI Access**

```bash
cd /path/to/financial-mgmt-system/backend/migrations

# Add subscription columns to users table
mysql -h YOUR_MYSQL_HOST -u YOUR_MYSQL_USER -p YOUR_DATABASE < FIX_USERS_SUBSCRIPTION_COLUMNS.sql

# Add created_by ownership columns
mysql -h YOUR_MYSQL_HOST -u YOUR_MYSQL_USER -p YOUR_DATABASE < FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql

# When prompted for password, enter your MySQL password
```

**Option B: Via phpMyAdmin/MySQL Console**

1. Log into phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Copy content from `FIX_USERS_SUBSCRIPTION_COLUMNS.sql`
5. Paste and execute (Execute button)
6. Repeat for `FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql`

**Option C: Via Application Code**

```javascript
// In backend startup or CLI script
const knex = require('./knexfile').development; // or production config

// Run migrations programmatically
knex.migrate.latest()
  .then(() => console.log('Migrations completed'))
  .catch(err => console.error('Migration failed:', err));
```

### Step 2: Verify the Fix

```bash
# Check if columns were added
mysql -h YOUR_MYSQL_HOST -u YOUR_MYSQL_USER -p YOUR_DATABASE -e "
  SELECT COLUMN_NAME 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'users' AND COLUMN_NAME LIKE 'plan_%'
  ORDER BY COLUMN_NAME;
"

# Should output: plan_id, plan_interval, plan_name, plan_price, etc.
```

### Step 3: Verify Application Works

```bash
# Test /api/customers endpoint
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return 200 with customer list (not 500)
```

---

## Detailed Deployment Steps

### Pre-Deployment Checklist

- [ ] Backup database: `mysqldump -h HOST -u USER -p DB_NAME > backup_$(date +%s).sql`
- [ ] Test on staging first with same database credentials
- [ ] Notify users of brief maintenance window (if needed)
- [ ] Have rollback plan ready

### Phase 1: Database Schema Updates

```bash
# 1. SSH to production server
ssh your-server

# 2. Navigate to project
cd /path/to/financial-mgmt-system/backend

# 3. Create backup (CRITICAL)
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DB > schema_backup_$(date +%s).sql

# 4. Apply subscription columns
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DB < migrations/FIX_USERS_SUBSCRIPTION_COLUMNS.sql

# Check for errors - should see "Query OK" for each ALTER
```

Expected output:
```
Query OK, 0 rows affected (0.02 sec)
Query OK, 0 rows affected (0.01 sec)
...
```

```bash
# 5. Apply ownership columns
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DB < migrations/FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql

# Check for errors - should see "Query OK" for each ALTER
```

### Phase 2: Run Knex Migrations

```bash
# 6. Pull latest code if needed
git pull origin main

# 7. Run migrations
npm run db:migrate

# Output should show:
# > Ran 2 migrations
# > Batch 1: Migration 202601010001_add_subscription_billing_columns.js completed
# > Batch 1: Migration 202601010002_add_created_by_ownership_columns.js completed
```

### Phase 3: Application Restart

```bash
# 8. Restart Node.js application
# (method depends on your process manager)

# If using PM2:
pm2 restart financial-mgmt-backend

# If using systemd:
sudo systemctl restart financial-mgmt-backend

# If using Docker:
docker restart financial-mgmt-system-backend
```

### Phase 4: Verification

```bash
# 9. Verify schema changes
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DB << EOF
-- Verify users table columns
DESCRIBE users;

-- Verify created_by columns
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE COLUMN_NAME = 'created_by' 
AND TABLE_SCHEMA = DATABASE();

-- Verify indexes were created
SHOW INDEXES FROM customers WHERE Column_name = 'created_by';
EOF

# 10. Test API endpoints
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Should return: {"success": true, "data": [...]}
```

---

## Files in This Fix

| File | Purpose | When to Use |
|------|---------|------------|
| `202601010001_add_subscription_billing_columns.js` | Knex migration for subscription columns | Auto-run with `npm run db:migrate` |
| `202601010002_add_created_by_ownership_columns.js` | Knex migration for ownership columns | Auto-run with `npm run db:migrate` |
| `FIX_USERS_SUBSCRIPTION_COLUMNS.sql` | Direct SQL fix (can run anytime) | Alternative to Knex |
| `FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql` | Direct SQL fix for ownership | Alternative to Knex |
| `SCHEMA_FIX_README.md` | Complete technical documentation | Reference |

---

## What Gets Added

### Users Table (11 new columns, all nullable)
- `plan_id` - Subscription plan (defaults to 'free')
- `plan_name` - Plan display name
- `plan_price` - Monthly cost
- `plan_interval` - Billing period
- `storage_used` - Current storage used in GB
- `storage_limit` - Maximum storage quota in GB
- `invoices_this_month` - Invoice count for current period
- `invoice_limit` - Maximum invoices per period
- `billing_status` - Active/suspended/cancelled
- `billing_renews_at` - Next renewal date
- `payment_method` - Payment processor reference

### Other Tables (1 column each: `created_by`)
- `customers.created_by` - Track which user created the customer
- `invoices.created_by` - Track invoice creator
- `po_entries.created_by` - Track PO entry creator
- `sales_invoice_master.created_by` - Track sales invoice creator
- `payment_moms.created_by` - Track MOM creator

All have indexes for fast queries and are nullable for backward compatibility.

---

## Troubleshooting

### Issue: "Access denied" when running MySQL commands

```bash
# Solution: Include password in command (or use env variable)
mysql -h $HOST -u $USER -p $PASS $DB < migrations/FIX_*.sql

# Or use MySQL config file (~/.my.cnf):
[client]
host=your-host
user=your-user
password=your-password
```

### Issue: "Unknown column" errors still appearing

**Check 1: Verify columns were actually added**
```bash
mysql -h $HOST -u $USER -p $PASS $DB -e "DESCRIBE users;" | grep -E "plan_|storage_|invoice_|billing_"
```

**Check 2: Make sure using correct database**
```bash
mysql -h $HOST -u $USER -p $PASS $DB -e "SELECT DATABASE();"
```

**Check 3: Application is using updated schema**
```bash
# Restart app to reload schema:
pm2 restart financial-mgmt-backend
# Wait 10 seconds for restart
curl http://localhost:5000/health
```

### Issue: Migrations show "already running" or stale

```bash
# Check migration status
npm run db:migrate:status

# If stuck, check knex_migrations table
mysql -h $HOST -u $USER -p $PASS $DB -e "SELECT * FROM knex_migrations;"

# If truly stuck, can manually delete bad entry:
# DELETE FROM knex_migrations WHERE migration LIKE '%202601%';
```

### Issue: SQL file syntax errors

- Verify line endings (should be Unix LF, not Windows CRLF)
- Check MySQL version supports the syntax
- Run with `SOURCE` command for better error reporting:
  ```mysql
  SOURCE /path/to/FIX_USERS_SUBSCRIPTION_COLUMNS.sql;
  ```

---

## Rollback Plan

If something goes wrong, you have a backup:

```bash
# 1. Restore database from backup created earlier
mysql -h $HOST -u $USER -p $PASS $DB < schema_backup_TIMESTAMP.sql

# 2. Restart application
pm2 restart financial-mgmt-backend

# 3. Contact support with error details
```

To manually remove added columns (if needed):

```sql
-- Only run if absolutely necessary for rollback
ALTER TABLE users DROP COLUMN plan_id;
ALTER TABLE users DROP COLUMN plan_name;
-- ... etc for all columns

DELETE FROM knex_migrations WHERE migration LIKE '202601%';
```

---

## Success Criteria

After deployment, verify:

1. ✅ **No 500 errors on `/api/customers`**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/customers
   # Should return 200 with customer list
   ```

2. ✅ **Dashboard endpoints working**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/dashboard
   # Should return 200 with metrics
   ```

3. ✅ **No `ER_BAD_FIELD_ERROR` in logs**
   ```bash
   tail -f backend/logs/app.log | grep -i "ER_BAD_FIELD_ERROR"
   # Should have no matches
   ```

4. ✅ **New customers can be created**
   ```bash
   curl -X POST http://localhost:5000/api/customers \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"company_name": "Test Corp"}'
   # Should return 201 with new customer
   ```

5. ✅ **Existing data is intact**
   ```bash
   # Verify customer count hasn't changed
   curl -H "Authorization: Bearer $TOKEN" \
     'http://localhost:5000/api/customers?limit=1' \
     | grep -o '"total":' 
   # Should match pre-deployment count
   ```

---

## Post-Deployment Monitoring

Monitor these logs after deployment:

```bash
# 1. Application errors
tail -f backend/logs/error.log | grep -i "field"

# 2. Slow queries (now with indexes)
tail -f backend/logs/slow.log | head -20

# 3. Database connection issues
tail -f backend/logs/app.log | grep -i "database\|connection"
```

No errors = successful deployment! ✅

---

## Support

For issues, check:
1. `SCHEMA_FIX_README.md` - Technical details and troubleshooting
2. Database backup file - For rollback
3. Migration logs - In `backend/logs/migrations.log` (if enabled)

**Keep this guide for future reference on handling schema migrations.**
