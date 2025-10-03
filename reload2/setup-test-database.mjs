
import { PostgreSQL } from './mcp_server.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupTestDatabase() {
  console.log('🚀 Setting up test database with initial data...
');

  const pg = new PostgreSQL();

  try {
    // Create executive_metrics table if it doesn't exist
    console.log('📊 Creating executive_metrics table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS public.executive_metrics (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        meals_delivered INTEGER NOT NULL,
        people_served INTEGER NOT NULL,
        cost_per_meal DECIMAL(10, 2) NOT NULL,
        program_efficiency DECIMAL(5, 2) NOT NULL,
        revenue DECIMAL(15, 2) NOT NULL,
        expenses DECIMAL(15, 2) NOT NULL,
        reserves DECIMAL(15, 2) NOT NULL,
        cash_position DECIMAL(15, 2) NOT NULL,
        coverage_governorates INTEGER NOT NULL,
        scenario_factors JSONB
      );
    `);

    // Create RLS policies
    console.log('🔒 Setting up Row Level Security (RLS) policies...');
    await pg.query(`
      ALTER TABLE public.executive_metrics ENABLE ROW LEVEL SECURITY;
    `);

    await pg.query(`
      DROP POLICY IF EXISTS "Public read access" ON public.executive_metrics;
      CREATE POLICY "Public read access" ON public.executive_metrics FOR SELECT USING (true);
    `);

    await pg.query(`
      DROP POLICY IF EXISTS "Authenticated users can insert" ON public.executive_metrics;
      CREATE POLICY "Authenticated users can insert" ON public.executive_metrics FOR INSERT WITH CHECK (true);
    `);

    await pg.query(`
      DROP POLICY IF EXISTS "Authenticated users can update" ON public.executive_metrics;
      CREATE POLICY "Authenticated users can update" ON public.executive_metrics FOR UPDATE USING (true);
    `);

    // Insert initial test data if it doesn't exist
    console.log('📝 Inserting initial test data...');
    await pg.query(`
      INSERT INTO public.executive_metrics (
        meals_delivered, people_served, cost_per_meal, program_efficiency,
        revenue, expenses, reserves, cash_position, coverage_governorates
      ) VALUES (
        367500000, 4960000, 6.36, 83,
        2200000000, 2316000000, 731200000, 459800000, 27
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create audit_logs table
    console.log('📝 Creating audit_logs table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        old_data JSONB,
        new_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pg.query(`
      ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    `);

    await pg.query(`
      DROP POLICY IF EXISTS "Users can read all logs" ON public.audit_logs;
      CREATE POLICY "Users can read all logs" ON public.audit_logs FOR SELECT USING (true);
    `);

    // Create scenarios table
    console.log('📝 Creating scenarios table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS public.scenarios (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name TEXT NOT NULL,
        description TEXT,
        factors JSONB NOT NULL,
        results JSONB,
        created_by UUID,
        is_active BOOLEAN DEFAULT true
      );
    `);

    await pg.query(`
      ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
    `);

    await pg.query(`
      DROP POLICY IF EXISTS "Users can read scenarios" ON public.scenarios;
      CREATE POLICY "Users can read scenarios" ON public.scenarios FOR SELECT USING (true);
    `);

    // Reload schema cache
    console.log('🔄 Reloading schema cache...');
    await pg.query('NOTIFY pgrst, 'reload schema';');

    // Verify setup
    console.log('✅ Verifying database setup...');
    const result = await pg.query(`
      SELECT COUNT(*) as count FROM executive_metrics;
    `);

    console.log(`✅ Setup complete! Found ${result[0].count} records in executive_metrics table.`);

  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
  } finally {
    await sleep(2000);
    console.log('
✅ Database setup completed');
  }
}

setupTestDatabase();
