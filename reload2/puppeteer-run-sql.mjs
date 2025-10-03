import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SQL = `
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

DROP POLICY IF EXISTS "Public read access" ON public.executive_metrics;
CREATE POLICY "Public read access" ON public.executive_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert" ON public.executive_metrics;
CREATE POLICY "Authenticated users can insert" ON public.executive_metrics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update" ON public.executive_metrics;
CREATE POLICY "Authenticated users can update" ON public.executive_metrics FOR UPDATE USING (true);

-- Insert sample data
INSERT INTO public.executive_metrics (
  meals_delivered, people_served, cost_per_meal, program_efficiency,
  revenue, expenses, reserves, cash_position, coverage_governorates
) VALUES (
  367500000, 4960000, 2.50, 95.5,
  5000000, 4500000, 500000, 250000, 27
)
ON CONFLICT (id) DO NOTHING;

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

DROP POLICY IF EXISTS "Users can read all logs" ON public.audit_logs;
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

DROP POLICY IF EXISTS "Users can read scenarios" ON public.scenarios;
CREATE POLICY "Users can read scenarios" ON public.scenarios FOR SELECT USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
`;

async function runSQL() {
  console.log('🚀 Launching browser to run SQL via Supabase dashboard...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    console.log('📄 Navigating to Supabase SQL Editor...');
    const sqlEditorUrl = 'https://supabase.com/dashboard/project/kbbtxvbqxpwsgbbbhwty/sql/new';
    await page.goto(sqlEditorUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('⏳ Waiting for page to load...');
    await sleep(5000);

    // Check if we need to login
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('sign-in')) {
      console.log('❌ Not logged in to Supabase dashboard');
      console.log('⚠️  Please login to Supabase first, then run this script again');
      console.log('   OR manually run the SQL shown below');
      console.log('\n' + '='.repeat(60));
      console.log('SQL TO RUN:');
      console.log('='.repeat(60));
      console.log(SQL);
      console.log('='.repeat(60));

      await sleep(10000);
      return;
    }

    console.log('✅ On SQL Editor page');
    await page.screenshot({ path: 'sql-editor.png', fullPage: true });

    // Try to find the SQL editor textarea/code editor
    console.log('📝 Looking for SQL editor...');
    await sleep(2000);

    // Monaco editor or CodeMirror - try multiple selectors
    const editorSelectors = [
      '.monaco-editor textarea',
      'textarea[placeholder*="SQL"]',
      '.CodeMirror textarea',
      '[data-testid="sql-editor"]',
      'textarea.ace_text-input'
    ];

    let editorFound = false;
    for (const selector of editorSelectors) {
      const editor = await page.$(selector);
      if (editor) {
        console.log(`✅ Found editor with selector: ${selector}`);

        // Click to focus
        await editor.click();
        await sleep(500);

        // Clear existing content
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await sleep(200);

        // Paste SQL
        console.log('📋 Pasting SQL...');
        await page.evaluate((sql) => {
          navigator.clipboard.writeText(sql);
        }, SQL);

        await page.keyboard.down('Control');
        await page.keyboard.press('V');
        await page.keyboard.up('Control');

        await sleep(1000);
        await page.screenshot({ path: 'sql-pasted.png', fullPage: true });

        editorFound = true;
        break;
      }
    }

    if (!editorFound) {
      console.log('❌ Could not find SQL editor');
      console.log('📸 Check sql-editor.png to see what the page looks like');
      console.log('\n⚠️  Please manually run this SQL:');
      console.log('='.repeat(60));
      console.log(SQL);
      console.log('='.repeat(60));
      await sleep(10000);
      return;
    }

    // Try to find and click the Run button
    console.log('🔍 Looking for Run button...');
    const runButtonSelectors = [
      'button:has-text("Run")',
      'button[title*="Run"]',
      'button:contains("Run")',
      '[data-testid="run-query"]'
    ];

    let runClicked = false;
    for (const selector of runButtonSelectors) {
      try {
        const runButton = await page.$(selector);
        if (runButton) {
          console.log(`✅ Found Run button: ${selector}`);
          await runButton.click();
          console.log('🖱️  Clicked Run button');
          runClicked = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!runClicked) {
      console.log('⚠️  Could not auto-click Run button');
      console.log('👆 Please click the Run button manually in the browser');
    }

    console.log('\n⏳ Waiting for SQL to execute...');
    await sleep(5000);

    await page.screenshot({ path: 'sql-result.png', fullPage: true });
    console.log('📸 Result screenshot: sql-result.png');

    console.log('\n✅ Keeping browser open for 30 seconds...');
    console.log('   Check if SQL executed successfully');
    console.log('   If successful, close browser');
    console.log('   If failed, you can manually run the SQL shown above');

    await sleep(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await sleep(10000);
  } finally {
    await browser.close();
    console.log('\n✅ Done');
  }
}

runSQL();
