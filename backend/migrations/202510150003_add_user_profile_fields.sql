-- Add phone_number, avatar_url, and preferences to users table
-- Using a simple approach - these will error if columns exist, but that's handled by migration system

-- Add phone_number column (if it doesn't exist, this will fail but migration can be re-run)
ALTER TABLE users ADD COLUMN phone_number VARCHAR(50) NULL AFTER last_name;

-- Add avatar_url column
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER phone_number;

-- Add preferences column (JSON type for MySQL 5.7+)
ALTER TABLE users ADD COLUMN preferences JSON NULL AFTER avatar_url;

-- Update role enum to include new professional roles
ALTER TABLE users 
  MODIFY COLUMN role ENUM('admin','user','company','business_user','company_admin','system_admin') NOT NULL DEFAULT 'user';
