import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
  const map = {};
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local','utf-8').split(/\r?\n/)){
      const t=line.trim(); if(!t||t.startsWith('#')) continue; const i=t.indexOf('='); if(i>0) map[t.slice(0,i).trim()]=t.slice(i+1).trim();
    }
  }
  return { ...map, ...process.env };
}

async function main(){
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('Missing Supabase URL/service key');
  const admin = createClient(url, key, { auth:{ persistSession:false, autoRefreshToken:false }});

  // Fetch current row fully
  const { data: row, error: selErr } = await admin
    .from('executive_metrics')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if(selErr) throw selErr;

  const newValue = Math.floor(Math.random()*400000)+5600000;
  const expected = (newValue/1000000).toFixed(1)+'M';

  const payload = { ...row, people_served: newValue };

  const browser = await chromium.launch({ channel:'chrome', headless:false });
  try{
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil:'domcontentloaded' });
    const { error: upErr } = await admin.from('executive_metrics').upsert([payload]).select().single();
    if(upErr) throw upErr;
    await page.waitForFunction((txt) => {
      const el = document.querySelector('[data-testid="people-served-value"]');
      return el && el.textContent && el.textContent.includes(txt);
    }, expected, { timeout: 25000 });
    const text = await page.locator('[data-testid=people-served-value]').first().textContent();
    console.log('[PW-DashOnly] Metric value:', (text || '').trim());
    await page.screenshot({ path:'playwright-dashboard-only.png', fullPage:true });
    console.log('[PW-DashOnly] Screenshot saved');
  } finally {
    await browser.close();
  }
}

main().catch(e=>{ console.error('[PW-DashOnly] Failed:', e); process.exitCode=1; });
