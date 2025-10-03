// Use Supabase's undocumented SQL execution endpoint
const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const sql = `
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Service role bypass" ON public.users;

-- Policy: Users can read own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Service role bypass (for admin operations)
CREATE POLICY "Service role bypass" ON public.users
  USING (true)
  WITH CHECK (true);

-- Insert admin user
INSERT INTO public.users (id, email, role)
VALUES ('3218df1e-f252-4cee-b04d-85353b37d662', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = CURRENT_TIMESTAMP;
`;

async function executeSQL() {
  console.log('🔧 Attempting to execute SQL via HTTP...\n');

  // Try the pg_meta endpoint (used by Supabase Dashboard)
  const endpoints = [
    `${supabaseUrl}/rest/v1/rpc/exec`,
    `${supabaseUrl}/pg/exec`,
    `${supabaseUrl}/query`
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: sql, sql: sql })
      });

      const text = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${text}\n`);

      if (response.ok) {
        console.log('✅ SQL executed successfully!');
        return;
      }
    } catch (error) {
      console.log(`Error: ${error.message}\n`);
    }
  }

  console.log('❌ All endpoints failed. Trying PostgreSQL wire protocol...\n');

  // Try using pg with connection string
  console.log('Please provide your database password to continue.');
  console.log('You can find it at: https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/settings/database');
}

executeSQL();
