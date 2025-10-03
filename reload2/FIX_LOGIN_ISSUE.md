# 🔧 Fix "Invalid Credentials" Login Issue

## Problem
You're seeing "Invalid credentials" when trying to login with:
- Email: `admin@example.com`
- Password: `TestAdmin2024!@#SecurePass`

## Cause
The user doesn't exist in Supabase Auth yet. You need to create it manually.

---

## ✅ Solution (3 Easy Steps)

### Step 1: Create User in Supabase

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/auth/users

1. Click **"Add user"** button (top right corner)
2. Select **"Create new user"**
3. Fill in the form:

```
Email:    admin@example.com
Password: TestAdmin2024!@#SecurePass

Settings:
☑ Auto Confirm User: ON
☐ Send confirmation email: OFF
```

4. Click **"Create user"**

5. **Important:** Copy the **User UID** that appears
   - It looks like: `123e4567-e89b-12d3-a456-426614174000`
   - You'll need this in the next step

---

### Step 2: Add Admin Role (SQL)

**Go to SQL Editor:**
https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/sql

1. Click **"New query"**
2. Copy and paste this SQL:

```sql
-- Replace the UID below with YOUR user UID from Step 1
INSERT INTO users (id, email, role)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- ← REPLACE THIS
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify it worked
SELECT id, email, role FROM users WHERE email = 'admin@example.com';
```

3. **Replace** `123e4567-e89b-12d3-a456-426614174000` with your actual User UID
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: **"Success. 1 rows affected."**
6. The SELECT query should return 1 row with `role = 'admin'`

---

### Step 3: Test Login

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:8080/login

3. Enter credentials:
   ```
   Email:    admin@example.com
   Password: TestAdmin2024!@#SecurePass
   ```

4. Click **"Sign In"**

5. **Success!** You should be redirected to `/admin`

---

## 🎯 Screenshots

### Where to find "Add user":
```
Supabase Dashboard
├─ Authentication (sidebar)
│  └─ Users tab
│     └─ [Add user] button ← Click here!
```

### What "Create user" form looks like:
```
┌─────────────────────────────────────────┐
│  Add user                          [X]  │
├─────────────────────────────────────────┤
│  ● Create new user                      │
│  ○ Invite over email                    │
│                                         │
│  Email address                          │
│  ┌─────────────────────────────────┐   │
│  │ admin@example.com               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Password                               │
│  ┌─────────────────────────────────┐   │
│  │ TestAdmin2024!@#SecurePass      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Auto Confirm User    [✓] ON            │
│  Send confirmation    [ ] OFF           │
│                                         │
│           [Create user]                 │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problem: User created but still can't login

**Check if user is confirmed:**

1. Go to: Authentication → Users
2. Find your user in the list
3. Look for a green checkmark ✓
4. If not confirmed, click the user → Click "Confirm user"

**Or run this SQL:**
```sql
-- Check confirmation status
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'admin@example.com';
```

If `email_confirmed_at` is NULL, confirm the user in Dashboard.

---

### Problem: "Access Denied" after login

**Check if user has admin role:**

```sql
SELECT email, role FROM users WHERE email = 'admin@example.com';
```

If role is NOT 'admin', fix it:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

### Problem: SQL error "relation users does not exist"

The database tables haven't been created yet.

**Fix:** Run the database setup script first:

1. Go to: SQL Editor
2. Copy contents of: `supabase-init.sql`
3. Run it
4. Then try Step 2 again

---

### Problem: Still getting "Invalid credentials"

**Debug checklist:**

1. **Check if user exists:**
   ```sql
   SELECT email, created_at FROM auth.users WHERE email = 'admin@example.com';
   ```
   Should return 1 row.

2. **Verify password in .env.local:**
   ```bash
   cat .env.local | grep PASSWORD
   ```
   Should show: `VITE_ADMIN_INITIAL_PASSWORD=TestAdmin2024!@#SecurePass`

3. **Try resetting password:**
   - Dashboard → Authentication → Users
   - Find user → Click "..." → "Reset password"
   - Set new password
   - Update `.env.local` with new password

4. **Check Supabase logs:**
   - Dashboard → Logs → Auth logs
   - Look for failed login attempts
   - May reveal the actual error

---

## 🎓 Alternative: Use Your Own Email

If you prefer to use your own email:

1. In **Step 1**, use your email instead of `admin@example.com`
2. Choose your own strong password
3. Update `.env.local`:
   ```
   VITE_ADMIN_INITIAL_PASSWORD=YourChosenPassword
   ```
4. Follow the same steps

---

## ✅ Verification

After completing all steps, verify:

- [ ] User exists in Authentication → Users
- [ ] User has green checkmark (confirmed)
- [ ] SQL query shows `role = 'admin'`
- [ ] Can login at `/login`
- [ ] Redirected to `/admin` after login
- [ ] Can see Admin Panel interface
- [ ] No errors in browser console

---

## 📞 Still Stuck?

Run these debug queries in SQL Editor:

```sql
-- 1. Check auth user
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@example.com';

-- 2. Check users table
SELECT id, email, role, created_at
FROM users
WHERE email = 'admin@example.com';

-- 3. Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'executive_metrics', 'audit_logs');
```

Post the results and I can help debug further!

---

**Test Credentials:**
```
Email:    admin@example.com
Password: TestAdmin2024!@#SecurePass
URL:      http://localhost:8080/login
```

Good luck! 🚀
