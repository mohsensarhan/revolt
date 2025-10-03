import pg from 'pg';
const { Client } = pg;

// Connection string format: postgresql://[user]:[password]@[host]:[port]/[database]
// For Supabase, we need to use the connection pooler
// Using direct connection with host pattern: aws-0-[region].pooler.supabase.com
const connectionString = 'postgresql://postgres:sygUvx0vFfFsRv2H@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'editor')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await client.query(`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled');

    // Create policies
    console.log('📜 Creating security policies...');
    await client.query(`
      DROP POLICY IF EXISTS "Users can read own data" ON public.users;
      CREATE POLICY "Users can read own data" ON public.users
        FOR SELECT USING (auth.uid() = id);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Service role can manage all" ON public.users;
      CREATE POLICY "Service role can manage all" ON public.users
        FOR ALL USING (true);
    `);
    console.log('✅ Policies created');

    // Insert admin user
    console.log('👤 Inserting admin user...');
    await client.query(`
      INSERT INTO public.users (id, email, role)
      VALUES ('3218df1e-f252-4cee-b04d-85353b37d662', 'admin@example.com', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `);
    console.log('✅ Admin user inserted');

    console.log('\n✨ Setup complete! You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: TestAdmin2024!@#SecurePass');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

setupDatabase();
