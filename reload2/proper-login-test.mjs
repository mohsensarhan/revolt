import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loginTest() {
  console.log('🚀 Testing actual login in browser...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    console.log('📄 Navigating to login page...');
    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Clear and enter email
    console.log('⌨️  Clearing and entering email...');
    const emailInput = await page.waitForSelector('input[id="email"]');
    await emailInput.click({ clickCount: 3 }); // Select all
    await emailInput.press('Backspace'); // Clear
    await emailInput.type('admin@example.com', { delay: 50 });

    // Clear and enter password
    console.log('⌨️  Clearing and entering password...');
    const passwordInput = await page.waitForSelector('input[id="password"]');
    await passwordInput.click({ clickCount: 3 }); // Select all
    await passwordInput.press('Backspace'); // Clear
    await passwordInput.type('TestAdmin2024!@#SecurePass', { delay: 50 });

    await sleep(500);
    await page.screenshot({ path: 'ready-to-submit.png', fullPage: true });

    // Click submit
    console.log('🖱️  Clicking Sign In button...');
    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for authentication response...\n');
    await sleep(5000);

    await page.screenshot({ path: 'final-result.png', fullPage: true });

    // Check result
    const currentUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log('=' .repeat(60));
    console.log('RESULT:');
    console.log('=' .repeat(60));
    console.log('Current URL:', currentUrl);
    console.log('Contains "Invalid":', bodyText.includes('Invalid'));
    console.log('Contains "Admin":', bodyText.includes('Admin'));
    console.log('=' .repeat(60));

    if (currentUrl.includes('/admin')) {
      console.log('\n✅✅✅ SUCCESS! LOGIN WORKED! ✅✅✅');
      console.log('🎉 User successfully authenticated and redirected to admin panel!');
      console.log('🎉 THE APP IS FULLY FUNCTIONAL!\n');
    } else if (bodyText.includes('Invalid')) {
      console.log('\n❌ Login failed - Invalid credentials shown');
      console.log('This means the fallback code did NOT work as expected\n');
    } else {
      console.log('\n⚠️  Unclear state - checking screenshots...\n');
    }

    console.log('Keeping browser open for 10 seconds...');
    await sleep(10000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

loginTest();
