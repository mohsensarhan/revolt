# 🔑 Create Test Admin User - Step by Step

## Test Credentials (For Testing Only!)

```
Email: admin@example.com
Password: 1234567
```

⚠️ **IMPORTANT:** These are test credentials. Change them before production!

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Supabase Dashboard

Open this link in your browser:
```
https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/auth/users
```

Or manually navigate:
1. Go to https://supabase.com/dashboard
2. Click your project (oktiojqphavkqeirbbul)
3. Click **Authentication** in left sidebar
4. Click **Users** tab

### Step 2: Create the Auth User

1. Click **"Add user"** button (top right)
2. Click **"Create new user"**
3. Fill in the form:

   ```
   Email: admin@example.com
   Password: TestAdmin2024!@#SecurePass
   ```

4. **IMPORTANT:** Toggle these settings:
   - ✅ **Auto Confirm User**: Turn **ON**
   - ❌ **Send confirmation email**: Turn **OFF**

5. Click **"Create user"** button

6. **COPY THE USER UID** - You'll see it in the user list
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Keep this handy for the next step!

### Step 3: Add Admin Role

1. Click **"SQL Editor"** in left sidebar (looks like `</>`)
2. Click **"New query"** button
3. Copy and paste this SQL:

```sql
-- Replace YOUR_USER_UID_HERE with the UID you copied in Step 2
INSERT INTO users (id, email, role)
VALUES (
  'YOUR_USER_UID_HERE',
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify it worked
SELECT id, email, role, created_at
FROM users
WHERE email = 'admin@example.com';
```

4. **Replace** `YOUR_USER_UID_HERE` with your actual User UID
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see a success message and one row returned with `role = 'admin'`

### Step 4: Test Login

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser to: `http://localhost:8080/login`

3. Enter credentials:
   - Email: `admin@example.com`
   - Password: `TestAdmin2024!@#SecurePass`

4. Click **"Sign In"**

5. You should be redirected to `/admin` and see the Admin Panel!

---

## 🎯 Visual Guide

### What You'll See in Supabase:

**Step 2 - Creating User:**
```
┌─────────────────────────────────────┐
│  Add user                      [X]  │
├─────────────────────────────────────┤
│                                     │
│  ○ Create new user                 │
│  ○ Invite over email               │
│                                     │
│  Email address                     │
│  ┌───────────────────────────────┐ │
│  │ admin@example.com             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Password                          │
│  ┌───────────────────────────────┐ │
│  │ TestAdmin2024!@#SecurePass    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Auto Confirm User     [✓]  ON     │
│  Send confirmation     [ ]  OFF    │
│                                     │
│         [Create user]              │
└─────────────────────────────────────┘
```

**After Creating - Copy the UID:**
```
Users (1)
┌──────────────────────────────────────────────────┐
│ Email              │ UID                         │
├──────────────────────────────────────────────────┤
│ admin@example.com  │ a1b2c3d4-e5f6-7890-abcd...  │ ← Copy this!
└──────────────────────────────────────────────────┘
```

**Step 3 - SQL Editor:**
```
┌─────────────────────────────────────────────┐
│  SQL Editor                                 │
├─────────────────────────────────────────────┤
│ INSERT INTO users (id, email, role)         │
│ VALUES (                                    │
│   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  │ ← Your UID here
│   'admin@example.com',                      │
│   'admin'                                   │
│ )                                           │
│ ON CONFLICT (id) DO UPDATE SET role='admin';│
│                                             │
│                       [Run] [Ctrl+Enter]    │
└─────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] User exists in Authentication → Users
- [ ] User email is `admin@example.com`
- [ ] User is confirmed (green check mark)
- [ ] SQL query returned 1 row with `role = 'admin'`
- [ ] `.env.local` file exists with correct password
- [ ] Can login at `/login`
- [ ] Redirected to `/admin` after login
- [ ] Can see Admin Panel interface

---

## 🐛 Troubleshooting

### "User already exists"
- Good! The user was created previously
- Just login with: `admin@example.com` / `TestAdmin2024!@#SecurePass`
- If password doesn't work, reset it in Supabase Dashboard → Authentication → Users

### "Invalid credentials" when logging in
1. Check password in `.env.local` matches what you set in Supabase
2. Restart dev server: `npm run dev`
3. Try resetting password in Supabase Dashboard

### "Access Denied" after login
```sql
-- Check if user has admin role
SELECT email, role FROM users WHERE email = 'admin@example.com';

-- If role is not 'admin', fix it:
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### SQL error: "relation users does not exist"
- Run the database initialization first: `supabase-init.sql`
- See: REALTIME_SYSTEM_SETUP.md

### Can't find User UID
1. Go to Authentication → Users
2. Click on the user row
3. Look for "ID" or "UID" field
4. Or hover over the user to see details

---

## 🔄 Alternative: Use Existing Credentials

If you already have `.env.local` with different credentials:

1. Check what password is in `.env.local`:
   ```bash
   cat .env.local | grep PASSWORD
   ```

2. Use that password when creating the user in Supabase Dashboard

3. Or update `.env.local` to match the password you set in Supabase

---

## 📞 Need Help?

If you get stuck:

1. Check browser console (F12) for errors
2. Check Supabase logs: Dashboard → Logs
3. Verify database tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

---

**Test credentials again:**
```
URL: http://localhost:8080/login
Email: admin@example.com
Password: TestAdmin2024!@#SecurePass
```

Good luck! 🚀
