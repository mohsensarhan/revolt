
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyRealtimeSync() {
  console.log('🚀 Starting real-time sync verification with Playwright...
');

  try {
    // First, let's check the current state
    console.log('📊 Checking current database state...');
    const { data: initialData, error: initialError } = await supabase
      .from('executive_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (initialError) {
      console.error('Error fetching initial data:', initialError);
      return;
    }

    console.log('Initial metrics:', initialData);

    // Launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to application
      console.log('📄 Navigating to application...');
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

      console.log('⏳ Waiting for page to load...');
      await sleep(5000);

      // Take screenshot of initial state
      await page.screenshot({ path: 'initial-dashboard.png', fullPage: true });
      console.log('📸 Initial dashboard screenshot: initial-dashboard.png');

      // Navigate to admin panel
      console.log('🔍 Navigating to admin panel...');
      await page.click('a[href*="admin"]');
      await sleep(3000);

      // Take screenshot of admin panel
      await page.screenshot({ path: 'admin-panel.png', fullPage: true });
      console.log('📸 Admin panel screenshot: admin-panel.png');

      // Check if we need to login
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('sign-in')) {
        console.log('🔐 Logging in to admin panel...');

        // Enter login credentials
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'TestAdmin2024!@#SecurePass');
        await page.click('button:has-text("Login")');

        // Wait for login to complete
        await sleep(3000);

        // Take screenshot after login
        await page.screenshot({ path: 'admin-panel-after-login.png', fullPage: true });
        console.log('📸 Admin panel after login: admin-panel-after-login.png');
      }

      // Test 1: Update people_served metric
      console.log('
📝 Test 1: Updating people_served metric...');

      // Update the "people_served" field
      await page.fill('input[name="people_served"]', '6000000');
      console.log('✅ Updated people_served to 6000000');

      // Find and click the save button
      await page.click('button:has-text("Save Metrics")');
      console.log('✅ Clicked Save Metrics button');

      // Wait for save to complete
      await sleep(5000);

      // Take screenshot after saving
      await page.screenshot({ path: 'admin-after-save-1.png', fullPage: true });
      console.log('📸 Admin panel after first save: admin-after-save-1.png');

      // Verify the change in the database
      console.log('📊 Verifying change in database...');
      await sleep(2000);

      const { data: dbResult1, error: dbError1 } = await supabase
        .from('executive_metrics')
        .select('people_served')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError1) {
        console.error('Error fetching updated data:', dbError1);
      } else {
        console.log('Updated metrics in DB:', dbResult1);

        if (dbResult1 && dbResult1.people_served === 6000000) {
          console.log('✅ Database updated successfully');
        } else {
          console.log('❌ Database update failed');
        }
      }

      // Navigate back to dashboard
      console.log('🔍 Navigating back to dashboard...');
      await page.click('a[href*="dashboard"]');
      await sleep(5000);

      // Take screenshot of dashboard after update
      await page.screenshot({ path: 'dashboard-after-update-1.png', fullPage: true });
      console.log('📸 Dashboard after first update: dashboard-after-update-1.png');

      // Check if the dashboard updated with the new value
      const dashboardValue1 = await page.evaluate(() => {
        // Look for the people served metric value
        const element = document.querySelector('[data-metric="people-served"] .metric-value') || 
                       document.querySelector('.people-served .metric-value') ||
                       document.querySelector('.metric-card:has-text("Lives Impacted") .metric-value');
        return element ? element.textContent : null;
      });

      console.log(`
📊 Dashboard people served value: ${dashboardValue1}`);

      if (dashboardValue1 && dashboardValue1.includes('6000000')) {
        console.log('✅ SUCCESS: Dashboard updated with new value!');
      } else {
        console.log('❌ ISSUE: Dashboard did not update with new value');
      }

      // Test 2: Update meals_delivered metric
      console.log('
📝 Test 2: Updating meals_delivered metric...');

      // Navigate back to admin panel
      await page.click('a[href*="admin"]');
      await sleep(3000);

      // Update the "meals_delivered" field
      await page.fill('input[name="meals_delivered"]', '400000000');
      console.log('✅ Updated meals_delivered to 400000000');

      // Find and click the save button
      await page.click('button:has-text("Save Metrics")');
      console.log('✅ Clicked Save Metrics button again');

      // Wait for save to complete
      await sleep(5000);

      // Verify in database
      const { data: dbResult2, error: dbError2 } = await supabase
        .from('executive_metrics')
        .select('meals_delivered')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError2) {
        console.error('Error fetching meals data:', dbError2);
      } else {
        console.log('Updated meals in DB:', dbResult2);

        if (dbResult2 && dbResult2.meals_delivered === 400000000) {
          console.log('✅ Database updated successfully with meals value');
        } else {
          console.log('❌ Database update failed for meals value');
        }
      }

      // Navigate back to dashboard
      await page.click('a[href*="dashboard"]');
      await sleep(5000);

      // Take screenshot of dashboard after second update
      await page.screenshot({ path: 'dashboard-after-update-2.png', fullPage: true });
      console.log('📸 Dashboard after second update: dashboard-after-update-2.png');

      // Check the dashboard value again
      const dashboardValue2 = await page.evaluate(() => {
        // Look for the meals delivered metric value
        const element = document.querySelector('[data-metric="meals-delivered"] .metric-value') || 
                       document.querySelector('.meals-delivered .metric-value') ||
                       document.querySelector('.metric-card:has-text("Meals Delivered") .metric-value');
        return element ? element.textContent : null;
      });

      console.log(`
📊 Dashboard meals delivered value: ${dashboardValue2}`);

      if (dashboardValue2 && dashboardValue2.includes('400000000')) {
        console.log('✅ SUCCESS: Dashboard updated with second new value!');
      } else {
        console.log('❌ ISSUE: Dashboard did not update with second new value');
      }

      // Test 3: Update scenario factors
      console.log('
📝 Test 3: Updating scenario factors...');

      // Navigate back to admin panel
      await page.click('a[href*="admin"]');
      await sleep(3000);

      // Update scenario factors
      await page.fill('input[aria-label="Economic Growth"]', '5');
      console.log('✅ Updated Economic Growth factor');

      await page.fill('input[aria-label="Inflation Rate"]', '20');
      console.log('✅ Updated Inflation Rate factor');

      // Find and click the save button
      await page.click('button:has-text("Save Scenario Factors")');
      console.log('✅ Clicked Save Scenario Factors button');

      // Wait for save to complete
      await sleep(5000);

      // Verify in database
      const { data: dbResult3, error: dbError3 } = await supabase
        .from('executive_metrics')
        .select('scenario_factors')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError3) {
        console.error('Error fetching scenario factors:', dbError3);
      } else {
        console.log('Updated scenario factors in DB:', dbResult3);

        if (dbResult3 && dbResult3.scenario_factors) {
          console.log('✅ Database updated successfully with scenario factors');
        } else {
          console.log('❌ Database update failed for scenario factors');
        }
      }

      // Navigate back to dashboard
      await page.click('a[href*="dashboard"]');
      await sleep(5000);

      // Take final screenshot
      await page.screenshot({ path: 'dashboard-final.png', fullPage: true });
      console.log('📸 Final dashboard: dashboard-final.png');

      // Check the dashboard value again
      const finalDashboardValue = await page.evaluate(() => {
        // Look for the meals delivered metric value
        const element = document.querySelector('[data-metric="meals-delivered"] .metric-value') || 
                       document.querySelector('.meals-delivered .metric-value') ||
                       document.querySelector('.metric-card:has-text("Meals Delivered") .metric-value');
        return element ? element.textContent : null;
      });

      console.log(`
📊 Final dashboard meals delivered value: ${finalDashboardValue}`);

      if (finalDashboardValue && finalDashboardValue.includes('400000000')) {
        console.log('✅ SUCCESS: Final dashboard updated correctly!');
      } else {
        console.log('❌ ISSUE: Final dashboard did not update correctly');
      }

      // Check audit logs
      console.log('
📊 Checking audit logs...');
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('action, table_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (auditError) {
        console.error('Error fetching audit logs:', auditError);
      } else {
        console.log('Recent audit logs:', auditLogs);
      }

      console.log('
✅ Keeping browser open for 30 seconds...');
      console.log('   Review the screenshots to verify the update process');
      await sleep(30000);

    } catch (error) {
      console.error('❌ Error during browser test:', error.message);
      await sleep(10000);
    } finally {
      await browser.close();
      console.log('
✅ Test completed');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await sleep(10000);
  }
}

verifyRealtimeSync();
