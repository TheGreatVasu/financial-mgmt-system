-- Add Google OAuth tokens to users table for Google Sheets integration
-- This allows storing access token and refresh token from Google login
ALTER TABLE users 
ADD COLUMN google_access_token TEXT NULL,
ADD COLUMN google_refresh_token TEXT NULL,
ADD COLUMN google_token_expires_at DATETIME NULL;

