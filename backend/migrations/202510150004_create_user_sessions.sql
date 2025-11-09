-- User Sessions table for tracking active sessions across devices
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  session_token VARCHAR(500) NOT NULL,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_current TINYINT(1) NOT NULL DEFAULT 0,
  last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  INDEX idx_user_sessions_user (user_id),
  INDEX idx_user_sessions_token (session_token),
  INDEX idx_user_sessions_active (user_id, is_current),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

