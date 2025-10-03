-- =====================================================
-- Create Test Admin User
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: First, you need to create the auth user in Supabase Dashboard!
-- Then come back and run this script with the User UID

-- Step 1: Go to Supabase Dashboard
--   → Authentication → Users → Add user
--   Email: admin@example.com
--   Password: TestAdmin2024!@#SecurePass
--   Auto Confirm User: ON
--   Click "Create user"
--   COPY THE USER UID

-- Step 2: Replace 'YOUR_USER_UID_HERE' below with the actual UID
--   Then run this SQL

INSERT INTO users (id, email, role)
VALUES (
  'YOUR_USER_UID_HERE',  -- Replace with UID from Authentication → Users
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 3: Verify it worked
SELECT id, email, role, created_at
FROM users
WHERE email = 'admin@example.com';

-- You should see one row with role = 'admin'

-- =====================================================
-- Test Credentials:
-- Email: admin@example.com
-- Password: TestAdmin2024!@#SecurePass
-- =====================================================
