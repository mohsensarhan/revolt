import fs from 'fs';
const path = 'playwright-realtime-dashboard-only.mjs';
let content = fs.readFileSync(path, 'utf8');
content = content.replace("await page.waitForFunction((txt)=>document.body && document.body.innerText && document.body.innerText.includes(txt), expected, { timeout: 25000 });", "await page.waitForFunction((txt) => {\n      const el = document.querySelector('[data-testid\\="people-served-value\\"]');\n      return el && el.textContent && el.textContent.includes(txt);\n    }, expected, { timeout: 25000 });");
content = content.replace("const body = await page.evaluate(()=>document.body.innerText);\n    console.log('[PW-DashOnly] Found expected text in body');", "const text = await page.locator('[data-testid=people-served-value]').first().textContent();\n    console.log('[PW-DashOnly] Metric value:', text?.trim());");
fs.writeFileSync(path, content);
