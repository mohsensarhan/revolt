import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing real-time updates between admin panel and dashboard...');

// Create a simple test to verify real-time updates work
const testScript = `
console.log('🧪 Starting real-time update test...');

// Test function to verify admin changes reflect in dashboard
async function testRealtimeUpdates() {
  console.log('📊 Step 1: Testing admin panel to dashboard real-time sync');
  
  // Open admin panel in new tab
  const adminWindow = window.open('http://localhost:8084/admin', '_blank');
  if (!adminWindow) {
    console.log('❌ Could not open admin panel. Please open it manually.');
    return;
  }
  
  // Wait for admin panel to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Open dashboard in new tab
  const dashboardWindow = window.open('http://localhost:8084/', '_blank');
  if (!dashboardWindow) {
    console.log('❌ Could not open dashboard. Please open it manually.');
    return;
  }
  
  // Wait for dashboard to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('📊 Step 2: Both tabs should now be open');
  console.log('📊 Step 3: In the admin panel tab:');
  console.log('   - Change "People Served" to 6000000');
  console.log('   - Change "Meals Delivered" to 400000000');
  console.log('   - Click "Save All Core Metrics"');
  console.log('   - Watch for success message');
  console.log('📊 Step 4: In the dashboard tab:');
  console.log('   - Watch the "Lives Impacted" card');
  console.log('   - Watch the "Meals Delivered" card');
  console.log('   - Should update within 2-3 seconds automatically');
  console.log('📊 Step 5: Check browser console for debug messages');
  
  return true;
}

// Auto-run the test
testRealtimeUpdates().then(success => {
  if (success) {
    console.log('✅ Test initiated! Follow the steps above to verify real-time updates.');
    console.log('🌐 If you see the dashboard update automatically, the real-time sync is working!');
    console.log('🔍 Check browser console (F12) for debug messages showing data flow.');
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
});

// Add a manual test button to the page
const testButton = document.createElement('div');
testButton.innerHTML = \`
  <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;">
    🧪 Test Real-time Updates
  </div>
  <div style="position: fixed; top: 80px; right: 20px; z-index: 9999; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: Arial, sans-serif; font-size: 14px; max-width: 300px;">
    <div style="font-weight: bold; margin-bottom: 8px;">📋 Test Instructions:</div>
    <div style="font-size: 12px; line-height: 1.4;">
      1. Open admin panel (new tab)<br>
      2. Change "People Served" to 6000000<br>
      3. Click "Save All Core Metrics"<br>
      4. Watch dashboard update automatically<br>
      5. Check console for debug messages
    </div>
  </div>
\`;

testButton.onclick = () => {
  testRealtimeUpdates();
};

document.body.appendChild(testButton);

console.log('🎯 Test interface added to page!');
console.log('📋 Click the "Test Real-time Updates" button to start the test');
console.log('🔍 Or follow the manual test steps above');
`;

// Create an HTML file with the test interface
const testHtmlPath = path.join(__dirname, 'test-realtime.html');
fs.writeFileSync(testHtmlPath, testScript);

console.log('✅ Real-time test script created!');
console.log('🚀 Features:');
console.log('   - Automated test function with step-by-step instructions');
console.log('   - Opens admin panel and dashboard in new tabs');
console.log('   - Provides clear test steps for manual verification');
console.log('   - Visual test interface added to any page');
console.log('🌐 Open test-realtime.html in browser or run the test function');
