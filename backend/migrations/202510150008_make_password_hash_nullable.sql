-- Make password_hash nullable to support Google OAuth users
-- Google OAuth users don't have passwords, so password_hash should be NULL
ALTER TABLE users 
MODIFY COLUMN password_hash VARCHAR(191) NULL;

