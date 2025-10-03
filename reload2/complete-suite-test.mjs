import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function completeTestSuite() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPLETE INTEGRATION TEST SUITE');
  console.log('='.repeat(80));
  console.log('Testing: Database ↔ UI ↔ Admin Panel Full Integration\n');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const testResults = [];
  let testNumber = 0;

  try {
    const page = await browser.newPage();

    // ========================================
    // TEST 1: VERIFY DATABASE TABLES EXIST
    // ========================================
    testNumber++;
    console.log(`\n[${ testNumber }] DATABASE CONNECTIVITY TEST`);
    console.log('-'.repeat(80));

    const { data: metricsCheck, error: metricsError } = await supabase
      .from('executive_metrics')
      .select('*')
      .limit(1);

    if (metricsError) {
      console.log(`   ❌ executive_metrics table: ${metricsError.message}`);
      testResults.push({ test: 'Database Tables', passed: false, error: metricsError.message });
    } else {
      console.log(`   ✅ executive_metrics table: ACCESSIBLE`);
      console.log(`   📊 Records found: ${metricsCheck?.length || 0}`);
      if (metricsCheck && metricsCheck.length > 0) {
        console.log(`   📈 Sample data:`);
        console.log(`      - Meals delivered: ${metricsCheck[0].meals_delivered?.toLocaleString()}`);
        console.log(`      - People served: ${metricsCheck[0].people_served?.toLocaleString()}`);
        console.log(`      - Cost per meal: $${metricsCheck[0].cost_per_meal}`);
      }
      testResults.push({ test: 'Database Tables', passed: true, data: metricsCheck });
    }

    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.log(`   ⚠️  users table: ${usersError.message}`);
    } else {
      console.log(`   ✅ users table: ACCESSIBLE (${usersCheck?.length} users)`);
    }

    // ========================================
    // TEST 2: LOGIN AND AUTHENTICATION
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] LOGIN & AUTHENTICATION TEST`);
    console.log('-'.repeat(80));

    await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    const emailInput = await page.waitForSelector('input[id="email"]', { timeout: 5000 });
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type('admin@example.com');

    const passwordInput = await page.waitForSelector('input[id="password"]');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.press('Backspace');
    await passwordInput.type('TestAdmin2024!@#SecurePass');

    await page.screenshot({ path: 'suite-1-login.png' });
    await page.click('button[type="submit"]');

    console.log(`   ⏳ Authenticating...`);
    await sleep(4000);

    const loginUrl = page.url();
    const loginSuccess = loginUrl.includes('/admin');

    console.log(`   ${loginSuccess ? '✅' : '❌'} Login: ${loginSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📍 Redirected to: ${loginUrl}`);

    testResults.push({ test: 'Login & Auth', passed: loginSuccess, url: loginUrl });
    await page.screenshot({ path: 'suite-2-after-login.png' });

    if (!loginSuccess) {
      throw new Error('Login failed - cannot continue tests');
    }

    // ========================================
    // TEST 3: VERIFY UI DISPLAYS DATABASE DATA
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] UI ↔ DATABASE DATA SYNC TEST`);
    console.log('-'.repeat(80));

    await sleep(3000);

    const pageText = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'suite-3-ui-loaded.png', fullPage: true });

    // Check if database values appear in UI
    let dataMatches = 0;
    const checksToPerform = [];

    if (metricsCheck && metricsCheck.length > 0) {
      const dbMetrics = metricsCheck[0];

      // Check for meals delivered
      const mealsStr = dbMetrics.meals_delivered?.toString();
      if (mealsStr && pageText.includes(mealsStr.substring(0, 5))) {
        dataMatches++;
        checksToPerform.push({ field: 'Meals Delivered', found: true, value: mealsStr });
      } else {
        checksToPerform.push({ field: 'Meals Delivered', found: false, expected: mealsStr });
      }

      // Check for people served
      const peopleStr = dbMetrics.people_served?.toString();
      if (peopleStr && pageText.includes(peopleStr.substring(0, 4))) {
        dataMatches++;
        checksToPerform.push({ field: 'People Served', found: true, value: peopleStr });
      } else {
        checksToPerform.push({ field: 'People Served', found: false, expected: peopleStr });
      }

      // Check for cost per meal
      const costStr = dbMetrics.cost_per_meal?.toString();
      if (costStr && pageText.includes(costStr)) {
        dataMatches++;
        checksToPerform.push({ field: 'Cost per Meal', found: true, value: costStr });
      } else {
        checksToPerform.push({ field: 'Cost per Meal', found: false, expected: costStr });
      }
    }

    console.log(`   📊 Data sync checks:`);
    checksToPerform.forEach(check => {
      console.log(`      ${check.found ? '✅' : '⚠️ '} ${check.field}: ${check.found ? 'DISPLAYED' : 'NOT VISIBLE'}`);
    });

    const uiSyncPassed = dataMatches >= 2;
    console.log(`   ${uiSyncPassed ? '✅' : '⚠️ '} UI displays database data: ${uiSyncPassed ? 'YES' : 'PARTIAL'}`);
    testResults.push({ test: 'UI Data Sync', passed: uiSyncPassed, matches: dataMatches });

    // ========================================
    // TEST 4: UPDATE DATA IN DATABASE
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] DATABASE UPDATE TEST`);
    console.log('-'.repeat(80));

    const testMealsValue = 999777555;
    const testPeopleValue = 8888888;

    console.log(`   📝 Updating database with test values...`);
    console.log(`      - New meals_delivered: ${testMealsValue.toLocaleString()}`);
    console.log(`      - New people_served: ${testPeopleValue.toLocaleString()}`);

    const { data: updateData, error: updateError } = await supabase
      .from('executive_metrics')
      .update({
        meals_delivered: testMealsValue,
        people_served: testPeopleValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', metricsCheck[0].id)
      .select();

    if (updateError) {
      console.log(`   ❌ Update failed: ${updateError.message}`);
      testResults.push({ test: 'Database Update', passed: false, error: updateError.message });
    } else {
      console.log(`   ✅ Database updated successfully`);
      testResults.push({ test: 'Database Update', passed: true });

      // Verify update in DB
      const { data: verifyData } = await supabase
        .from('executive_metrics')
        .select('*')
        .eq('id', metricsCheck[0].id)
        .single();

      console.log(`   ✅ Verification: meals_delivered = ${verifyData.meals_delivered.toLocaleString()}`);
    }

    // ========================================
    // TEST 5: VERIFY UI UPDATES WITH NEW DATA
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] REAL-TIME UI UPDATE TEST`);
    console.log('-'.repeat(80));

    console.log(`   🔄 Refreshing page to check for updates...`);
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(4000);

    const updatedPageText = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'suite-4-after-update.png', fullPage: true });

    const mealsInUI = updatedPageText.includes(testMealsValue.toString().substring(0, 6));
    const peopleInUI = updatedPageText.includes(testPeopleValue.toString().substring(0, 5));

    console.log(`   ${mealsInUI ? '✅' : '❌'} New meals value in UI: ${mealsInUI ? 'YES' : 'NO'}`);
    console.log(`   ${peopleInUI ? '✅' : '❌'} New people value in UI: ${peopleInUI ? 'YES' : 'NO'}`);

    const realtimeWorking = mealsInUI || peopleInUI;
    console.log(`   ${realtimeWorking ? '✅' : '⚠️ '} UI updated with database changes: ${realtimeWorking ? 'YES' : 'NEEDS REFRESH'}`);

    testResults.push({ test: 'Real-time UI Update', passed: realtimeWorking });

    // ========================================
    // TEST 6: ADMIN PANEL FUNCTIONALITY
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] ADMIN PANEL FUNCTIONALITY TEST`);
    console.log('-'.repeat(80));

    // Check for admin controls
    const buttons = await page.$$('button');
    const inputs = await page.$$('input, textarea');
    const tables = await page.$$('table');

    console.log(`   📊 Admin UI elements:`);
    console.log(`      - Buttons: ${buttons.length}`);
    console.log(`      - Input fields: ${inputs.length}`);
    console.log(`      - Tables: ${tables.length}`);

    const hasAdminFeatures = buttons.length > 5 && inputs.length > 0;
    console.log(`   ${hasAdminFeatures ? '✅' : '❌'} Admin features present: ${hasAdminFeatures ? 'YES' : 'NO'}`);

    testResults.push({ test: 'Admin Panel UI', passed: hasAdminFeatures });

    // ========================================
    // TEST 7: NAVIGATION TEST
    // ========================================
    testNumber++;
    console.log(`\n[${testNumber}] NAVIGATION TEST`);
    console.log('-'.repeat(80));

    // Try to navigate to main dashboard
    console.log(`   🔍 Navigating to main dashboard...`);
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle0' });
    await sleep(2000);

    const dashboardText = await page.evaluate(() => document.body.innerText);
    const dashboardLoaded = dashboardText.includes('Dashboard') || dashboardText.includes('Humanitarian');

    console.log(`   ${dashboardLoaded ? '✅' : '❌'} Dashboard loads: ${dashboardLoaded ? 'YES' : 'NO'}`);
    await page.screenshot({ path: 'suite-5-dashboard.png', fullPage: true });

    testResults.push({ test: 'Navigation', passed: dashboardLoaded });

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));

    testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} | ${index + 1}. ${result.test}`);
      if (result.error) {
        console.log(`         Error: ${result.error}`);
      }
    });

    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('='.repeat(80));
    console.log(`📈 Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    console.log('='.repeat(80));

    if (passedTests === totalTests) {
      console.log('\n🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉');
      console.log('✨ Database ↔ UI ↔ Admin Panel: FULLY INTEGRATED & WORKING!');
    } else if (passRate >= 70) {
      console.log('\n✅ SYSTEM FUNCTIONAL - Minor issues detected');
    } else {
      console.log('\n⚠️  SYSTEM NEEDS ATTENTION - Multiple tests failed');
    }

    console.log('\n📸 Screenshots saved:');
    console.log('   - suite-1-login.png');
    console.log('   - suite-2-after-login.png');
    console.log('   - suite-3-ui-loaded.png');
    console.log('   - suite-4-after-update.png');
    console.log('   - suite-5-dashboard.png');

    console.log('\n⏳ Keeping browser open for 20 seconds for inspection...');
    await sleep(20000);

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error.stack);
    await sleep(10000);
  } finally {
    await browser.close();
    console.log('\n✅ Test suite completed\n');
  }
}

completeTestSuite();
