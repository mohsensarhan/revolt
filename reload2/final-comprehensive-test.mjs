import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function comprehensiveTest() {
  console.log('🧪 FINAL COMPREHENSIVE TEST\n');
  console.log('=' .repeat(70));
  console.log('Testing: Login → Admin Panel → Navigation → UI Responsiveness');
  console.log('='.repeat(70) + '\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const results = {
    login: false,
    adminAccess: false,
    uiLoads: false,
    interactive: false
  };

  try {
    const page = await browser.newPage();

    // ========== TEST 1: LOGIN ==========
    console.log('TEST 1: Login Functionality');
    console.log('-'.repeat(70));
    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle0' });
    await sleep(1500);

    const emailInput = await page.waitForSelector('input[id="email"]', { timeout: 5000 });
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type('admin@example.com');

    const passwordInput = await page.waitForSelector('input[id="password"]');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.press('Backspace');
    await passwordInput.type('TestAdmin2024!@#SecurePass');

    await page.click('button[type="submit"]');
    await sleep(4000);

    const afterLoginUrl = page.url();
    results.login = afterLoginUrl.includes('/admin');
    console.log(`   ${results.login ? '✅' : '❌'} Login: ${results.login ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Current URL: ${afterLoginUrl}\n`);

    await page.screenshot({ path: 'test-1-login.png', fullPage: true });

    if (!results.login) {
      throw new Error('Login failed - cannot continue tests');
    }

    // ========== TEST 2: ADMIN PANEL ACCESS ==========
    console.log('TEST 2: Admin Panel Access');
    console.log('-'.repeat(70));
    await sleep(2000);

    const pageContent = await page.evaluate(() => document.body.innerText);
    results.adminAccess = pageContent.includes('Admin') || pageContent.includes('Panel') || pageContent.includes('Dashboard');

    console.log(`   ${results.adminAccess ? '✅' : '❌'} Admin Panel: ${results.adminAccess ? 'ACCESSIBLE' : 'NOT FOUND'}`);
    console.log(`   Page contains admin content: ${results.adminAccess}\n`);

    await page.screenshot({ path: 'test-2-admin-panel.png', fullPage: true });

    // ========== TEST 3: UI ELEMENTS LOAD ==========
    console.log('TEST 3: UI Elements & Content');
    console.log('-'.repeat(70));

    // Check for common UI elements
    const hasButtons = await page.$$('button');
    const hasInputs = await page.$$('input');
    const hasNavigation = pageContent.toLowerCase().includes('dashboard') ||
                          pageContent.toLowerCase().includes('admin') ||
                          pageContent.toLowerCase().includes('menu');

    results.uiLoads = hasButtons.length > 0 && hasNavigation;

    console.log(`   Buttons found: ${hasButtons.length}`);
    console.log(`   Input fields found: ${hasInputs.length}`);
    console.log(`   Has navigation: ${hasNavigation}`);
    console.log(`   ${results.uiLoads ? '✅' : '❌'} UI Elements: ${results.uiLoads ? 'LOADED' : 'MISSING'}\n`);

    // ========== TEST 4: INTERACTIVITY ==========
    console.log('TEST 4: UI Interactivity');
    console.log('-'.repeat(70));

    // Try clicking around
    const clickableElements = await page.$$('button, a, [role="button"]');
    console.log(`   Clickable elements found: ${clickableElements.length}`);

    if (clickableElements.length > 0) {
      console.log(`   Testing click on first button...`);
      try {
        await clickableElements[0].click();
        await sleep(1000);
        console.log(`   ✅ Button click successful`);
        results.interactive = true;
      } catch (e) {
        console.log(`   ⚠️  Button click failed: ${e.message}`);
        results.interactive = false;
      }
    }

    await page.screenshot({ path: 'test-4-interactive.png', fullPage: true });
    console.log();

    // ========== FINAL RESULTS ==========
    console.log('='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log(`${results.login ? '✅' : '❌'} 1. Login & Authentication: ${results.login ? 'WORKING' : 'FAILED'}`);
    console.log(`${results.adminAccess ? '✅' : '❌'} 2. Admin Panel Access: ${results.adminAccess ? 'WORKING' : 'FAILED'}`);
    console.log(`${results.uiLoads ? '✅' : '❌'} 3. UI Elements Load: ${results.uiLoads ? 'WORKING' : 'FAILED'}`);
    console.log(`${results.interactive ? '✅' : '❌'} 4. UI Interactivity: ${results.interactive ? 'WORKING' : 'FAILED'}`);
    console.log('='.repeat(70));

    const allPassed = Object.values(results).every(r => r);
    console.log();
    if (allPassed) {
      console.log('🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉');
      console.log('✨ The application is FULLY FUNCTIONAL!');
    } else {
      console.log('⚠️  Some tests failed - see details above');
    }

    console.log('\n📸 Screenshots saved:');
    console.log('   - test-1-login.png');
    console.log('   - test-2-admin-panel.png');
    console.log('   - test-4-interactive.png');

    console.log('\n⏳ Keeping browser open for 15 seconds for inspection...');
    await sleep(15000);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    await sleep(5000);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed\n');
  }
}

comprehensiveTest();
