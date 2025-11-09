-- Add items and notes columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS items TEXT NULL COMMENT 'JSON array of invoice items',
ADD COLUMN IF NOT EXISTS notes TEXT NULL COMMENT 'Additional notes or comments',
ADD COLUMN IF NOT EXISTS po_ref VARCHAR(191) NULL COMMENT 'PO Reference',
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) NULL COMMENT 'Payment terms (net15, net30, net45, net60)';

