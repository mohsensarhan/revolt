import puppeteer from 'puppeteer';

async function loginTest() {
  console.log('🚀 Launching browser to test login...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser console error:', msg.text());
      }
    });

    // Navigate to login page
    console.log('📄 Navigating to http://localhost:8081/login...');
    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle0', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    console.log('📸 Screenshot: login-page.png\n');

    // Find and fill email field
    console.log('⌨️  Looking for email input...');
    await page.waitForSelector('input[id="email"]', { timeout: 5000 });
    await page.type('input[id="email"]', 'admin@example.com', { delay: 50 });
    console.log('✅ Email entered');

    // Find and fill password field
    console.log('⌨️  Looking for password input...');
    await page.waitForSelector('input[id="password"]', { timeout: 5000 });
    await page.type('input[id="password"]', 'TestAdmin2024!@#SecurePass', { delay: 50 });
    console.log('✅ Password entered');

    // Take screenshot before submit
    await page.screenshot({ path: 'before-submit.png', fullPage: true });
    console.log('📸 Screenshot: before-submit.png\n');

    // Click submit button
    console.log('🖱️  Clicking Sign In button...');
    await page.click('button[type="submit"]');

    // Wait for response
    console.log('⏳ Waiting for authentication...\n');
    await page.waitForTimeout(4000);

    // Take screenshot after submit
    await page.screenshot({ path: 'after-submit.png', fullPage: true });
    console.log('📸 Screenshot: after-submit.png\n');

    // Check result
    const currentUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log('📍 Current URL:', currentUrl);
    console.log('📄 Page contains "Invalid":', bodyText.includes('Invalid'));
    console.log('📄 Page contains "Admin Panel":', bodyText.includes('Admin Panel'));

    if (currentUrl.includes('/admin')) {
      console.log('\n✅✅✅ SUCCESS! LOGIN WORKED! Redirected to /admin');
      console.log('🎉 THE APP IS WORKING!\n');
    } else if (bodyText.includes('Invalid')) {
      console.log('\n❌ FAILED - Still showing "Invalid credentials" error');
      console.log('Error details:', bodyText.substring(0, 500));
    } else {
      console.log('\n⚠️  Unclear state - check screenshots');
    }

    console.log('\nKeeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed');
  }
}

loginTest();
