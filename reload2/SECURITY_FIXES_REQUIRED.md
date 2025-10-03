# 🚨 CRITICAL SECURITY FIXES REQUIRED

**Date:** October 3, 2025
**Status:** URGENT - DO NOT DEPLOY TO PRODUCTION UNTIL COMPLETE

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED (Complete within 24 hours)

### 1. Rotate ALL Exposed Credentials

Your credentials are currently exposed in git history and must be rotated immediately.

#### Step 1.1: Rotate Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/settings/api
2. Navigate to "Project API keys" section
3. Click "Reset service_role key" (⚠️ This will invalidate the old key)
4. Copy the new service role key
5. **DO NOT add it to your .env.local file** - Service role keys should NEVER be used in client-side code
6. Save the key securely (password manager) for backend use only

#### Step 1.2: Rotate Supabase Anon Key (If Possible)

1. In the same API settings page
2. If possible, click "Reset anon key"
3. Copy the new anon key
4. Update your `.env.local` file with the new key (see template below)

#### Step 1.3: Revoke Management API Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Find the token ending in `...qJZU` (or full token: `sbp_8500b64c61daea9a863b23dd66a0c30afe33a3c6`)
3. Click "Revoke" to invalidate it
4. If needed, create a new token and store it securely (NOT in code)

#### Step 1.4: Change Admin Password

1. Go to Supabase Dashboard → Authentication → Users
2. Find user: `admin@example.com`
3. Reset password to a strong password (minimum 20 characters, mixed case, numbers, symbols)
4. Example strong password: `K9$mP2x@Lq7#Wn4vR8!Zt5&Jh3`
5. Store in password manager
6. Update your `.env.local` with the new password (see template below)

---

### 2. Create Secure .env.local File

Create a NEW `.env.local` file with the following template:

```bash
# Supabase Configuration
# SECURITY: This file is NOT committed to git - never commit credentials!
VITE_SUPABASE_URL=https://oktiojqphavkqeirbbul.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here

# Admin Initial Password (minimum 12 characters, 20+ recommended)
VITE_ADMIN_INITIAL_PASSWORD=your_strong_password_here

# DO NOT ADD SERVICE ROLE KEY HERE - it should never be in client code!
```

**Important:**
- Replace `your_new_anon_key_here` with the new anon key from Step 1.2
- Replace `your_strong_password_here` with the new admin password from Step 1.4
- This file is now properly ignored by git (`.gitignore` has been updated)

---

### 3. Remove .env.local from Git History

Your `.env.local` file is currently in git history and must be removed:

```bash
# WARNING: This requires a force push and will rewrite git history
# Coordinate with your team before doing this!

# Option 1: Using git filter-branch (recommended for small repos)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Option 2: Using BFG Repo-Cleaner (faster for large repos)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env.local

# After either option:
git push origin --force --all
git push origin --force --tags

# Clean up local repository
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**⚠️ CRITICAL:**
- This will rewrite git history - notify all team members
- Everyone will need to re-clone the repository
- All forks/clones will have the old credentials until updated

---

### 4. Remove Hardcoded Credentials from Other Files

Several files still contain hardcoded credentials. Delete or update these files:

#### Files to Delete (Not needed for production):
```bash
rm setup-supabase-admin.js
rm create-admin.html
rm create-admin-simple.js
rm complete-admin-control.js
rm complete-setup.js
rm quick-admin-setup.html
rm fix-admin-*.js
rm simple-admin-fix.js
rm automated-realtime-test.js
rm test-realtime*.js
rm comprehensive-test.html
```

These are temporary setup/testing files with hardcoded credentials.

---

## 🔧 CODE FIXES COMPLETED

The following security fixes have already been applied to the codebase:

### ✅ 1. Removed Service Role Key from Client Code
- **File:** `src/lib/supabase.ts`
- **Change:** Removed hardcoded service role key and fallback
- **Impact:** Service role key no longer exposed in client bundle
- **Note:** `supabaseAdmin` now points to regular `supabase` client - ensure RLS policies are configured

### ✅ 2. Updated .gitignore
- **File:** `.gitignore`
- **Change:** Added `.env.local`, `.env.development`, `.env.production`, `.env*.local`
- **Impact:** Environment files will no longer be committed to git

### ✅ 3. Removed Hardcoded Passwords
- **File:** `src/lib/create-admin-user.ts`
- **Change:** Password now required via `VITE_ADMIN_INITIAL_PASSWORD` env variable
- **File:** `src/lib/data-service.ts`
- **Change:** `createUser()` now requires password parameter with validation

### ✅ 4. Fixed CORS Policy
- **File:** `api/_utils.ts`
- **Change:** Changed from wildcard (`*`) to whitelist of allowed origins
- **Impact:** Only specified domains can make API requests
- **Action Required:** Update `ALLOWED_ORIGINS` array with your production domain

### ✅ 5. Sanitized Error Messages
- **File:** `src/components/ErrorBoundary.tsx`
- **Change:** Detailed errors only shown in development, not production
- **Impact:** Stack traces and internal errors no longer exposed to users

### ✅ 6. Added Security Headers
- **File:** `vite.config.ts`
- **Change:** Added security headers (X-Frame-Options, CSP, etc.)
- **Impact:** Protection against clickjacking, XSS, and other attacks

---

## 📋 ADDITIONAL SECURITY TASKS (Complete within 1 week)

### Input Validation

The admin panel currently lacks input validation. You should add:

```typescript
// Example for numeric inputs
const validateMetric = (value: number, min: number, max: number): boolean => {
  return Number.isFinite(value) && value >= min && value <= max;
};

// Use in onChange handlers:
onChange={(e) => {
  const value = Number(e.target.value);
  if (validateMetric(value, 0, 1000000000)) {
    setEditMetrics(prev => ({ ...prev, meals_delivered: value }));
  }
}}
```

### Rate Limiting

Implement rate limiting on authentication endpoints to prevent brute force attacks.

Consider using:
- Supabase Edge Functions with rate limiting
- Upstash Redis with `@upstash/ratelimit`
- CloudFlare rate limiting rules

### Content Security Policy

Add a stricter CSP header in production. Consider using a `meta` tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' data:;
               connect-src 'self' https://oktiojqphavkqeirbbul.supabase.co;">
```

---

## 🔐 SUPABASE ROW LEVEL SECURITY (RLS)

Since service role key is removed from client code, ensure your RLS policies are properly configured:

### Check Current Policies

Go to: https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/auth/policies

Ensure these policies exist:

#### executive_metrics table:
- ✅ `SELECT`: Allow public read access (or restrict to authenticated users)
- ✅ `INSERT`: Only admin role
- ✅ `UPDATE`: Only admin role
- ✅ `DELETE`: Only admin role

#### users table:
- ✅ `SELECT`: Authenticated users can see own record, admins can see all
- ✅ `INSERT`: Only service_role (backend only)
- ✅ `UPDATE`: Admins only for role changes, users can update own profile
- ✅ `DELETE`: Only service_role (backend only)

#### audit_logs table:
- ✅ `SELECT`: Admins only
- ✅ `INSERT`: Authenticated users
- ✅ `UPDATE`: Never
- ✅ `DELETE`: Never

### Example RLS Policy SQL

```sql
-- Executive Metrics - Read for authenticated users
CREATE POLICY "Authenticated users can view metrics"
  ON executive_metrics FOR SELECT
  TO authenticated
  USING (true);

-- Executive Metrics - Write for admins only
CREATE POLICY "Only admins can modify metrics"
  ON executive_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 📊 SECURITY CHECKLIST

Use this checklist to track your progress:

### Phase 1: CRITICAL (Complete within 24 hours)
- [ ] Rotated Supabase service role key
- [ ] Rotated Supabase anon key
- [ ] Revoked management API token
- [ ] Changed admin password to strong credential
- [ ] Created secure `.env.local` file
- [ ] Removed `.env.local` from git history
- [ ] Deleted temporary setup files with hardcoded credentials
- [ ] Verified RLS policies are properly configured
- [ ] Tested application still works with new credentials

### Phase 2: HIGH PRIORITY (Complete within 1 week)
- [ ] Updated `ALLOWED_ORIGINS` in `api/_utils.ts` with production domain
- [ ] Added input validation to all admin forms
- [ ] Implemented rate limiting on auth endpoints
- [ ] Added CSRF protection
- [ ] Configured stronger Content Security Policy
- [ ] Tested authentication with new password requirements

### Phase 3: RECOMMENDED (Complete within 1 month)
- [ ] Set up error tracking service (Sentry, LogRocket, etc.)
- [ ] Implement session timeout (1 hour recommended)
- [ ] Add 2FA for admin accounts
- [ ] Set up automated security scanning (Snyk, Dependabot)
- [ ] Create backend API for admin operations (no service role in client)
- [ ] Implement audit log review process
- [ ] Document security procedures for team

---

## 🆘 SUPPORT & RESOURCES

### If You Need Help

1. **Supabase Documentation:**
   - RLS: https://supabase.com/docs/guides/auth/row-level-security
   - Auth: https://supabase.com/docs/guides/auth

2. **Security Best Practices:**
   - OWASP Top 10: https://owasp.org/www-project-top-ten/
   - Web Security: https://web.dev/security/

3. **Emergency Contact:**
   - If credentials are actively being exploited, contact Supabase support immediately
   - Pause the project in Supabase dashboard to prevent access

---

## ⚠️ WHAT HAPPENS IF YOU DON'T FIX THIS?

### Potential Attack Scenarios:

1. **Complete Database Takeover:**
   - Attacker uses exposed service role key to bypass ALL security
   - Can read, modify, delete any data
   - Can create admin users
   - Can export entire database

2. **Data Breach:**
   - Sensitive data exposed
   - User information compromised
   - Financial/operational data stolen

3. **Service Disruption:**
   - Attacker deletes critical data
   - Modifies metrics to show false information
   - Locks out legitimate users

4. **Compliance Violations:**
   - GDPR fines (up to €20M or 4% of revenue)
   - Legal liability
   - Reputational damage

### Recent Similar Incidents:

- Multiple companies have had credentials exposed in git history
- Average cost of data breach: $4.45M (IBM 2023 report)
- Average time to detect breach: 277 days

---

## ✅ VERIFICATION

After completing the fixes, verify security:

```bash
# 1. Check no credentials in code
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/

# 2. Check .env.local not in git
git ls-files | grep .env.local

# 3. Check git history is clean
git log --all --full-history --source -- .env.local

# 4. Build and test
npm run build
npm run preview
```

All commands should return empty/no results.

---

## 📝 POST-FIX DOCUMENTATION

Once fixes are complete:

1. Document the incident in your security log
2. Update team security training
3. Implement pre-commit hooks to prevent future credential commits
4. Schedule regular security audits (quarterly recommended)

---

**Remember: Security is not a one-time fix, it's an ongoing process!**

For questions or assistance, refer to the security audit report or consult a security professional.
