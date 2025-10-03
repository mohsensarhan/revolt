import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(relativePath) {
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    return {};
  }
  const entries = {};
  const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    entries[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return entries;
}

function formatExpectedDisplay(value) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return Math.round(value / 1_000) + 'K';
  return value.toLocaleString();
}

async function waitForSelectorWithRetry(page, selector, attempts = 3, delay = 2000) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await page.waitForSelector(selector, { timeout: 10000, visible: true });
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(`[Puppeteer] Retry ${attempt}/${attempts - 1} waiting for ${selector}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function run() {
  const env = { ...loadEnvFile('.env.local'), ...loadEnvFile('.env.new'), ...process.env };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseServiceKey = env.VITE_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const adminPassword = env.VITE_ADMIN_INITIAL_PASSWORD;

  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials');
  if (!adminPassword) throw new Error('Missing VITE_ADMIN_INITIAL_PASSWORD');

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: existingRow, error: selectError } = await supabaseAdmin
    .from('executive_metrics')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (selectError) throw selectError;

  const newMetricValue = Math.floor(Math.random() * 500000) + 5500000;
  const expectedDisplay = formatExpectedDisplay(newMetricValue);

  console.log('[Puppeteer] Target people_served value:', newMetricValue, 'expected display:', expectedDisplay);

  const browser = await puppeteer.launch({ headless: false });
  try {
    const adminPage = await browser.newPage();

    adminPage.on('console', msg => console.log(`[admin:${msg.type()}]`, msg.text()));
    adminPage.on('pageerror', err => console.log('[admin:pageerror]', err.message));
    adminPage.on('response', response => {
      if (response.status() >= 400) console.log('[admin:response]', response.status(), response.url());
    });

    console.log('[Puppeteer] Opening login page');
    await adminPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });
    await waitForSelectorWithRetry(adminPage, '#email');
    await waitForSelectorWithRetry(adminPage, '#password');

    await adminPage.click('#email', { clickCount: 3 });
    await adminPage.type('#email', 'admin@example.com', { delay: 50 });
    await adminPage.click('#password', { clickCount: 3 });
    await adminPage.type('#password', adminPassword, { delay: 50 });

    await Promise.all([
      adminPage.waitForNavigation({ waitUntil: 'networkidle0' }),
      adminPage.click('button[type="submit"]'),
    ]);

    console.log('[Puppeteer] Logged in, waiting for admin surface');
    await adminPage.waitForSelector('button', { timeout: 15000 });

    const adjustButtons = await adminPage.$x("//button[contains(., 'Adjust')]");
    if (!adjustButtons.length) throw new Error('Adjust button not found');
    await adjustButtons[0].click();
    await waitForSelectorWithRetry(adminPage, '#people_served');

    await adminPage.click('#people_served', { clickCount: 3 });
    await adminPage.type('#people_served', String(newMetricValue), { delay: 30 });

    const saveButtons = await adminPage.$x("//button[contains(., 'Save Metrics')]");
    if (!saveButtons.length) throw new Error('Save Metrics button not found');
    await saveButtons[0].click();

    await adminPage.waitForFunction(() => document.body && document.body.innerText.includes('Core metrics saved!'), { timeout: 15000 });
    await adminPage.screenshot({ path: 'puppeteer-admin.png', fullPage: true });
    console.log('[Puppeteer] Admin screenshot saved');

    console.log('[Puppeteer] Verifying Supabase write');
    const { data: dbRow, error: dbError } = await supabaseAdmin
      .from('executive_metrics')
      .select('people_served, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    if (dbError) throw dbError;
    if (!dbRow || Number(dbRow.people_served) !== newMetricValue) {
      throw new Error(`Supabase mismatch, expected ${newMetricValue}, got ${dbRow ? dbRow.people_served : 'null'}`);
    }
    console.log('[Puppeteer] Supabase reflects the new value');

    const dashboardPage = await browser.newPage();
    dashboardPage.on('console', msg => console.log(`[dashboard:${msg.type()}]`, msg.text()));
    dashboardPage.on('pageerror', err => console.log('[dashboard:pageerror]', err.message));
    dashboardPage.on('response', response => {
      if (response.status() >= 400) console.log('[dashboard:response]', response.status(), response.url());
    });

    console.log('[Puppeteer] Opening dashboard view');
    await dashboardPage.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'domcontentloaded' });

    await dashboardPage.waitForFunction((expected) => {
      const el = document.querySelector('[data-testid="people-served-value"]');
      return el && el.textContent && el.textContent.includes(expected);
    }, expectedDisplay, { timeout: 20000 });

    const displayedText = await dashboardPage.locator('[data-testid=people-served-value]').first().textContent();
    console.log('[Puppeteer] Dashboard shows:', displayedText ? displayedText.trim() : 'N/A');
    await dashboardPage.screenshot({ path: 'puppeteer-dashboard.png', fullPage: true });
    console.log('[Puppeteer] Dashboard screenshot saved');

  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error('[Puppeteer] Test failed:', error);
  process.exitCode = 1;
});
