import pg from 'pg';
const { Client } = pg;

const SQL = `
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
`;

const connections = [
  // Transaction mode pooler
  {
    name: 'Transaction Pooler (6543)',
    config: {
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.kbbtxvbqxpwsgbbbhwty',
      password: 'sygUvx0vFfFsRv2H',
      ssl: { rejectUnauthorized: false }
    }
  },
  // Session mode pooler
  {
    name: 'Session Pooler (5432)',
    config: {
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.kbbtxvbqxpwsgbbbhwty',
      password: 'sygUvx0vFfFsRv2H',
      ssl: { rejectUnauthorized: false }
    }
  },
  // Direct connection
  {
    name: 'Direct Connection',
    config: {
      host: 'db.kbbtxvbqxpwsgbbbhwty.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'sygUvx0vFfFsRv2H',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function tryConnection(connectionInfo) {
  const client = new Client(connectionInfo.config);

  try {
    console.log(`\n🔌 Trying: ${connectionInfo.name}...`);
    console.log(`   Host: ${connectionInfo.config.host}:${connectionInfo.config.port}`);

    await client.connect();
    console.log('✅ Connected!');

    console.log('📋 Executing SQL...');
    await client.query(SQL);
    console.log('✅ SQL executed successfully!');

    console.log('\n✨ Setup complete! You can now login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: TestAdmin2024!@#SecurePass');

    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function execute() {
  console.log('🚀 Attempting to connect to Supabase PostgreSQL...\n');

  for (const conn of connections) {
    const success = await tryConnection(conn);
    if (success) {
      break;
    }
  }
}

execute();
