
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function rebuildSystem() {
  console.log('🚀 Starting complete system rebuild...
');

  try {
    // Step 1: Create admin user
    console.log('👤 Creating admin user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'TestAdmin2024!@#SecurePass',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
    } else {
      console.log('✅ Admin user created successfully');
    }

    // Step 2: Create tables
    console.log('📊 Creating tables...');

    // Create executive_metrics table
    const { error: metricsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.executive_metrics (
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

        ALTER TABLE public.executive_metrics ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Public read access" ON public.executive_metrics FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Authenticated users can insert" ON public.executive_metrics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY IF NOT EXISTS "Authenticated users can update" ON public.executive_metrics FOR UPDATE USING (auth.role() = 'authenticated');
      `
    });

    if (metricsError) {
      console.error('Error creating executive_metrics table:', metricsError);
    } else {
      console.log('✅ Executive metrics table created successfully');
    }

    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer', 'editor')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        );

        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Public read access" ON public.users FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Authenticated users can insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY IF NOT EXISTS "Authenticated users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create audit_logs table
    const { error: auditError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.audit_logs (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          old_data JSONB,
          new_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can read all logs" ON public.audit_logs FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Authenticated users can insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `
    });

    if (auditError) {
      console.error('Error creating audit_logs table:', auditError);
    } else {
      console.log('✅ Audit logs table created successfully');
    }

    // Create scenarios table
    const { error: scenariosError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.scenarios (
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

        ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Public read access" ON public.scenarios FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "Authenticated users can insert" ON public.scenarios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY IF NOT EXISTS "Authenticated users can update" ON public.scenarios FOR UPDATE USING (auth.role() = 'authenticated');
      `
    });

    if (scenariosError) {
      console.error('Error creating scenarios table:', scenariosError);
    } else {
      console.log('✅ Scenarios table created successfully');
    }

    // Step 3: Insert initial data
    console.log('📝 Inserting initial data...');

    // Insert admin user
    if (authData && authData.user) {
      const { error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: authData.user.id,
          email: 'admin@example.com',
          role: 'admin'
        }]);

      if (insertUserError) {
        console.error('Error inserting admin user:', insertUserError);
      } else {
        console.log('✅ Admin user inserted successfully');
      }
    }

    // Insert initial metrics
    const { error: insertMetricsError } = await supabaseAdmin
      .from('executive_metrics')
      .insert([{
        meals_delivered: 367490721,
        people_served: 4960000,
        cost_per_meal: 6.36,
        program_efficiency: 83,
        revenue: 2200000000,
        expenses: 2316000000,
        reserves: 731200000,
        cash_position: 459800000,
        coverage_governorates: 27,
        scenario_factors: {
          economicGrowth: 2.5,
          inflationRate: 15.0,
          donorSentiment: 75.0
        }
      }]);

    if (insertMetricsError) {
      console.error('Error inserting initial metrics:', insertMetricsError);
    } else {
      console.log('✅ Initial metrics inserted successfully');
    }

    // Step 4: Test the system
    console.log('🧪 Testing the system...');

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--start-maximized'],
      defaultViewport: null
    });

    try {
      const page = await browser.newPage();

      // Set viewport size
      await page.setViewport({ width: 1920, height: 1080 });

      console.log('📄 Navigating to application...');
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

      console.log('⏳ Waiting for page to load...');
      await sleep(5000);

      // Take screenshot of initial state
      await page.screenshot({ path: 'initial-dashboard.png', fullPage: true });
      console.log('📸 Initial dashboard screenshot: initial-dashboard.png');

      // Navigate to admin panel
      console.log('🔍 Navigating to admin panel...');
      await page.click('a[href*="admin"]');
      await sleep(3000);

      // Take screenshot of admin panel
      await page.screenshot({ path: 'admin-panel.png', fullPage: true });
      console.log('📸 Admin panel screenshot: admin-panel.png');

      // Check if we need to login
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('sign-in')) {
        console.log('🔐 Logging in to admin panel...');

        // Enter login credentials
        const emailInput = await page.$('input[type="email"]');
        if (emailInput) {
          await emailInput.type('admin@example.com');
        }

        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.type('TestAdmin2024!@#SecurePass');
        }

        const loginButton = await page.$('button:has-text("Login")');
        if (loginButton) {
          await loginButton.click();
        }

        // Wait for login to complete
        await sleep(3000);

        // Take screenshot after login
        await page.screenshot({ path: 'admin-panel-after-login.png', fullPage: true });
        console.log('📸 Admin panel after login: admin-panel-after-login.png');
      }

      // Test updating metrics
      console.log('📝 Testing metric updates...');

      // Update the "people_served" field
      const peopleServedInput = await page.$('input[name="people_served"]');
      if (peopleServedInput) {
        // Clear the field
        await peopleServedInput.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');

        // Enter new value
        const newValue = 6000000; // 6 million people
        await peopleServedInput.type(newValue.toString());
        console.log(`✅ Updated people_served to ${newValue}`);
      }

      // Find and click the save button
      const saveButton = await page.$('button:has-text("Save Metrics")');
      if (saveButton) {
        await saveButton.click();
        console.log('✅ Clicked Save Metrics button');
      } else {
        console.log('❌ Could not find Save Metrics button');
      }

      // Wait for save to complete
      await sleep(5000);

      // Take screenshot after saving
      await page.screenshot({ path: 'admin-after-save.png', fullPage: true });
      console.log('📸 Admin panel after save: admin-after-save.png');

      // Navigate back to dashboard
      console.log('🔍 Navigating back to dashboard...');
      await page.click('a[href*="dashboard"]');
      await sleep(5000);

      // Take screenshot of dashboard after update
      await page.screenshot({ path: 'dashboard-after-update.png', fullPage: true });
      console.log('📸 Dashboard after update: dashboard-after-update.png');

      // Check if the dashboard updated with the new value
      const dashboardValue = await page.evaluate(() => {
        // Look for the people served metric value
        const element = document.querySelector('[data-metric="people-served"] .metric-value') || 
                       document.querySelector('.people-served .metric-value') ||
                       document.querySelector('.metric-card:has-text("Lives Impacted") .metric-value');
        return element ? element.textContent : null;
      });

      console.log(`
📊 Dashboard people served value: ${dashboardValue}`);

      if (dashboardValue && dashboardValue.includes('6000000')) {
        console.log('✅ SUCCESS: Dashboard updated with new value!');
      } else {
        console.log('❌ ISSUE: Dashboard did not update with new value');
      }

      console.log('
✅ Keeping browser open for 30 seconds...');
      console.log('   Review the screenshots to verify the update process');
      await sleep(30000);

    } catch (error) {
      console.error('❌ Error during browser test:', error.message);
      await sleep(10000);
    } finally {
      await browser.close();
      console.log('
✅ Test completed');
    }

  } catch (error) {
    console.error('❌ Error during system rebuild:', error.message);
    await sleep(10000);
  }
}

rebuildSystem();
