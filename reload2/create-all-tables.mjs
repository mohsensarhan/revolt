import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔧 Creating all required tables...\n');

  // Since we can't execute DDL via API, let's just try to insert data
  // If tables exist, this will work. If not, we'll get errors that tell us what's missing

  console.log('1️⃣  Testing executive_metrics table...');
  const { data: metrics, error: metricsError } = await supabase
    .from('executive_metrics')
    .select('count')
    .limit(1);

  if (metricsError && metricsError.code === 'PGRST205') {
    console.log('❌ executive_metrics table does not exist');
    console.log('\n📋 REQUIRED SQL:');
    console.log('Run this at: https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/sql/new\n');
    console.log(`
-- Create executive_metrics table
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

ALTER TABLE public.executive_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.executive_metrics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON public.executive_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON public.executive_metrics FOR UPDATE USING (true);

-- Insert sample data
INSERT INTO public.executive_metrics (
  meals_delivered, people_served, cost_per_meal, program_efficiency,
  revenue, expenses, reserves, cash_position, coverage_governorates
) VALUES (
  367500000, 4960000, 2.50, 95.5,
  5000000, 4500000, 500000, 250000, 27
);

-- Create audit_logs table
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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all logs" ON public.audit_logs FOR SELECT USING (true);

-- Create scenarios table
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

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read scenarios" ON public.scenarios FOR SELECT USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
    `);

    return false;
  } else {
    console.log('✅ executive_metrics table exists');
    return true;
  }
}

createTables();
