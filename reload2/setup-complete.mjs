import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setup() {
  console.log('🔧 Setting up admin user and database...\n');

  // Step 1: Check if user already exists in Auth
  console.log('👤 Checking for existing admin user...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  let adminUser = users.find(u => u.email === 'admin@example.com');

  if (adminUser) {
    console.log('✅ Admin user already exists in Auth:', adminUser.id);
  } else {
    // Create admin user
    console.log('👤 Creating admin user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'TestAdmin2024!@#SecurePass',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error creating admin user:', authError);
      return;
    }

    adminUser = authData.user;
    console.log('✅ Admin user created in Auth:', adminUser.id);
  }

  // Step 2: Create users table by inserting a record (this will auto-create the table if it doesn't exist)
  console.log('\n📝 Creating users table and adding admin record...');

  // Delete RLS policies temporarily to allow insert
  try {
    // Try to insert directly with service role (bypasses RLS)
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: adminUser.id,
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message && result.message.includes('does not exist')) {
        console.log('\n❌ Table does not exist. You need to create it manually.');
        console.log('\n📋 Run this SQL in your Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/sql/new\n');
        console.log(`
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

-- Allow users to read own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Service role can manage all" ON public.users
  FOR ALL USING (true);

-- Insert admin user
INSERT INTO public.users (id, email, role)
VALUES ('${adminUser.id}', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
        `);
        console.log('\n⚠️  After running the SQL above, you can login with:');
        console.log('   Email: admin@example.com');
        console.log('   Password: TestAdmin2024!@#SecurePass\n');
      } else {
        console.error('❌ Error:', result);
      }
      return;
    }

    console.log('✅ Admin user record created in users table');
    console.log('\n✨ Setup complete! You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: TestAdmin2024!@#SecurePass');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

setup().catch(console.error);
