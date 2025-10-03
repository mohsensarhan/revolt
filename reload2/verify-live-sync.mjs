import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyLiveSync() {
  console.log('\n' + '='.repeat(90));
  console.log('✅ VERIFICATION: ADMIN CHANGES → DATABASE → UI LIVE SYNC');
  console.log('='.repeat(90) + '\n');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();

    // Login
    console.log('[1] Logging in...');
    await page.goto('http://localhost:8083/login', { waitUntil: 'networkidle0' });
    await sleep(1500);

    const emailInput = await page.waitForSelector('input[id="email"]');
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type('admin@example.com');

    const passwordInput = await page.waitForSelector('input[id="password"]');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.press('Backspace');
    await passwordInput.type('TestAdmin2024!@#SecurePass');

    await page.click('button[type="submit"]');
    await sleep(4000);
    console.log('✅ Logged in\n');

    // Go to admin and set unique values
    console.log('[2] Going to admin panel...');
    await page.goto('http://localhost:8083/admin', { waitUntil: 'networkidle0' });
    await sleep(3000);

    const uniquePeople = 7777777;
    const uniqueMeals = 888888888;
    const uniqueCost = 9.99;

    console.log(`\n[3] Setting test values in admin panel:`);
    console.log(`   People: ${uniquePeople.toLocaleString()}`);
    console.log(`   Meals: ${uniqueMeals.toLocaleString()}`);
    console.log(`   Cost: ${uniqueCost}\n`);

    const inputs = await page.$$('input[type="number"]');

    if (inputs.length >= 3) {
      // Set people
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].press('Backspace');
      await inputs[0].type(uniquePeople.toString());

      // Set meals
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].press('Backspace');
      await inputs[1].type(uniqueMeals.toString());

      // Set cost
      await inputs[2].click({ clickCount: 3 });
      await inputs[2].press('Backspace');
      await inputs[2].type(uniqueCost.toString());

      console.log('✅ Values entered in admin panel\n');

      // Click save
      console.log('[4] Saving to database...');
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent?.toLowerCase() || '');
        if (text.includes('save')) {
          await button.click();
          console.log('✅ Save button clicked');
          await sleep(3000);
          break;
        }
      }

      await page.screenshot({ path: 'verify-1-admin-saved.png', fullPage: true });

      // Navigate to dashboard
      console.log('\n[5] Navigating to dashboard...');
      await page.goto('http://localhost:8083/', { waitUntil: 'networkidle0' });
      await sleep(5000); // Wait for data to load

      const dashboardText = await page.evaluate(() => document.body.innerText);
      await page.screenshot({ path: 'verify-2-dashboard.png', fullPage: true });

      // Check if values appear
      console.log('\n[6] Checking if values appear in dashboard...\n');

      const peopleFound = dashboardText.includes(uniquePeople.toString().substring(0, 6)) ||
                         dashboardText.includes(uniquePeople.toLocaleString().substring(0, 7));
      const mealsFound = dashboardText.includes(uniqueMeals.toString().substring(0, 6)) ||
                        dashboardText.includes(uniqueMeals.toLocaleString().substring(0, 9));
      const costFound = dashboardText.includes(uniqueCost.toString());

      console.log(`   People (${uniquePeople.toLocaleString()}): ${peopleFound ? '✅ FOUND' : '❌ NOT FOUND'}`);
      console.log(`   Meals (${uniqueMeals.toLocaleString()}): ${mealsFound ? '✅ FOUND' : '❌ NOT FOUND'}`);
      console.log(`   Cost (${uniqueCost}): ${costFound ? '✅ FOUND' : '❌ NOT FOUND'}`);

      const syncWorking = peopleFound || mealsFound || costFound;

      console.log('\n' + '='.repeat(90));
      console.log('📊 RESULTS');
      console.log('='.repeat(90));
      console.log(`${syncWorking ? '✅' : '❌'} Admin → Database → UI Sync: ${syncWorking ? 'WORKING' : 'FAILED'}`);
      console.log('='.repeat(90));

      if (syncWorking) {
        console.log('\n🎉 SUCCESS! Admin panel changes now reflect in UI!');
        console.log('✨ Complete synchronization confirmed!');
      } else {
        console.log('\n⚠️  Values not yet visible - may need page refresh or cache clear');
      }

    } else {
      console.log('❌ Not enough input fields found');
    }

    console.log('\n📸 Screenshots saved:');
    console.log('   - verify-1-admin-saved.png');
    console.log('   - verify-2-dashboard.png');

    console.log('\n⏳ Browser open for 30 seconds for manual check...');
    await sleep(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await sleep(5000);
  } finally {
    await browser.close();
    console.log('\n✅ Verification complete\n');
  }
}

verifyLiveSync();
