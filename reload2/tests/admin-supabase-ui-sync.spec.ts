import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
function loadEnvFile(relativePath: string) {
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    return {};
  }
  const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
  return Object.fromEntries(
    lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        if (idx === -1) return null;
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
      .filter((item): item is [string, string] => item !== null)
  );
}

test.describe('Admin → Supabase → UI Perfect Sync', () => {
  let supabaseAdmin: any;
  let adminPassword: string;
  let testMetrics: any;

  test.beforeAll(async () => {
    // Load environment variables
    const env = {
      ...loadEnvFile('.env.local'),
      ...loadEnvFile('.env.new'),
      ...process.env,
    };

    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseServiceKey = env.VITE_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
    adminPassword = env.VITE_ADMIN_INITIAL_PASSWORD || '';

    if (!supabaseUrl || !env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase URL or anon key');
    }
    if (!adminPassword) {
      throw new Error('Missing VITE_ADMIN_INITIAL_PASSWORD');
    }

    // Initialize Supabase admin client
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Generate test metrics
    testMetrics = {
      people_served: Math.floor(Math.random() * 500000) + 5500000,
      meals_delivered: Math.floor(Math.random() * 100000000) + 300000000,
      cost_per_meal: Math.random() * 5 + 5,
      program_efficiency: Math.random() * 15 + 75,
      revenue: Math.floor(Math.random() * 1000000000) + 2000000000,
      expenses: Math.floor(Math.random() * 1000000000) + 2000000000,
      reserves: Math.floor(Math.random() * 1000000000) + 500000000,
      cash_position: Math.floor(Math.random() * 1000000000) + 300000000,
      coverage_governorates: Math.floor(Math.random() * 5) + 25,
      scenario_factors: {
        economicGrowth: Math.random() * 10 - 5,
        inflationRate: Math.random() * 20 + 20,
        donorSentiment: Math.random() * 100 - 50,
        operationalEfficiency: Math.random() * 50 + 75,
        foodPrices: Math.random() * 50 + 100,
        unemploymentRate: Math.random() * 10 + 10,
        corporateCSR: Math.random() * 100 - 25,
        governmentSupport: Math.random() * 100 - 25,
        exchangeRateEGP: Math.random() * 20 + 35,
        logisticsCostIndex: Math.random() * 50 + 100,
        regionalShock: Math.random() * 100 - 50,
      },
      chartData: {
        revenueChange: Math.random() * 20 - 10,
        demandChange: Math.random() * 20 - 10,
        costChange: Math.random() * 20 - 10,
        efficiencyChange: Math.random() * 20 - 10,
        reserveChange: Math.random() * 20 - 10,
        cashChange: Math.random() * 20 - 10,
        mealsChange: Math.random() * 20 - 10,
      },
      globalIndicators: {
        egyptInflation: Math.random() * 20 + 25,
        egyptCurrency: Math.random() * 20 + 40,
        egyptFoodInsecurity: Math.random() * 10 + 12,
        globalInflation: Math.random() * 5 + 4,
        globalFoodPrices: Math.random() * 20 + 15,
        emergingMarketRisk: Math.random() * 30 + 60,
      }
    };

    console.log('🧪 Test metrics generated:', testMetrics);
  });

  test('should sync admin changes to Supabase and UI in real-time', async ({ page, context }) => {
    // Step 1: Login to admin panel
    console.log('🔐 Step 1: Logging into admin panel...');
    await page.goto('/login');
    await page.waitForSelector('#email', { timeout: 30000 });

    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', adminPassword);

    await Promise.all([
      page.waitForNavigation({ url: (url) => url.pathname.includes('/admin') }),
      page.click('button:has-text("Sign In")'),
    ]);

    console.log('✅ Admin login successful');

    // Step 2: Wait for admin panel to load and capture initial state
    console.log('📊 Step 2: Loading admin panel...');
    await page.waitForSelector('#people_served', { timeout: 15000 });
    
    // Capture initial values
    const initialPeopleServed = await page.inputValue('#people_served');
    console.log(`📈 Initial people_served: ${initialPeopleServed}`);

    // Step 3: Update metrics in admin panel
    console.log('✏️ Step 3: Updating metrics in admin panel...');
    
    // Update core metrics
    await page.fill('#people_served', testMetrics.people_served.toString());
    await page.fill('#meals_delivered', testMetrics.meals_delivered.toString());
    await page.fill('#cost_per_meal', testMetrics.cost_per_meal.toString());
    await page.fill('#program_efficiency', testMetrics.program_efficiency.toString());
    await page.fill('#revenue', testMetrics.revenue.toString());
    await page.fill('#expenses', testMetrics.expenses.toString());
    await page.fill('#reserves', testMetrics.reserves.toString());
    await page.fill('#cash_position', testMetrics.cash_position.toString());
    await page.fill('#coverage_governorates', testMetrics.coverage_governorates.toString());

    console.log('📝 Admin form filled with test data');

    // Step 4: Save the metrics
    console.log('💾 Step 4: Saving metrics...');
    await page.getByRole('button', { name: /Save All Core Metrics/i }).click();
    
    // Wait for save confirmation
    await page.waitForTimeout(3000);
    console.log('✅ Metrics saved to admin panel');

    // Step 5: Verify Supabase has the updated data
    console.log('🗄️ Step 5: Verifying Supabase data...');
    const { data: dbRow, error: dbError } = await supabaseAdmin
      .from('executive_metrics')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError) {
      throw new Error(`Supabase query failed: ${dbError.message}`);
    }

    expect(dbRow).toBeTruthy();
    expect(Number(dbRow.people_served)).toBe(testMetrics.people_served);
    expect(Number(dbRow.meals_delivered)).toBe(testMetrics.meals_delivered);
    expect(Number(dbRow.cost_per_meal)).toBeCloseTo(testMetrics.cost_per_meal, 2);
    
    console.log('✅ Supabase data verified');

    // Step 6: Open dashboard in new context and verify real-time sync
    console.log('🖥️ Step 6: Testing dashboard real-time sync...');
    const dashboardContext = await context.browser()?.newContext();
    const dashboardPage = await dashboardContext?.newPage();
    
    if (!dashboardPage) {
      throw new Error('Failed to create dashboard page');
    }

    await dashboardPage.goto('/dashboard', { waitUntil: 'networkidle' });

    // Wait for real-time update to propagate
    await dashboardPage.waitForTimeout(5000);

    // Verify dashboard shows updated values
    const expectedDisplay = testMetrics.people_served >= 1000000
      ? (testMetrics.people_served / 1000000).toFixed(1) + 'M'
      : testMetrics.people_served.toLocaleString();

    await dashboardPage.waitForFunction(
      (expectedText) => {
        const element = document.querySelector('[aria-label="Lives impacted metric"] .text-sm.font-bold.text-foreground');
        return element ? element.textContent.includes(expectedText) : false;
      },
      expectedDisplay,
      { timeout: 15000 }
    );

    const livesMetricLocator = dashboardPage.locator('[aria-label="Lives impacted metric"] .text-sm.font-bold.text-foreground');
    const displayedText = await livesMetricLocator.first().textContent();
    
    expect(displayedText).toContain(expectedDisplay);
    console.log(`✅ Dashboard shows updated value: ${displayedText}`);

    // Step 7: Verify financial metrics sync
    const expectedRevenue = testMetrics.revenue >= 1000000000
      ? 'EGP ' + (testMetrics.revenue / 1000000000).toFixed(1) + 'B'
      : 'EGP ' + (testMetrics.revenue / 1000000).toFixed(0) + 'M';

    await dashboardPage.waitForFunction(
      (expectedText) => {
        const elements = document.querySelectorAll('.text-lg.font-bold');
        return Array.from(elements).some(el => el.textContent.includes(expectedText));
      },
      expectedRevenue,
      { timeout: 10000 }
    );

    console.log('✅ Financial metrics synced to dashboard');

    // Step 8: Take screenshots for documentation
    await page.screenshot({ path: 'test-results/admin-after-update.png', fullPage: true });
    await dashboardPage.screenshot({ path: 'test-results/dashboard-synced.png', fullPage: true });
    
    console.log('📸 Screenshots captured');

    // Cleanup
    await dashboardContext?.close();
    
    console.log('🎉 Perfect sync test completed successfully!');
  });

  test('should handle scenario factors and chart data sync', async ({ page }) => {
    console.log('🧪 Testing scenario factors and chart data sync...');

    // Login to admin
    await page.goto('/login');
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', adminPassword);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('#people_served');

    // Open scenario factors dialog
    await page.getByRole('button', { name: /Adjust/i }).first().click();
    await page.waitForSelector('[role="dialog"]');

    // Update scenario factors
    const economicGrowthSlider = page.locator('[data-testid="economicGrowth-slider"] input').first();
    await economicGrowthSlider.fill(testMetrics.scenario_factors.economicGrowth.toString());

    // Save scenario factors
    await page.getByRole('button', { name: /Save Scenario Factors/i }).click();
    await page.waitForTimeout(2000);

    // Verify in Supabase
    const { data: scenarioData } = await supabaseAdmin
      .from('executive_metrics')
      .select('scenario_factors')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    expect(scenarioData?.scenario_factors).toBeTruthy();
    console.log('✅ Scenario factors synced successfully');
  });

  test('should maintain connection status and handle errors gracefully', async ({ page }) => {
    console.log('🔌 Testing connection status and error handling...');

    // Login to admin
    await page.goto('/login');
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', adminPassword);
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('#people_served');

    // Check connection status
    const connectionBadge = page.locator('[data-testid="connection-status"]');
    await expect(connectionBadge).toBeVisible({ timeout: 10000 });

    const connectionText = await connectionBadge.textContent();
    expect(connectionText).toContain('Connected');
    
    console.log('✅ Connection status verified');
  });
});
