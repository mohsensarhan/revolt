import fs from 'fs';

const path = 'playwright-realtime-check.mjs';
let content = fs.readFileSync(path, 'utf8');
content = content.replace("await adminPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });", "await adminPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });\n    await adminPage.waitForSelector('#email', { timeout: 30000 });");
content = content.replace("await adminPage.fill('input[type=\"email\"]', 'admin@example.com');", "await adminPage.fill('#email', 'admin@example.com');");
content = content.replace("await adminPage.fill('input[type=\"password\"]', adminPassword);", "await adminPage.fill('#password', adminPassword);");
fs.writeFileSync(path, content);
