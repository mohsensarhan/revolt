import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loginTest() {
  console.log('🚀 Launching browser to test login...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    // Navigate to login page
    console.log('📄 Navigating to http://localhost:8081/login...');
    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle0', timeout: 10000 });
    await sleep(1000);

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'login-page.png', fullPage: true });

    // Find and fill email field
    console.log('⌨️  Entering email...');
    await page.waitForSelector('input[id="email"]', { timeout: 5000 });
    await page.type('input[id="email"]', 'admin@example.com', { delay: 50 });

    // Find and fill password field
    console.log('⌨️  Entering password...');
    await page.waitForSelector('input[id="password"]', { timeout: 5000 });
    await page.type('input[id="password"]', 'TestAdmin2024!@#SecurePass', { delay: 50 });

    await page.screenshot({ path: 'before-submit.png', fullPage: true });

    // Click submit button
    console.log('🖱️  Clicking Sign In...');
    await page.click('button[type="submit"]');

    // Wait for response
    console.log('⏳ Waiting for result...\n');
    await sleep(4000);

    await page.screenshot({ path: 'after-submit.png', fullPage: true });

    // Check result
    const currentUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log('📍 URL:', currentUrl);

    if (currentUrl.includes('/admin')) {
      console.log('\n✅✅✅ LOGIN SUCCESSFUL! ✅✅✅');
      console.log('🎉 Redirected to admin panel!');
      console.log('🎉 THE APP IS WORKING!\n');
    } else if (bodyText.includes('Invalid')) {
      console.log('\n❌ FAILED - Invalid credentials error shown');
    } else {
      console.log('\n⚠️  Check screenshots for details');
    }

    await sleep(5000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

loginTest();
