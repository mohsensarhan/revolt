
import { PostgreSQL } from './mcp_server.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function nukeAndRebuildDB() {
  console.log('🚀 Nuking and rebuilding Supabase database from scratch...
');

  const pg = new PostgreSQL();

  try {
    // Drop all existing tables
    console.log('💥 Dropping all existing tables...');

    await pg.query(`
      DROP TABLE IF EXISTS public.audit_logs CASCADE;
    `);

    await pg.query(`
      DROP TABLE IF EXISTS public.scenarios CASCADE;
    `);

    await pg.query(`
      DROP TABLE IF EXISTS public.executive_metrics CASCADE;
    `);

    await pg.query(`
      DROP TABLE IF EXISTS public.users CASCADE;
    `);

    console.log('✅ All tables dropped successfully');

    // Create users table first (needed for audit logs)
    console.log('📝 Creating users table...');
    await pg.query(`
      CREATE TABLE public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer', 'editor')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);

    // Enable RLS
    await pg.query(`
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policies for users
    await pg.query(`
      CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
      CREATE POLICY "Authenticated users can insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
    `);

    // Create executive_metrics table
    console.log('📝 Creating executive_metrics table...');
    await pg.query(`
      CREATE TABLE public.executive_metrics (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        meals_delivered INTEGER NOT NULL DEFAULT 0,
        people_served INTEGER NOT NULL DEFAULT 0,
        cost_per_meal DECIMAL(10, 2) NOT NULL DEFAULT 0,
        program_efficiency DECIMAL(5, 2) NOT NULL DEFAULT 0,
        revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
        expenses DECIMAL(15, 2) NOT NULL DEFAULT 0,
        reserves DECIMAL(15, 2) NOT NULL DEFAULT 0,
        cash_position DECIMAL(15, 2) NOT NULL DEFAULT 0,
        coverage_governorates INTEGER NOT NULL DEFAULT 0,
        scenario_factors JSONB DEFAULT '{}'
      );
    `);

    // Enable RLS
    await pg.query(`
      ALTER TABLE public.executive_metrics ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policies for executive_metrics
    await pg.query(`
      CREATE POLICY "Public read access" ON public.executive_metrics FOR SELECT USING (true);
      CREATE POLICY "Authenticated users can insert" ON public.executive_metrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can update" ON public.executive_metrics FOR UPDATE USING (auth.role() = 'authenticated');
    `);

    // Create audit_logs table
    console.log('📝 Creating audit_logs table...');
    await pg.query(`
      CREATE TABLE public.audit_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        old_data JSONB,
        new_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Enable RLS
    await pg.query(`
      ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policies for audit_logs
    await pg.query(`
      CREATE POLICY "Users can read all logs" ON public.audit_logs FOR SELECT USING (true);
      CREATE POLICY "Authenticated users can insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    `);

    // Create scenarios table
    console.log('📝 Creating scenarios table...');
    await pg.query(`
      CREATE TABLE public.scenarios (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT,
        factors JSONB NOT NULL DEFAULT '{}',
        results JSONB,
        created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Enable RLS
    await pg.query(`
      ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policies for scenarios
    await pg.query(`
      CREATE POLICY "Public read access" ON public.scenarios FOR SELECT USING (true);
      CREATE POLICY "Authenticated users can insert" ON public.scenarios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can update" ON public.scenarios FOR UPDATE USING (auth.role() = 'authenticated');
    `);

    // Create triggers for updated_at
    console.log('📝 Creating triggers for updated_at...');

    await pg.query(`
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pg.query(`
      CREATE TRIGGER handle_executive_metrics_updated_at
      BEFORE UPDATE ON public.executive_metrics
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    `);

    await pg.query(`
      CREATE TRIGGER handle_scenarios_updated_at
      BEFORE UPDATE ON public.scenarios
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    `);

    // Create trigger for audit logging
    console.log('📝 Creating audit trigger for executive_metrics...');

    await pg.query(`
      CREATE OR REPLACE FUNCTION public.log_executive_metrics_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_data, new_data
          ) VALUES (
            auth.uid(), 
            TG_OP, 
            TG_TABLE_NAME, 
            OLD.id::TEXT, 
            jsonb_build_object(
              'meals_delivered', OLD.meals_delivered,
              'people_served', OLD.people_served,
              'cost_per_meal', OLD.cost_per_meal,
              'program_efficiency', OLD.program_efficiency,
              'revenue', OLD.revenue,
              'expenses', OLD.expenses,
              'reserves', OLD.reserves,
              'cash_position', OLD.cash_position,
              'coverage_governorates', OLD.coverage_governorates,
              'scenario_factors', OLD.scenario_factors
            ),
            jsonb_build_object(
              'meals_delivered', NEW.meals_delivered,
              'people_served', NEW.people_served,
              'cost_per_meal', NEW.cost_per_meal,
              'program_efficiency', NEW.program_efficiency,
              'revenue', NEW.revenue,
              'expenses', NEW.expenses,
              'reserves', NEW.reserves,
              'cash_position', NEW.cash_position,
              'coverage_governorates', NEW.coverage_governorates,
              'scenario_factors', NEW.scenario_factors
            )
          );
          RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
          INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, new_data
          ) VALUES (
            auth.uid(), 
            TG_OP, 
            TG_TABLE_NAME, 
            NEW.id::TEXT, 
            jsonb_build_object(
              'meals_delivered', NEW.meals_delivered,
              'people_served', NEW.people_served,
              'cost_per_meal', NEW.cost_per_meal,
              'program_efficiency', NEW.program_efficiency,
              'revenue', NEW.revenue,
              'expenses', NEW.expenses,
              'reserves', NEW.reserves,
              'cash_position', NEW.cash_position,
              'coverage_governorates', NEW.coverage_governorates,
              'scenario_factors', NEW.scenario_factors
            )
          );
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    await pg.query(`
      CREATE TRIGGER audit_executive_metrics_changes
      AFTER INSERT OR UPDATE ON public.executive_metrics
      FOR EACH ROW
      EXECUTE FUNCTION public.log_executive_metrics_changes();
    `);

    // Create trigger for scenarios audit logging
    console.log('📝 Creating audit trigger for scenarios...');

    await pg.query(`
      CREATE OR REPLACE FUNCTION public.log_scenarios_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, old_data, new_data
          ) VALUES (
            auth.uid(), 
            TG_OP, 
            TG_TABLE_NAME, 
            OLD.id::TEXT, 
            jsonb_build_object(
              'name', OLD.name,
              'description', OLD.description,
              'factors', OLD.factors,
              'results', OLD.results,
              'is_active', OLD.is_active
            ),
            jsonb_build_object(
              'name', NEW.name,
              'description', NEW.description,
              'factors', NEW.factors,
              'results', NEW.results,
              'is_active', NEW.is_active
            )
          );
          RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
          INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, new_data
          ) VALUES (
            auth.uid(), 
            TG_OP, 
            TG_TABLE_NAME, 
            NEW.id::TEXT, 
            jsonb_build_object(
              'name', NEW.name,
              'description', NEW.description,
              'factors', NEW.factors,
              'results', NEW.results,
              'is_active', NEW.is_active
            )
          );
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    await pg.query(`
      CREATE TRIGGER audit_scenarios_changes
      AFTER INSERT OR UPDATE ON public.scenarios
      FOR EACH ROW
      EXECUTE FUNCTION public.log_scenarios_changes();
    `);

    // Insert initial admin user
    console.log('📝 Creating initial admin user...');
    const adminPassword = 'TestAdmin2024!@#SecurePass';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
    } else {
      await pg.query(`
        INSERT INTO public.users (id, email, role)
        VALUES (
          '${authData.user.id}',
          'admin@example.com',
          'admin'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Admin user created successfully');
    }

    // Insert initial data
    console.log('📝 Inserting initial data...');
    await pg.query(`
      INSERT INTO public.executive_metrics (
        meals_delivered, people_served, cost_per_meal, program_efficiency,
        revenue, expenses, reserves, cash_position, coverage_governorates,
        scenario_factors
      ) VALUES (
        367500000, 4960000, 6.36, 83,
        2200000000, 2316000000, 731200000, 459800000, 27,
        '{"economicGrowth": 2.5, "inflationRate": 15.0, "donorSentiment": 75.0}'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Reload schema cache
    console.log('🔄 Reloading schema cache...');
    await pg.query('NOTIFY pgrst, 'reload schema';');

    console.log('✅ Database rebuilt successfully!');

  } catch (error) {
    console.error('❌ Error during database rebuild:', error.message);
  } finally {
    await sleep(2000);
    console.log('
✅ Database rebuild process completed');
  }
}

nukeAndRebuildDB();
