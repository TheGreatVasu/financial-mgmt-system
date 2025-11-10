-- Fix role column to support longer role values
-- Convert ENUM to VARCHAR(100) to accommodate longer role descriptions

-- Step 1: Convert ENUM to VARCHAR(100)
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(100) NOT NULL DEFAULT 'user';
