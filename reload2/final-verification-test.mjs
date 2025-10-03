
import puppeteer from 'puppeteer';
import { PostgreSQL } from './mcp_server.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalVerificationTest() {
  console.log('🚀 Starting final verification test of the complete system...
');

  const pg = new PostgreSQL();

  try {
    // First, let's verify the database connection and initial data
    console.log('📊 Checking initial database state...');
    const initialResult = await pg.query(`
      SELECT * FROM executive_metrics 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('Initial metrics:', initialResult);

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--start-maximized'],
      defaultViewport: null
    });

    try {
      const page = await browser.newPage();

      // Set viewport size
      await page.setViewport({ width: 1920, height: 1080 });

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

      // Test 1: Update people_served metric
      console.log('
📝 Test 1: Updating people_served metric...');

      // Update the "people_served" field
      const peopleServedInput = await page.$('input[name="people_served"]');
      if (peopleServedInput) {
        // Clear the field
        await peopleServedInput.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');

        // Enter new value
        const newValue = 6000000; // 6 million people
        await peopleServedInput.type(newValue.toString());
        console.log(`✅ Updated people_served to ${newValue}`);
      }

      // Find and click the save button
      const saveButton = await page.$('button:has-text("Save Metrics")');
      if (saveButton) {
        await saveButton.click();
        console.log('✅ Clicked Save Metrics button');
      } else {
        console.log('❌ Could not find Save Metrics button');
      }

      // Wait for save to complete
      await sleep(5000);

      // Take screenshot after saving
      await page.screenshot({ path: 'admin-after-save-1.png', fullPage: true });
      console.log('📸 Admin panel after first save: admin-after-save-1.png');

      // Verify the change in the database
      console.log('📊 Verifying change in database...');
      await sleep(2000);

      const dbResult1 = await pg.query(`
        SELECT people_served FROM executive_metrics 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      console.log('Updated metrics in DB:', dbResult1);

      if (dbResult1 && dbResult1[0] && dbResult1[0].people_served === 6000000) {
        console.log('✅ Database updated successfully');
      } else {
        console.log('❌ Database update failed');
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
      const mealsInput = await page.$('input[name="meals_delivered"]');
      if (mealsInput) {
        // Clear the field
        await mealsInput.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');

        // Enter new value
        const newValue = 400000000; // 400 million meals
        await mealsInput.type(newValue.toString());
        console.log(`✅ Updated meals_delivered to ${newValue}`);
      }

      // Find and click the save button
      const saveButton2 = await page.$('button:has-text("Save Metrics")');
      if (saveButton2) {
        await saveButton2.click();
        console.log('✅ Clicked Save Metrics button again');
      }

      // Wait for save to complete
      await sleep(5000);

      // Verify in database
      const dbResult2 = await pg.query(`
        SELECT meals_delivered FROM executive_metrics 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      console.log('Updated meals in DB:', dbResult2);

      if (dbResult2 && dbResult2[0] && dbResult2[0].meals_delivered === 400000000) {
        console.log('✅ Database updated successfully with meals value');
      } else {
        console.log('❌ Database update failed for meals value');
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
      const economicGrowthSlider = await page.$('input[aria-label="Economic Growth"]');
      if (economicGrowthSlider) {
        await economicGrowthSlider.click();
        await page.keyboard.type('5');
        console.log('✅ Updated Economic Growth factor');
      }

      const inflationRateSlider = await page.$('input[aria-label="Inflation Rate"]');
      if (inflationRateSlider) {
        await inflationRateSlider.click();
        await page.keyboard.type('20');
        console.log('✅ Updated Inflation Rate factor');
      }

      // Find and click the save button
      const saveButton3 = await page.$('button:has-text("Save Scenario Factors")');
      if (saveButton3) {
        await saveButton3.click();
        console.log('✅ Clicked Save Scenario Factors button');
      }

      // Wait for save to complete
      await sleep(5000);

      // Verify in database
      const dbResult3 = await pg.query(`
        SELECT scenario_factors FROM executive_metrics 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      console.log('Updated scenario factors in DB:', dbResult3);

      if (dbResult3 && dbResult3[0] && dbResult3[0].scenario_factors) {
        console.log('✅ Database updated successfully with scenario factors');
      } else {
        console.log('❌ Database update failed for scenario factors');
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
      const auditLogs = await pg.query(`
        SELECT action, table_name, created_at FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      console.log('Recent audit logs:', auditLogs);

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
    console.error('❌ Error during PostgreSQL connection:', error.message);
    await sleep(10000);
  }
}

finalVerificationTest();
