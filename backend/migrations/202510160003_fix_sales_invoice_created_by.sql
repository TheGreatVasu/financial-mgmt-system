-- Fix sales_invoice_master.created_by to use BIGINT UNSIGNED to match users.id
-- This ensures proper foreign key relationships and user data isolation

-- First, check if column exists and what type it is
-- If it's INT, we need to alter it to BIGINT UNSIGNED

ALTER TABLE sales_invoice_master 
MODIFY COLUMN created_by BIGINT UNSIGNED NULL;

-- Add index for performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_sales_invoice_master_created_by ON sales_invoice_master(created_by);

