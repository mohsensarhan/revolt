# Real-time System Setup - Admin Panel ↔ Supabase ↔ Dashboard

## 🎯 What You Have Now

A **fully connected real-time system** where:
- **Admin Panel** (`/admin`) - Secure interface to update metrics (requires login)
- **Supabase Database** - PostgreSQL with real-time sync
- **Public Dashboard** (`/`) - Updates automatically when admin changes data

## ✅ Files Created

### New React Hooks:
- `src/hooks/useAuth.ts` - Authentication state management
- `src/hooks/useRealtimeMetrics.ts` - Real-time metrics with auto-sync
- `src/components/ProtectedRoute.tsx` - Route protection component
- `src/components/Login.tsx` - Updated with new auth hook

### Updated Files:
- `src/App.tsx` - Added login route and protected admin route
- `src/lib/supabase.ts` - Secured (removed service role key)
- `.gitignore` - Added environment files

## 🚀 Quick Start (3 Steps)

### Step 1: Environment Setup

Create `.env.local` file in project root:

```bash
VITE_SUPABASE_URL=https://oktiojqphavkqeirbbul.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_after_rotation
VITE_ADMIN_INITIAL_PASSWORD=YourStrongPassword123!@#MinLength20
```

⚠️ **IMPORTANT:** Use the NEW anon key after rotating credentials (see SECURITY_FIXES_REQUIRED.md)

### Step 2: Database Setup

Go to Supabase SQL Editor and run:

```sql
-- 1. Enable Realtime on executive_metrics table
-- Go to Database → Replication → Enable for executive_metrics

-- 2. Verify tables exist (should already be there)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('executive_metrics', 'users', 'audit_logs');

-- 3. Insert sample data if needed
INSERT INTO executive_metrics (
  meals_delivered, people_served, cost_per_meal, program_efficiency,
  revenue, expenses, reserves, cash_position, coverage_governorates
) VALUES (
  50000000, 1000000, 5.50, 85.0,
  1000000000, 900000000, 500000000, 300000000, 15
);
```

### Step 3: Create Admin User

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@example.com`
   - Password: (same as VITE_ADMIN_INITIAL_PASSWORD)
   - Auto Confirm User: **ON**
4. Click **Create user**
5. Copy the User UID
6. In **SQL Editor**, run:

```sql
INSERT INTO users (id, email, role)
VALUES ('paste-user-uid-here', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Option B: Via Code** (requires service role - not recommended for production)

```bash
npx tsx src/lib/create-admin-user.ts
```

## 🧪 Testing the Real-time Connection

### Test 1: Basic Flow

```bash
# 1. Start the app
npm run dev

# 2. Open two browser windows:
# - Window 1: http://localhost:8080/login
# - Window 2: http://localhost:8080/
```

**In Window 1 (Login):**
1. Login with `admin@example.com` + your password
2. You'll be redirected to `/admin`
3. Go to "Metrics Management" tab
4. Change "People Served" to `2000000`
5. Click "Save Metrics"

**In Window 2 (Dashboard):**
- Watch the dashboard update automatically within 1-2 seconds
- No refresh needed! ✨

### Test 2: Verify Real-time Subscription

Open browser console on dashboard:
```javascript
// You should see:
📡 Real-time metrics update received: {...}
```

## 🎛️ System Components

### Authentication Flow
```
User → /login → Login.tsx (useAuth hook)
  ↓
Authenticate with Supabase
  ↓
Success → Redirect to /admin
  ↓
ProtectedRoute checks auth + role
  ↓
AdminPanel (if admin role)
```

### Data Flow
```
Admin Panel → updateMetrics()
  ↓
Supabase Database (RLS checks permission)
  ↓
Real-time broadcast
  ↓
Dashboard subscribeToExecutiveMetrics()
  ↓
UI updates automatically
```

## 🔐 Security Features

✅ **Implemented:**
- Service role key removed from client code
- Protected routes (admin requires authentication + admin role)
- Row Level Security on all tables
- Password validation (12+ chars)
- Environment variables for credentials
- CORS whitelist

## 📊 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Dashboard (auto-updates) |
| `/dashboard` | Public | Same as `/` |
| `/login` | Public | Login page |
| `/admin` | Admin only | Admin panel (protected) |

## 🐛 Troubleshooting

### "Cannot read properties of undefined"
- **Cause:** Supabase credentials not loaded
- **Fix:** Restart dev server: `npm run dev`

### Dashboard doesn't update
1. Check Supabase Dashboard → Database → Replication
2. Enable Realtime for `executive_metrics` table
3. Open browser console - look for real-time messages

### Login fails
1. Verify user exists in Supabase Auth
2. Check password matches `.env.local`
3. Verify user has `admin` role in `users` table

### "Access Denied" at /admin
```sql
-- Check user role
SELECT email, role FROM users WHERE email = 'admin@example.com';

-- Fix if needed
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📝 How to Use

### As Admin:
1. Login at `/login`
2. Update metrics in Admin Panel
3. Changes sync instantly to dashboard

### As Viewer:
1. Visit `/` or `/dashboard`
2. See live metrics
3. "Live" badge shows connection status

## 🎯 Next Steps

1. ✅ Complete credential rotation (see SECURITY_FIXES_REQUIRED.md)
2. ✅ Test real-time sync between admin and dashboard
3. ✅ Add more admin users if needed
4. ✅ Customize dashboard layout
5. ✅ Deploy to production

## 📚 Code Examples

### Using useRealtimeMetrics Hook

```typescript
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

function MyComponent() {
  const { metrics, loading, error, updateMetrics } = useRealtimeMetrics();

  const handleUpdate = async () => {
    await updateMetrics({
      people_served: 5000000
    });
  };

  return <div>{metrics?.people_served}</div>;
}
```

### Using useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAdmin, signIn, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <p>Welcome, {user.email} ({user.role})</p>
      ) : (
        <button onClick={() => signIn(email, password)}>Login</button>
      )}
    </div>
  );
}
```

## ✨ Features Included

- ✅ Real-time data synchronization
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Authentication with Supabase Auth
- ✅ Protected routes
- ✅ Auto-updates without page refresh
- ✅ Connection status indicators
- ✅ Error handling and loading states
- ✅ Responsive design

---

**System Status:** ✅ Ready to use (after credential rotation)

**Created:** October 3, 2025
