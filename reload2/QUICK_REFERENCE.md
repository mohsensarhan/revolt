# ⚡ Quick Reference Guide

**Fast lookup for common tasks**

---

## 🚀 Getting Started (< 5 minutes)

```bash
# 1. Setup environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 2. Install & run
npm install && npm run dev

# 3. Create admin user (in Supabase Dashboard SQL Editor)
# See SETUP_GUIDE.md Step 4
```

**URLs:**
- Dashboard: http://localhost:8080/
- Admin Panel: http://localhost:8080/admin
- Login: http://localhost:8080/login

---

## 🔑 Default Credentials

```
Email: admin@example.com
Password: [Set in .env.local as VITE_ADMIN_INITIAL_PASSWORD]
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routes & authentication |
| `src/hooks/useRealtimeMetrics.ts` | Real-time data hook |
| `src/hooks/useAuth.ts` | Authentication hook |
| `src/components/AdminPanel.tsx` | Admin interface |
| `src/components/ExecutiveDashboard.tsx` | Public dashboard |
| `src/lib/data-service.ts` | Database operations |
| `src/lib/supabase.ts` | Supabase client |
| `.env.local` | Environment variables (NOT in git) |

---

## 🔧 Common Tasks

### Test Real-Time Sync
1. Open `/admin` in one window
2. Open `/dashboard` in another window
3. Change a metric in admin
4. Watch dashboard update instantly

### Add a New Metric
```sql
-- 1. Database
ALTER TABLE executive_metrics ADD COLUMN new_field INTEGER DEFAULT 0;

-- 2. TypeScript (src/lib/supabase.ts)
interface Database { ... new_field: number; }

-- 3. Admin Panel (src/components/AdminPanel.tsx)
<Input value={editMetrics.new_field} onChange={...} />

-- 4. Dashboard (src/components/ExecutiveDashboard.tsx)
<MetricCard value={metrics?.new_field} />
```

### Check Database Connection
```typescript
// In browser console
await dataService.checkConnection() // Should return true
```

### View Realtime Events
```
Open DevTools Console, look for:
📡 Real-time update received: {...}
```

---

## 🗄️ Database Tables

### executive_metrics
Main metrics data - updates trigger real-time events

### users
User accounts with roles (admin/editor/viewer)

### audit_logs
Change history - who changed what when

### scenarios
Saved scenario models (optional)

---

## 🔐 User Roles

| Role | Can Access Admin? | Can Edit? | Can Manage Users? |
|------|------------------|-----------|-------------------|
| `admin` | ✅ Yes | ✅ Yes | ✅ Yes |
| `editor` | ✅ Yes | ⚠️ Limited | ❌ No |
| `viewer` | ❌ No | ❌ No | ❌ No |

### Change User Role
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

---

## 🐛 Quick Troubleshooting

### "Missing environment variables"
```bash
# Check file exists
ls .env.local

# Should contain:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_INITIAL_PASSWORD=...

# Restart server
npm run dev
```

### Login Fails
```sql
-- Check user exists and has admin role
SELECT email, role FROM users WHERE email = 'admin@example.com';

-- If not admin, update:
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### No Real-Time Updates
```sql
-- Enable realtime on table
ALTER PUBLICATION supabase_realtime ADD TABLE executive_metrics;
```

### Connection Issues
```typescript
// Test in console
await dataService.checkConnection()

// Check Supabase credentials
console.log(import.meta.env.VITE_SUPABASE_URL)
```

---

## 📊 SQL Snippets

### View Current Metrics
```sql
SELECT * FROM executive_metrics ORDER BY created_at DESC LIMIT 1;
```

### View All Users
```sql
SELECT id, email, role, last_login FROM users;
```

### View Recent Changes
```sql
SELECT
  u.email,
  a.action,
  a.table_name,
  a.created_at
FROM audit_logs a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Reset Metrics to Default
```sql
UPDATE executive_metrics SET
  meals_delivered = 367490721,
  people_served = 4960000,
  cost_per_meal = 6.36,
  program_efficiency = 83.00,
  revenue = 2200000000.00,
  expenses = 2316000000.00,
  reserves = 731200000.00,
  cash_position = 459800000.00,
  coverage_governorates = 27
WHERE id = 1;
```

---

## 🔍 Console Commands

```javascript
// Get current metrics
const metrics = await dataService.getExecutiveMetrics();
console.log(metrics);

// Get current user
const user = await dataService.getCurrentUser();
console.log(user);

// Check connection
const connected = await dataService.checkConnection();
console.log('Connected:', connected);

// Get all users (admin only)
const users = await dataService.getUsers();
console.log(users);
```

---

## 📡 Supabase Dashboard URLs

Replace `YOUR_PROJECT` with your project ref:

- **Project Home:** `https://supabase.com/dashboard/project/YOUR_PROJECT`
- **SQL Editor:** `https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new`
- **Table Editor:** `https://supabase.com/dashboard/project/YOUR_PROJECT/editor`
- **Auth Users:** `https://supabase.com/dashboard/project/YOUR_PROJECT/auth/users`
- **API Settings:** `https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api`
- **Realtime:** `https://supabase.com/dashboard/project/YOUR_PROJECT/database/replication`

---

## 🎯 Performance

**Expected:**
- Initial load: < 2s
- Real-time update: < 100ms
- Save operation: < 500ms

**Too slow?**
1. Check network tab for slow requests
2. Verify Supabase region is close to you
3. Check for console errors

---

## 📦 Environment Variables

```bash
# Required
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Public anon key
VITE_ADMIN_INITIAL_PASSWORD= # Min 12 chars

# NOT ALLOWED (security)
# VITE_SUPABASE_SERVICE_ROLE_KEY= # ❌ Never use in client!
```

---

## 🔒 Security Checklist

- [ ] `.env.local` not in git
- [ ] Service role key NOT in client code
- [ ] RLS enabled on all tables
- [ ] Admin routes protected
- [ ] Strong admin password (12+ chars)
- [ ] Credentials rotated after any leak

---

## 📚 Documentation

- **Detailed Setup:** `SETUP_GUIDE.md`
- **System Overview:** `COMPLETE_SYSTEM_OVERVIEW.md`
- **Security Guide:** `SECURITY_FIXES_REQUIRED.md`
- **This Reference:** `QUICK_REFERENCE.md`

---

## 🆘 Emergency Commands

### Reset Everything
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Restart clean
npm run dev
```

### Check Supabase Status
```bash
# In browser console
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

---

**💡 Tip:** Bookmark this file for quick access!
