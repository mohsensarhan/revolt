
import puppeteer from 'puppeteer';
import { PostgreSQL } from './mcp_server.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRealtimeUpdates() {
  console.log('🚀 Testing real-time updates between admin panel and UI...
');

  // Initialize PostgreSQL connection
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

      // Update a metric in the admin panel
      console.log('📝 Updating metrics in admin panel...');

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
      await page.screenshot({ path: 'admin-after-save.png', fullPage: true });
      console.log('📸 Admin panel after save: admin-after-save.png');

      // Verify the change in the database
      console.log('📊 Verifying change in database...');
      await sleep(2000);

      const dbResult = await pg.query(`
        SELECT people_served FROM executive_metrics 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      console.log('Updated metrics in DB:', dbResult);

      if (dbResult && dbResult[0] && dbResult[0].people_served === 6000000) {
        console.log('✅ Database updated successfully');
      } else {
        console.log('❌ Database update failed');
      }

      // Navigate back to dashboard
      console.log('🔍 Navigating back to dashboard...');
      await page.click('a[href*="dashboard"]');
      await sleep(5000);

      // Take screenshot of dashboard after update
      await page.screenshot({ path: 'dashboard-after-update.png', fullPage: true });
      console.log('📸 Dashboard after update: dashboard-after-update.png');

      // Check if the dashboard updated with the new value
      const dashboardValue = await page.evaluate(() => {
        // Look for the people served metric value
        const element = document.querySelector('[data-metric="people-served"] .metric-value') || 
                       document.querySelector('.people-served .metric-value') ||
                       document.querySelector('.metric-card:has-text("Lives Impacted") .metric-value');
        return element ? element.textContent : null;
      });

      console.log(`
📊 Dashboard people served value: ${dashboardValue}`);

      if (dashboardValue && dashboardValue.includes('6000000')) {
        console.log('✅ SUCCESS: Dashboard updated with new value!');
      } else {
        console.log('❌ ISSUE: Dashboard did not update with new value');
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
    console.error('❌ Error during PostgreSQL connection:', error.message);
    await sleep(10000);
  }
}

testRealtimeUpdates();
