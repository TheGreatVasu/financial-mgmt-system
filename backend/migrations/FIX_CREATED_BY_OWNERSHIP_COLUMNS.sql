-- ============================================================================
-- PRODUCTION SCHEMA FIX: Add created_by ownership columns
-- ============================================================================
--
-- CRITICAL: This script fixes ER_BAD_FIELD_ERROR issues on /api/customers,
-- dashboard endpoints, and invoice-related APIs by adding the created_by
-- column that tracks data ownership per user.
--
-- SAFETY: All columns are nullable, maintaining backward compatibility with
-- existing data. Historic records without ownership info remain intact.
--
-- Run this BEFORE re-running Knex migrations to ensure compatibility.
-- ============================================================================

-- Add created_by to customers table (if missing)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER status;

-- Add created_by to invoices table (if missing - may already exist)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER status;

-- Add created_by to payment_moms table (if it exists)
-- This table may not exist yet in all environments
ALTER TABLE payment_moms ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER updated_at;

-- Add created_by to po_entries table (if missing - may already exist)
ALTER TABLE po_entries ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER status;

-- Add created_by to sales_invoice_master table (if missing - may already exist)
ALTER TABLE sales_invoice_master ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED NULL AFTER status;

-- Create indexes for faster filtering by owner (improves performance)
ALTER TABLE customers ADD INDEX idx_customers_created_by (created_by);
ALTER TABLE invoices ADD INDEX idx_invoices_created_by (created_by);
ALTER TABLE po_entries ADD INDEX idx_po_entries_created_by (created_by);
ALTER TABLE sales_invoice_master ADD INDEX idx_sales_invoice_created_by (created_by);

-- Verify columns were added
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND COLUMN_NAME = 'created_by'
ORDER BY TABLE_NAME;
