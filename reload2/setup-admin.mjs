import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log('🔧 Setting up admin user...\n');

  // Step 1: Create users table using raw SQL
  console.log('📋 Creating users table...');

  // First create the table
  const { error: createTableError } = await supabase.rpc('query', {
    query: `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `
  });

  if (createTableError && !createTableError.message.includes('already exists')) {
    console.log('⚠️  Creating table via direct SQL...');
    // Try alternative method using direct query
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        query: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
          );
        `
      })
    });

    if (!response.ok) {
      console.log('⚠️  Table creation via RPC failed, will try INSERT method...');
    }
  }

  console.log('✅ Table creation attempted');

  // Enable RLS
  console.log('📋 Setting up Row Level Security...');
  await supabase.rpc('query', {
    query: `
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can read own data" ON public.users;
      CREATE POLICY "Users can read own data" ON public.users
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
      CREATE POLICY "Admins can manage users" ON public.users
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `
  }).catch(e => console.log('⚠️  RLS setup may have failed, continuing...'));

  // Step 2: Create admin user in Auth
  console.log('\n👤 Creating admin user in Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@example.com',
    password: 'TestAdmin2024!@#SecurePass',
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️  Admin user already exists in Auth, getting user ID...');
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error('❌ Error listing users:', listError);
        return;
      }

      const adminUser = users.find(u => u.email === 'admin@example.com');
      if (adminUser) {
        console.log('✅ Found existing admin user:', adminUser.id);

        // Step 3: Insert/update user record in users table
        console.log('\n📝 Adding admin to users table...');
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: adminUser.id,
            email: 'admin@example.com',
            role: 'admin'
          });

        if (insertError) {
          console.error('❌ Error adding admin to users table:', insertError);
          return;
        }

        console.log('✅ Admin user record created/updated in users table');
      }
    } else {
      console.error('❌ Error creating admin user:', authError);
      return;
    }
  } else {
    console.log('✅ Admin user created in Auth:', authData.user.id);

    // Step 3: Insert user record in users table
    console.log('\n📝 Adding admin to users table...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@example.com',
        role: 'admin'
      });

    if (insertError) {
      console.error('❌ Error adding admin to users table:', insertError);
      return;
    }

    console.log('✅ Admin user record created in users table');
  }

  console.log('\n✨ Setup complete! You can now login with:');
  console.log('   Email: admin@example.com');
  console.log('   Password: TestAdmin2024!@#SecurePass');
}

setupAdmin().catch(console.error);
