-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(191) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_code VARCHAR(32) UNIQUE NOT NULL,
  company_name VARCHAR(191) NOT NULL,
  contact_email VARCHAR(191) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_by BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_status (status)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(32) UNIQUE NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoices_customer (customer_id),
  INDEX idx_invoices_status (status)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  payment_code VARCHAR(32) UNIQUE NOT NULL,
  invoice_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATETIME NOT NULL,
  method ENUM('cash','check','bank_transfer','credit_card','upi','other') NOT NULL,
  reference VARCHAR(191) NOT NULL,
  status ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  processed_by BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_invoice (invoice_id),
  INDEX idx_payments_customer (customer_id)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type ENUM('danger','warning','success','info') NOT NULL,
  message VARCHAR(255) NOT NULL,
  read_flag TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alerts_created (created_at)
);


