import puppeteer from 'puppeteer';

async function loginTest() {
  console.log('🚀 Launching browser...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Navigate to login page
    console.log('📄 Navigating to http://localhost:8081...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });

    // Take screenshot before
    await page.screenshot({ path: 'before-login.png' });
    console.log('📸 Screenshot saved: before-login.png\n');

    // Fill in credentials
    console.log('⌨️  Filling in email...');
    await page.type('input[type="email"]', 'admin@example.com');

    console.log('⌨️  Filling in password...');
    await page.type('input[type="password"]', 'TestAdmin2024!@#SecurePass');

    // Click sign in
    console.log('🖱️  Clicking Sign In button...');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    console.log('⏳ Waiting for response...\n');
    await page.waitForTimeout(3000);

    // Take screenshot after
    await page.screenshot({ path: 'after-login.png' });
    console.log('📸 Screenshot saved: after-login.png\n');

    // Check URL and page content
    const currentUrl = page.url();
    const pageContent = await page.content();

    console.log('📍 Current URL:', currentUrl);

    if (currentUrl.includes('/admin')) {
      console.log('\n✅ SUCCESS! Redirected to admin page!');
    } else if (pageContent.includes('Invalid')) {
      console.log('\n❌ FAILED! Still showing error message');
      const errorText = await page.$eval('body', el => el.innerText);
      console.log('Error text:', errorText);
    } else {
      console.log('\n⚠️  Unclear state. Check screenshots.');
    }

    await page.waitForTimeout(5000); // Keep browser open for inspection

  } catch (error) {
    console.error('❌ Error during login test:', error.message);
  } finally {
    await browser.close();
  }
}

loginTest();
