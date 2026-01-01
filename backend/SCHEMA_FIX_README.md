# Production Database Schema Mismatch - Analysis & Resolution

## Executive Summary

Your application is experiencing **ER_BAD_FIELD_ERROR** (MySQL error 1054) errors on production because:

1. **Backend code expects columns that don't exist in production database**
2. **Knex migration system reports "up to date" even though migrations haven't been run**
3. **Result:** 500 errors on `/api/customers`, dashboard endpoints, and subscription APIs

This document explains why this happens and provides the complete fix.

---

## Root Cause Analysis

### Why This Happens

This schema mismatch occurs due to **migration drift** - a common scenario in development workflows:

```
Development Environment          Production Environment
├─ Latest schema                 ├─ Older schema
├─ All migrations run            ├─ Some migrations never ran
├─ New columns exist             ├─ New columns missing
└─ Code works perfectly          └─ Code crashes with 500 errors
```

### Why "npm run db:migrate" Reports Success

The Knex migration system tracks **which migration files have been executed** using the `knex_migrations` table, not what the actual schema looks like. Here's the sequence:

1. **Development:** Run `npm run db:migrate` → Creates migration entries in `knex_migrations` table
2. **Production Deployment:** Only code is deployed, NOT the migration state
3. **Production runs migration:** `npm run db:migrate` checks `knex_migrations` → Sees latest migration already recorded → Skips it
4. **Result:** Report says "up to date" but schema is still old

This happens because:
- `knex_migrations` table contains stale entries from development
- Migration files assume "IF NOT EXISTS" logic (but many migrations don't use this)
- Database schema wasn't updated when code changed
- Previous deployments didn't include migration execution

### Common Scenarios Where This Occurs

1. **Inconsistent deployment process:** Code deployed but migrations not explicitly run
2. **Database restored from backup:** Old schema restored, but migration tracking table not cleared
3. **Manual schema modifications:** Changes made outside migration system, confusing Knex
4. **Environment drift:** Development and production diverged over time
5. **Missing error handling in migrations:** Old migrations failed silently

---

## Missing Columns Identified

### 1. Users Table - Subscription & Billing Columns

**Location in code:** `backend/src/services/userRepo.js` lines 37-61

Backend expects but production is missing:

```
plan_id              (VARCHAR(50))        - Current subscription plan identifier
plan_name            (VARCHAR(100))       - Human-readable plan name
plan_price           (DECIMAL(10,2))      - Monthly cost
plan_interval        (ENUM)               - Billing period (monthly/yearly)
storage_used         (DECIMAL(12,2))      - Current storage in GB
storage_limit        (DECIMAL(12,2))      - Max allowed storage
invoices_this_month  (INT UNSIGNED)       - Invoice count this period
invoice_limit        (INT UNSIGNED)       - Max invoices per period
billing_status       (ENUM)               - Current status (active/suspended/cancelled)
billing_renews_at    (DATETIME)           - Next renewal date
payment_method       (VARCHAR(100))       - Payment processor reference
```

**Impact:** Dashboard loads, user profile APIs throw 500 errors

---

### 2. Customers Table - Ownership Tracking

**Location in code:** `backend/src/controllers/customerController.js` line 509

Backend expects but production is missing:

```
created_by (BIGINT UNSIGNED) - User ID that created this customer record
```

**Impact:** `/api/customers` endpoint returns 500 with ER_BAD_FIELD_ERROR

**Related queries failing:**
- `db('customers').where('created_by', userId)` → Column doesn't exist
- `db('customers').insert({created_by: userId, ...})` → Column doesn't exist

---

### 3. Other Tables - Ownership & Audit Tracking

**Location in code:** `backend/src/services/storageUsageService.js` lines 24-29

Backend expects `created_by` in:

- **invoices** - Invoice creator tracking
- **payment_moms** - MOM (Minutes of Meeting) creator
- **po_entries** - Purchase Order entry creator  
- **sales_invoice_master** - Sales invoice creator

**Impact:** Storage calculation fails, dashboard metrics broken

---

## The Fix

### Two-Part Solution

#### Part 1: Safe SQL Migration (Run First)

Use the provided SQL scripts:
- `FIX_USERS_SUBSCRIPTION_COLUMNS.sql` - Adds 11 nullable columns with defaults
- `FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql` - Adds created_by with indexes

These use MySQL's `IF NOT EXISTS` clause to ensure:
- ✅ No errors if columns already exist
- ✅ Backward compatible (nullable + defaults)
- ✅ No data loss
- ✅ Safe to re-run multiple times

**Execution:**
```bash
# SSH into production server
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < FIX_USERS_SUBSCRIPTION_COLUMNS.sql
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql

# Verify it worked
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE -e "
  DESCRIBE users;  -- Check for new columns
  DESCRIBE customers;  -- Check for created_by
"
```

#### Part 2: Knex Migrations (Run Second)

Two new migration files have been created:

1. **202601010001_add_subscription_billing_columns.js**
   - Adds all subscription columns to users table
   - Uses Knex schema builder for database-agnostic approach
   - Handles `IF NOT EXISTS` checks automatically

2. **202601010002_add_created_by_ownership_columns.js**
   - Adds created_by to all tables that need it
   - Handles missing tables gracefully
   - Creates appropriate indexes

**Execution:**
```bash
# Run new migrations
npm run db:migrate

# Verify success
# - Should see migrations 202601010001 and 202601010002 logged as successful
# - `knex_migrations` table should have new entries
```

---

## Why This Solution Works

### Data Preservation ✅
- All columns are **nullable** → existing data untouched
- All columns have **sensible defaults**:
  - `plan_id` defaults to 'free' (users on free tier)
  - `storage_limit` defaults to 15 GB (free plan quota)
  - `invoice_limit` defaults to 50 (free plan limit)
  - `billing_status` defaults to 'active' (assume paid users are active)
- Zero risk of data corruption

### Backward Compatibility ✅
- Existing queries that DON'T reference new columns continue working
- New queries that reference new columns now work
- Code already handles missing columns gracefully with try-catch blocks

### Production Safety ✅
- Can be applied to live database without downtime
- IF NOT EXISTS prevents errors if columns already partially exist
- Includes rollback procedures (down() function in Knex migrations)

### Future-Proof ✅
- Schema now matches code expectations
- New features (subscription, storage tracking) can be enabled
- Foundation for billing/quota enforcement

---

## Detailed Column Reference

### Users Table Additions (11 columns)

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| plan_id | VARCHAR(50) | 'free' | Plan identifier for quota lookups |
| plan_name | VARCHAR(100) | 'Free' | Display name for UI |
| plan_price | DECIMAL(10,2) | 0 | Monthly cost in customer currency |
| plan_interval | ENUM(mo,year,lifetime) | 'mo' | Billing interval |
| storage_used | DECIMAL(12,2) | 0 | Current storage in GB |
| storage_limit | DECIMAL(12,2) | 15 | Max storage in GB |
| invoices_this_month | INT UNSIGNED | 0 | Invoice count for rate limiting |
| invoice_limit | INT UNSIGNED | 50 | Max invoices per billing period |
| billing_status | ENUM(active,suspended,cancelled) | 'active' | Current subscription status |
| billing_renews_at | DATETIME | NULL | Next renewal date (nullable) |
| payment_method | VARCHAR(100) | NULL | Payment processor reference |

### Ownership Columns (5 tables)

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| customers | created_by | BIGINT UNSIGNED | User who created customer |
| invoices | created_by | BIGINT UNSIGNED | User who created invoice |
| payment_moms | created_by | BIGINT UNSIGNED | User who created MOM |
| po_entries | created_by | BIGINT UNSIGNED | User who created PO entry |
| sales_invoice_master | created_by | BIGINT UNSIGNED | User who created sales invoice |

All `created_by` columns:
- Are **nullable** for backward compatibility
- Have **indexes** for fast filtering by owner
- Support **multi-tenancy** and **access control**

---

## Testing the Fix

### Before Applying Fix

```bash
# These should fail with 500 errors:
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/customers
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/dashboard

# Backend logs will show:
# ER_BAD_FIELD_ERROR: Unknown column 'created_by' in 'on clause'
# ER_BAD_FIELD_ERROR: Unknown column 'plan_id' in 'field list'
```

### After Applying Fix

```bash
# These should return 200 with data:
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/customers
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/dashboard

# No more 500 errors
# Storage metrics load correctly
# Customer list shows properly filtered by owner
```

---

## Prevention for Future

### 1. Verify Migration State

Before deploying, verify that **all migrations are actually applied**:

```bash
# Check migration status
npm run db:migrate:status

# Should show all migrations as completed
# If any show as "pending", run: npm run db:migrate
```

### 2. Test Schema in Staging

```bash
# Dump production schema
mysqldump -h PROD_HOST -u USER -p DB_NAME --no-data > prod_schema.sql

# Compare with staging
mysqldump -h STAGING_HOST -u USER -p DB_NAME --no-data > staging_schema.sql

# Diff them to spot divergence
diff prod_schema.sql staging_schema.sql
```

### 3. Include Migrations in Deployment

Deployment checklist:
- [ ] Pull latest code
- [ ] Run `npm run db:migrate` on target environment
- [ ] Verify with `npm run db:migrate:status`
- [ ] Deploy Node.js application
- [ ] Monitor logs for column errors

### 4. Clear Stale Migration State

If migration tracking is corrupted:

```sql
-- Backup first!
-- Check what's recorded
SELECT * FROM knex_migrations ORDER BY batch, migration_time DESC;

-- If needed, you can clear migrations (DANGEROUS - do in test environment first):
-- TRUNCATE TABLE knex_migrations;
-- Then re-run all migrations to rebuild state
```

---

## Troubleshooting

### Issue: "Column already exists" error

**Solution:** The SQL files use `IF NOT EXISTS` so this shouldn't happen. If it does, the migrations will skip existing columns.

### Issue: Access denied or permission errors

**Solution:** Ensure MySQL user has `ALTER TABLE` privileges:

```sql
GRANT ALTER, CREATE ON database_name.* TO 'user'@'host';
FLUSH PRIVILEGES;
```

### Issue: Knex migrations still not running

**Solution:** Manually check and fix `knex_migrations` table:

```bash
# View migration status in detail
npm run db:migrate:status

# If showing "pending", force run:
NODE_ENV=production npm run db:migrate

# View logs for specific error
NODE_ENV=production npm run db:migrate:make test_migration
```

### Issue: Some columns added but not all

**Solution:** Check if previous migrations partially ran. Run the provided SQL scripts again - they're idempotent.

---

## Verification Checklist

After applying this fix, verify:

- [ ] ✅ All 11 columns added to `users` table
- [ ] ✅ `created_by` added to `customers`, `invoices`, `po_entries`, `sales_invoice_master`
- [ ] ✅ Indexes created on `created_by` columns
- [ ] ✅ `/api/customers` returns 200 (not 500)
- [ ] ✅ Dashboard API returns metrics (not 500)
- [ ] ✅ Subscription endpoints working
- [ ] ✅ No more `ER_BAD_FIELD_ERROR` in logs
- [ ] ✅ Existing customer data still present and unchanged
- [ ] ✅ New customers can be created with `created_by` tracking

---

## Files Provided

1. **202601010001_add_subscription_billing_columns.js** - Knex migration (subscriptions)
2. **202601010002_add_created_by_ownership_columns.js** - Knex migration (ownership)
3. **FIX_USERS_SUBSCRIPTION_COLUMNS.sql** - Direct SQL (subscriptions)
4. **FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql** - Direct SQL (ownership)
5. **SCHEMA_FIX_README.md** - This comprehensive guide

---

## Quick Reference

### Immediate Action (Production Fix)

```bash
# 1. Apply SQL fixes
mysql -h $HOST -u $USER -p $DB < FIX_USERS_SUBSCRIPTION_COLUMNS.sql
mysql -h $HOST -u $USER -p $DB < FIX_CREATED_BY_OWNERSHIP_COLUMNS.sql

# 2. Run Knex migrations
npm run db:migrate

# 3. Verify no 500 errors
curl -H "Authorization: Bearer $TOKEN" http://localhost/api/customers

# 4. Monitor logs
tail -f backend/logs/app.log | grep -i "error"
```

### Long-Term Prevention

- Add migration verification to deployment pipeline
- Run `npm run db:migrate:status` before deployment
- Test schema changes in staging first
- Document all schema changes with timestamps
- Keep migration file comments up-to-date

---

## Questions?

If columns still don't appear after running the fix:

1. Verify you're connected to the correct database:
   ```sql
   SELECT DATABASE();
   ```

2. Check for multiple databases with same name:
   ```sql
   SHOW DATABASES LIKE '%financial%';
   ```

3. Verify column didn't go to wrong table:
   ```sql
   SHOW COLUMNS FROM users;
   SHOW COLUMNS FROM customers;
   ```

4. Check MySQL/MariaDB version (affects syntax):
   ```sql
   SELECT VERSION();
   ```

---

**Generated:** 2026-01-01  
**For:** Financial Management System - Production Database Repair  
**Status:** Ready for deployment
