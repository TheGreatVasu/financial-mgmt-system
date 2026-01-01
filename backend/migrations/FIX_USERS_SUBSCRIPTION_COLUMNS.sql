-- ============================================================================
-- PRODUCTION SCHEMA FIX: Add subscription/billing columns to users table
-- ============================================================================
-- 
-- CRITICAL: This script fixes ER_BAD_FIELD_ERROR issues on dashboard and
-- subscription-related endpoints by adding all missing columns that the 
-- backend code expects.
--
-- SAFETY: All columns are nullable with sensible defaults, ensuring no data
-- loss for existing users. Existing users default to free tier.
--
-- Run this BEFORE re-running Knex migrations to ensure compatibility.
-- ============================================================================

-- Add subscription plan columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50) NULL DEFAULT 'free' AFTER last_login;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100) NULL DEFAULT 'Free' AFTER plan_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2) NULL DEFAULT 0 AFTER plan_name;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_interval ENUM('mo','year','lifetime') NULL DEFAULT 'mo' AFTER plan_price;

-- Add storage quota columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used DECIMAL(12,2) NULL DEFAULT 0 AFTER plan_interval;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit DECIMAL(12,2) NULL DEFAULT 15 AFTER storage_used;

-- Add invoice quota columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoices_this_month INT UNSIGNED NULL DEFAULT 0 AFTER storage_limit;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_limit INT UNSIGNED NULL DEFAULT 50 AFTER invoices_this_month;

-- Add billing status columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_status ENUM('active','suspended','cancelled') NULL DEFAULT 'active' AFTER invoice_limit;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_renews_at DATETIME NULL AFTER billing_status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) NULL AFTER billing_renews_at;

-- Verify the schema was updated
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;
