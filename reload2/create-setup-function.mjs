import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSetupFunction() {
  console.log('🔧 Creating setup function via edge function...\n');

  // First, let's try to create the function using a migration approach
  const setupSQL = `
CREATE OR REPLACE FUNCTION setup_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
  );

  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Service role bypass" ON public.users;
  CREATE POLICY "Service role bypass" ON public.users
    USING (true)
    WITH CHECK (true);

  INSERT INTO public.users (id, email, role)
  VALUES ('3218df1e-f252-4cee-b04d-85353b37d662', 'admin@example.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = CURRENT_TIMESTAMP;
END;
$$;
  `;

  // Try to execute via raw fetch to the Database REST API
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Client-Info': 'supabase-js/2.0.0'
      },
      body: JSON.stringify({
        query: setupSQL
      })
    });

    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response:', data);

  } catch (error) {
    console.error('Error:', error);
  }

  // Alternative: Try to use the schema endpoint
  console.log('\n📋 Since direct SQL execution is blocked, here is the SQL to run manually:\n');
  console.log('Go to: https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/sql/new');
  console.log('\nSQL to execute:\n');
  console.log(setupSQL.replace('CREATE OR REPLACE FUNCTION setup_users_table()', `
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role bypass" ON public.users;
CREATE POLICY "Service role bypass" ON public.users
  USING (true)
  WITH CHECK (true);

INSERT INTO public.users (id, email, role)
VALUES ('3218df1e-f252-4cee-b04d-85353b37d662', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = CURRENT_TIMESTAMP;
  `).replace(/CREATE OR REPLACE FUNCTION.*END;\s*\$\$;/gs, ''));
}

createSetupFunction();
