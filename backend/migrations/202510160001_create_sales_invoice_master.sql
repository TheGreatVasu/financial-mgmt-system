-- Migration: Create sales_invoice_master table to store all 93 columns from Excel import
-- This table stores comprehensive invoice data with all fields from Sales_Invoice_Import_Format.xlsx

CREATE TABLE IF NOT EXISTS sales_invoice_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic Invoice Information (Columns 1-5)
  key_id VARCHAR(100) UNIQUE,
  gst_tax_invoice_no VARCHAR(100) NOT NULL,
  gst_tax_invoice_date DATE,
  internal_invoice_no VARCHAR(100),
  invoice_type VARCHAR(50),
  
  -- Business & Customer Information (Columns 6-10)
  business_unit VARCHAR(100),
  customer_name VARCHAR(255) NOT NULL,
  segment VARCHAR(100),
  region VARCHAR(100),
  zone VARCHAR(100),
  
  -- Order & Reference Information (Columns 11-14)
  sales_order_no VARCHAR(100),
  account_manager_name VARCHAR(255),
  po_no_reference VARCHAR(100),
  po_date DATE,
  
  -- Party & Material Information (Columns 15-17)
  bill_to_party VARCHAR(255),
  material_description TEXT,
  state_of_supply VARCHAR(100),
  
  -- Quantity & Pricing (Columns 18-22)
  qty DECIMAL(15, 3) DEFAULT 0,
  unit VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'INR',
  basic_rate DECIMAL(15, 2) DEFAULT 0,
  basic_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Freight Information (Columns 23-25)
  freight_invoice_no VARCHAR(100),
  freight_rate DECIMAL(15, 2) DEFAULT 0,
  freight_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Tax Information (Columns 26-30)
  sgst_output DECIMAL(15, 2) DEFAULT 0,
  cgst_output DECIMAL(15, 2) DEFAULT 0,
  igst_output DECIMAL(15, 2) DEFAULT 0,
  ugst_output DECIMAL(15, 2) DEFAULT 0,
  tcs DECIMAL(15, 2) DEFAULT 0,
  
  -- Financial Totals (Columns 31-32)
  subtotal DECIMAL(15, 2) DEFAULT 0,
  total_invoice_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Address Information (Columns 33-36)
  consignee_name_address TEXT,
  consignee_city VARCHAR(100),
  payer_name_address TEXT,
  city VARCHAR(100),
  
  -- Logistics & Document Information (Columns 37-50)
  lr_no VARCHAR(100),
  lr_date DATE,
  delivery_challan_no VARCHAR(100),
  delivery_challan_date DATE,
  inspection_offer_date DATE,
  inspection_date DATE,
  delivery_instruction_date DATE,
  last_date_of_dispatch DATE,
  last_date_of_material_receipt DATE,
  invoice_ready_date DATE,
  courier_document_no VARCHAR(100),
  courier_document_date DATE,
  courier_name VARCHAR(255),
  invoice_receipt_date DATE,
  
  -- Payment Terms (Columns 51-52)
  payment_text TEXT,
  payment_terms VARCHAR(255),
  
  -- 1st Due Payment Information (Columns 53-60)
  first_due_date DATE,
  first_due_amount DECIMAL(15, 2) DEFAULT 0,
  payment_received_amount_first_due DECIMAL(15, 2) DEFAULT 0,
  receipt_date_first_due DATE,
  first_due_balance DECIMAL(15, 2) DEFAULT 0,
  not_due_first_due DECIMAL(15, 2) DEFAULT 0,
  over_due_first_due DECIMAL(15, 2) DEFAULT 0,
  no_of_days_of_payment_receipt_first_due INT DEFAULT 0,
  
  -- 2nd Due Payment Information (Columns 61-68)
  second_due_date DATE,
  second_due_amount DECIMAL(15, 2) DEFAULT 0,
  payment_received_amount_second_due DECIMAL(15, 2) DEFAULT 0,
  receipt_date_second_due DATE,
  second_due_balance DECIMAL(15, 2) DEFAULT 0,
  not_due_second_due DECIMAL(15, 2) DEFAULT 0,
  over_due_second_due DECIMAL(15, 2) DEFAULT 0,
  no_of_days_of_payment_receipt_second_due INT DEFAULT 0,
  
  -- 3rd Due Payment Information (Columns 69-76)
  third_due_date DATE,
  third_due_amount DECIMAL(15, 2) DEFAULT 0,
  payment_received_amount_third_due DECIMAL(15, 2) DEFAULT 0,
  receipt_date_third_due DATE,
  third_due_balance DECIMAL(15, 2) DEFAULT 0,
  not_due_third_due DECIMAL(15, 2) DEFAULT 0,
  over_due_third_due DECIMAL(15, 2) DEFAULT 0,
  no_of_days_of_payment_receipt_third_due INT DEFAULT 0,
  
  -- Total Balance Information (Columns 77-79)
  total_balance DECIMAL(15, 2) DEFAULT 0,
  not_due_total DECIMAL(15, 2) DEFAULT 0,
  over_due_total DECIMAL(15, 2) DEFAULT 0,
  
  -- TDS & Deductions (Columns 80-85)
  it_tds_2_percent_service DECIMAL(15, 2) DEFAULT 0,
  it_tds_1_percent_194q_supply DECIMAL(15, 2) DEFAULT 0,
  lcess_boq_1_percent_works DECIMAL(15, 2) DEFAULT 0,
  tds_2_percent_cgst_sgst DECIMAL(15, 2) DEFAULT 0,
  tds_on_cgst_1_percent DECIMAL(15, 2) DEFAULT 0,
  tds_on_sgst_1_percent DECIMAL(15, 2) DEFAULT 0,
  
  -- Reconciliation & Exception Fields (Columns 86-93)
  excess_supply_qty DECIMAL(15, 3) DEFAULT 0,
  interest_on_advance DECIMAL(15, 2) DEFAULT 0,
  any_hold VARCHAR(100),
  penalty_ld_deduction DECIMAL(15, 2) DEFAULT 0,
  bank_charges DECIMAL(15, 2) DEFAULT 0,
  lc_discrepancy_charge DECIMAL(15, 2) DEFAULT 0,
  provision_for_bad_debts DECIMAL(15, 2) DEFAULT 0,
  bad_debts DECIMAL(15, 2) DEFAULT 0,
  
  -- Metadata
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_gst_tax_invoice_no (gst_tax_invoice_no),
  INDEX idx_internal_invoice_no (internal_invoice_no),
  INDEX idx_customer_name (customer_name),
  INDEX idx_business_unit (business_unit),
  INDEX idx_region (region),
  INDEX idx_zone (zone),
  INDEX idx_gst_tax_invoice_date (gst_tax_invoice_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

