-- Quick fix script for role column issue
-- Run this directly in your MySQL database to fix the "Data truncated for column 'role'" error
-- 
-- Usage: mysql -u your_username -p your_database_name < fix-role-column.sql
-- Or execute this in MySQL Workbench, phpMyAdmin, or your preferred database client

-- Step 1: Convert ENUM to VARCHAR to avoid truncation issues
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Step 2: Add a CHECK constraint to ensure only valid roles are allowed
-- Note: For MySQL versions < 8.0.16, CHECK constraints are parsed but ignored
-- The application layer will still validate roles, so this is a safety measure
ALTER TABLE users 
ADD CONSTRAINT chk_users_role 
CHECK (role IN ('admin','user','company','business_user','company_admin','system_admin'));

-- Step 3: Update any existing invalid role values to 'user' as a safety measure
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin','user','company','business_user','company_admin','system_admin');

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'role';

