import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = await browser.newPage();

    page.on('console', msg => {
      const type = msg.type();
      console.log(`[console:${type}]`, msg.text());
    });

    page.on('pageerror', err => {
      console.log('[pageerror]', err.message);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('[response]', response.status(), response.url());
      }
    });

    console.log('[Puppeteer] Navigating to /login');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });

    await new Promise(res => setTimeout(res, 5000));

    const htmlSnippet = await page.evaluate(() => document.body.innerHTML.slice(0, 5000));
    console.log('[Puppeteer] Body snippet:', htmlSnippet);

    await page.screenshot({ path: 'puppeteer-login.png', fullPage: true });
    console.log('[Puppeteer] Screenshot saved to puppeteer-login.png');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('[Puppeteer] Failed:', err);
  process.exitCode = 1;
});
