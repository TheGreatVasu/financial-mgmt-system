-- Fix role column to support all professional roles
-- This migration ensures the role column can accommodate all role values including 'company_admin' and 'system_admin'
-- The issue is that ENUM columns in MySQL can be problematic when modifying, so we'll convert to VARCHAR with a CHECK constraint

-- Step 1: Convert ENUM to VARCHAR to avoid truncation issues
-- This is more flexible and easier to maintain
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Step 2: Add a CHECK constraint to ensure only valid roles are allowed
-- Note: MySQL 8.0.16+ supports CHECK constraints, for older versions this will be ignored
ALTER TABLE users 
ADD CONSTRAINT chk_users_role 
CHECK (role IN ('admin','user','company','business_user','company_admin','system_admin'));

-- Step 3: Update any existing invalid role values to 'user' as a safety measure
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin','user','company','business_user','company_admin','system_admin');

