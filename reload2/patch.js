const fs = require('fs');
const path = 'playwright-realtime-dashboard-only.mjs';
let content = fs.readFileSync(path, 'utf8');
const oldWait = "await page.waitForFunction((txt)=>document.body && document.body.innerText && document.body.innerText.includes(txt), expected, { timeout: 25000 });";
const newWait = "await page.waitForFunction((txt) => {\n      const el = document.querySelector('[data-testid=\\"people-served-value\\"]');\n      return el && el.textContent && el.textContent.includes(txt);\n    }, expected, { timeout: 25000 });";
const oldLog = "const body = await page.evaluate(()=>document.body.innerText);\\n    console.log('[PW-DashOnly] Found expected text in body');";
const newLog = "const text = await page.locator('[data-testid=people-served-value]').first().textContent();\\n    console.log('[PW-DashOnly] Metric value:', text ? text.trim() : 'N/A');";
content = content.replace(oldWait, newWait).replace(oldLog, newLog);
fs.writeFileSync(path, content);
