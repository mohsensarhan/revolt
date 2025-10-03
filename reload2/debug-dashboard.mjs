import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:false });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(3000);
  const html = await page.content();
  console.log('Loaded dashboard HTML length:', html.length);
  await page.screenshot({ path:'dashboard-debug.png', fullPage:true });
  const found = await page.locator('[aria-label="Lives impacted metric"] .text-sm.font-bold.text-foreground').count();
  console.log('Lives tile count:', found);
  await browser.close();
})();
