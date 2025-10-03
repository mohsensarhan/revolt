
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...
');

  try {
    // Step 1: Rebuild the system
    console.log('📋 Step 1: Rebuilding the system...');
    console.log('Running rebuild-system.mjs...
');

    try {
      const { stdout, stderr } = await execAsync('node rebuild-system.mjs');
      console.log(stdout);
      if (stderr) {
        console.error('Error:', stderr);
      }
    } catch (error) {
      console.error('Error running rebuild-system.mjs:', error.message);
    }

    // Wait for system rebuild to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Test real-time subscription
    console.log('
📋 Step 2: Testing real-time subscription...');
    console.log('Running test-realtime-subscription.mjs...
');

    try {
      const { stdout, stderr } = await execAsync('node test-realtime-subscription.mjs');
      console.log(stdout);
      if (stderr) {
        console.error('Error:', stderr);
      }
    } catch (error) {
      console.error('Error running test-realtime-subscription.mjs:', error.message);
    }

    // Wait for subscription test to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Verify real-time sync with Playwright
    console.log('
📋 Step 3: Verifying real-time sync with Playwright...');
    console.log('Running verify-realtime-sync-playwright.mjs...
');

    try {
      const { stdout, stderr } = await execAsync('node verify-realtime-sync-playwright.mjs');
      console.log(stdout);
      if (stderr) {
        console.error('Error:', stderr);
      }
    } catch (error) {
      console.error('Error running verify-realtime-sync-playwright.mjs:', error.message);
    }

    console.log('
✅ All tests completed!');
    console.log('Please review the screenshots generated during the tests to verify the system is working correctly.');

  } catch (error) {
    console.error('❌ Error during test execution:', error.message);
  }
}

runAllTests();
