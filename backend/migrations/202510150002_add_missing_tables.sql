-- Payment MOMs (Minutes of Meeting)
CREATE TABLE IF NOT EXISTS payment_moms (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  mom_id VARCHAR(32) UNIQUE NOT NULL,
  meeting_title VARCHAR(255) NOT NULL,
  meeting_date DATETIME NOT NULL,
  participants TEXT, -- JSON array
  agenda TEXT,
  discussion_notes TEXT,
  agreed_payment_terms TEXT,
  customer_id BIGINT UNSIGNED,
  linked_invoice_id BIGINT UNSIGNED,
  payment_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATETIME,
  payment_type ENUM('advance','milestone','final','refund','other') NOT NULL DEFAULT 'milestone',
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  status ENUM('planned','due','paid','overdue','cancelled') NOT NULL DEFAULT 'planned',
  smart TEXT, -- JSON object with totalPayable, pendingDues, computedInterest
  calendar TEXT, -- JSON object with eventId, followUpDate, reminders, provider
  ai_summary TEXT,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payment_moms_meeting_date (meeting_date),
  INDEX idx_payment_moms_status (status, due_date),
  INDEX idx_payment_moms_customer (customer_id, meeting_date)
);

-- Action Items (for MOM follow-ups)
CREATE TABLE IF NOT EXISTS action_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  action_id VARCHAR(32),
  title VARCHAR(500) NOT NULL,
  owner_name VARCHAR(100),
  owner_email VARCHAR(191) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('open','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_action_items_owner (owner_email),
  INDEX idx_action_items_due_date (due_date),
  INDEX idx_action_items_status (status)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  performed_by BIGINT UNSIGNED NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  changes TEXT, -- JSON object
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_entity (entity, entity_id),
  INDEX idx_audit_logs_performed_by (performed_by),
  INDEX idx_audit_logs_created (created_at)
);

