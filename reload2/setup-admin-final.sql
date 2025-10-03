-- =====================================================
-- FINAL ADMIN USER SETUP
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- =====================================================

-- This will create the admin user in both auth and users tables

-- IMPORTANT: First, manually create the user in Supabase Dashboard:
-- 1. Go to: Authentication → Users → Add user
-- 2. Email: admin@example.com
-- 3. Password: TestAdmin2024!@#SecurePass
-- 4. Auto Confirm: ON
-- 5. Create user and copy the UID

-- Then run this SQL (replace USER_UID with the actual UID):

-- Step 1: Insert admin into users table
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES (
  'PASTE_YOUR_USER_UID_HERE',  -- Replace with UID from Dashboard
  'admin@example.com',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = NOW();

-- Step 2: Verify the user was added
SELECT id, email, role, created_at
FROM users
WHERE email = 'admin@example.com';

-- Step 3: Check auth user exists
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'admin@example.com';

-- =====================================================
-- Expected result:
-- - Step 2 should show 1 row with role='admin'
-- - Step 3 should show 1 row with email_confirmed_at set
-- =====================================================

-- Login credentials:
-- Email: admin@example.com
-- Password: TestAdmin2024!@#SecurePass
-- URL: http://localhost:8080/login
