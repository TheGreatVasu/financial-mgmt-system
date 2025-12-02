-- Comprehensive fix for role column
-- This migration handles all cases: ENUM, VARCHAR(50), or any other size
-- It converts the role column to VARCHAR(255) to accommodate any future role values

-- Step 1: Try to drop existing CHECK constraint (will fail silently if it doesn't exist)
-- Note: This will fail silently on older MySQL versions, which is fine
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;

-- Step 2: Convert role column to VARCHAR(255) regardless of current type
-- This handles ENUM, VARCHAR(50), VARCHAR(100), or any other type
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user';

-- Step 3: Update any invalid role values to 'user' as a safety measure
-- Valid roles: admin, user, company, business_user, company_admin, system_admin
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin','user','company','business_user','company_admin','system_admin');

