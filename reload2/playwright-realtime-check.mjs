import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(relativePath) {
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
      .filter(Boolean)
  );
}

async function main() {
  const env = {
    ...loadEnvFile('.env.local'),
    ...loadEnvFile('.env.new'),
    ...process.env,
  };

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseServiceKey = env.VITE_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const adminPassword = env.VITE_ADMIN_INITIAL_PASSWORD;

  if (!supabaseUrl || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or anon key');
  }
  if (!adminPassword) {
    throw new Error('Missing VITE_ADMIN_INITIAL_PASSWORD');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const newMetricValue = Math.floor(Math.random() * 500000) + 5500000;
  const expectedDisplay = newMetricValue >= 1000000
    ? (newMetricValue / 1000000).toFixed(1) + 'M'
    : newMetricValue.toLocaleString();

  console.log(`[Playwright] Using target people_served value: ${newMetricValue}`);

  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const adminContext = await browser.newContext();
  const dashboardContext = await browser.newContext();

  try {
    const adminPage = await adminContext.newPage();
    adminPage.on('console', (msg) => console.log('[AdminConsole]', msg.text()));
    adminPage.on('pageerror', (err) => console.log('[AdminError]', err.message));

    console.log('[Playwright] Opening admin login');
    await adminPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForSelector('#email', { timeout: 30000 });

    await adminPage.fill('#email', 'admin@example.com');
    await adminPage.fill('#password', adminPassword);

    await Promise.all([
      adminPage.waitForNavigation({ url: (url) => url.pathname.includes('/admin') }),
      adminPage.click('button:has-text("Sign In")'),
    ]);

    console.log('[Playwright] Signed in, waiting for admin panel');
    await adminPage.waitForSelector('#people_served', { timeout: 15000 });

    await adminPage.fill('#people_served', newMetricValue.toString());
    console.log('[Playwright] Updated people_served field');

    await adminPage.getByRole('button', { name: /Save All Core Metrics/i }).click();
    console.log('[Playwright] Triggered save for core metrics');

    await adminPage.waitForTimeout(6000);

    console.log('[Playwright] Querying Supabase to confirm write');
    const { data: dbRow, error: dbError } = await supabaseAdmin
      .from('executive_metrics')
      .select('people_served, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError) {
      throw new Error(`Supabase query failed: ${dbError.message}`);
    }

    if (!dbRow || Number(dbRow.people_served) !== newMetricValue) {
      throw new Error(`Supabase value mismatch. Expected ${newMetricValue}, got ${dbRow ? dbRow.people_served : 'null'}`);
    }

    console.log('[Playwright] Supabase reflects the new value');

    const dashboardPage = await dashboardContext.newPage();
    console.log('[Playwright] Opening dashboard view');
    await dashboardPage.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle' });

    await dashboardPage.waitForFunction(
      (expectedText) => {
        const element = document.querySelector('[aria-label="Lives impacted metric"] .text-sm.font-bold.text-foreground');
        return element ? element.textContent.includes(expectedText) : false;
      },
      expectedDisplay,
      { timeout: 15000 }
    );

    const livesMetricLocator = dashboardPage.locator('[aria-label="Lives impacted metric"] .text-sm.font-bold.text-foreground');
    const displayedText = (await livesMetricLocator.first().textContent())?.trim();
    console.log(`[Playwright] Dashboard shows: ${displayedText}`);

    if (!displayedText || !displayedText.includes(expectedDisplay)) {
      throw new Error(`Dashboard did not update. Expected substring ${expectedDisplay}, saw ${displayedText}`);
    }

    console.log('[Playwright] Dashboard reflects the updated value');

    await dashboardPage.screenshot({ path: 'playwright-dashboard.png', fullPage: true });
    await adminPage.screenshot({ path: 'playwright-admin.png', fullPage: true });

    console.log('[Playwright] Screenshots captured: playwright-admin.png, playwright-dashboard.png');
    console.log('[Playwright] Real-time flow verified end-to-end');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('[Playwright] Test failed:', error);
  process.exitCode = 1;
});
