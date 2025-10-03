
import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyRealtimeSync() {
  console.log('🚀 Starting real-time sync verification test...
');

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
    await sleep(3000);

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

    // Find and update a metric in the admin panel
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
    await sleep(3000);

    // Take screenshot after saving
    await page.screenshot({ path: 'admin-after-save.png', fullPage: true });
    console.log('📸 Admin panel after save: admin-after-save.png');

    // Navigate back to dashboard
    console.log('🔍 Navigating back to dashboard...');
    await page.click('a[href*="dashboard"]');
    await sleep(3000);

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
      console.log('   This indicates a real-time sync problem between admin panel and dashboard');
    }

    // Test with another metric
    console.log('
🔄 Testing with another metric...');

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
    await sleep(3000);

    // Navigate back to dashboard
    await page.click('a[href*="dashboard"]');
    await sleep(3000);

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
📊 Dashboard meals delivered value: ${finalDashboardValue}`);

    if (finalDashboardValue && finalDashboardValue.includes('400000000')) {
      console.log('✅ SUCCESS: Dashboard updated with second new value!');
    } else {
      console.log('❌ ISSUE: Dashboard did not update with second new value');
    }

    console.log('
✅ Keeping browser open for 30 seconds...');
    console.log('   Review the screenshots to verify the update process');
    await sleep(30000);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await sleep(10000);
  } finally {
    await browser.close();
    console.log('
✅ Test completed');
  }
}

verifyRealtimeSync();
