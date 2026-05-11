-- Add role column and name fields to users table
ALTER TABLE users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN first_name VARCHAR(128);
ALTER TABLE users ADD COLUMN last_name VARCHAR(128);

CREATE INDEX idx_users_role ON users (role);

-- Create admin user (password: Admin123!)
INSERT INTO users (email, phone, password_hash, status, role, first_name, last_name, created_at, updated_at)
SELECT 'admin@carsharing.by', '+375290000000',
       '$2b$10$Oui87g.SVY/SwnGvnYYOyegoSKXzrzUwVMuRG9WXuPUe9nfgWXAk.',
       'ACTIVE', 'ADMIN', 'Admin', 'System',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@carsharing.by');
