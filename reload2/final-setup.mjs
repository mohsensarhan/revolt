import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('🚀 Starting setup...\n');

  // First, let's just try to insert the admin user
  // If the table doesn't exist, we'll get an error and provide instructions
  console.log('📝 Attempting to insert admin user record...');

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: '3218df1e-f252-4cee-b04d-85353b37d662',
      email: 'admin@example.com',
      role: 'admin'
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.log('❌ Error:', error.message);

    if (error.message.includes('does not exist') || error.code === 'PGRST205') {
      console.log('\n📋 The users table needs to be created first.');
      console.log('\n🔧 Please go to your Supabase SQL Editor and run this:');
      console.log('   https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/sql/new\n');
      console.log('Copy and paste this SQL:\n');
      console.log('---START SQL---');
      console.log(`
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
      `);
      console.log('---END SQL---\n');
      console.log('After running this, login with:');
      console.log('  Email: admin@example.com');
      console.log('  Password: TestAdmin2024!@#SecurePass');
    }
  } else {
    console.log('✅ Success! Admin user is ready.');
    console.log('\n✨ You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: TestAdmin2024!@#SecurePass');
  }
}

setup();
