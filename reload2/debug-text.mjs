import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:false });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(3000);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Contains "Lives"?', bodyText.includes('Lives'));
  await browser.close();
})();
