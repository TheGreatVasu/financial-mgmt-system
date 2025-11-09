-- Add phone_number column to users table
ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(20) NULL AFTER last_name,
ADD INDEX idx_users_phone (phone_number);

