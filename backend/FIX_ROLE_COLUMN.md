# Fix Role Column Error

## Problem
You're seeing the error: `Data truncated for column 'role' at row 1`

This happens when the `role` column in the `users` table is an ENUM that doesn't include the new professional roles (`business_user`, `company_admin`, `system_admin`), or the column is too small to store these values.

## Solution

### Option 1: Run the Quick Fix SQL Script (Recommended)

Execute the SQL script directly in your database:

```bash
# Using MySQL command line
mysql -u your_username -p your_database_name < fix-role-column.sql

# Or using MySQL Workbench / phpMyAdmin
# Just copy and paste the contents of fix-role-column.sql and execute
```

### Option 2: Run the Migration

If you have a migration system set up:

```bash
# The migration file is at:
# backend/migrations/202510150007_fix_role_column.sql

# Run it through your migration system or execute it directly
```

### Option 3: Manual SQL Execution

Connect to your database and run:

```sql
-- Convert ENUM to VARCHAR
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Add CHECK constraint (MySQL 8.0.16+)
ALTER TABLE users 
ADD CONSTRAINT chk_users_role 
CHECK (role IN ('admin','user','company','business_user','company_admin','system_admin'));

-- Clean up any invalid values
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin','user','company','business_user','company_admin','system_admin');
```

## What This Does

1. **Converts ENUM to VARCHAR(50)**: This is more flexible and avoids truncation issues
2. **Adds a CHECK constraint**: Ensures only valid roles can be inserted (MySQL 8.0.16+)
3. **Cleans up invalid data**: Sets any invalid role values to 'user'

## Verification

After running the fix, verify the column structure:

```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'role';
```

You should see:
- `DATA_TYPE`: `varchar`
- `CHARACTER_MAXIMUM_LENGTH`: `50`

## After Fixing

1. Restart your backend server
2. Try the Google profile completion form again
3. The error should be resolved

## Notes

- The application layer still validates roles, so even if CHECK constraints aren't supported (MySQL < 8.0.16), the validation will work
- This change is backward compatible - existing roles will continue to work
- The VARCHAR(50) size allows for future role additions without schema changes

